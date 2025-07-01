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

  // Respond immediately to avoid timeout
  res.status(200).send();

  try {
    const url = 'https://obed.ambi.cz/?lang=cz';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let responseText = '';

    // Only process today's menu
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

    // Send delayed response
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
