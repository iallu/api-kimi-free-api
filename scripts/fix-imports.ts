import fs from 'fs';
import path from 'path';

function fixImports(dir: string) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            fixImports(fullPath);
            continue;
        }
        
        if (!file.endsWith('.ts')) continue;
        
        let content = fs.readFileSync(fullPath, 'utf8');
        content = content.replace(/from ['"]([^'"]+)\.ts['"]/g, 'from \'$1\'');
        fs.writeFileSync(fullPath, content);
    }
}

fixImports('./src'); 