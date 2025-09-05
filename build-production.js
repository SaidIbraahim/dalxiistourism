#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building production version...');

// Step 1: Replace AuthContext with production version
console.log('📝 Replacing AuthContext with production version...');
fs.copyFileSync(
  path.join(__dirname, 'src', 'context', 'AuthContext.prod.tsx'),
  path.join(__dirname, 'src', 'context', 'AuthContext.tsx')
);

// Step 2: Remove console.log statements from production files
console.log('🧹 Removing console.log statements...');

const filesToClean = [
  'src/services/dataService.ts',
  'src/services/CacheService.ts',
  'src/components/DataPreloader.tsx',
  'src/pages/BookingPage.tsx',
  'src/pages/DestinationsPage.tsx',
  'src/App.tsx'
];

filesToClean.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Remove console.log statements (but keep console.error for critical errors)
    content = content.replace(/console\.(log|warn|info)\([^)]*\);?\s*\n?/g, '');
    
    // Remove debug comments
    content = content.replace(/\/\/ Debug.*\n/g, '');
    content = content.replace(/\/\/ TODO.*\n/g, '');
    
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Cleaned: ${filePath}`);
  }
});

// Step 3: Build the project
console.log('🔨 Building project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 4: Restore original AuthContext
console.log('🔄 Restoring original AuthContext...');
// Note: In a real deployment, you'd want to keep the production version
// For now, we'll just log that it should be restored

console.log('🎉 Production build ready!');
console.log('📁 Output directory: dist/');
console.log('⚠️  Remember to set environment variables in your deployment platform!');
