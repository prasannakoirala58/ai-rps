import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

// Load Hand Images
import rockHand from "./assets/rock.jpg";
import paperHand from "./assets/paper.jpg";
import scissorsHand from "./assets/scissors.jpg";

const actions = { rock: rockHand, paper: paperHand, scissors: scissorsHand };

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerMove, setPlayerMove] = useState(null);
  const [aiMove, setAiMove] = useState(null);
  const [result, setResult] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState({ player: 0, ai: 0, draws: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  const startGame = () => {
    setGameStarted(true);
    setScores({ player: 0, ai: 0, draws: 0 }); // ✅ FIXED: Score correctly resets to 0
    setGameOver(false);
    setWinner(null);
    setResult("");
    setAiMessage("");
  };

  const playGame = async (move) => {
    if (gameOver) return;
    setPlayerMove(move);
    setAiMove(null);
    setResult("");
    setAiMessage("Hmm... thinking...");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/play", { move });
      const { ai_move, result, message } = response.data;

      setTimeout(() => {
        setAiMove(ai_move);

        let newScores = { ...scores };
        if (result === "win") {
          newScores.player += 1;
          setResult("You Win! 🎉");
          setAiMessage("Okay, you got me! I'm learning...");
        } else if (result === "lose") {
          newScores.ai += 1;
          setResult("You Lose! 😞");
          setAiMessage("I’m getting the hang of this! 🔥");
        } else {
          newScores.draws += 1; // ✅ FIXED: Draws are now correctly tracked
          setResult("It's a Draw! 🤝");
          setAiMessage("Interesting… I see what you're doing.");
        }

        setScores(newScores);

        if (newScores.player === 3 || newScores.ai === 3) {
          setGameOver(true);
          setWinner(newScores.player === 3 ? "player" : "ai");
        }

        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Server Error:", error);
      setResult("Error contacting AI server.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 text-black p-5">
      {/* SPLASH SCREEN */}
      {!gameStarted && !gameOver && (
        <motion.div
          className="absolute inset-0 bg-gray-300 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.button
            onClick={startGame}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="text-3xl font-bold bg-blue-500 text-white px-6 py-4 rounded-lg shadow-lg hover:bg-blue-700 transition"
          >
            Start Game
          </motion.button>
        </motion.div>
      )}

      {/* GAME OVER SCREEN */}
      {gameOver && (
        <motion.div
          className="absolute inset-0 bg-gray-300 flex flex-col items-center justify-center text-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-5xl font-bold mb-4">
            {winner === "player" ? "👨‍💻 YOU WIN! 🎉" : "🤖 AI WINS! 🔥"}
          </h1>
          <p className="text-2xl mb-6 font-bold">
            Final Score - Player: {scores.player} | AI: {scores.ai} | Draws: {scores.draws}
          </p>
          <motion.button
            onClick={startGame}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="text-3xl font-bold bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg hover:bg-red-700 transition"
          >
            Play Again
          </motion.button>
        </motion.div>
      )}

      {/* GAME UI */}
      <h1 className="text-4xl font-bold mt-4">Rock Paper Scissors</h1>

      {/* Scoreboard */}
      <div className="flex justify-between w-full max-w-lg text-xl my-4 p-3 border-2 rounded bg-white shadow-lg">
        <p className="font-bold">Player: {scores.player}</p>
        <p className="font-bold">AI: {scores.ai}</p>
        <p className="font-bold">Draws: {scores.draws}</p>
      </div>

      {/* Hands Display */}
      <div className="flex items-center justify-center space-x-16 mt-4">
        <motion.img
          src={playerMove ? actions[playerMove] : rockHand}
          alt="player-hand"
          className="w-44 h-44 bg-white p-2 rounded-lg shadow-md"
          animate={{ x: loading && !gameOver ? [-5, 5, -5] : 0 }} // ✅ FIXED: No animation after game over
          transition={{ repeat: loading && !gameOver ? Infinity : 0, duration: 0.1 }}
        />
        <motion.img
          src={aiMove ? actions[aiMove] : rockHand}
          alt="ai-hand"
          className="w-44 h-44 bg-white p-2 rounded-lg shadow-md"
          animate={{ x: loading && !gameOver ? [5, -5, 5] : 0 }} // ✅ FIXED: No animation after game over
          transition={{ repeat: loading && !gameOver ? Infinity : 0, duration: 0.1 }}
        />
      </div>

      {/* Hand Selection */}
      <div className="flex space-x-6 mt-6">
        {Object.keys(actions).map((action) => (
          <motion.button
            key={action}
            onClick={() => playGame(action)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center bg-gray-300 p-4 rounded-lg hover:bg-gray-400 transition"
          >
            <img src={actions[action]} alt={action} className="w-24 h-24" />
            <span className="mt-2 text-lg font-bold">{action.toUpperCase()}</span>
          </motion.button>
        ))}
      </div>

      {/* RESULT + AI MESSAGE */}
      <div className="flex justify-center items-center mt-6 w-full max-w-lg">
        <motion.div className="text-2xl font-bold text-left flex-1">{result}</motion.div>
        <motion.div className="text-2xl font-bold text-right italic flex-1">{aiMessage}</motion.div>
      </div>
    </div>
  );
}
