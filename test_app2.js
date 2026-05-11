import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Set viewport to a desktop size
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

  // Skip onboarding quickly
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

  // Dashboard -> Nexus Web Tab
  await clickButtonByText('The Nexus Web');
  await new Promise(r => setTimeout(r, 1000));

  // Click on a node (SVG paths / nodes are clickable)
  // Let's click the first node
  await page.evaluate(() => {
    const bubbles = document.querySelectorAll('.rounded-full.border-2');
    if (bubbles.length > 1) {
      // The first one might be the center 'You' node or the 0th node.
      // nodes are rendered after the center node.
      bubbles[1].click();
    }
  });

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'screenshot6_nexusweb_node.png' });

  await browser.close();
})();
