const path = require('path');
const fs = require('fs');

async function bundle() {
  console.log('📦 Bundling server with esbuild...');

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
  const entryPoint = path.resolve(serverRoot, 'src/server.ts');
  const outfile = path.resolve(serverRoot, 'dist/server.js');

  fs.mkdirSync(path.dirname(outfile), { recursive: true });

  await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    outfile: outfile,
    sourcemap: true,
    logLevel: 'info',
  });

  console.log('✅ Server bundled successfully into dist/server.js');
}

bundle().catch((err) => {
  console.error('❌ Bundle error:', err);
  process.exit(1);
});

