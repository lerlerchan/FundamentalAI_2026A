const { chromium } = require('playwright');

(async ()=>{
  const browser = await chromium.launch({ headless: false, slowMo: 60 });
  const context = await browser.newContext({ viewport: { width: 900, height: 900 } });
  const page = await context.newPage();

  const fileUrl = 'file:///d:/GitHub/FundamentalAI_2026A/index.html';
  console.log('Navigating to', fileUrl);
  await page.goto(fileUrl);

  await page.waitForSelector('#gameCanvas');
  // start the game
  await page.click('#startBtn');
  console.log('Started game.');

  // let it run a bit
  await page.waitForTimeout(2000);

  // toggle AI on so you can observe AI play
  await page.click('#aiToggle');
  console.log('AI toggled on. Watching for 8 seconds...');
  await page.waitForTimeout(8000);

  console.log('Taking screenshot -> tests/snapshot.png');
  await page.screenshot({ path: 'tests/snapshot.png' });

  await browser.close();
  console.log('Browser closed.');
})();
