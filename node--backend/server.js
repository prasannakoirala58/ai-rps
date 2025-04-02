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

app.post('/train', checkJwt, async (req, res) => {
  try {
    console.log('[TRAIN] Received move:', req.body);
    const response = await axios.post(`${AI_SERVER}/train`, req.body);
    console.log('[TRAIN] AI Response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error in /train:', error.message);
    res.status(500).json({ error: 'Error contacting AI backend (training)' });
  }
});

app.post('/battle', checkJwt, async (req, res) => {
  try {
    console.log('[BATTLE] Received move:', req.body);
    const response = await axios.post(`${AI_SERVER}/battle`, req.body);
    console.log('[BATTLE] AI Response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error in /battle:', error.message);
    res.status(500).json({ error: 'Error contacting AI backend (battle)' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Node server running at http://localhost:${PORT}`);
});
