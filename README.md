# 🚀 Rock Paper Scissors AI Game

An interactive **Rock Paper Scissors** game where the AI **learns and adapts** using **Q-learning!** The AI **remembers past rounds**, counters your strategy, and responds with **dynamic messages** based on its performance.

---

## 📌 Features
✅ **AI learns & adapts** using Q-learning  
✅ **Dynamic AI messages** based on game results  
✅ **Smooth animations & UI effects**  
✅ **Game Over screen when a player reaches 3 wins**  
✅ **Splash screen before starting the game**  
✅ **Final score tracking (Wins, Losses, Draws)**  
✅ **Fully functional backend with Flask & Express**  

---

## 📌 Setup Instructions

### Set up the backend (Python AI Server)

```bash
cd ai--backend
python -m venv venv  # Create virtual environment
source venv/bin/activate  # On macOS/Linux
venv\Scripts\activate  # On Windows
pip install -r requirements.txt  # Install dependencies
python app.py  # Run the AI server
```

### Set up the frontend (React App)

```bash
cd ../client
npm install  # Install dependencies
npm start  # Run the frontend
```

### Set up the Node.js server

```bash
cd ../node--backend
npm install  # Install dependencies
node server.js  # Run the Node.js API server
```

## 🔠 How to Play?

1. Click **Start Game** on the splash screen.
2. Choose **Rock, Paper, or Scissors**.
3. **AI makes a move & updates its strategy.**
4. The game **ends when a player or AI reaches 3 wins**.
5. See **AI learning messages** as it adapts to your playstyle.
6. **Play Again** when the Game Over screen appears.

## ⚙️ How the AI Works?

The AI uses **Q-learning** to improve over time:

- **Remembers past moves** & adjusts its strategy.
- **Counteracts the most frequent move** the player uses.
- **Uses reinforcement learning** to maximize wins.
- **Adapts dynamically** instead of playing randomly.
- **Sends custom messages** based on its learning progress.

## 📌 Tech Stack

- **Frontend:** React, Tailwind CSS, Framer Motion
- **Backend (Game Logic):** Flask (Python)
- **Backend (API Bridge):** Express.js (Node.js)
- **AI Model:** Q-learning with NumPy


## 🛠 Troubleshooting

If the game isn't working:

- Make sure **all three servers (AI, Node.js, React)** are running.
- Check Python dependencies:
  ```bash
  pip install -r requirements.txt
  ```
- Restart everything and **clear cache**:
  ```bash
  npm start --reset-cache
  ```

## 🤖 Future Improvements

- Store **AI learning progress** between games.
- Add **multiplayer mode**.
- Improve AI’s **learning speed & adaptability**.

---

**Enjoy the game & try to beat the AI! 😈🎮**

