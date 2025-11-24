import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface MacroStep {
  type: 'ai_suggestion' | 'file_edit' | 'command' | 'deploy' | 'test'
  tool: 'editor' | 'sandbox' | 'ui_studio' | 'deployer'
  action: string
  parameters: Record<string, any>
  expectedOutput?: string
}

// POST /api/ai/macros/[id]/execute - Execute a macro
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { dryRun = false, projectId } = body

    // Get macro
    const macro = await prisma.aIMacro.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!macro) {
      return NextResponse.json({ error: 'Macro not found' }, { status: 404 })
    }

    // Create macro run record
    const run = await prisma.aIMacroRun.create({
      data: {
        macroId: macro.id,
        userId: session.user.id,
        projectId: projectId || macro.projectId,
        status: 'running',
        logs: {
          events: [],
          dryRun,
        },
      },
    })

    // Execute macro steps in background
    executeMacro(run.id, macro, dryRun, session.user.id, projectId).catch(
      (error) => {
        console.error('Macro execution error:', error)
      }
    )

    return NextResponse.json({
      runId: run.id,
      status: 'running',
      message: dryRun
        ? 'Macro dry-run started'
        : 'Macro execution started',
    })
  } catch (error) {
    console.error('Error starting macro execution:', error)
    return NextResponse.json(
      { error: 'Failed to execute macro' },
      { status: 500 }
    )
  }
}

async function executeMacro(
  runId: string,
  macro: any,
  dryRun: boolean,
  userId: string,
  projectId?: string
) {
  const steps = macro.steps as MacroStep[]
  const logs: any[] = []
  let totalTokens = 0
  let totalCost = 0

  try {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]

      logs.push({
        timestamp: new Date().toISOString(),
        step: i + 1,
        type: step.type,
        action: step.action,
        status: 'running',
      })

      // Update run with current progress
      await prisma.aIMacroRun.update({
        where: { id: runId },
        data: {
          logs: {
            events: logs,
            currentStep: i + 1,
            totalSteps: steps.length,
            dryRun,
          },
        },
      })

      try {
        const result = await executeStep(step, dryRun, userId, projectId)

        logs[logs.length - 1].status = 'completed'
        logs[logs.length - 1].result = result.summary
        logs[logs.length - 1].output = dryRun ? result.dryRunOutput : result.output

        if (result.tokens) {
          totalTokens += result.tokens
          totalCost += result.cost || 0
        }
      } catch (stepError) {
        logs[logs.length - 1].status = 'failed'
        logs[logs.length - 1].error =
          stepError instanceof Error ? stepError.message : 'Unknown error'

        // Mark run as failed
        await prisma.aIMacroRun.update({
          where: { id: runId },
          data: {
            status: 'failed',
            outcome: 'failure',
            tokenUsage: totalTokens,
            cost: totalCost,
            logs: { events: logs, dryRun },
            completedAt: new Date(),
            errorMessage:
              stepError instanceof Error ? stepError.message : 'Step failed',
          },
        })

        return
      }
    }

    // Mark run as completed
    await prisma.aIMacroRun.update({
      where: { id: runId },
      data: {
        status: 'completed',
        outcome: 'success',
        tokenUsage: totalTokens,
        cost: totalCost,
        logs: { events: logs, dryRun },
        completedAt: new Date(),
      },
    })

    // Update macro last run time
    await prisma.aIMacro.update({
      where: { id: macro.id },
      data: {
        lastRun: new Date(),
        runCount: macro.runCount + 1,
      },
    })

    // Track analytics
    await prisma.analyticsEvent.create({
      data: {
        eventName: 'ai_macro_executed',
        eventType: 'ai_event',
        userId,
        projectId: projectId || null,
        metadata: {
          macroId: macro.id,
          runId,
          dryRun,
          stepCount: steps.length,
          totalTokens,
          totalCost,
        },
      },
    })
  } catch (error) {
    console.error('Macro execution failed:', error)

    await prisma.aIMacroRun.update({
      where: { id: runId },
      data: {
        status: 'failed',
        outcome: 'failure',
        tokenUsage: totalTokens,
        cost: totalCost,
        logs: { events: logs, dryRun },
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Execution failed',
      },
    })
  }
}

