/**
 * DevFlowHub Module Migration Script
 * Migrates existing projects to use DevFlowHub module names
 * Adds moduleName and provider fields to existing projects
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Mapping from legacy tools to new modules and providers
const TOOL_MAPPINGS = {
  'CURSOR': { moduleName: 'editor', provider: 'cursor' },
  'REPLIT': { moduleName: 'sandbox', provider: 'replit' },
  'SANDBOX': { moduleName: 'sandbox', provider: 'replit' }, // Handle SANDBOX as REPLIT
  'V0': { moduleName: 'ui_studio', provider: 'v0' },
  'BOLT': { moduleName: 'deployer', provider: 'bolt' }
}

async function migrateProjects() {
  console.log('🚀 Starting DevFlowHub module migration...')
  
  try {
    // Get all projects
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        activeTool: true,
        moduleName: true,
        provider: true
      }
    })

    console.log(`📊 Found ${projects.length} projects to migrate`)

    let migrated = 0
    let skipped = 0
    let errors = 0

    for (const project of projects) {
      try {
        // Check if already migrated
        if (project.moduleName && project.provider) {
          console.log(`⏭️  Skipping ${project.name} - already migrated`)
          skipped++
          continue
        }

        // Get mapping for active tool
        const mapping = TOOL_MAPPINGS[project.activeTool]
        if (!mapping) {
          console.log(`⚠️  Unknown tool ${project.activeTool} for project ${project.name}`)
          errors++
          continue
        }

        // Update project with module info
        await prisma.project.update({
          where: { id: project.id },
          data: {
            moduleName: mapping.moduleName,
            provider: mapping.provider
          }
        })

        console.log(`✅ Migrated ${project.name}: ${project.activeTool} → ${mapping.moduleName} (${mapping.provider})`)
        migrated++

      } catch (error) {
        console.error(`❌ Error migrating project ${project.name}:`, error.message)
        errors++
      }
    }

    console.log('\n📈 Migration Summary:')
    console.log(`   ✅ Migrated: ${migrated}`)
    console.log(`   ⏭️  Skipped: ${skipped}`)
    console.log(`   ❌ Errors: ${errors}`)
    console.log(`   📊 Total: ${projects.length}`)

  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

async function rollbackMigration() {
  console.log('🔄 Rolling back DevFlowHub module migration...')
  
  try {
    const result = await prisma.project.updateMany({
      data: {
        moduleName: null,
        provider: null
      }
    })

    console.log(`✅ Rolled back ${result.count} projects`)
  } catch (error) {
    console.error('💥 Rollback failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Main execution
async function main() {
  const command = process.argv[2]
  
  switch (command) {
    case 'migrate':
      await migrateProjects()
      break
    case 'rollback':
      await rollbackMigration()
      break
    default:
      console.log('Usage: node migrate-to-modules.js [migrate|rollback]')
      console.log('  migrate  - Migrate projects to use DevFlowHub modules')
      console.log('  rollback - Remove module fields from projects')
      process.exit(1)
  }
}

main().catch(console.error)
