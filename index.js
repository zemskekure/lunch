const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Health check route for browser
app.get('/', (req, res) => {
  res.send('✅ LunchBot is running!');
});

// TEST /lunch route
app.post('/lunch', (req, res) => {
  console.log("✅ Slack request received:", req.body);

  return res.json({
    response_type: "in_channel",
    text: "🍝 Your lunch bot is alive and ready!"
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