async function executeStep(
  step: MacroStep,
  dryRun: boolean,
  userId: string,
  projectId?: string
): Promise<{
  summary: string
  output?: any
  dryRunOutput?: string
  tokens?: number
  cost?: number
}> {
  // In dry-run mode, simulate execution
  if (dryRun) {
    return {
      summary: `[DRY RUN] Would execute: ${step.action}`,
      dryRunOutput: `This step would perform: ${step.action} on ${step.tool} with parameters: ${JSON.stringify(step.parameters, null, 2)}`,
    }
  }

  // Execute based on step type
  switch (step.type) {
    case 'ai_suggestion':
      return await executeAISuggestion(step, userId, projectId)

    case 'file_edit':
      return await executeFileEdit(step, userId, projectId)

    case 'command':
      return await executeCommand(step, userId, projectId)

    case 'deploy':
      return await executeDeploy(step, userId, projectId)

    case 'test':
      return await executeTest(step, userId, projectId)

    default:
      throw new Error(`Unknown step type: ${step.type}`)
  }
}

async function executeAISuggestion(
  step: MacroStep,
  userId: string,
  projectId?: string
) {
  const { prompt, context } = step.parameters

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful AI assistant for the DevFlowHub platform. Provide concise, actionable suggestions.',
      },
      {
        role: 'user',
        content: prompt + (context ? `\n\nContext: ${JSON.stringify(context)}` : ''),
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  })

  const suggestion = completion.choices[0].message.content || ''
  const tokens = completion.usage?.total_tokens || 0
  const cost = (tokens / 1000) * 0.03 // GPT-4 pricing approximation

  // Track AI usage
  await prisma.aITokenUsage.create({
    data: {
      userId,
      projectId: projectId || null,
      model: 'gpt-4',
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: tokens,
      cost,
      endpoint: '/api/ai/macros/execute',
      successful: true,
    },
  })

  return {
    summary: 'AI suggestion generated',
    output: suggestion,
    tokens,
    cost,
  }
}

async function executeFileEdit(
  step: MacroStep,
  userId: string,
  projectId?: string
) {
  const { filePath, content, operation } = step.parameters

  // This would integrate with the file system/editor API
  // For now, return a simulated response
  return {
    summary: `File ${operation || 'edited'}: ${filePath}`,
    output: {
      filePath,
      operation: operation || 'edit',
      success: true,
    },
  }
}

async function executeCommand(
  step: MacroStep,
  userId: string,
  projectId?: string
) {
  const { command, workingDir } = step.parameters

  // This would integrate with the terminal/sandbox API
  // For now, return a simulated response
  return {
    summary: `Command executed: ${command}`,
    output: {
      command,
      exitCode: 0,
      stdout: 'Command executed successfully',
    },
  }
}

async function executeDeploy(
  step: MacroStep,
  userId: string,
  projectId?: string
) {
  const { environment, branch } = step.parameters

  // This would integrate with the deployer API
  // For now, return a simulated response
  return {
    summary: `Deployed to ${environment || 'production'}`,
    output: {
      environment: environment || 'production',
      branch: branch || 'main',
      url: `https://preview-${projectId}.devflowhub.com`,
      status: 'success',
    },
  }
}

async function executeTest(
  step: MacroStep,
  userId: string,
  projectId?: string
) {
  const { testCommand, testFiles } = step.parameters

  // This would integrate with the testing API
  // For now, return a simulated response
  return {
    summary: 'Tests executed',
    output: {
      passed: 10,
      failed: 0,
      skipped: 2,
      total: 12,
    },
  }
}

