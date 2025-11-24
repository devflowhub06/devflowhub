import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { query, type = 'all', filters = {} } = body

    if (!query || query.trim() === '') {
      return NextResponse.json({ 
        success: true, 
        results: [] 
      })
    }

    // For demo purposes, return mock search results
    // In a real implementation, you would search through actual files
    const mockFiles = [
      { name: 'App.js', path: '/src/App.js', type: 'file', language: 'javascript', content: 'import React from "react";\n\nexport default function App() {\n  return (\n    <div className="App">\n      <h1>Hello World</h1>\n    </div>\n  );\n}' },
      { name: 'index.html', path: '/public/index.html', type: 'file', language: 'html', content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>' },
      { name: 'styles.css', path: '/src/styles.css', type: 'file', language: 'css', content: '.App {\n  text-align: center;\n}\n\nh1 {\n  color: blue;\n}' },
      { name: 'package.json', path: '/package.json', type: 'file', language: 'json', content: '{\n  "name": "my-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.0.0"\n  }\n}' },
      { name: 'README.md', path: '/README.md', type: 'file', language: 'markdown', content: '# My App\n\nThis is a React application.\n\n## Getting Started\n\nRun `npm start` to start the development server.' },
      { name: 'components', path: '/src/components', type: 'folder' },
      { name: 'utils', path: '/src/utils', type: 'folder' },
      { name: 'Button.tsx', path: '/src/components/Button.tsx', type: 'file', language: 'typescript', content: 'import React from "react";\n\ninterface ButtonProps {\n  children: React.ReactNode;\n  onClick?: () => void;\n}\n\nexport default function Button({ children, onClick }: ButtonProps) {\n  return (\n    <button onClick={onClick}>\n      {children}\n    </button>\n  );\n}' },
      { name: 'Modal.tsx', path: '/src/components/Modal.tsx', type: 'file', language: 'typescript', content: 'import React from "react";\n\ninterface ModalProps {\n  isOpen: boolean;\n  onClose: () => void;\n  children: React.ReactNode;\n}\n\nexport default function Modal({ isOpen, onClose, children }: ModalProps) {\n  if (!isOpen) return null;\n\n  return (\n    <div className="modal-overlay" onClick={onClose}>\n      <div className="modal-content" onClick={(e) => e.stopPropagation()}>\n        {children}\n      </div>\n    </div>\n  );\n}' },
      { name: 'api.ts', path: '/src/api.ts', type: 'file', language: 'typescript', content: 'export const API_BASE_URL = "https://api.example.com";\n\nexport async function fetchData(endpoint: string) {\n  const response = await fetch(`${API_BASE_URL}${endpoint}`);\n  return response.json();\n}' }
    ]

    // Filter files based on search query
    const searchResults = mockFiles
      .filter(file => {
        const matchesName = file.name.toLowerCase().includes(query.toLowerCase())
        const matchesPath = file.path.toLowerCase().includes(query.toLowerCase())
        const matchesContent = file.content && file.content.toLowerCase().includes(query.toLowerCase())
        
        if (type === 'files') {
          return matchesName || matchesPath
        } else if (type === 'content') {
          return matchesContent
        } else {
          return matchesName || matchesPath || matchesContent
        }
      })
      .map((file, index) => {
        const matches = []
        
        // Find content matches
        if (file.content) {
          const lines = file.content.split('\n')
          lines.forEach((line, lineIndex) => {
            const lowerLine = line.toLowerCase()
            const lowerQuery = query.toLowerCase()
            let startIndex = 0
            
            while ((startIndex = lowerLine.indexOf(lowerQuery, startIndex)) !== -1) {
              matches.push({
                line: lineIndex + 1,
                text: line,
                start: startIndex,
                end: startIndex + query.length
              })
              startIndex += query.length
            }
          })
        }
        
        return {
          id: `search-result-${index}`,
          name: file.name,
          path: file.path,
          type: file.type,
          content: file.content,
          matches: matches.slice(0, 5), // Limit to 5 matches per file
          size: file.content ? file.content.length : 0,
          modified: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          gitStatus: ['added', 'modified', 'untracked'][Math.floor(Math.random() * 3)],
          language: file.language,
          score: Math.random()
        }
      })
      .sort((a, b) => b.score - a.score)

    return NextResponse.json({
      success: true,
      results: searchResults,
      total: searchResults.length,
      query,
      type,
      filters
    })

  } catch (error) {
    console.error('Search failed:', error)
    return NextResponse.json(
      { error: 'Search failed', details: (error as Error).message },
      { status: 500 }
    )
  }
}
