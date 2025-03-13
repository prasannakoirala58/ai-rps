from flask import Flask, request, jsonify
import numpy as np
import random
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

actions = ["rock", "paper", "scissors"]
action_index = {action: i for i, action in enumerate(actions)}

# Initialize Q-table and scores
q_table = np.zeros((3, 3))
player_score = 0
ai_score = 0
draw_score = 0  # ✅ Added draw score tracking

# Learning Parameters (Adjusted)
alpha = 0.2  # Learning rate (AI adapts faster)
gamma = 0.95  # Discount factor (AI values future rewards more)
exploration_rate = 0.1  # AI plays randomly only 10% of the time now

def get_ai_move(user_move):
    """AI selects move based on Q-table or randomly"""
    user_index = action_index[user_move]

    # AI plays smarter, countering the player's most frequent move
    if random.random() < exploration_rate:
        ai_choice = random.choice(actions)
    else:
        ai_choice = actions[np.argmax(q_table[user_index])]

    return ai_choice

def get_learning_message(result):
    """Generate AI's 'thinking' messages based on learning progress"""
    global ai_score, player_score

    if result == "win":
        if ai_score > player_score:
            return random.choice(["Haha! I'm on a streak!", "I'm getting the hang of this!"])
        return random.choice(["Oh, I see your strategy!", "You're good, but I'm adapting!", "Aha! I'm learning!"])
    elif result == "lose":
        return random.choice(["Hmmm... need to rethink my strategy!", "That was unexpected!", "You're tricky!"])
    else:  # Draw
        return random.choice(["A tie? I'm studying your moves!", "Again? Interesting...", "I must analyze more!"])

def update_q_table(user_move, ai_move, result):
    """Update AI's Q-table based on game outcome"""
    user_index = action_index[user_move]
    ai_index = action_index[ai_move]

    # Assign rewards
    if result == "win":
        reward = -1  # AI lost, so penalize this move
    elif result == "lose":
        reward = 1  # AI won, so reward this move
    else:
        reward = 0.5  # Draw gets a slight reward

    # Update Q-table (AI learns from outcome)
    q_table[user_index, ai_index] = (1 - alpha) * q_table[user_index, ai_index] + alpha * (reward + gamma * np.max(q_table[ai_index]))

@app.route('/play', methods=['POST'])
def play():
    """Process game round and update AI learning"""
    global player_score, ai_score, draw_score  # ✅ Included draw_score

    data = request.json
    user_move = data.get('move')

    if user_move not in actions:
        return jsonify({"error": "Invalid move!"}), 400

    ai_move = get_ai_move(user_move)

    if user_move == ai_move:
        result = "draw"
        draw_score += 1  # ✅ Fixed: Now tracks draws correctly
    elif (user_move == "rock" and ai_move == "scissors") or \
         (user_move == "paper" and ai_move == "rock") or \
         (user_move == "scissors" and ai_move == "paper"):
        result = "win"
        player_score += 1
    else:
        result = "lose"
        ai_score += 1

    update_q_table(user_move, ai_move, result)
    learning_message = get_learning_message(result)

    # ✅ Game Over Logic (First to 3 wins)
    game_over = False
    if player_score >= 3 or ai_score >= 3:
        game_over = True
        final_winner = "player" if player_score >= 3 else "ai"
        player_score, ai_score, draw_score = 0, 0, 0  # ✅ Reset scores after game over

        return jsonify({
            "ai_move": ai_move,
            "result": result,
            "message": learning_message,
            "player_score": player_score,
            "ai_score": ai_score,
            "draw_score": draw_score,  # ✅ Fixed: Send final draws
            "game_over": game_over,
            "winner": final_winner
        })

    return jsonify({
        "ai_move": ai_move,
        "result": result,
        "message": learning_message,
        "player_score": player_score,
        "ai_score": ai_score,
        "draw_score": draw_score,  # ✅ Fixed: Draws now included in response
        "game_over": game_over
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
