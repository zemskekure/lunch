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

    if ($(el).is('h2')) {
      const heading = $(el).text().toLowerCase();
      if (heading.includes('zítra')) {
        console.log("➡️ Switching to TOMORROW section.");
        currentSection = 'tomorrow';
      } else if (heading.includes('dnes')) {
        console.log("➡️ Switching to TODAY section.");
        currentSection = 'today';
      }
    }

    if ($(el).hasClass('list')) {
      const boxes = $(el).children('.box');

      boxes.each((idx, box) => {
        const restaurant = $(box).find('img').attr('alt').trim();

        $(box).children('.jidlo').each((j, jidlo) => {
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
  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

  const todayPicks = shuffle(todayDishes).slice(0, 4);
  const tomorrowPicks = shuffle(tomorrowDishes).slice(0, 4);

  let response = '';

  if (todayPicks.length) {
    response += `Služebníček má úcta, dnes vám doporučuji k obědu:\n\n`;
    response += todayPicks.map(d => `• ${d}`).join('\n');
    response += '\n\n';
  } else {
    response += `Služebníček se omlouvá, dnes žádná doporučení nenalezl.\n\n`;
  }

  if (tomorrowPicks.length) {
    response += `A zítra se můžete těšit na:\n\n`;
    response += tomorrowPicks.map(d => `• ${d}`).join('\n');
  } else {
    response += `A zítra zatím žádná doporučení nejsou.`;
  }

  console.log('\n' + response);
})();
