const axios = require('axios');
const cheerio = require('cheerio');

(async () => {
  const url = 'https://obed.ambi.cz/?lang=cz';
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  let responseText = '';

  const boxesContainer = $('.boxes');
  const children = boxesContainer.children();

  for (let i = 0; i < children.length; i++) {
    const el = children[i];

    // Stop when we reach the "zítra" heading
    if ($(el).is('h2') && $(el).text().toLowerCase().startsWith('zítra')) {
      console.log("⏹️ Found 'zítra' heading, stopping here.");
      break;
    }

    // Process only lists before "zítra"
    if ($(el).hasClass('list')) {
      const boxes = $(el).children('.box');

      boxes.each((idx, box) => {
        const restaurant = $(box).find('img').attr('alt').trim().toLowerCase();

        if (restaurant === 'lokál dlouhá') {
          $(box).children('.jidlo').each((j, jidlo) => {
            const dish = $(jidlo).find('strong').text().trim();
            const price = $(jidlo).find('.cena').text().trim();
            if (dish) {
              responseText += `• ${dish} (${price})\n`;
            }
          });
        }
      });
    }
  }

  if (!responseText) {
    responseText = `🙁 No menu found for Lokál Dlouhá today.`;
  }

  // Print the result to the console
  console.log("\nToday's menu for Lokál Dlouhá:\n");
  console.log(responseText);
})();
