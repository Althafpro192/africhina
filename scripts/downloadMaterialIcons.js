import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const targetDirs = [
  path.join(rootDir, 'frontend', 'public'),
  path.join(rootDir, 'backend', 'public')
];

function fetchText(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchText(res.headers.location, headers));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function downloadBinary(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadBinary(res.headers.location, destPath));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => reject(err));
    });
  });
}

async function run() {
  console.log('Downloading Google Material Symbols font stylesheet...');
  const css = await fetchText(GOOGLE_FONTS_URL, { 'User-Agent': USER_AGENT });
  
  const urlMatch = css.match(/src:\ [^;]*url\((https:\/\/[^)]+\.woff2)\)/);
  if (!urlMatch || !urlMatch[1]) {
    throw new Error('Failed to parse .woff2 URL from Google Fonts CSS');
  }

  const fontUrl = urlMatch[1];
  console.log(`Found font URL: ${fontUrl}`);

  for (const pubDir of targetDirs) {
    const fontsDir = path.join(pubDir, 'fonts');
    const cssDir = path.join(pubDir, 'css');
    
    fs.mkdirSync(fontsDir, { recursive: true });
    fs.mkdirSync(cssDir, { recursive: true });

    const fontDest = path.join(fontsDir, 'material-symbols.woff2');
    console.log(`Downloading font file to ${fontDest}...`);
    await downloadBinary(fontUrl, fontDest);

    const localCssContent = `/* Material Symbols Outlined - Local Offline Version */
@font-face {
  font-family: 'Material Symbols Outlined';
  font-style: normal;
  font-weight: 100 700;
  font-display: block;
  src: url('/fonts/material-symbols.woff2') format('woff2');
}

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
}
`;

    const cssDest = path.join(cssDir, 'material-icons-local.css');
    fs.writeFileSync(cssDest, localCssContent, 'utf-8');
    console.log(`Saved local CSS to ${cssDest}`);
  }

  console.log('Material Symbols font download complete!');
}

run().catch(err => {
  console.error('Error downloading Material icons:', err);
  process.exit(1);
});
