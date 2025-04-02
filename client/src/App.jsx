// ...imports
import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth0 } from '@auth0/auth0-react';

import rockHand from './assets/rock.jpg';
import paperHand from './assets/paper.jpg';
import scissorsHand from './assets/scissors.jpg';

const actions = { rock: rockHand, paper: paperHand, scissors: scissorsHand };

export default function App() {
  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    isLoading,
    user,
    getAccessTokenSilently,
  } = useAuth0();

  const [playerMove, setPlayerMove] = useState(null);
  const [aiMove, setAiMove] = useState(null);
  const [result, setResult] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState({ player: 0, ai: 0, draws: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  const playGame = async (move) => {
    if (gameOver) return;
    setPlayerMove(move);
    setAiMove(null);
    setResult('');
    setAiMessage('Hmm... thinking...');
    setLoading(true);

    try {
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        'http://localhost:3001/play',
        { move },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { ai_move, result, message } = response.data;

      setTimeout(() => {
        setAiMove(ai_move);
        let newScores = { ...scores };

        if (result === 'win') {
          newScores.player += 1;
          setResult('You Win! 🎉');
          setAiMessage("Okay, you got me! I'm learning...");
        } else if (result === 'lose') {
          newScores.ai += 1;
          setResult('You Lose! 😞');
          setAiMessage('I’m getting the hang of this! 🔥');
        } else {
          newScores.draws += 1;
          setResult("It's a Draw! 🤝");
          setAiMessage("Interesting… I see what you're doing.");
        }

        setScores(newScores);

        if (newScores.player === 3 || newScores.ai === 3) {
          setGameOver(true);
          setWinner(newScores.player === 3 ? 'player' : 'ai');
        }

        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error contacting AI server:', error);
      setResult('Error contacting AI server.');
      setLoading(false);
    }
  };

  if (isLoading) return <div className="p-8 text-2xl text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-200 text-black flex flex-col items-center justify-start p-4 relative overflow-hidden">
      {/* Auth Status */}
      <div className="absolute top-6 right-6 flex items-center gap-4 text-lg">
        {isAuthenticated && (
          <>
            <span className="font-semibold">👋 {user?.name}</span>
            <button
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </>
        )}
      </div>

      {/* Login Prompt */}
      {!isAuthenticated && (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center text-gray-800">
          <h1 className="text-5xl font-bold mb-6">Welcome to AI-RPS Game</h1>
          <p className="text-2xl mb-6">Please log in to continue 🎮</p>
          <button
            onClick={() => loginWithRedirect()}
            className="px-6 py-3 text-xl bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </div>
      )}

      {/* Game UI */}
      {isAuthenticated && (
        <>
          <h1 className="text-4xl font-bold mt-4 mb-2">Rock Paper Scissors</h1>

          {/* Scoreboard */}
          <div className="flex justify-between w-full max-w-3xl text-xl my-2 p-3 border-2 rounded bg-white shadow-lg">
            <p className="font-bold">
              {user?.name}: {scores.player}
            </p>
            <p className="font-bold">AI: {scores.ai}</p>
            <p className="font-bold">Draws: {scores.draws}</p>
          </div>

          {/* Hands */}
          <div className="flex items-center justify-center space-x-16 mt-3">
            <motion.img
              src={playerMove ? actions[playerMove] : rockHand}
              alt="player-hand"
              className="w-32 h-32 bg-white p-2 rounded-lg shadow-md"
              animate={{ x: loading && !gameOver ? [-5, 5, -5] : 0 }}
              transition={{ repeat: loading && !gameOver ? Infinity : 0, duration: 0.1 }}
            />
            <motion.img
              src={aiMove ? actions[aiMove] : rockHand}
              alt="ai-hand"
              className="w-32 h-32 bg-white p-2 rounded-lg shadow-md"
              animate={{ x: loading && !gameOver ? [5, -5, 5] : 0 }}
              transition={{ repeat: loading && !gameOver ? Infinity : 0, duration: 0.1 }}
            />
          </div>

          {/* Hand Selection */}
          <div className="flex space-x-6 mt-4">
            {Object.keys(actions).map((action) => (
              <motion.button
                key={action}
                onClick={() => playGame(action)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center bg-gray-300 p-3 rounded-lg hover:bg-gray-400 transition"
              >
                <img src={actions[action]} alt={action} className="w-20 h-20" />
                <span className="mt-2 text-lg font-bold">{action.toUpperCase()}</span>
              </motion.button>
            ))}
          </div>

          {/* Results */}
          <div className="flex justify-between items-center mt-4 w-full max-w-3xl text-lg font-bold">
            <motion.div className="text-left">{result}</motion.div>
            <motion.div className="text-right italic font-bold">{aiMessage}</motion.div>
          </div>

          {/* Game Over Modal */}
          {gameOver && (
            <motion.div
              className="absolute inset-0 bg-gray-300 flex flex-col items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h1 className="text-5xl font-bold mb-6">
                {winner === 'player' ? '👨‍💻 YOU WIN! 🎉' : '🤖 AI WINS! 🔥'}
              </h1>
              <p className="text-2xl mb-6 font-bold">
                Final Score - {user?.name}: {scores.player} | AI: {scores.ai} | Draws:{' '}
                {scores.draws}
              </p>
              <motion.button
                onClick={() => {
                  setScores({ player: 0, ai: 0, draws: 0 });
                  setGameOver(false);
                  setWinner(null);
                  setResult('');
                  setAiMessage('');
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-2xl font-bold bg-red-500 text-white px-8 py-4 rounded-lg shadow-lg hover:bg-red-700 transition"
              >
                Play Again
              </motion.button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
