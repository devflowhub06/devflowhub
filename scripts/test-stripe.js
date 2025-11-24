#!/usr/bin/env node

/**
 * Stripe Integration Test Script
 * Tests the Stripe billing integration
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripeIntegration() {
  console.log('🧪 Testing Stripe Integration...\n');

  try {
    // Test 1: Verify API Key
    console.log('1. Testing API Key...');
    const account = await stripe.accounts.retrieve();
    console.log(`✅ API Key valid. Account: ${account.display_name || account.id}`);

    // Test 2: List Products
    console.log('\n2. Testing Products...');
    const products = await stripe.products.list({ limit: 10 });
    console.log(`✅ Found ${products.data.length} products:`);
    products.data.forEach(product => {
      console.log(`   - ${product.name} (${product.id})`);
    });

    // Test 3: List Prices
    console.log('\n3. Testing Prices...');
    const prices = await stripe.prices.list({ limit: 10 });
    console.log(`✅ Found ${prices.data.length} prices:`);
    prices.data.forEach(price => {
      const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : 'N/A';
      console.log(`   - ${price.nickname || 'Unnamed'} - $${amount} ${price.currency.toUpperCase()}`);
    });

    // Test 4: Create Test Customer
    console.log('\n4. Testing Customer Creation...');
    const customer = await stripe.customers.create({
      email: 'test@devflowhub.com',
      name: 'Test Customer',
      metadata: {
        test: 'true'
      }
    });
    console.log(`✅ Test customer created: ${customer.id}`);

    // Test 5: Create Test Checkout Session
    console.log('\n5. Testing Checkout Session Creation...');
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: 'http://localhost:3000/dashboard?success=true',
      cancel_url: 'http://localhost:3000/pricing?canceled=true',
    });
    console.log(`✅ Test checkout session created: ${session.id}`);
    console.log(`   Checkout URL: ${session.url}`);

    // Test 6: Clean up test customer
    console.log('\n6. Cleaning up test data...');
    await stripe.customers.del(customer.id);
    console.log('✅ Test customer deleted');

    console.log('\n🎉 All tests passed! Stripe integration is working correctly.');
    console.log('\nNext steps:');
    console.log('- Test the full billing flow in your app');
    console.log('- Set up webhooks for production');
    console.log('- Monitor transactions in Stripe Dashboard');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('\n💡 Make sure your STRIPE_SECRET_KEY is set correctly in .env.local');
    } else if (error.type === 'StripeInvalidRequestError') {
      console.log('\n💡 Check that your price IDs are correct in .env.local');
    }
    
    process.exit(1);
  }
}

// Check if we're in the right directory
const fs = require('fs');
if (!fs.existsSync('.env.local')) {
  console.error('❌ .env.local file not found. Run the setup script first: node scripts/setup-stripe.js');
  process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in .env.local');
  process.exit(1);
}

testStripeIntegration();
