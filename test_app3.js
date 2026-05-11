import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('http://localhost:3000');

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

  await page.type('input[placeholder="Your Name"]', 'John Doe');
  await page.keyboard.press('Enter');
  await clickButtonByText('Technology');
  await clickButtonByText('Next');
  await clickButtonByText('Football/Soccer');
  await clickButtonByText('Next');
  await clickButtonByText('Movies & TV');
  await clickButtonByText('Next');
  await clickButtonByText('Technology & Ethics');
  await clickButtonByText('Next');
  await clickButtonByText('North America');
  await clickButtonByText('Next');
  await clickButtonByText('Curate My World');
  await new Promise(r => setTimeout(r, 3000));

  await clickButtonByText('The Nexus Web');
  await new Promise(r => setTimeout(r, 1000));

  // Scroll down a bit
  await page.evaluate(() => window.scrollBy(0, 300));

  await page.evaluate(() => {
    const bubbles = document.querySelectorAll('.rounded-full.border-2');
    if (bubbles.length > 1) {
      bubbles[1].click(); // Click Geopolitics (top node usually)
    }
  });

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'screenshot7_nexusweb_scrolled.png', fullPage: true });

  await browser.close();
})();
