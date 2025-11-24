#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 DevFlowHub Direct Vercel Setup\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, description) {
  console.log(`\n${colors.bold}${colors.blue}Step ${step}:${colors.reset} ${description}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    return true;
  } catch (error) {
    return false;
  }
}

// Step 1: Check Vercel CLI
logStep(1, 'Checking Vercel CLI...');
try {
  execSync('vercel --version', { stdio: 'ignore' });
  log('✅ Vercel CLI is installed', 'green');
} catch (error) {
  log('⚠️  Vercel CLI not found. Install with: npm i -g vercel', 'yellow');
  log('   Then run: vercel login', 'yellow');
}

// Step 2: Check if project is linked to Vercel
logStep(2, 'Checking Vercel project link...');
try {
  const vercelConfig = path.join(process.cwd(), '.vercel');
  if (checkFileExists(vercelConfig)) {
    log('✅ Project is linked to Vercel', 'green');
  } else {
    log('⚠️  Project not linked to Vercel', 'yellow');
    log('   Run: vercel link', 'yellow');
  }
} catch (error) {
  log('⚠️  Could not check Vercel link status', 'yellow');
}

// Step 3: Create local environment file
logStep(3, 'Setting up local environment...');
const envLocalPath = path.join(process.cwd(), '.env.local');
const envStagingExamplePath = path.join(process.cwd(), 'env.staging.example');

if (!checkFileExists(envLocalPath)) {
  if (checkFileExists(envStagingExamplePath)) {
    if (copyFile(envStagingExamplePath, envLocalPath)) {
      log('✅ Created .env.local from template', 'green');
      log('⚠️  Please edit .env.local with your local values', 'yellow');
    } else {
      log('❌ Failed to create .env.local', 'red');
    }
  } else {
    log('❌ env.staging.example not found', 'red');
  }
} else {
  log('✅ .env.local already exists', 'green');
}

// Step 4: Check package.json scripts
logStep(4, 'Checking package.json scripts...');
const packageJsonPath = path.join(process.cwd(), 'package.json');

if (checkFileExists(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredScripts = [
    'build',
    'start',
    'test',
    'type-check',
    'lint:fix'
  ];
  
  const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
  
  if (missingScripts.length === 0) {
    log('✅ All required scripts found in package.json', 'green');
  } else {
    log('⚠️  Missing scripts in package.json:', 'yellow');
    missingScripts.forEach(script => log(`   - ${script}`, 'yellow'));
  }
} else {
  log('❌ package.json not found', 'red');
}

// Step 5: Check Node.js version
logStep(5, 'Checking Node.js version...');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  log(`✅ Node.js version: ${nodeVersion}`, 'green');
} catch (error) {
  log('❌ Node.js not found', 'red');
}

// Step 6: Display Vercel setup instructions
logStep(6, 'Vercel Environment Variables Setup');
log('\n📋 Manual steps you need to complete:', 'bold');

log('\n1. Set up external services:', 'yellow');
log('   • Create Sentry account: https://sentry.io');
log('   • Create PostHog account: https://posthog.com');
log('   • Set up Neon database: https://neon.tech');

log('\n2. Configure Vercel Environment Variables:', 'yellow');
log('   • Go to your Vercel dashboard → Project Settings → Environment Variables');
log('   • Add Production environment variables:');
log('     - DATABASE_URL (your Neon production database)');
log('     - NEXTAUTH_URL (your production domain)');
log('     - NEXTAUTH_SECRET (your production secret)');
log('     - GOOGLE_CLIENT_ID (your production Google OAuth ID)');
log('     - GOOGLE_CLIENT_SECRET (your production Google OAuth secret)');
log('     - SENTRY_DSN (your production Sentry DSN)');
log('     - POSTHOG_KEY (your production PostHog API key)');
log('     - POSTHOG_HOST (https://app.posthog.com)');
log('     - NODE_ENV (production)');
log('     - NEXT_PUBLIC_ENABLE_ANALYTICS (true)');
log('     - NEXT_PUBLIC_ENABLE_ERROR_TRACKING (true)');
log('     - NEXT_PUBLIC_ENABLE_FEEDBACK (true)');

log('\n   • Add Preview environment variables (same as above but for staging):');
log('     - Use staging database URL');
log('     - Use staging domain');
log('     - Use staging secrets and keys');

log('\n3. Deploy to Vercel:', 'yellow');
log('   • Use Cursor\'s Vercel integration to deploy');
log('   • Or run: vercel --prod (for production)');
log('   • Or run: vercel (for preview)');

log('\n📖 For detailed instructions, see: DIRECT_VERCEL_SETUP.md', 'blue');

// Step 7: Run pre-flight checks
logStep(7, 'Running pre-flight checks...');

try {
  log('Running type check...', 'yellow');
  execSync('npm run type-check', { stdio: 'inherit' });
  log('✅ TypeScript compilation successful', 'green');
} catch (error) {
  log('❌ TypeScript compilation failed', 'red');
}

try {
  log('Running lint check...', 'yellow');
  execSync('npm run lint', { stdio: 'inherit' });
  log('✅ Code linting passed', 'green');
} catch (error) {
  log('❌ Code linting failed', 'red');
}

// Step 8: Check if dependencies are installed
logStep(8, 'Checking dependencies...');
try {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (checkFileExists(nodeModulesPath)) {
    log('✅ Dependencies are installed', 'green');
  } else {
    log('⚠️  Dependencies not installed. Run: npm install', 'yellow');
  }
} catch (error) {
  log('⚠️  Could not check dependencies', 'yellow');
}

log('\n🎉 Vercel setup script completed!', 'green');
log('Please complete the manual steps above to finish the setup.', 'blue');
log('\n💡 Tip: After setting up environment variables in Vercel, redeploy your project for changes to take effect.', 'yellow'); 