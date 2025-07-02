const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(express.urlencoded({ extended: true }));

// Handle Slack slash command
app.post('/', async (req, res) => {
  console.log('🔔 Slack request received');

  let responseText = '';
  try {
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
          currentSection = 'tomorrow';
        } else if (heading.includes('dnes')) {
          currentSection = 'today';
        }
      }

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
              } else {
                tomorrowDishes.push(text);
              }
            }
          });
        });
      }
    }

    const shuffle = arr => arr.sort(() => Math.random() - 0.5);
    const todayPicks = shuffle(todayDishes).slice(0, 4);
    const tomorrowPicks = shuffle(tomorrowDishes).slice(0, 4);

    if (todayPicks.length) {
      responseText += `👋 Služebníček hlásí! Dnes doporučuji:\n\n`;
      responseText += todayPicks.map(d => `• ${d}`).join('\n');
      responseText += '\n\n';
    } else {
      responseText += `😕 Dnes žádná jídla nenalezena.\n\n`;
    }

    if (tomorrowPicks.length) {
      responseText += `🔮 Zítra se můžete těšit na:\n\n`;
      responseText += tomorrowPicks.map(d => `• ${d}`).join('\n');
    } else {
      responseText += `😕 Na zítra zatím žádná jídla.`;
    }

  } catch (err) {
    console.error(err);
    responseText = '⚠️ Došlo k chybě při načítání menu.';
  }

  res.json({ response_type: 'in_channel', text: responseText });
});

// Start HTTP server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
