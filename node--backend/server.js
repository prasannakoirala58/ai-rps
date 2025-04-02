const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { auth } = require('express-oauth2-jwt-bearer');

const app = express();
app.use(express.json());
app.use(cors());

const AI_SERVER = 'http://127.0.0.1:5000';

const checkJwt = auth({
  audience: 'http://localhost:3001',
  issuerBaseURL: 'https://dev-hqyiirkk4eh32ivo.us.auth0.com/',
  tokenSigningAlg: 'RS256',
});

app.post('/play', checkJwt, async (req, res) => {
  try {
    console.log('🎮 Received player move:', req.body);

    const aiResponse = await axios.post(`${AI_SERVER}/play`, req.body);
    const { ai_move, result, message } = aiResponse.data;

    console.log('🧠 AI Response:', aiResponse.data);

    res.json({ ai_move, result, message });
  } catch (error) {
    console.error('❌ Error contacting Python AI backend:', error.message);
    res.status(500).json({ error: 'Error contacting AI backend' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Node server running at http://localhost:${PORT}`);
});
