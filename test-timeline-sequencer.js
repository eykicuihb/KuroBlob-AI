import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Testing Animation Timeline & Montage Sequencer on http://localhost:3000...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1300, height: 900 }
  });

  const page = await browser.newPage();
  page.on('pageerror', err => console.error('🔴 BROWSER PAGE ERROR:', err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') console.error('🔴 BROWSER CONSOLE ERROR:', msg.text());
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  console.log('✅ Page loaded successfully');

  // 1. Switch to Timeline Tab
  console.log('1. Testing Tab Switch to #tabTimeline...');
  await page.click('#tabTimeline');
  await new Promise(r => setTimeout(r, 400));

  const isTimelineActive = await page.$eval('#tabTimeline', el => el.classList.contains('active'));
  const isTimelinePanelVisible = await page.$eval('#timelinePanel', el => !el.classList.contains('hidden'));
  console.log('   #tabTimeline is active:', isTimelineActive);
  console.log('   #timelinePanel is visible:', isTimelinePanelVisible);
  if (!isTimelineActive || !isTimelinePanelVisible) {
    throw new Error('Failed to switch to Timeline tab');
  }

  // 2. Verify Initial Preset Clips (INSIGHT)
  console.log('2. Verifying Default Preset Clips (INSIGHT)...');
  let cards = await page.$$eval('#timelineClipsTrack .timeline-clip-card', els => els.map(e => ({
    title: e.querySelector('.timeline-clip-title')?.textContent?.trim(),
    id: e.querySelector('.timeline-clip-id')?.textContent?.trim(),
    duration: e.querySelector('.clip-duration-val')?.textContent?.trim()
  })));
  console.log('   Loaded default clips:', cards);
  if (cards.length !== 4) {
    throw new Error(`Expected 4 initial clips, got ${cards.length}`);
  }

  let totalDur = await page.$eval('#lblTimelineTotalDuration', el => el.textContent.trim());
  console.log('   Initial total duration:', totalDur);
  if (!totalDur.includes('6.7s')) {
    throw new Error(`Expected total duration 6.7s, got ${totalDur}`);
  }

  // 3. Switch Preset to ROMANCE
  console.log('3. Testing Preset Switch to ROMANCE...');
  await page.select('#selectStoryPreset', 'ROMANCE');
  await new Promise(r => setTimeout(r, 400));

  cards = await page.$$eval('#timelineClipsTrack .timeline-clip-card', els => els.map(e => e.querySelector('.timeline-clip-id')?.textContent?.trim()));
  console.log('   Clips after ROMANCE preset:', cards);
  if (!cards.includes('COOL') || !cards.includes('LOVE')) {
    throw new Error('ROMANCE preset clips not correctly loaded');
  }

  // 4. Test Duration Slider Adjustment
  console.log('4. Testing Duration Slider Adjustment on first clip...');
  await page.evaluate(() => {
    const slider = document.querySelector('#timelineClipsTrack .timeline-clip-card .clip-duration-slider');
    if (slider) {
      slider.value = '3.0';
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 200));

  const newDurLabel = await page.$eval('#timelineClipsTrack .timeline-clip-card .clip-duration-val', el => el.textContent.trim());
  console.log('   First clip updated duration label:', newDurLabel);
  if (newDurLabel !== '3s' && newDurLabel !== '3.0s') {
    throw new Error(`Expected 3s, got ${newDurLabel}`);
  }

  // 5. Test Adding a Clip
  console.log('5. Testing Adding Custom Clip (FIRE, 2.5s)...');
  await page.select('#selectAddEmotion', 'FIRE');
  await page.$eval('#inputAddDuration', el => el.value = '2.5');
  await page.click('#btnAddTimelineClip');
  await new Promise(r => setTimeout(r, 300));

  const clipCountAfterAdd = await page.$$eval('#timelineClipsTrack .timeline-clip-card', els => els.length);
  console.log('   Total clips after adding FIRE:', clipCountAfterAdd);
  if (clipCountAfterAdd !== 5) {
    throw new Error(`Expected 5 clips after add, got ${clipCountAfterAdd}`);
  }

  // 6. Test Move Left & Delete
  console.log('6. Testing Clip Reorder and Deletion...');
  // Move last clip left
  await page.evaluate(() => {
    const lastCard = document.querySelector('#timelineClipsTrack .timeline-clip-card:last-child');
    const moveLeftBtn = lastCard?.querySelector('.move-left');
    if (moveLeftBtn) moveLeftBtn.click();
  });
  await new Promise(r => setTimeout(r, 200));

  // Delete first clip
  await page.evaluate(() => {
    const firstCard = document.querySelector('#timelineClipsTrack .timeline-clip-card:first-child');
    const delBtn = firstCard?.querySelector('.timeline-clip-del');
    if (delBtn) delBtn.click();
  });
  await new Promise(r => setTimeout(r, 200));

  const clipCountAfterDel = await page.$$eval('#timelineClipsTrack .timeline-clip-card', els => els.length);
  console.log('   Total clips after deletion:', clipCountAfterDel);
  if (clipCountAfterDel !== 4) {
    throw new Error(`Expected 4 clips, got ${clipCountAfterDel}`);
  }

  // 7. Test Timeline Playback
  console.log('7. Testing Timeline Playback Loop...');
  await page.click('#btnPlayTimeline');
  await new Promise(r => setTimeout(r, 600));

  let isPlaying = await page.$eval('#btnPlayTimeline', el => el.classList.contains('active'));
  console.log('   Play button active state:', isPlaying);
  if (!isPlaying) throw new Error('Timeline did not enter playing state');

  const activeCardIndex = await page.evaluate(() => {
    const activeCard = document.querySelector('#timelineClipsTrack .timeline-clip-card.active');
    return activeCard ? activeCard.getAttribute('data-index') : null;
  });
  console.log('   Active highlighted clip index during playback:', activeCardIndex);
  if (activeCardIndex === null) throw new Error('No clip highlighted as active during playback');

  // Pause playback
  await page.click('#btnPlayTimeline');
  await new Promise(r => setTimeout(r, 200));
  isPlaying = await page.$eval('#btnPlayTimeline', el => el.classList.contains('active'));
  console.log('   Play button active state after pause:', isPlaying);
  if (isPlaying) throw new Error('Timeline did not pause properly');

  // 8. Capture Visual Proof Screenshot
  const screenshotPath = '/Users/erik/.gemini/antigravity/brain/fce84f1d-a4c4-4410-86a6-b60eb6331169/kuroblob_timeline_sequencer.png';
  await page.screenshot({ path: screenshotPath });
  console.log('   Saved visual proof screenshot to:', screenshotPath);

  // 9. Test Direct URL Hash #timeline
  console.log('9. Testing Direct URL Hash #timeline navigation...');
  await page.goto('http://localhost:3000#timeline', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));
  const isHashTimelineActive = await page.$eval('#tabTimeline', el => el.classList.contains('active'));
  console.log('   #tabTimeline active via #timeline hash:', isHashTimelineActive);
  if (!isHashTimelineActive) throw new Error('Hash navigation to #timeline failed');

  await browser.close();
  console.log('🎉 ALL ANIMATION TIMELINE SEQUENCER TESTS PASSED 100% PERFECTLY!');
})();
