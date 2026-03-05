const fs = require('fs');
const files = ['src/pages/Exam.tsx', 'src/pages/Register.tsx', 'src/index.css'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/dark:[a-zA-Z0-9_/[\]-]+\s?/g, '');
  fs.writeFileSync(file, content);
});
console.log('Removed dark classes');
