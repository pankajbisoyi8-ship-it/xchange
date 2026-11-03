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
  const serverlessEntry = path.resolve(serverRoot, 'src/serverless.ts');

  const outfileServer = path.resolve(serverRoot, 'dist/server.js');
  const outfileServerless = path.resolve(serverRoot, 'dist/serverless.js');

  fs.mkdirSync(path.dirname(outfileServer), { recursive: true });

  // 1. Bundle local server runner (dist/server.js)
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

  // 2. Bundle Vercel serverless entrypoint (dist/serverless.js)
  await esbuild.build({
    entryPoints: [serverlessEntry],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    outfile: outfileServerless,
    sourcemap: true,
    logLevel: 'info',
    banner: {
      js: '// PartXChange Production Vercel Serverless Function\n',
    },
    footer: {
      js: '\nmodule.exports = app;\nmodule.exports.default = app;\n',
    },
  });

  console.log('✅ Server bundled successfully into dist/server.js and dist/serverless.js');
}

bundle().catch((err) => {
  console.error('❌ Bundle error:', err);
  process.exit(1);
});
