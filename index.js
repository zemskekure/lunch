const axios = require('axios');
const cheerio = require('cheerio');

(async () => {
  const url = 'https://obed.ambi.cz/?lang=cz';
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  let currentSection = 'today';
  const todayDishes = [];
  const tomorrowDishes = [];

  const boxesContainer = $('.boxes');
  const children = boxesContainer.children();

  for (let i = 0; i < children.length; i++) {
    const el = children[i];

    // Check if this is a heading marking today or tomorrow
    if ($(el).is('h2')) {
      const heading = $(el).text().toLowerCase();
      if (heading.includes('zítra')) {
        currentSection = 'tomorrow';
        console.log('👉 Switched to TOMORROW section.');
      } else if (heading.includes('dnes')) {
        currentSection = 'today';
        console.log('👉 Switched to TODAY section.');
      }
    }

    // Process menu list
    if ($(el).hasClass('list')) {
      const boxes = $(el).children('.box');

      boxes.each((idx, box) => {
        const restaurant = $(box).find('img').attr('alt')?.trim() || 'Neznámá restaurace';

        $(box).find('.jidlo').each((j, jidlo) => {
          const dish = $(jidlo).find('strong').text().trim();
          const price = $(jidlo).find('.cena').text().trim();

          if (dish) {
            const text = `${dish} (${restaurant}, ${price})`;
            if (currentSection === 'today') {
              todayDishes.push(text);
            } else if (currentSection === 'tomorrow') {
              tomorrowDishes.push(text);
            }
          }
        });
      });
    }
  }

  // Shuffle helper
  const shuffle = arr => arr.sort(() => Math.random() - 0.5);

  const todayPicks = shuffle(todayDishes).slice(0, 4);
  const tomorrowPicks = shuffle(tomorrowDishes).slice(0, 4);

  let response = '';

  if (todayPicks.length) {
    response += `👋 Služebníček hlásí! Dnes bych vám doporučil tyto dobroty:\n\n`;
    response += todayPicks.map(d => `• ${d}`).join('\n');
    response += '\n\n';
  } else {
    response += `😕 Služebníček se omlouvá, dnes žádná jídla nenašel.\n\n`;
  }

  if (tomorrowPicks.length) {
    response += `🔮 A zítra se můžete těšit na:\n\n`;
    response += tomorrowPicks.map(d => `• ${d}`).join('\n');
  } else {
    response += `😕 Na zítra zatím nejsou žádná jídla k dispozici.`;
  }

  console.log('\n' + response);
})();
