const fs = require('fs');
const files = [
  { path: 'frontend/src/views/admin/RatingsModeration.vue', depth: 3 },
  { path: 'frontend/src/views/admin/Dashboard.vue', depth: 3 },
  { path: 'frontend/src/views/admin/Suppliers.vue', depth: 3 },
  { path: 'frontend/src/views/buyer/RequestDetail.vue', depth: 3 },
  { path: 'frontend/src/components/ui/BaseModal.vue', depth: 3 },
  { path: 'frontend/src/components/chat/ChatComponent.vue', depth: 3 }
];

files.forEach(({ path, depth }) => {
  let content = fs.readFileSync(path, 'utf8');
  
  if (content.includes('alert(')) {
    // Replace alert with showToast
    content = content.replace(/alert\(/g, 'showToast(');
    
    // Add import
    const prefix = '../'.repeat(depth - 1);
    const importStatement = `import { useToast } from '${prefix}composables/useToast.js';\nconst { showToast } = useToast();\n`;
    
    // Find script setup
    const scriptSetupMatch = content.match(/<script setup[^>]*>/);
    if (scriptSetupMatch) {
      const insertionIndex = scriptSetupMatch.index + scriptSetupMatch[0].length;
      content = content.slice(0, insertionIndex) + '\n' + importStatement + content.slice(insertionIndex);
    }
    
    fs.writeFileSync(path, content, 'utf8');
    console.log('Updated ' + path);
  }
});
