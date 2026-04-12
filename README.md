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

- **Frontend**  
  The user interface you interact with in the browser.

The frontend talks to the backend through HTTP requests and a persistent real-time connection.

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
