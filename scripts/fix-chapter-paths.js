#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix paths in all chapter HTML files
const chaptersDir = path.join(__dirname, '..', 'docs', 'chapters');
const chapterFiles = fs.readdirSync(chaptersDir).filter(f => f.endsWith('.html'));

chapterFiles.forEach(file => {
  const filePath = path.join(chaptersDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix CSS path (go up one level from chapters/)
  content = content.replace(
    'href="/docs/assets/css/main.css"',
    'href="../assets/css/main.css"'
  );
  
  // Fix JS path (go up one level from chapters/)
  content = content.replace(
    'src="/docs/assets/js/main.js"',
    'src="../assets/js/main.js"'
  );
  
  // Fix navigation links
  content = content.replace(
    'href="/docs/"',
    'href="../"'
  );
  
  content = content.replace(
    'href="/docs/chapters/"',
    'href="./"'
  );
  
  content = content.replace(
    'href="/docs/playground/"',
    'href="../playground/"'
  );
  
  content = content.replace(
    'href="/docs/demos/"',
    'href="../demos/"'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed paths in ${file}`);
});

console.log(`\nFixed ${chapterFiles.length} chapter files`);