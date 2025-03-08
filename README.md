# Two-Player Bomberman-Like Game

## Overview
This project is a simple, real-time, two-player game inspired by Bomberman. Using React, TypeScript, Firebase Realtime Database, and advanced CSS animations, the game delivers a synchronous gameplay experience where two players compete until one loses all health points.

## User Story
**As a** gamer,  
**I want to** engage in a competitive bomberman-style game with another player,  
**so that** I can experience real-time, synchronized gameplay with smooth animations and clear game mechanics.

## Features & Requirements

### Home Page
- Displays a prominent **Start** button.
- Navigates the user to a waiting room when clicked.

### Waiting Room
- The first player enters and sees a waiting message.
- Once a second player joins, a **Start Game** button appears.
- Displays the status of connected players.

### Game Screen
- Shows a basic bomberman board.
- Renders player avatars with health points.
- Allows players to move in four directions (up, down, left, right).
- Enables bomb placement, with bombs detonating after a preset delay.
- Animates bomb explosions (affecting adjacent cells) using advanced CSS effects.
- Ends the game when one player's health points drop to zero, displaying a game-over screen.

### Game Mechanics
- **Movement:** Players can move using keyboard or on-screen controls.
- **Bomb Placement:** Players can drop bombs that explode after a delay.
- **Explosions:** The explosion affects cells in a cross pattern, typical of Bomberman.
- **Health Management:** Each player starts with a set number of health points (e.g., 3 HP) and loses health when hit by an explosion.
- **Obstacles:** Incorporates static obstacles and potentially destructible walls to enhance strategy.

### Real-Time Synchronization
- Uses Firebase Realtime Database to synchronize:
  - Player positions
  - Bomb placements and explosion statuses
  - Health updates in real time

## Tech Stack
- **Frontend:** React, TypeScript, CSS (with advanced animations)
- **Backend:** Firebase Realtime Database (and optionally Firebase Authentication for secure access)

## Project Roadmap

- **Phase 1: MVP**
  - Implement the Home Page and Waiting Room.
  - Create a basic Game Screen with a static bomberman board.

- **Phase 2: Core Game Mechanics**
  - Implement player movement and collision detection.
  - Develop bomb placement and explosion logic.
  - Integrate health management and game-over conditions.

- **Phase 3: Real-Time Synchronization**
  - Integrate Firebase to sync game state (player positions, bombs, health, etc.) in real time.

- **Phase 4: Enhancements and UI Polish**
  - Apply advanced CSS animations for a smoother, more engaging experience.
  - Optimize UI/UX based on user feedback.

- **Phase 5: Testing and Optimization**
  - Write unit and integration tests.
  - Optimize performance and scalability for future enhancements.
