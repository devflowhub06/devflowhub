#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 DevFlowHub Staging Environment Setup\n');

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

// Step 1: Check if staging branch exists
logStep(1, 'Checking staging branch...');
try {
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  log(`Current branch: ${currentBranch}`, 'yellow');
  
  if (currentBranch !== 'staging') {
    log('Creating staging branch...', 'yellow');
    execSync('git checkout -b staging', { stdio: 'inherit' });
    log('✅ Staging branch created', 'green');
  } else {
    log('✅ Already on staging branch', 'green');
  }
} catch (error) {
  log('❌ Error checking git branch. Make sure you\'re in a git repository.', 'red');
  process.exit(1);
}

// Step 2: Create staging environment file
logStep(2, 'Setting up staging environment file...');
const envStagingPath = path.join(process.cwd(), '.env.staging');
const envStagingExamplePath = path.join(process.cwd(), 'env.staging.example');

if (!checkFileExists(envStagingPath)) {
  if (checkFileExists(envStagingExamplePath)) {
    if (copyFile(envStagingExamplePath, envStagingPath)) {
      log('✅ Created .env.staging from template', 'green');
      log('⚠️  Please edit .env.staging with your actual values', 'yellow');
    } else {
      log('❌ Failed to create .env.staging', 'red');
    }
  } else {
    log('❌ env.staging.example not found', 'red');
  }
} else {
  log('✅ .env.staging already exists', 'green');
}

// Step 3: Check for required tools
logStep(3, 'Checking required tools...');

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
  log('✅ Vercel CLI is installed', 'green');
} catch (error) {
  log('⚠️  Vercel CLI not found. Install with: npm i -g vercel', 'yellow');
}

// Check if Node.js version is compatible
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  log(`✅ Node.js version: ${nodeVersion}`, 'green');
} catch (error) {
  log('❌ Node.js not found', 'red');
}

// Step 4: Check package.json scripts
logStep(4, 'Checking package.json scripts...');
const packageJsonPath = path.join(process.cwd(), 'package.json');

if (checkFileExists(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredScripts = [
    'build:staging',
    'start:staging',
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

// Step 5: Check for GitHub repository
logStep(5, 'Checking GitHub repository...');
try {
  const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
  if (remoteUrl.includes('github.com')) {
    log('✅ GitHub repository detected', 'green');
    log(`   Repository: ${remoteUrl}`, 'blue');
  } else {
    log('⚠️  Remote origin is not a GitHub repository', 'yellow');
  }
} catch (error) {
  log('⚠️  No remote origin found', 'yellow');
}

// Step 6: Display next steps
logStep(6, 'Next Steps');
log('\n📋 Manual steps you need to complete:', 'bold');

log('\n1. Set up external services:', 'yellow');
log('   • Create Sentry account: https://sentry.io');
log('   • Create PostHog account: https://posthog.com');
log('   • Get Vercel token: https://vercel.com/account/tokens');

log('\n2. Configure GitHub Secrets:', 'yellow');
log('   • Go to your GitHub repository → Settings → Secrets and variables → Actions');
log('   • Add the required secrets listed in SETUP_GUIDE.md');

log('\n3. Update environment variables:', 'yellow');
log('   • Edit .env.staging with your actual values');
log('   • Copy values to GitHub Secrets');

log('\n4. Deploy to staging:', 'yellow');
log('   • git add .');
log('   • git commit -m "Setup staging environment"');
log('   • git push origin staging');

log('\n📖 For detailed instructions, see: SETUP_GUIDE.md', 'blue');

// Step 7: Offer to run tests
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

log('\n🎉 Setup script completed!', 'green');
log('Please complete the manual steps above to finish the staging environment setup.', 'blue'); 