// replace-env.js
const fs = require('fs');
const path = require('path');

const environmentProdPath = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');
let environmentProdContent = fs.readFileSync(environmentProdPath, 'utf8');

// Replace placeholders with actual environment variables from process.env
// Provide fallback local values if the environment variables are not set (e.g., if running locally without Railway vars)
environmentProdContent = environmentProdContent
        .replace(/NG_APP_PRODUCTION_PLACEHOLDER/g, process.env.NG_APP_PRODUCTION || 'false')
        .replace(/NG_APP_API_URL_PLACEHOLDER/g, process.env.NG_APP_API_URL || 'http://localhost:5000/api')
        .replace(/NG_APP_NEXTJS_URL_PLACEHOLDER/g, process.env.NG_APP_NEXTJS_URL || 'http://localhost:3000');

fs.writeFileSync(environmentProdPath, environmentProdContent, 'utf8');

console.log('Production environment variables injected into environment.prod.ts.');