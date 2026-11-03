const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const screenshotDir = path.resolve('docs/assets/screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profileDir = path.join(os.tmpdir(), 'edge_partx_' + Date.now());

function waitForHttp(url, timeoutMs = 25000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve();
        } else {
          retry();
        }
      }).on('error', retry);
    };
    const retry = () => {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timeout waiting for ${url}`));
      } else {
        setTimeout(check, 500);
      }
    };
    check();
  });
}

async function run() {
  console.log('🚀 Starting PartXChange Backend and Client...');

  // Start backend
  const serverProc = spawn('node', ['dist/server.js'], {
    cwd: path.resolve('server'),
    env: { ...process.env, PORT: '5000' },
    stdio: 'ignore'
  });

  // Start client Vite dev server
  const clientProc = spawn('npm.cmd', ['run', 'dev', '--workspace=client'], {
    cwd: path.resolve('.'),
    env: { ...process.env },
    shell: true,
    stdio: 'ignore'
  });

  try {
    console.log('⏳ Waiting for backend (http://localhost:5000/health)...');
    await waitForHttp('http://localhost:5000/health');
    console.log('✅ Backend is healthy!');

    console.log('⏳ Waiting for frontend (http://localhost:5173)...');
    await waitForHttp('http://localhost:5173');
    console.log('✅ Frontend is live!');

    // Start Edge with CDP
    console.log('🌐 Launching Microsoft Edge in headless mode with CDP...');
    const edgeProc = spawn(edgePath, [
      '--headless=new',
      '--remote-debugging-port=9222',
      `--user-data-dir=${profileDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--window-size=1440,900'
    ], { stdio: 'ignore' });

    await new Promise(r => setTimeout(r, 2000));

    // Connect to CDP
    const verRes = await fetch('http://127.0.0.1:9222/json/version');
    const verData = await verRes.json();
    console.log('✅ Connected to Edge:', verData.Browser);

    const newPageRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:5173', { method: 'PUT' });
    const pageData = await newPageRes.json();
    const ws = new WebSocket(pageData.webSocketDebuggerUrl);

    await new Promise((resolve) => {
      ws.onopen = resolve;
    });

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (evt) => {
          const res = JSON.parse(evt.data);
          if (res.id === id) {
            ws.removeEventListener('message', handler);
            resolve(res.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    async function navigateAndCapture(url, filename, waitMs = 2500) {
      console.log(`📸 Navigating to ${url} -> ${filename}...`);
      await send('Page.navigate', { url });
      await new Promise(r => setTimeout(r, waitMs));
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const outPath = path.join(screenshotDir, filename);
      fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
      const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
      console.log(`   Saved ${filename} (${sizeKb} KB)`);
    }

    async function evalScript(expression) {
      const res = await send('Runtime.evaluate', {
        expression,
        awaitPromise: true,
        returnByValue: true
      });
      return res?.result?.value;
    }

    // 1. Homepage
    await navigateAndCapture('http://localhost:5173/', '01-homepage.png', 3000);

    // 2. Browse Hardware
    await navigateAndCapture('http://localhost:5173/browse', '02-browse-hardware.png', 3000);

    // 3. Listing Detail
    await navigateAndCapture('http://localhost:5173/listings/sample-listing-gpu-1', '03-listing-detail.png', 3000);

    // 4. Register Page
    await navigateAndCapture('http://localhost:5173/register', '04-register.png', 2000);

    // 5. Login Page
    await navigateAndCapture('http://localhost:5173/login', '05-login.png', 2000);

    // 6. Create Listing Page (as Seller)
    console.log('🔑 Authenticating as Seller (Rahul Sharma)...');
    await evalScript(`(async () => {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'seller.rahul@gmail.com', password: 'Password123!' }),
        credentials: 'include'
      });
      const data = await res.json();
      if (window.authStore) {
        window.authStore.getState().setAuth(data.data.user, data.data.accessToken);
      }
      return data;
    })()`);
    await navigateAndCapture('http://localhost:5173/listings/new', '06-create-listing.png', 3000);

    // 7. Orders & Escrow Tracking (as Buyer Amit Verma)
    console.log('🔑 Authenticating as Buyer (Amit Verma)...');
    await evalScript(`(async () => {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'buyer.amit@gmail.com', password: 'Password123!' }),
        credentials: 'include'
      });
      const data = await res.json();
      if (window.authStore) {
        window.authStore.getState().setAuth(data.data.user, data.data.accessToken);
      }
      return data;
    })()`);
    await navigateAndCapture('http://localhost:5173/orders', '07-orders-tracking.png', 3000);

    // 8. Agent Operations Dashboard
    console.log('🔑 Authenticating as Field Agent (Vikram Singh)...');
    await evalScript(`(async () => {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'agent.vikram@partxchange.com', password: 'Password123!' }),
        credentials: 'include'
      });
      const data = await res.json();
      if (window.authStore) {
        window.authStore.getState().setAuth(data.data.user, data.data.accessToken);
      }
      return data;
    })()`);
    await navigateAndCapture('http://localhost:5173/agent', '08-agent-dashboard.png', 3000);

    // 9. Agent Cash Management Ledger
    await navigateAndCapture('http://localhost:5173/agent/cash', '09-agent-cash.png', 3000);

    // 10. Platform Admin Dashboard
    console.log('🔑 Authenticating as System SuperAdmin...');
    await evalScript(`(async () => {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@partxchange.com', password: 'AdminPass123!' }),
        credentials: 'include'
      });
      const data = await res.json();
      if (window.authStore) {
        window.authStore.getState().setAuth(data.data.user, data.data.accessToken);
      }
      return data;
    })()`);
    await navigateAndCapture('http://localhost:5173/admin', '10-admin-dashboard.png', 3500);

    console.log('🎉 All 10 genuine screenshots captured successfully!');

    ws.close();
    edgeProc.kill();
  } finally {
    try { serverProc.kill(); } catch (e) {}
    try { clientProc.kill(); } catch (e) {}
  }
}

run().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
