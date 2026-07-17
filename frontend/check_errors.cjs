const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`PAGE LOG: [${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', exception => {
    console.log(`UNCAUGHT EXCEPTION: ${exception}`);
  });

  try {
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle', timeout: 5000 });
    console.log("Page loaded. Logging in...");
    
    // Fill login form
    await page.fill('#volId', 'VOL-1234');
    await page.fill('#pin', '1234');
    await page.click('button[type="submit"]');
    
    // Wait for the login to process and next page to render
    await page.waitForTimeout(2000);
    
    console.log("Taking screenshot after login...");
    await page.screenshot({ path: 'screenshot_after_login.png' });
    
  } catch (e) {
    console.log(`Navigation/Action error: ${e}`);
  }

  await browser.close();
})();
