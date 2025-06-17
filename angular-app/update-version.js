const fs = require('fs');
const path = require('path');

// Leer la versión del package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Crear el contenido del archivo de versión
const versionFileContent = `// This file is auto-generated. Do not edit manually.
export const VERSION = '${version}';
`;

// Escribir el archivo de versión
const versionFilePath = path.join(__dirname, 'src', 'app', 'shared', 'version.ts');
fs.writeFileSync(versionFilePath, versionFileContent);

console.log(`✅ Version file updated to ${version}`);
