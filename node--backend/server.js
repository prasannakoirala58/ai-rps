const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json()); // Ensure JSON parsing
app.use(cors()); // Allow frontend requests

const AI_SERVER = "http://127.0.0.1:5000"; // Python AI backend

app.post("/play", async (req, res) => {
  try {
    console.log("Received Player Move:", req.body);
    
    const response = await axios.post(`${AI_SERVER}/play`, req.body);
    const aiMove = response.data.ai_move;

    console.log("AI Move from Python:", aiMove); // Log AI move

    res.json({ ai_move: aiMove });
  } catch (error) {
    console.error("Error communicating with AI backend:", error);
    res.status(500).json({ error: "Error communicating with AI backend" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Node server running on port ${PORT}`));
