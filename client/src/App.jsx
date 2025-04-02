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

  // Show only the first name
  const firstName = user?.name?.split(' ')[0] || 'Player';

  // Game mode: "training" or "battle"
  const [gameMode, setGameMode] = useState('training');
  // Once training is done, we remain in battle mode for subsequent rounds.
  const [hasTrained, setHasTrained] = useState(false);

  // Moves
  const [playerMove, setPlayerMove] = useState(null);
  const [aiMove, setAiMove] = useState(null);

  // Messages
  const [result, setResult] = useState('');
  const [aiMessage, setAiMessage] = useState('');

  // Animation/loading
  const [loading, setLoading] = useState(false);

  // Score states
  const [trainingScores, setTrainingScores] = useState({ player: 0, ai: 0, draws: 0 });
  const [battleScores, setBattleScores] = useState({ player: 0, ai: 0, draws: 0 });
  const [finalScores, setFinalScores] = useState({ player: 0, ai: 0, draws: 0 });

  // Battle game-over
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  const playGame = async (move) => {
    if (loading || gameOver) return;
    setLoading(true);
    setPlayerMove(move);
    setAiMove(null);
    // Reserve text space so layout doesn't jump
    setResult(' ');
    setAiMessage(' ');

    const endpoint =
      gameMode === 'training'
        ? 'http://localhost:3001/train'
        : 'http://localhost:3001/battle';

    try {
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        endpoint,
        { move },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Wait briefly to let the animation play
      await new Promise((r) => setTimeout(r, 500));

      const data = response.data;
      console.log(`[${gameMode.toUpperCase()}]`, data);

      // Display AI move
      setAiMove(data.ai_move);

      if (gameMode === 'training') {
        setTrainingScores(data.training_scores);
        if (data.result === 'win') setResult('You Win!');
        else if (data.result === 'lose') setResult('You Lose!');
        else setResult('Draw!');
        setAiMessage(data.message);

        if (data.training_complete) {
          setHasTrained(true);
          setResult('Training complete! Switching to Battle Round...');
          setTimeout(() => {
            setGameMode('battle');
            setResult('');
            setAiMessage('');
          }, 1200);
        }
      } else {
        const { battle_scores, final_scores, game_over, winner } = data;
        if (game_over) {
          setFinalScores(final_scores);
          setGameOver(true);
          setWinner(winner);
        } else {
          setBattleScores(battle_scores);
        }
        if (data.result === 'win') {
          setResult('You Win!');
          setAiMessage('AI is impressed...');
        } else if (data.result === 'lose') {
          setResult('You Lose!');
          setAiMessage('AI strikes back!');
        } else {
          setResult('Draw!');
          setAiMessage("It's a tie!");
        }
      }
    } catch (err) {
      console.error('Error contacting server:', err);
      setResult('Error contacting AI server.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div className="p-8 text-2xl text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-200 text-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Auth Buttons */}
      <div className="absolute top-6 right-6 flex items-center gap-4 text-xl">
        {isAuthenticated && (
          <>
            <span className="font-semibold">👋 {firstName}</span>
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

      {/* Not Logged In */}
      {!isAuthenticated && (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center">
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

      {/* Game UI for Authenticated Users */}
      {isAuthenticated && (
        <>
          <h1 className="text-4xl font-bold mt-4 mb-2">
            {gameMode === 'training'
              ? 'Training Round (10 moves)'
              : 'Battle Round (First to 3 wins)'}
          </h1>

          {/* Scoreboard */}
          {gameMode === 'training' ? (
            <div className="flex justify-around w-full max-w-3xl text-2xl my-4 p-4 border-2 rounded bg-white shadow-lg">
              <p className="font-bold">
                {firstName}: {trainingScores.player}
              </p>
              <p className="font-bold">AI: {trainingScores.ai}</p>
              <p className="font-bold">Draws: {trainingScores.draws}</p>
            </div>
          ) : (
            <div className="flex justify-around w-full max-w-3xl text-2xl my-4 p-4 border-2 rounded bg-white shadow-lg">
              <p className="font-bold">
                {firstName}: {battleScores.player}
              </p>
              <p className="font-bold">AI: {battleScores.ai}</p>
              <p className="font-bold">Draws: {battleScores.draws}</p>
            </div>
          )}

          {/* Hands */}
          <div className="flex items-center justify-center space-x-16 mt-3">
            <motion.img
              src={playerMove ? actions[playerMove] : rockHand}
              alt="player-hand"
              className="w-32 h-32 bg-white p-2 rounded-lg shadow-md"
              animate={{ x: loading ? [-15, 15, -15] : 0 }}
              transition={{ repeat: loading ? Infinity : 0, duration: 0.15 }}
            />
            <motion.img
              src={aiMove ? actions[aiMove] : rockHand}
              alt="ai-hand"
              className="w-32 h-32 bg-white p-2 rounded-lg shadow-md"
              animate={{ x: loading ? [15, -15, 15] : 0 }}
              transition={{ repeat: loading ? Infinity : 0, duration: 0.15 }}
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
                className="flex flex-col items-center bg-gray-300 p-4 rounded-lg hover:bg-gray-400 transition"
              >
                <img src={actions[action]} alt={action} className="w-20 h-20" />
                <span className="mt-2 text-xl font-bold">{action.toUpperCase()}</span>
              </motion.button>
            ))}
          </div>

          {/* Results + AI Message (fixed height to avoid layout jump) */}
          <div
            className="flex justify-between items-center mt-4 w-full max-w-3xl text-xl font-bold"
            style={{ minHeight: '40px' }}
          >
            <motion.div className="text-left">{result}</motion.div>
            <motion.div className="text-right italic font-bold">{aiMessage}</motion.div>
          </div>

          {/* Battle Over Modal */}
          {gameMode === 'battle' && gameOver && (
            <motion.div
              className="absolute inset-0 bg-gray-300 flex flex-col items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h1 className="text-5xl font-bold mb-6">
                {winner === 'player' ? '👨‍💻 YOU WIN! 🎉' : '🤖 AI WINS! 🔥'}
              </h1>
              <p className="text-2xl mb-6 font-bold">
                Final Score - {firstName}: {finalScores.player} | AI: {finalScores.ai} |
                Draws: {finalScores.draws}
              </p>
              <motion.button
                onClick={() => {
                  // Reset battle scoreboard, remain in battle mode (training only on first load)
                  setBattleScores({ player: 0, ai: 0, draws: 0 });
                  setFinalScores({ player: 0, ai: 0, draws: 0 });
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
