import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, prompt, framework, category } = await request.json()

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: session.user.id 
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Generate component code based on prompt and framework
    const componentCode = generateComponentCode(prompt, framework, category)
    const componentName = extractComponentName(prompt, category)

    // Create component file in project
    const fileName = `${componentName}.${getFileExtension(framework)}`
    const filePath = `components/${fileName}`

    // Save component to project files (this would integrate with your file system)
    // For now, we'll create a project file record
    const projectFile = await prisma.projectFile.create({
      data: {
        projectId,
        name: fileName,
        path: filePath,
        content: componentCode,
        type: 'component',
        metadata: {
          framework,
          category,
          componentName,
          generated: true
        }
      }
    })

    // Log usage
    await prisma.usageLog.create({
      data: {
        projectId,
        userId: session.user.id,
        tool: 'V0',
        action: 'generate_component',
        metadata: {
          prompt,
          framework,
          category,
          componentName,
          fileName,
          success: true
        }
      }
    })

    // Note: ProjectActivity creation removed to prevent database errors

    return NextResponse.json({
      success: true,
      component: {
        name: componentName,
        code: componentCode,
        fileName,
        filePath,
        framework,
        category
      },
      file: projectFile
    })

  } catch (error) {
    console.error('Failed to generate component:', error)
    return NextResponse.json(
      { error: 'Failed to generate component' },
      { status: 500 }
    )
  }
}

function generateComponentCode(prompt: string, framework: string, category: string): string {
  const componentName = extractComponentName(prompt, category)
  
  switch (framework.toLowerCase()) {
    case 'react':
      return generateReactComponent(componentName, prompt, category)
    case 'vue':
      return generateVueComponent(componentName, prompt, category)
    case 'angular':
      return generateAngularComponent(componentName, prompt, category)
    default:
      return generateReactComponent(componentName, prompt, category)
  }
}

function generateReactComponent(name: string, prompt: string, category: string): string {
  return `import React from 'react';

/**
 * ${name} Component
 * Generated from prompt: ${prompt}
 * Category: ${category}
 */
export const ${name}: React.FC = () => {
  return (
    <div className="${name.toLowerCase()}-container">
      <h2>${name}</h2>
      <p>This component was generated using AI based on your description.</p>
      <div className="content">
        {/* TODO: Customize this component based on your needs */}
        <p>${prompt}</p>
      </div>
    </div>
  );
};

export default ${name};
`
}

function generateVueComponent(name: string, prompt: string, category: string): string {
  return `<template>
  <div class="${name.toLowerCase()}-container">
    <h2>${name}</h2>
    <p>This component was generated using AI based on your description.</p>
    <div class="content">
      <!-- TODO: Customize this component based on your needs -->
      <p>${prompt}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: '${name}',
  data() {
    return {
      // Add your data properties here
    }
  },
  methods: {
    // Add your methods here
  }
}
</script>

<style scoped>
.${name.toLowerCase()}-container {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}
</style>
`
}

function generateAngularComponent(name: string, prompt: string, category: string): string {
  return `import { Component } from '@angular/core';

@Component({
  selector: 'app-${name.toLowerCase()}',
  template: \`
    <div class="${name.toLowerCase()}-container">
      <h2>${name}</h2>
      <p>This component was generated using AI based on your description.</p>
      <div class="content">
        <!-- TODO: Customize this component based on your needs -->
        <p>${prompt}</p>
      </div>
    </div>
  \`,
  styles: [\`
    .${name.toLowerCase()}-container {
      padding: 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
    }
  \`]
})
export class ${name}Component {
  // Add your component logic here
}
`
}

function extractComponentName(prompt: string, category: string): string {
  // Extract meaningful component name from prompt
  const words = prompt.split(' ').filter(word => word.length > 2)
  if (words.length === 0) return 'GeneratedComponent'
  
  // Capitalize first letter of each word
  const componentName = words
    .slice(0, 3) // Take first 3 words max
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
  
  return componentName || 'GeneratedComponent'
}

function getFileExtension(framework: string): string {
  switch (framework.toLowerCase()) {
    case 'react':
      return 'tsx'
    case 'vue':
      return 'vue'
    case 'angular':
      return 'ts'
    default:
      return 'tsx'
  }
}
