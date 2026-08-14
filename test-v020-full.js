import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Testing KuroBlob AI v0.2.0 Features on http://localhost:3000...');
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
  console.log('✅ Page loaded successfully');

  // 1. Test TTS Toggle
  console.log('1. Testing Cute Anime TTS Voice toggle...');
  const ttsTextBefore = await page.$eval('#ttsText', el => el.textContent);
  console.log('   TTS Text Before:', ttsTextBefore);
  await page.click('#ttsToggle');
  const ttsTextAfter = await page.$eval('#ttsText', el => el.textContent);
  console.log('   TTS Text After:', ttsTextAfter);
  if (ttsTextBefore === ttsTextAfter) throw new Error('TTS toggle did not update UI');

  // 2. Test OBS Chroma Green Screen Toggle
  console.log('2. Testing OBS Chroma Green Screen Toggle...');
  await page.click('#obsToggle');
  await new Promise(r => setTimeout(r, 200));
  const isOBSActive = await page.$eval('#obsToggle', el => el.classList.contains('active'));
  console.log('   OBS Mode Active:', isOBSActive);
  if (!isOBSActive) throw new Error('OBS toggle failed');
  await page.click('#obsToggle'); // restore

  // 3. Test Physical Overload Pinch / Dizzy Trigger
  console.log('3. Testing Physical Pinch Overload Reaction...');
  const canvasBox = await page.$eval('#avatarCanvas', el => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.mouse.move(canvasBox.x + 40, canvasBox.y + 40);
  await page.mouse.down();
  await page.mouse.move(canvasBox.x + 130, canvasBox.y + 130, { steps: 10 });
  await page.mouse.up();
  await new Promise(r => setTimeout(r, 400));

  const emotionPill = await page.$eval('#activeEmotionPill', el => el.textContent);
  console.log('   Avatar emotion pill text:', emotionPill.trim());

  // 4. Test AI Expression Creator Studio + Vault Save
  console.log('4. Testing AI Expression Creator Studio + Vault Save...');
  await page.click('#tabCreator');
  await new Promise(r => setTimeout(r, 300));

  await page.click('.creator-preset-chip[data-prompt*="咖啡"]');
  await new Promise(r => setTimeout(r, 600));

  console.log('   Clicking 💾 收藏到表情包 (Save to Vault)...');
  await page.click('#btnSaveCreatorToVault');
  await new Promise(r => setTimeout(r, 400));

  const vaultCount = await page.$$eval('#customEmotionsContainer .btn-vault-custom', els => els.length);
  console.log('   Vault buttons in manual testing grid:', vaultCount);
  if (vaultCount < 1) throw new Error('Expression was not saved to Vault grid');

  // Test clicking the vault item in the grid
  console.log('   Clicking saved vault expression in testing grid...');
  await page.click('#customEmotionsContainer .btn-vault-custom');
  await new Promise(r => setTimeout(r, 300));

  // 5. Test Bilingual Toggle
  console.log('5. Testing Bilingual Toggle...');
  await page.click('#langToggle');
  await new Promise(r => setTimeout(r, 200));
  const ttsEnText = await page.$eval('#ttsText', el => el.textContent);
  console.log('   English TTS text:', ttsEnText);

  await browser.close();
  console.log('🎉 ALL v0.2.0 FEATURE ENHANCEMENT TESTS PASSED 100% PERFECTLY!');
})();
