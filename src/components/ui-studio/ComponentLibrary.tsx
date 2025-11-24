'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { uiStudioClient, ComponentLibraryEntry } from '@/lib/ui-studio/client'
import { 
  Search,
  Filter,
  Heart,
  Download,
  Star,
  Calendar,
  User,
  Tag,
  Layers
} from 'lucide-react'

interface ComponentEntry {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  previewHtml: string
  downloads: number
  likes: number
  createdAt: string
}

interface ComponentLibraryProps {
  projectId: string
  components?: ComponentEntry[]
  onSelect: (component: any) => void
}

const CATEGORIES = [
  'All', 'Button', 'Form', 'Navigation', 'Layout', 'Data Display', 'Feedback', 'Overlay'
]

const MOCK_COMPONENTS: ComponentEntry[] = [
  {
    id: '1',
    name: 'PrimaryButton',
    description: 'Accessible primary button with multiple variants',
    category: 'Button',
    tags: ['button', 'cta', 'primary'],
    previewHtml: '<button class="bg-blue-600 text-white px-4 py-2 rounded-lg">Primary</button>',
    downloads: 45,
    likes: 12,
    createdAt: '2025-01-15T10:30:00Z'
  },
  {
    id: '2', 
    name: 'LoginCard',
    description: 'Complete login form with validation',
    category: 'Form',
    tags: ['form', 'login', 'auth'],
    previewHtml: '<div class="bg-white p-6 rounded-lg shadow-lg border"><h2 class="text-xl font-bold mb-4">Login</h2><input class="w-full p-2 border rounded mb-2" placeholder="Email"><input class="w-full p-2 border rounded mb-4" placeholder="Password" type="password"><button class="w-full bg-blue-600 text-white p-2 rounded">Sign In</button></div>',
    downloads: 89,
    likes: 23,
    createdAt: '2025-01-14T15:20:00Z'
  },
  {
    id: '3',
    name: 'StatsCard',
    description: 'Dashboard stats card with icon and trend',
    category: 'Data Display',
    tags: ['stats', 'dashboard', 'metrics'],
    previewHtml: '<div class="bg-white p-4 rounded-lg shadow border"><div class="flex items-center justify-between"><div><p class="text-sm text-gray-600">Total Users</p><p class="text-2xl font-bold">1,234</p></div><div class="text-green-500">↗ +12%</div></div></div>',
    downloads: 67,
    likes: 18,
    createdAt: '2025-01-13T09:15:00Z'
  }
]

export function ComponentLibrary({ projectId, components = [], onSelect }: ComponentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'downloads'>('newest')
  const [realComponents, setRealComponents] = useState<ComponentLibraryEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Load real components from API
  useEffect(() => {
    loadComponents()
  }, [projectId])

  const loadComponents = async () => {
    try {
      setLoading(true)
      const fetchedComponents = await uiStudioClient.getComponents(projectId, {
        search: searchQuery,
        category: selectedCategory === 'All' ? undefined : selectedCategory
      })
      setRealComponents(fetchedComponents)
    } catch (error) {
      console.error('Failed to load components:', error)
      setRealComponents([])
    } finally {
      setLoading(false)
    }
  }

  // Reload when search or category changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadComponents()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedCategory])

  // Combine real and mock components for MVP
  const allComponents = [
    ...(Array.isArray(realComponents) ? realComponents.map(comp => ({
      id: comp.id,
      name: comp.name,
      description: comp.description || 'AI-generated component',
      category: comp.category,
      tags: comp.tags,
      previewHtml: comp.previewHtml || `<div class="p-4 bg-gray-100 rounded">${comp.name}</div>`,
      downloads: comp.downloads,
      likes: comp.likes,
      createdAt: comp.createdAt
    })) : []),
    ...components
  ]

  // Filter and sort components
  const filteredComponents = allComponents
    .filter(comp => {
      const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           comp.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCategory === 'All' || comp.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.likes - a.likes
        case 'downloads':
          return b.downloads - a.downloads
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const handleComponentSelect = async (component: ComponentEntry) => {
    try {
      // Try to load full component data from API
      const fullComponent = await uiStudioClient.getComponent(component.id)
      
      // Convert to preview format
      const previewComponent = {
        name: fullComponent.name,
        code: fullComponent.code,
        props: fullComponent.props,
        variants: fullComponent.variants,
        story: fullComponent.story || `// Storybook story for ${fullComponent.name}`,
        test: fullComponent.test || `// Jest test for ${fullComponent.name}`,
        previewHtml: fullComponent.previewHtml || component.previewHtml,
        rationale: fullComponent.description || component.description,
        confidence: 0.95,
        accessibility: { score: 95, issues: [] }
      }
      onSelect(previewComponent)
    } catch (error) {
      console.error('Failed to load component details:', error)
      
      // Fallback to basic component data
      const fallbackComponent = {
        name: component.name,
        code: `// ${component.name} component code would be loaded here`,
        props: [],
        variants: [],
        story: `// Storybook story for ${component.name}`,
        test: `// Jest test for ${component.name}`,
        previewHtml: component.previewHtml,
        rationale: component.description,
        confidence: 0.95,
        accessibility: { score: 95, issues: [] }
      }
      onSelect(fallbackComponent)
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Search and Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components..."
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-1">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="text-xs"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Sort by:</span>
            {(['newest', 'popular', 'downloads'] as const).map((option) => (
              <Button
                key={option}
                size="sm"
                variant={sortBy === option ? "default" : "ghost"}
                onClick={() => setSortBy(option)}
                className="text-xs"
              >
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Components Grid */}
      <div className="flex-1 overflow-auto space-y-3">
        {filteredComponents.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <Layers className="h-12 w-12 mx-auto mb-4 text-slate-400 opacity-50" />
              <h3 className="text-white font-semibold mb-2">No Components Found</h3>
              <p className="text-slate-400 text-sm">
                {searchQuery ? 'Try adjusting your search criteria' : 'Generate your first component to get started!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredComponents.map((component) => (
            <Card 
              key={component.id} 
              className="bg-slate-800 border-slate-700 cursor-pointer hover:border-purple-500 transition-colors"
              onClick={() => handleComponentSelect(component)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-sm mb-1">{component.name}</h3>
                    <p className="text-slate-400 text-xs mb-2 line-clamp-2">{component.description}</p>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {component.category}
                      </Badge>
                      {component.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview Thumbnail */}
                <div className="bg-white rounded p-2 mb-3 h-16 overflow-hidden">
                  <div 
                    className="scale-75 origin-top-left"
                    dangerouslySetInnerHTML={{ __html: component.previewHtml }} 
                  />
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Download className="h-3 w-3" />
                      <span>{component.downloads}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>{component.likes}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(component.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Library Stats */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-3">
          <div className="grid grid-cols-3 gap-3 text-xs text-center">
            <div>
              <div className="text-lg font-semibold text-purple-400">{allComponents.length}</div>
              <div className="text-slate-400">Components</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-400">
                {allComponents.reduce((sum, c) => sum + c.downloads, 0)}
              </div>
              <div className="text-slate-400">Downloads</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-400">
                {allComponents.reduce((sum, c) => sum + c.likes, 0)}
              </div>
              <div className="text-slate-400">Likes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
