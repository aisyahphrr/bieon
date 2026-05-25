import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error(`[BROWSER PAGEERROR]`, err);
  });

  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    
    await page.evaluate(() => {
      const mockPayload = {
        role: "Homeowner",
        email: "asrisaras17@gmail.com",
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      const base64Payload = btoa(JSON.stringify(mockPayload));
      const dummyToken = `dummyHeader.${base64Payload}.dummySignature`;
      localStorage.setItem('token', dummyToken);
      localStorage.setItem('email', 'asrisaras17@gmail.com');
      localStorage.setItem('userId', 'mock-user-id');
      localStorage.setItem('USE_MOCK_DATA', 'true');
    });

    console.log('Navigating to history...');
    await page.goto('http://localhost:3000/history', { waitUntil: 'networkidle2' });
    
    // Wait for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('--- BODY TEXT START ---');
    console.log(bodyText);
    console.log('--- BODY TEXT END ---');

  } catch (error) {
    console.error('Puppeteer execution error:', error);
  } finally {
    await browser.close();
  }
})();
