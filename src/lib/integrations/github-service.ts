import { Octokit } from '@octokit/rest'
import { prisma } from '@/lib/prisma'

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  private: boolean
  html_url: string
  default_branch: string
}

export interface GitHubPR {
  number: number
  title: string
  body: string
  state: string
  html_url: string
  head: {
    ref: string
    sha: string
  }
  base: {
    ref: string
  }
}

export class GitHubService {
  /**
   * Get GitHub client for a user
   */
  static async getClient(userId: string): Promise<Octokit | null> {
    try {
      const integration = await prisma.integration.findFirst({
        where: {
          userId,
          provider: 'github',
          connectionState: 'connected'
        }
      })

      if (!integration || !integration.config) {
        return null
      }

      // Decrypt token (simplified - in production use proper decryption)
      const config = integration.config as any
      const accessToken = this.decryptToken(config.accessToken)

      return new Octokit({
        auth: accessToken
      })
    } catch (error) {
      console.error('Error getting GitHub client:', error)
      return null
    }
  }

  /**
   * List user repositories
   */
  static async listRepositories(userId: string): Promise<GitHubRepo[]> {
    const octokit = await this.getClient(userId)
    if (!octokit) {
      throw new Error('GitHub not connected')
    }

    const { data } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: 'updated'
    })

    return data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      html_url: repo.html_url,
      default_branch: repo.default_branch || 'main'
    }))
  }

  /**
   * Link project to GitHub repository
   */
  static async linkRepository(projectId: string, userId: string, repoFullName: string): Promise<void> {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    })

    if (!project) {
      throw new Error('Project not found')
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        repoPath: `https://github.com/${repoFullName}`,
        context: {
          ...(project.context as any || {}),
          githubRepo: repoFullName
        }
      }
    })
  }

  /**
   * Create a pull request
   */
  static async createPullRequest(
    userId: string,
    repoFullName: string,
    title: string,
    body: string,
    headBranch: string,
    baseBranch: string = 'main'
  ): Promise<GitHubPR> {
    const octokit = await this.getClient(userId)
    if (!octokit) {
      throw new Error('GitHub not connected')
    }

    const [owner, repo] = repoFullName.split('/')

    const { data } = await octokit.pulls.create({
      owner,
      repo,
      title,
      body,
      head: headBranch,
      base: baseBranch
    })

    return {
      number: data.number,
      title: data.title,
      body: data.body || '',
      state: data.state,
      html_url: data.html_url,
      head: {
        ref: data.head.ref,
        sha: data.head.sha
      },
      base: {
        ref: data.base.ref
      }
    }
  }

  /**
   * Get repository branches
   */
  static async getBranches(userId: string, repoFullName: string): Promise<string[]> {
    const octokit = await this.getClient(userId)
    if (!octokit) {
      throw new Error('GitHub not connected')
    }

    const [owner, repo] = repoFullName.split('/')
    const { data } = await octokit.repos.listBranches({
      owner,
      repo,
      per_page: 100
    })

    return data.map(branch => branch.name)
  }

  /**
   * Create a new branch
   */
  static async createBranch(
    userId: string,
    repoFullName: string,
    branchName: string,
    fromBranch: string = 'main'
  ): Promise<void> {
    const octokit = await this.getClient(userId)
    if (!octokit) {
      throw new Error('GitHub not connected')
    }

    const [owner, repo] = repoFullName.split('/')

    // Get the SHA of the base branch
    const { data: baseBranch } = await octokit.repos.getBranch({
      owner,
      repo,
      branch: fromBranch
    })

    // Create new branch
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: baseBranch.commit.sha
    })
  }

  /**
   * Decrypt token (simplified - in production use proper decryption)
   */
  private static decryptToken(encrypted: string): string {
    // Simplified decryption - in production use proper crypto
    if (encrypted.startsWith('mock_token_')) {
      return encrypted
    }
    // In production, decrypt using the same method as encryption
    return encrypted.split(':')[1] || encrypted
  }
}


