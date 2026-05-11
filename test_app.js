import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Set viewport to a desktop size
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('http://localhost:3000');

  // Take screenshot of the initial onboarding screen
  await page.screenshot({ path: 'screenshot1_onboarding.png' });

  // Step 0: Welcome
  await page.type('input[placeholder="Your Name"]', 'John Doe');
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'screenshot2_job.png' });

  const clickButtonByText = async (text) => {
    const button = await page.evaluateHandle((buttonText) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent && b.textContent.includes(buttonText));
    }, text);
    if (button) {
      await button.click();
      await button.dispose();
    }
  };

  // Step 1: Job
  await clickButtonByText('Technology');
  await clickButtonByText('Next');
  await new Promise(r => setTimeout(r, 500));

  // Step 2: Sports
  await clickButtonByText('Football/Soccer');
  await clickButtonByText('Next');
  await new Promise(r => setTimeout(r, 500));

  // Step 3: Entertainment
  await clickButtonByText('Movies & TV');
  await clickButtonByText('Next');
  await new Promise(r => setTimeout(r, 500));

  // Step 4: Society
  await clickButtonByText('Technology & Ethics');
  await clickButtonByText('Next');
  await new Promise(r => setTimeout(r, 500));

  // Step 5: Geopolitics
  await clickButtonByText('North America');
  await clickButtonByText('Next');
  await new Promise(r => setTimeout(r, 500));

  // Step 6: Delivery
  await page.screenshot({ path: 'screenshot3_delivery.png' });
  await clickButtonByText('Curate My World');
  await new Promise(r => setTimeout(r, 3000));

  // Dashboard
  await page.screenshot({ path: 'screenshot4_dashboard.png' });

  // Nexus Web Tab
  await clickButtonByText('The Nexus Web');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'screenshot5_nexusweb.png' });

  await browser.close();
})();
