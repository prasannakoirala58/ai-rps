from flask import Flask, request, jsonify
import numpy as np
import random
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

actions = ["rock", "paper", "scissors"]
action_index = {action: i for i, action in enumerate(actions)}

# Q-learning parameters (used only during training)
alpha = 0.2
gamma = 0.95

TRAINING_EXPLORATION = 0.5
# In battle mode, we want balanced play so we disregard Q-table (always random)
# BATTLE_EXPLORATION is not used in battle mode.

# Random initialization of Q-table so AI doesn't always start identically
q_table = np.random.uniform(low=-0.1, high=0.1, size=(3, 3))

# Training Round (10 moves)
training_moves_required = 10
training_moves_done = 0
training_scores = {"player": 0, "ai": 0, "draws": 0}

# Battle Round (first to 3 wins)
battle_score_limit = 3
battle_scores = {"player": 0, "ai": 0, "draws": 0}

def pick_ai_move(user_move, exploration_rate, mode="training"):
    user_idx = action_index[user_move]
    if mode == "battle":
        # In battle mode, return a uniform random move for balanced outcomes.
        return random.choice(actions)
    # Training mode: use exploration.
    if random.random() < exploration_rate:
        return random.choice(actions)
    return actions[np.argmax(q_table[user_idx])]

def compute_result(user_move, ai_move):
    if user_move == ai_move:
        return "draw"
    elif ((user_move == "rock" and ai_move == "scissors") or
          (user_move == "paper" and ai_move == "rock") or
          (user_move == "scissors" and ai_move == "paper")):
        return "win"
    else:
        return "lose"

def update_q_table(user_move, ai_move, result):
    user_idx = action_index[user_move]
    ai_idx = action_index[ai_move]
    if result == "win":
        reward = -1  # Player wins, so AI gets negative reward.
    elif result == "lose":
        reward = 1   # Player loses, so AI gets positive reward.
    else:
        reward = 0   # Draw
    q_table[user_idx, ai_idx] = (1 - alpha) * q_table[user_idx, ai_idx] + alpha * (
        reward + gamma * np.max(q_table[ai_idx])
    )

def random_message(result):
    if result == "win":
        return random.choice(["Wow, you got me!", "You're on fire!"])
    elif result == "lose":
        return random.choice(["Ha! Gotcha!", "I win this round!"])
    else:
        return random.choice(["A tie...", "We matched each other!"])

@app.route('/train', methods=['POST'])
def train():
    global training_moves_done, training_scores

    data = request.json
    user_move = data.get('move')
    if user_move not in actions:
        return jsonify({"error": "Invalid move"}), 400

    ai_move = pick_ai_move(user_move, TRAINING_EXPLORATION, mode="training")
    result = compute_result(user_move, ai_move)
    update_q_table(user_move, ai_move, result)

    if result == "win":
        training_scores["player"] += 1
    elif result == "lose":
        training_scores["ai"] += 1
    else:
        training_scores["draws"] += 1

    training_moves_done += 1
    training_complete = (training_moves_done >= training_moves_required)
    if training_complete:
        training_moves_done = 0

    return jsonify({
        "ai_move": ai_move,
        "result": result,
        "message": random_message(result),
        "training_complete": training_complete,
        "training_scores": training_scores
    })

@app.route('/battle', methods=['POST'])
def battle():
    global battle_scores
    data = request.json
    user_move = data.get('move')
    if user_move not in actions:
        return jsonify({"error": "Invalid move"}), 400

    # In battle mode, AI always plays uniformly random for balanced 50/50 outcomes.
    ai_move = pick_ai_move(user_move, 1.0, mode="battle")
    result = compute_result(user_move, ai_move)

    if result == "win":
        battle_scores["player"] += 1
    elif result == "lose":
        battle_scores["ai"] += 1
    else:
        battle_scores["draws"] += 1

    game_over = False
    winner = None
    final_scores = dict(battle_scores)
    if battle_scores["player"] >= battle_score_limit or battle_scores["ai"] >= battle_score_limit:
        game_over = True
        winner = "player" if battle_scores["player"] >= battle_score_limit else "ai"
        battle_scores = {"player": 0, "ai": 0, "draws": 0}

    return jsonify({
        "ai_move": ai_move,
        "result": result,
        "message": random_message(result),
        "battle_scores": battle_scores,
        "final_scores": final_scores,
        "game_over": game_over,
        "winner": winner
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
