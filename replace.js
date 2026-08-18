const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src').filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
files.forEach(file => {
  if (file.includes('cartStore.ts')) return; // skip internal state name
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace all variations of Artisan with NONBASIC
  content = content.replace(/Artisan Merch/g, 'NONBASIC');
  content = content.replace(/Artisan/g, 'NONBASIC');
  content = content.replace(/ARTISAN/g, 'NONBASIC');
  content = content.replace(/artisanmerch/g, 'nonbasic'); // for email hello@artisanmerch.com -> hello@nonbasic.com
  content = content.replace(/artisan/g, 'nonbasic'); // for SEO keywords
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
  }
});
