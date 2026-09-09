import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = '/Users/erik/.gemini/antigravity/brain/fce84f1d-a4c4-4410-86a6-b60eb6331169';

(async () => {
  console.log('📸 Launching Chrome to capture live KuroBlob UI screenshots...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 850, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // 1. Capture Main Home / Dialogue Panel with Vault Import/Export
  const mainPath = path.join(ARTIFACT_DIR, 'kuroblob_live_main.png');
  await page.screenshot({ path: mainPath });
  console.log('✅ Captured main UI:', mainPath);

  // 2. Click on Studio Tab and capture "↺ 恢复默认" & controls
  await page.click('#tabStudio');
  await new Promise(r => setTimeout(r, 400));
  const studioPath = path.join(ARTIFACT_DIR, 'kuroblob_live_studio.png');
  await page.screenshot({ path: studioPath });
  console.log('✅ Captured studio UI:', studioPath);

  // 3. Click on Creator Tab and generate Coffee Dev expression
  await page.click('#tabCreator');
  await new Promise(r => setTimeout(r, 300));
  await page.click('.creator-preset-chip[data-prompt*="咖啡"]');
  await new Promise(r => setTimeout(r, 700));
  const creatorPath = path.join(ARTIFACT_DIR, 'kuroblob_live_creator.png');
  await page.screenshot({ path: creatorPath });
  console.log('✅ Captured creator UI:', creatorPath);

  await browser.close();
  console.log('🎉 Screenshots successfully generated!');
})();
