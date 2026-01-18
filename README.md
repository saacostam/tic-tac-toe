# Tic-Tac-Toe

This is a simple **real-time Tic-Tac-Toe game** you can play in the browser.

It was built as a side project to explore real-time interactions, game state handling, and clean separation between frontend and backend logic.

The game supports:
- Creating and joining games
- Playing turns in real time
- Detecting wins and finished games
- Handling player disconnects

---

## How It Works (High Level)

- You open the app in the browser and choose a name
- You can create a new game or join an existing one
- Two players take turns placing their marks on a 3×3 board
- The game ends when someone wins or the game is closed

Everything happens in real time — moves and game state updates are pushed instantly to both players.

---

## What’s in This Repository

This project has two main parts:

- **Frontend**  
  The user interface you interact with in the browser.

- **Backend**  
  A small server that:
  - Keeps track of users and games
  - Validates moves
  - Determines winners
  - Sends real-time updates

The frontend talks to the backend through HTTP requests and a persistent real-time connection.

---

## Running Locally

This project is designed to be run locally.

1. Start the backend server
2. Start the frontend
3. Open the frontend in your browser
4. Open a second tab (or browser) to play against yourself or a friend

All data lives in memory, so restarting the backend resets everything.

---

## Limitations

This is a **learning / side project**, so some things are intentionally simple:

- No accounts or passwords
- No persistence (games disappear on restart)
- No matchmaking beyond joining open games

---

## Why This Exists

This project was built to:
- Practice full-stack development
- Experiment with real-time updates
- Keep things small, understandable, and fun

---

## License

MIT
