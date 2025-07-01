const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Health check
app.get('/', (req, res) => {
  res.send('✅ LunchBot is running!');
});

// /lunch Slash Command
app.post('/lunch', async (req, res) => {
  console.log("✅ Slack request received:", req.body);

  const responseUrl = req.body.response_url;
  const query = req.body.text.trim().toLowerCase();

  // Immediate 200 OK response
  res.status(200).send();

  // Fetch and process in background
  try {
    const url = 'https://obed.ambi.cz/?lang=cz';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let responseText = '';

const boxesContainer = $('.boxes');
const children = boxesContainer.children();

for (let i = 0; i < children.length; i++) {
  const el = children[i];

  // Stop if we reach tomorrow's section
  if ($(el).is('h2') && $(el).text().toLowerCase().startsWith('zítra')) {
    break;
  }

  // Process only lists before "zítra"
  if ($(el).hasClass('list')) {
    const boxes = $(el).find('.box');

    boxes.each((idx, box) => {
      const restaurant = $(box).find('img').attr('alt').trim().toLowerCase();

      if (restaurant === 'lokál dlouhá') {
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
      responseText = `🙁 No menu found for Lokál Dlouhá today.`;
    }

    // Send delayed response back to Slack
    await axios.post(responseUrl, {
      response_type: 'in_channel',
      text: responseText
    });
  } catch (error) {
    console.error("Error fetching menu:", error);
    await axios.post(responseUrl, {
      response_type: 'ephemeral',
      text: "⚠️ Sorry, I couldn't fetch the menu. Please try again later."
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

