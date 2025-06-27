const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('✅ LunchBot is running!');
});

app.post('/lunch', (req, res) => {
  console.log("✅ Slack request received!");
  console.log("BODY:", req.body);

  res.json({
    response_type: "in_channel",
    text: "✅ Hello from your lunch bot!"
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
