import fs from 'fs';
const errorData = JSON.parse(fs.readFileSync('eslint_errors.json', 'utf16le').trim());
const errors = errorData.filter(f => f.errorCount > 0);
errors.forEach(f => {
  console.log('FILE:', f.filePath);
  f.messages.forEach(m => {
    console.log(`  Line ${m.line}: ${m.message}`);
  });
});
