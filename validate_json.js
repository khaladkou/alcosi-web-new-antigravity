
const fs = require('fs');
const path = require('path');

const dictDir = path.join(__dirname, 'src/dictionaries');
const files = fs.readdirSync(dictDir);

files.forEach(file => {
    if (file.endsWith('.json')) {
        const filePath = path.join(dictDir, file);
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            JSON.parse(content);
            console.log(`✅ ${file} is valid.`);
        } catch (e) {
            console.error(`❌ ${file} is INVALID:`, e.message);
        }
    }
});
