import puppeteer from 'puppeteer';
import path from 'path';

(async () => {
  console.log('🧪 Starting Eye Proportions & 3D Orbital Rainbow Ring Test...');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 900 }
  });

  const page = await browser.newPage();
  page.on('pageerror', err => console.error('🔴 BROWSER ERROR:', err.message));
  page.on('console', msg => console.log('💬 PAGE LOG:', msg.text()));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  console.log('✅ Page loaded');

  const artifactDir = '/Users/erik/.gemini/antigravity/brain/fce84f1d-a4c4-4410-86a6-b60eb6331169';

  // 1. Capture IDLE state with new eye proportions
  await new Promise(r => setTimeout(r, 600));
  const idleInfo = await page.evaluate(() => {
    // @ts-ignore
    const av = window.avatar;
    return {
      baseRadius: av.baseRadius,
      eyeWidth: av.eyeWidth,
      eyeHeight: av.eyeHeight,
      eyeSpacing: av.eyeSpacing,
      ratioW: (av.eyeWidth / av.baseRadius).toFixed(3),
      ratioH: (av.eyeHeight / av.baseRadius).toFixed(3),
      ratioSpacing: (av.eyeSpacing / av.baseRadius).toFixed(3)
    };
  });
  console.log('📊 IDLE Eye Proportions:', idleInfo);

  const canvasHandle = await page.$('#avatarCanvas');
  await canvasHandle.screenshot({ path: path.join(artifactDir, 'eye_proportion_idle.png') });
  console.log('📸 Saved eye_proportion_idle.png');

  // 2. Lateral Gaze Test (checking that outer eye does not become microscopic)
  await page.evaluate(() => {
    // @ts-ignore
    const av = window.avatar;
    av.targetEyeOffset = { x: 38, y: -6 };
  });
  await new Promise(r => setTimeout(r, 400));
  await canvasHandle.screenshot({ path: path.join(artifactDir, 'eye_proportion_lateral_gaze.png') });
  console.log('📸 Saved eye_proportion_lateral_gaze.png');

  // 3. THINKING State with 3D Orbital Rainbow Ring
  await page.evaluate(() => {
    // @ts-ignore
    const av = window.avatar;
    av.targetEyeOffset = { x: 0, y: 0 };
    av.setEmotion('THINKING');
  });
  await new Promise(r => setTimeout(r, 900));
  
  const thinkingRingInfo = await page.evaluate(() => {
    // @ts-ignore
    const av = window.avatar;
    return {
      ringVisibility: av.ringVisibility.toFixed(2),
      ringsCount: av.orbitalRings.length,
      firstRingRainbow: av.orbitalRings[0].isRainbow,
      baseRadius: av.baseRadius
    };
  });
  console.log('🪐 THINKING 3D Orbital Rings Info:', thinkingRingInfo);

  await canvasHandle.screenshot({ path: path.join(artifactDir, 'orbital_rainbow_rings_thinking.png') });
  console.log('📸 Saved orbital_rainbow_rings_thinking.png');

  // 4. COSMIC State (Active 3D Galaxy Orbit)
  await page.evaluate(() => {
    // @ts-ignore
    const av = window.avatar;
    av.setEmotion('COSMIC');
  });
  await new Promise(r => setTimeout(r, 900));
  await canvasHandle.screenshot({ path: path.join(artifactDir, 'orbital_rainbow_rings_cosmic.png') });
  console.log('📸 Saved orbital_rainbow_rings_cosmic.png');

  // 5. HAPPY State
  await page.evaluate(() => {
    // @ts-ignore
    const av = window.avatar;
    av.setEmotion('HAPPY');
  });
  await new Promise(r => setTimeout(r, 800));
  await canvasHandle.screenshot({ path: path.join(artifactDir, 'eye_proportion_happy.png') });
  console.log('📸 Saved eye_proportion_happy.png');

  // 6. Reset back to IDLE
  await page.evaluate(() => {
    // @ts-ignore
    const av = window.avatar;
    av.setEmotion('IDLE');
  });
  await new Promise(r => setTimeout(r, 600));

  await browser.close();
  console.log('🎉 Test completed successfully!');
})();
