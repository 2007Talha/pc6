const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function runDemoRecorder() {
  console.log('🎥 Launching browser with video recorder...');
  const videosDir = path.resolve(__dirname, '../videos');
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,720']
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: videosDir,
      size: { width: 1280, height: 720 }
    },
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();
  
  page.on('console', (msg) => {
    console.log(`[PAGE LOG]: ${msg.text()}`);
  });

  page.on('pageerror', (err) => {
    console.error(`[PAGE ERROR]: ${err.message}`);
  });

  console.log('🌐 Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  console.log('🎬 Injecting walkthrough script in browser...');
  const scriptPath = path.resolve(__dirname, 'walkthrough_automation.js');
  await page.addScriptTag({ path: scriptPath });

  console.log('⏳ Waiting for automated walkthrough to finish...');
  await page.waitForFunction(() => window.__DEMO_FINISHED__ === true, null, { timeout: 180000 });

  console.log('⏳ Allowing buffer frames...');
  await page.waitForTimeout(2000);

  const video = page.video();
  const videoPath = await video.path();

  console.log('🛑 Closing browser context to finalize video encoding...');
  await page.close();
  await context.close();
  await browser.close();

  const rootDir = path.resolve(__dirname, '..');
  const targetVideoPath = path.join(rootDir, 'demo.video');
  const targetMp4Path = path.join(rootDir, 'demo.mp4');

  fs.copyFileSync(videoPath, targetVideoPath);
  fs.copyFileSync(videoPath, targetMp4Path);

  const stats = fs.statSync(targetVideoPath);
  console.log(`✅ Video recorded successfully!`);
  console.log(`📁 File saved: ${targetVideoPath} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`📁 Also available as: ${targetMp4Path}`);
}

runDemoRecorder().catch((err) => {
  console.error('❌ Recording failed:', err);
  process.exit(1);
});
