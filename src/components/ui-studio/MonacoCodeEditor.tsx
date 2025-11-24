'use client'

import React, { useState, useRef } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="h-96 bg-slate-900 flex items-center justify-center text-slate-400">Loading Editor...</div>
})
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Save,
  Copy,
  Undo,
  Redo,
  AlignLeft,
  Eye,
  Code2,
  Check,
  X
} from 'lucide-react'

interface MonacoCodeEditorProps {
  code: string
  language?: string
  readOnly?: boolean
  onChange?: (value: string) => void
  onSave?: (value: string) => void
  className?: string
}

export function MonacoCodeEditor({
  code,
  language = 'typescript',
  readOnly = false,
  onChange,
  onSave,
  className = ''
}: MonacoCodeEditorProps) {
  const [value, setValue] = useState(code)
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    // Configure TypeScript settings
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types']
    })

    // Add Tailwind CSS IntelliSense
    monaco.languages.registerCompletionItemProvider('typescript', {
      provideCompletionItems: (model: any, position: any) => {
        const suggestions = [
          // Common Tailwind classes
          {
            label: 'className',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'className=""',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Tailwind CSS class attribute'
          },
          {
            label: 'bg-blue-500',
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: 'bg-blue-500',
            documentation: 'Blue background color'
          },
          {
            label: 'text-white',
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: 'text-white',
            documentation: 'White text color'
          },
          {
            label: 'px-4 py-2',
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: 'px-4 py-2',
            documentation: 'Horizontal and vertical padding'
          },
          {
            label: 'rounded-lg',
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: 'rounded-lg',
            documentation: 'Large border radius'
          },
          {
            label: 'hover:bg-blue-600',
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: 'hover:bg-blue-600',
            documentation: 'Hover state background color'
          }
        ]

        return { suggestions }
      }
    })

    // Add React component snippets
    monaco.languages.registerCompletionItemProvider('typescript', {
      provideCompletionItems: (model: any, position: any) => {
        const suggestions = [
          {
            label: 'React Component',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'interface ${1:ComponentName}Props {',
              '  ${2:// props}',
              '}',
              '',
              'export function ${1:ComponentName}({ ${3:props} }: ${1:ComponentName}Props) {',
              '  return (',
              '    <div className="${4:container}">',
              '      ${5:// content}',
              '    </div>',
              '  )',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'React functional component template'
          },
          {
            label: 'useState Hook',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState(${2:initialValue})'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'React useState hook'
          },
          {
            label: 'useEffect Hook',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'useEffect(() => {',
              '  ${1:// effect logic}',
              '  return () => {',
              '    ${2:// cleanup}',
              '  }',
              '}, [${3:dependencies}])'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'React useEffect hook'
          }
        ]

        return { suggestions }
      }
    })

    // Listen for changes
    editor.onDidChangeModelContent(() => {
      const currentValue = editor.getValue()
      setValue(currentValue)
      setHasChanges(currentValue !== code)
      onChange?.(currentValue)
    })

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      handleFormat()
    })
  }

  const handleSave = () => {
    if (onSave) {
      onSave(value)
    }
    setHasChanges(false)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setValue(code)
    setHasChanges(false)
    setIsEditing(false)
  }

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run()
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
  }

  const handleUndo = () => {
    if (editorRef.current) {
      editorRef.current.getAction('undo').run()
    }
  }

  const handleRedo = () => {
    if (editorRef.current) {
      editorRef.current.getAction('redo').run()
    }
  }

  return (
    <Card className={`bg-slate-800 border-slate-700 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-white text-sm">
            <Code2 className="h-4 w-4" />
            <span>Code Editor</span>
            {hasChanges && (
              <div className="flex items-center space-x-1 text-xs text-yellow-400">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Modified</span>
              </div>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {!readOnly && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleUndo}
                  className="text-slate-400 hover:text-white"
                >
                  <Undo className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRedo}
                  className="text-slate-400 hover:text-white"
                >
                  <Redo className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleFormat}
                  className="text-slate-400 hover:text-white"
                >
                  <AlignLeft className="h-3 w-3" />
                </Button>
              </>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="text-slate-400 hover:text-white"
            >
              <Copy className="h-3 w-3" />
            </Button>

            {!readOnly && hasChanges && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-96">
          <Editor
            height="100%"
            language={language}
            value={value}
            theme="vs-dark"
            options={{
              readOnly,
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              wordWrap: 'on',
              bracketPairColorization: { enabled: true },
              guides: {
                bracketPairs: true,
                indentation: true
              },
              suggest: {
                showKeywords: true,
                showSnippets: true,
                showFunctions: true,
                showConstructors: true,
                showFields: true,
                showVariables: true,
                showClasses: true,
                showStructs: true,
                showInterfaces: true,
                showModules: true,
                showProperties: true,
                showEvents: true,
                showOperators: true,
                showUnits: true,
                showValues: true,
                showConstants: true,
                showEnums: true,
                showEnumMembers: true,
                showColors: true,
                showFiles: true,
                showReferences: true,
                showFolders: true,
                showTypeParameters: true,
                showIssues: true,
                showUsers: true,
                showWords: true
              }
            }}
            onMount={handleEditorDidMount}
          />
        </div>
      </CardContent>
    </Card>
  )
}
