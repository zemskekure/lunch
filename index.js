const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Test route
app.get('/', (req, res) => {
  res.send('✅ LunchBot is running!');
});

// /lunch Slash Command
app.post('/lunch', async (req, res) => {
  const query = req.body.text.trim().toLowerCase();
  console.log("🔍 Requested restaurant:", query);

  const url = 'https://obed.ambi.cz/?lang=cz';
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  let responseText = '';

  const boxesContainer = $('.boxes');
  const children = boxesContainer.children();

  for (let i = 0; i < children.length; i++) {
    const el = children[i];

    if (el.tagName === 'h2' && $(el).text().toLowerCase().startsWith('zítra')) {
      break; // Stop when reaching "zítra"
    }

    if ($(el).hasClass('list')) {
      const boxes = $(el).find('.box');

      boxes.each((idx, box) => {
        const restaurant = $(box).find('img').attr('alt').trim().toLowerCase();

        if (restaurant.includes(query)) {
          $(box).find('.jidlo').each((j, jidlo) => {
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
    responseText = `🙁 No menu found for *${req.body.text}*.`;
  }

  return res.json({
    response_type: 'in_channel',
    text: responseText
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
