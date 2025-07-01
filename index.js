const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://obed.ambi.cz/?lang=cz', { waitUntil: 'networkidle0' });

  // Evaluate inside the page context
  const menu = await page.evaluate(() => {
    const container = document.querySelector('#denni-dnes');
    if (!container) {
      return "🙁 No 'denni-dnes' container found.";
    }

    let text = '';
    const boxes = container.querySelectorAll('.list > .box');

    boxes.forEach(box => {
      const restaurant = box.querySelector('img').alt.trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      if (restaurant === 'lokal dlouha') {
        box.querySelectorAll('.jidlo').forEach(jidlo => {
          const dish = jidlo.querySelector('strong').innerText.trim();
          const price = jidlo.querySelector('.cena').innerText.trim();
          if (dish) {
            text += `• ${dish} (${price})\n`;
          }
        });
      }
    });

    return text || '🙁 No menu found for Lokál Dlouhá today.';
  });

  console.log("\nToday's menu for Lokál Dlouhá:\n");
  console.log(menu);

  await browser.close();
})();
