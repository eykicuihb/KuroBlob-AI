import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Testing Dynamic Accessory Optional Toggle on http://localhost:3000...');
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

  // 2. Click Coffee Dev chip
  console.log('2. Generating Coffee Dev Expression...');
  await page.click('.creator-preset-chip[data-prompt*="咖啡"]');
  await new Promise(r => setTimeout(r, 500));

  // Verify checkbox exists and is checked
  const isCheckedInitial = await page.$eval('#chkCreatorShowAccessory', el => el.checked);
  const badgeInitial = await page.$eval('#badgeAccessoryStatus', el => el.textContent.trim());
  console.log('   Initial Accessory Checkbox:', isCheckedInitial);
  console.log('   Initial Accessory Badge:', badgeInitial);
  if (!isCheckedInitial || badgeInitial !== '已装配') {
    throw new Error('Accessory should be checked and equipped initially');
  }

  // 3. Uncheck Accessory Checkbox
  console.log('3. Toggling Accessory OFF...');
  await page.click('#chkCreatorShowAccessory');
  await new Promise(r => setTimeout(r, 200));

  const isCheckedAfter = await page.$eval('#chkCreatorShowAccessory', el => el.checked);
  const badgeAfter = await page.$eval('#badgeAccessoryStatus', el => el.textContent.trim());
  console.log('   Toggled Accessory Checkbox:', isCheckedAfter);
  console.log('   Toggled Accessory Badge:', badgeAfter);
  if (isCheckedAfter || badgeAfter !== '仅五官体态') {
    throw new Error('Accessory should be unchecked and show 仅五官体态');
  }

  // 4. Check Accessory Checkbox again
  console.log('4. Toggling Accessory back ON...');
  await page.click('#chkCreatorShowAccessory');
  await new Promise(r => setTimeout(r, 200));

  const isCheckedFinal = await page.$eval('#chkCreatorShowAccessory', el => el.checked);
  const badgeFinal = await page.$eval('#badgeAccessoryStatus', el => el.textContent.trim());
  console.log('   Restored Accessory Checkbox:', isCheckedFinal);
  console.log('   Restored Accessory Badge:', badgeFinal);
  if (!isCheckedFinal || badgeFinal !== '已装配') {
    throw new Error('Accessory should be restored to equipped');
  }

  await browser.close();
  console.log('🎉 DYNAMIC ACCESSORY OPTIONAL TOGGLE VERIFIED 100% PERFECTLY!');
})();
