#!/usr/bin/env node

/**
 * Stripe Setup Script for DevFlowHub
 * This script helps you set up Stripe billing step by step
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupStripe() {
  console.log('🚀 DevFlowHub Stripe Setup Wizard');
  console.log('=====================================\n');

  console.log('This script will help you set up Stripe billing for DevFlowHub.');
  console.log('Make sure you have a Stripe account and are logged into the dashboard.\n');

  // Step 1: Get API Keys
  console.log('📋 Step 1: Get your Stripe API Keys');
  console.log('1. Go to https://dashboard.stripe.com/');
  console.log('2. Make sure you\'re in TEST mode (toggle in top-left)');
  console.log('3. Go to Developers → API Keys');
  console.log('4. Copy your Publishable key (starts with pk_test_) and Secret key (starts with sk_test_)\n');

  const publishableKey = await question('Enter your Stripe Publishable Key (pk_test_...): ');
  const secretKey = await question('Enter your Stripe Secret Key (sk_test_...): ');

  // Step 2: Create Products
  console.log('\n📦 Step 2: Create Products in Stripe Dashboard');
  console.log('1. Go to Products in Stripe Dashboard');
  console.log('2. Create these products:\n');

  console.log('Product 1: DevFlowHub Pro');
  console.log('- Name: DevFlowHub Pro');
  console.log('- Description: Professional AI development workspace');
  console.log('- Price: $29.00 USD monthly recurring');
  console.log('- Copy the Price ID (starts with price_)\n');

  const proPriceId = await question('Enter DevFlowHub Pro Price ID (price_...): ');

  console.log('Product 2: DevFlowHub Enterprise');
  console.log('- Name: DevFlowHub Enterprise');
  console.log('- Description: Enterprise AI development platform');
  console.log('- Price: $99.00 USD monthly recurring');
  console.log('- Copy the Price ID (starts with price_)\n');

  const enterprisePriceId = await question('Enter DevFlowHub Enterprise Price ID (price_...): ');

  // Step 3: Create Usage-Based Products
  console.log('\n📊 Step 3: Create Usage-Based Products');
  console.log('Create these metered products for usage tracking:\n');

  console.log('AI Tokens Usage:');
  console.log('- Price: $0.01 USD per unit');
  console.log('- Usage type: Metered\n');

  const aiTokensPriceId = await question('Enter AI Tokens Price ID (price_...): ');

  console.log('Preview Minutes Usage:');
  console.log('- Price: $0.10 USD per unit');
  console.log('- Usage type: Metered\n');

  const previewMinutesPriceId = await question('Enter Preview Minutes Price ID (price_...): ');

  console.log('Sandbox Runs Usage:');
  console.log('- Price: $0.50 USD per unit');
  console.log('- Usage type: Metered\n');

  const sandboxRunsPriceId = await question('Enter Sandbox Runs Price ID (price_...): ');

  console.log('Deployments Usage:');
  console.log('- Price: $2.00 USD per unit');
  console.log('- Usage type: Metered\n');

  const deploymentsPriceId = await question('Enter Deployments Price ID (price_...): ');

  // Step 4: Set up Webhook
  console.log('\n🔗 Step 4: Set up Webhook');
  console.log('1. Go to Developers → Webhooks in Stripe Dashboard');
  console.log('2. Click Add endpoint');
  console.log('3. Endpoint URL: http://localhost:3000/api/billing/webhook');
  console.log('4. Select these events:');
  console.log('   - checkout.session.completed');
  console.log('   - customer.subscription.created');
  console.log('   - customer.subscription.updated');
  console.log('   - customer.subscription.deleted');
  console.log('   - invoice.payment_succeeded');
  console.log('   - invoice.payment_failed');
  console.log('5. Copy the Webhook signing secret (starts with whsec_)\n');

  const webhookSecret = await question('Enter Webhook Secret (whsec_...): ');

  // Step 5: Generate .env.local file
  console.log('\n📝 Step 5: Generating .env.local file...');

  const envContent = `# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/devflow"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="313dkTPkcPQ02KedN1xip2dFkeaqwXkCjVYF"

# Google OAuth
GOOGLE_CLIENT_ID="1039746332971-3i42a3taqg4bjkpk646p5v3cha3cqo1e.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"

# OpenAI
OPENAI_API_KEY="your-openai-api-key-here"

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY="phx_OdKg5PeG0cZwoaCTy2WjTAHcy8fuEdwuji065Hx1fvGH6ri"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# Environment
NODE_ENV="development"

# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY="${secretKey}"
STRIPE_PUBLISHABLE_KEY="${publishableKey}"
STRIPE_WEBHOOK_SECRET="${webhookSecret}"

# Stripe Price IDs (Test Mode)
STRIPE_PRO_MONTHLY_PRICE_ID="${proPriceId}"
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID="${enterprisePriceId}"
STRIPE_AI_TOKENS_PRICE_ID="${aiTokensPriceId}"
STRIPE_PREVIEW_MINUTES_PRICE_ID="${previewMinutesPriceId}"
STRIPE_SANDBOX_RUNS_PRICE_ID="${sandboxRunsPriceId}"
STRIPE_DEPLOYMENTS_PRICE_ID="${deploymentsPriceId}"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_FEATURE_REBRAND_V1_0="true"
NEXT_PUBLIC_FEATURE_AI_ROUTER="true"
NEXT_PUBLIC_FEATURE_ANALYTICS_V2="true"
`;

  const envPath = path.join(process.cwd(), '.env.local');
  fs.writeFileSync(envPath, envContent);

  console.log('✅ .env.local file created successfully!');

  // Step 6: Test instructions
  console.log('\n🧪 Step 6: Test Your Setup');
  console.log('1. Restart your development server: npm run dev');
  console.log('2. Go to http://localhost:3000/pricing');
  console.log('3. Click "Start Free Trial" on the Pro plan');
  console.log('4. Use test card: 4242 4242 4242 4242');
  console.log('5. Complete the checkout process');
  console.log('6. Check Stripe Dashboard to see the subscription');

  console.log('\n🎉 Stripe setup complete!');
  console.log('\nNext steps:');
  console.log('- Test the billing flow thoroughly');
  console.log('- Set up live mode when ready for production');
  console.log('- Monitor your revenue in Stripe Dashboard');
  console.log('- Check the detailed setup guide: docs/STRIPE_PRODUCTION_SETUP.md');

  rl.close();
}

setupStripe().catch(console.error);
