const axios = require('axios');
const cheerio = require('cheerio');

(async () => {
  const url = 'https://obed.ambi.cz/?lang=cz';
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  let responseText = '';

  // Select only today's container
  const todayContainer = $('#denni-dnes');
  const boxes = todayContainer.find('.list > .box');

  boxes.each((idx, box) => {
    const restaurant = $(box).find('img').attr('alt').trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    console.log("Found restaurant alt:", restaurant);

    if (restaurant === 'lokal dlouha') {
      $(box).children('.jidlo').each((j, jidlo) => {
        const dish = $(jidlo).find('strong').text().trim();
        const price = $(jidlo).find('.cena').text().trim();
        if (dish) {
          responseText += `• ${dish} (${price})\n`;
        }
      });
    }
  });

  if (!responseText) {
    responseText = `🙁 No menu found for Lokál Dlouhá today.`;
  }

  console.log("\nToday's menu for Lokál Dlouhá:\n");
  console.log(responseText);
})();
