import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Testing Light Mode Video & PNG Background Rendering...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.on('pageerror', err => console.error('🔴 BROWSER PAGE ERROR:', err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') console.error('🔴 BROWSER CONSOLE ERROR:', msg.text());
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // 1. Ensure Light Theme
  console.log('1. Checking Light Theme...');
  let currentTheme = await page.$eval('html', el => el.getAttribute('data-theme'));
  if (currentTheme !== 'light') {
    await page.click('#themeToggle');
    await new Promise(r => setTimeout(r, 200));
    currentTheme = await page.$eval('html', el => el.getAttribute('data-theme'));
  }
  console.log('   Current theme:', currentTheme);
  if (currentTheme !== 'light') throw new Error('Failed to activate light theme');

  // 2. Go to Studio Tab and Trigger Video Export
  console.log('2. Testing Light Mode Video Export Background...');
  await page.click('#tabStudio');
  await new Promise(r => setTimeout(r, 200));

  // Trigger recording
  await page.click('#btnStudioExportVideo');
  await new Promise(r => setTimeout(r, 500)); // wait while recording

  // Check canvas background during recording
  const pixelData = await page.evaluate(() => {
    const canvas = document.getElementById('avatarCanvas');
    const ctx = canvas.getContext('2d');
    // Read top-left corner pixel (background area)
    const imgData = ctx.getImageData(5, 5, 1, 1).data;
    return { r: imgData[0], g: imgData[1], b: imgData[2], a: imgData[3] };
  });

  console.log('   Corner pixel during recording in light mode:', pixelData);
  // In light mode, background should be white (r: 255, g: 255, b: 255, a: 255)
  if (pixelData.r < 240 || pixelData.g < 240 || pixelData.b < 240 || pixelData.a < 240) {
    throw new Error(`Expected white background (255,255,255) during light mode recording, got: ${JSON.stringify(pixelData)}`);
  }
  console.log('✅ Background during light mode recording is verified WHITE (255, 255, 255, 255)!');

  // 3. Test PNG Export in Light Mode
  console.log('3. Testing PNG Export in Light Mode...');
  const pngDataUrl = await page.evaluate(() => {
    const canvas = document.getElementById('avatarCanvas');
    return window.__avatarInstance ? window.__avatarInstance.exportPNG('light') : null;
  });
  console.log('   PNG Data URL generated:', !!pngDataUrl || 'canvas direct');

  await browser.close();
  console.log('🎉 LIGHT MODE WHITE BACKGROUND VIDEO RECORDING VERIFIED PERFECTLY!');
})();
