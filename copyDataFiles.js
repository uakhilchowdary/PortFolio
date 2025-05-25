/**
 * Script to copy data files for the portfolio site:
 * 1. Copies JSON data from src/data to public/data
 * 2. Copies Markdown blog files from src/blogs to public/blogs
 * 
 * This ensures both SEO-friendly build content and client-side access
 */

import fs from 'fs';
import path from 'path';

// Define paths for JSON data
const jsonSourceDir = path.join(process.cwd(), 'src', 'data');
const jsonDestDir = path.join(process.cwd(), 'public', 'data');

// Define paths for blogs
const blogSourceDir = path.join(process.cwd(), 'src', 'blogs');
const blogDestDir = path.join(process.cwd(), 'public', 'blogs');

// Create directories if they don't exist
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Copy JSON files
function copyJsonFiles() {
  try {
    ensureDirectoryExists(jsonDestDir);
    
    const files = fs.readdirSync(jsonSourceDir);
    
    let copiedCount = 0;
    for (const file of files) {
      if (file.endsWith('.json')) {
        const sourcePath = path.join(jsonSourceDir, file);
        const destPath = path.join(jsonDestDir, file);
        
        fs.copyFileSync(sourcePath, destPath);
        copiedCount++;
        console.log(`Copied JSON: ${file}`);
      }
    }
    
    console.log(`✅ Successfully copied ${copiedCount} JSON files from src/data to public/data`);
    return true;
  } catch (error) {
    console.error('❌ Error copying JSON files:', error);
    return false;
  }
}

// Recursively copy blog files
function copyBlogFiles(sourceDir = blogSourceDir, destDir = blogDestDir, relativePath = '') {
  try {
    const currentSourceDir = path.join(sourceDir, relativePath);
    const currentDestDir = path.join(destDir, relativePath);
    
    // Ensure the destination directory exists
    ensureDirectoryExists(currentDestDir);
    
    // Read all files and directories in the current source directory
    const items = fs.readdirSync(currentSourceDir);
    
    let copiedCount = 0;
    
    for (const item of items) {
      const sourcePath = path.join(currentSourceDir, item);
      const destPath = path.join(currentDestDir, item);
      const stats = fs.statSync(sourcePath);
      
      if (stats.isDirectory()) {
        // Recursively copy subdirectories
        const subDirPath = relativePath ? `${relativePath}/${item}` : item;
        const subDirCopied = copyBlogFiles(sourceDir, destDir, subDirPath);
        copiedCount += subDirCopied;
      } else if (item.endsWith('.md') || item === 'README.md') {
        // Copy markdown files
        fs.copyFileSync(sourcePath, destPath);
        copiedCount++;
        
        // Only log individual files when not in a subdirectory (to avoid excessive output)
        if (!relativePath) {
          console.log(`Copied blog file: ${item}`);
        }
      }
    }
    
    // Log summary for subdirectories
    if (relativePath) {
      console.log(`Copied ${copiedCount} files from ${relativePath}/`);
    } else {
      console.log(`✅ Successfully copied ${copiedCount} blog files from src/blogs to public/blogs`);
    }
    
    return copiedCount;
  } catch (error) {
    console.error(`❌ Error copying blog files${relativePath ? ` in ${relativePath}` : ''}:`, error);
    return 0;
  }
}

// Main execution
console.log('Starting data file copy process...');
const jsonSuccess = copyJsonFiles();
const blogSuccess = copyBlogFiles();

if (jsonSuccess && blogSuccess) {
  console.log('✅ All data files copied successfully!');
} else {
  console.error('❌ There were errors during the copy process.');
  process.exit(1);
}