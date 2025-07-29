#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * 
 * This script runs webpack bundle analyzer to help identify
 * optimization opportunities in the build output.
 * 
 * Usage:
 *   npm run build:analyze
 *   node analyze-bundle.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Starting bundle analysis...');

// Check if build exists
const buildPath = path.join(__dirname, '.next');
if (!fs.existsSync(buildPath)) {
  console.error('❌ No build found. Please run "npm run build" first.');
  process.exit(1);
}

try {
  // Set environment variable for analysis
  process.env.ANALYZE = 'true';
  
  console.log('📊 Building with bundle analyzer...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Bundle analysis complete!');
  console.log('📈 Check the generated bundle-analyzer-report.html file');
  
  // Provide optimization suggestions
  console.log('\n💡 Optimization Tips:');
  console.log('- Look for large dependencies that can be code-split');
  console.log('- Check for duplicate dependencies');
  console.log('- Consider lazy loading for large components');
  console.log('- Optimize images and assets');
  
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
  process.exit(1);
}
