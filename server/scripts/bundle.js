const path = require('path');
const fs = require('fs');

async function bundle() {
  console.log('📦 Bundling server with esbuild for production and Vercel serverless...');

  // Try resolving esbuild from local server or parent monorepo root
  let esbuild;
  try {
    esbuild = require('esbuild');
  } catch {
    try {
      esbuild = require('../../node_modules/esbuild');
    } catch {
      esbuild = require('../../../node_modules/esbuild');
    }
  }

  const serverRoot = path.resolve(__dirname, '..');

  const serverEntry = path.resolve(serverRoot, 'src/server.ts');
  const outfileServer = path.resolve(serverRoot, 'dist/server.js');

  fs.mkdirSync(path.dirname(outfileServer), { recursive: true });

  await esbuild.build({
    entryPoints: [serverEntry],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    outfile: outfileServer,
    sourcemap: true,
    logLevel: 'info',
  });

  console.log('✅ Server bundled successfully into dist/server.js');
}

bundle().catch((err) => {
  console.error('❌ Bundle error:', err);
  process.exit(1);
});
