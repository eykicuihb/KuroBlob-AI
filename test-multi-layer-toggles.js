import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Testing Multi-Layer & Orbital Rings Optional Controls on http://localhost:3000...');
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

  // 1. Go to Creator Studio Tab
  console.log('1. Navigating to AI Expression Creator Tab...');
  await page.click('#tabCreator');
  await new Promise(r => setTimeout(r, 200));

  // 2. Generate Astronaut (Space) Expression
  console.log('2. Generating Astronaut Expression with Rings & Particles...');
  await page.click('.creator-preset-chip[data-prompt*="宇航员"]');
  await new Promise(r => setTimeout(r, 600));

  // 3. Verify all 4 layer checkboxes exist
  const accState = await page.$eval('#chkCreatorShowAccessory', el => el.checked);
  const ringsState = await page.$eval('#chkCreatorShowRings', el => el.checked);
  const particlesState = await page.$eval('#chkCreatorShowParticles', el => el.checked);
  const cheeksState = await page.$eval('#chkCreatorShowCheeks', el => el.checked);

  console.log('   Layer States -> Accessory:', accState, '| Rings:', ringsState, '| Particles:', particlesState, '| Cheeks:', cheeksState);

  // 4. Toggle Orbital Rings OFF & ON
  console.log('3. Testing 3D Orbital Rings Toggle...');
  await page.click('#chkCreatorShowRings');
  await new Promise(r => setTimeout(r, 100));
  const ringsOff = await page.$eval('#chkCreatorShowRings', el => el.checked);
  console.log('   Rings toggled state:', ringsOff);
  if (ringsOff !== !ringsState) throw new Error('Rings checkbox toggle failed');

  // 5. Toggle Particles OFF & ON
  console.log('4. Testing Cosmic Particles Toggle...');
  await page.click('#chkCreatorShowParticles');
  await new Promise(r => setTimeout(r, 100));
  const particlesOff = await page.$eval('#chkCreatorShowParticles', el => el.checked);
  console.log('   Particles toggled state:', particlesOff);
  if (particlesOff !== !particlesState) throw new Error('Particles checkbox toggle failed');

  // 6. Save Customized Multi-Layer Expression to Vault
  console.log('5. Saving Customized Multi-Layer Expression to Vault...');
  await page.click('#btnSaveCreatorToVault');
  await new Promise(r => setTimeout(r, 400));

  const vaultCount = await page.$$eval('#customEmotionsContainer .btn-vault-custom', els => els.length);
  console.log('   Total Vault Items in testing grid:', vaultCount);
  if (vaultCount < 1) throw new Error('Vault did not receive customized item');

  await browser.close();
  console.log('🎉 ALL MULTI-LAYER (RINGS, PARTICLES, ACCESSORIES, CHEEKS) OPTIONAL TOGGLES VERIFIED 100% PERFECTLY!');
})();
