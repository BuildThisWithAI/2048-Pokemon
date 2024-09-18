import React, { useState, useLayoutEffect, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import "./App.css";

const GRID_SIZE = 4;
const CELL_SIZE = 80;
const GAP_SIZE = 10;

const POKEMON = {
  grass: ["bulbasaur", "ivysaur", "venusaur"],
  fire: ["charmander", "charmeleon", "charizard"],
  water: ["squirtle", "wartortle", "blastoise"],
  bug1: ["caterpie", "metapod", "butterfree"],
  bug2: ["weedle", "kakuna", "beedrill"],
  normal: ["pidgey", "pidgeotto", "pidgeot"],
};

const POKEMON_NAMES = {
  grass: ["Bulbasaur", "Ivysaur", "Venusaur"],
  fire: ["Charmander", "Charmeleon", "Charizard"],
  water: ["Squirtle", "Wartortle", "Blastoise"],
  bug1: ["Caterpie", "Metapod", "Butterfree"],
  bug2: ["Weedle", "Kakuna", "Beedrill"],
  normal: ["Pidgey", "Pidgeotto", "Pidgeot"],
};

const COLOR_SCHEME = {
  grass: "#78C850",
  fire: "#F08030",
  water: "#6890F0",
  bug1: "#A8B820",
  bug2: "#A8B820",
  normal: "#A8A878",
};

const PokemonEvolutionGame = () => {
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [moves, setMoves] = useState(0);
  const [winningPokemon, setWinningPokemon] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const initializeGrid = () => {
    const newGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));
    addNewPokemon(newGrid);
    addNewPokemon(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setWin(false);
    setMoves(0);
    setWinningPokemon("");
  };

  useLayoutEffect(() => {
    initializeGrid();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => setShowModal(true), 500);
    }
  }, [isLoading]);

  useEffect(() => {
    document.body.style.cursor = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:24px;'><text y='50%'>🔴</text></svg>") 16 0, auto`;
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

  const addNewPokemon = (grid) => {
    const emptyCells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (!grid[i][j]) {
          emptyCells.push([i, j]);
        }
      }
    }
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const pokemonTypes = Object.keys(POKEMON);
      const randomType = pokemonTypes[Math.floor(Math.random() * pokemonTypes.length)];
      grid[row][col] = POKEMON[randomType][0]; // Always add the first evolution
    }
  };

  const moveCells = (direction) => {
    let newGrid = grid.map(row => [...row]);
    let moved = false;
    let scoreIncrease = 0;

    const moveCell = (row, col, rowDelta, colDelta) => {
      if (!newGrid[row][col]) return false;

      let newRow = row + rowDelta;
      let newCol = col + colDelta;

      while (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
        if (!newGrid[newRow][newCol]) {
          newRow += rowDelta;
          newCol += colDelta;
        } else if (newGrid[newRow][newCol] === newGrid[row][col]) {
          const pokemonType = Object.keys(POKEMON).find(type => POKEMON[type].includes(newGrid[row][col]));
          const currentIndex = POKEMON[pokemonType].indexOf(newGrid[row][col]);
          if (currentIndex < POKEMON[pokemonType].length - 1) {
            newGrid[newRow][newCol] = POKEMON[pokemonType][currentIndex + 1];
            scoreIncrease += (currentIndex + 2) * 10;
            if (newGrid[newRow][newCol] === POKEMON[pokemonType][POKEMON[pokemonType].length - 1]) {
              setWin(true);
              setWinningPokemon(POKEMON_NAMES[pokemonType][POKEMON[pokemonType].length - 1]);
              setShowWinModal(true);
            }
          }
          newGrid[row][col] = null;
          return true;
        } else {
          break;
        }
      }

      newRow -= rowDelta;
      newCol -= colDelta;

      if (newRow !== row || newCol !== col) {
        newGrid[newRow][newCol] = newGrid[row][col];
        newGrid[row][col] = null;
        return true;
      }

      return false;
    };

    if (direction === "up" || direction === "down") {
      const start = direction === "up" ? 1 : GRID_SIZE - 2;
      const end = direction === "up" ? GRID_SIZE : -1;
      const delta = direction === "up" ? 1 : -1;

      for (let col = 0; col < GRID_SIZE; col++) {
        for (let row = start; row !== end; row += delta) {
          moved |= moveCell(row, col, -delta, 0);
        }
      }
    } else {
      const start = direction === "left" ? 1 : GRID_SIZE - 2;
      const end = direction === "left" ? GRID_SIZE : -1;
      const delta = direction === "left" ? 1 : -1;

      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = start; col !== end; col += delta) {
          moved |= moveCell(row, col, 0, -delta);
        }
      }
    }

    if (moved) {
      addNewPokemon(newGrid);
      setGrid(newGrid);
      setScore(prevScore => prevScore + scoreIncrease);
      setMoves(prevMoves => prevMoves + 1);
      if (isGameOver(newGrid)) {
        setGameOver(true);
      }
    }
  };

  const isGameOver = (grid) => {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (!grid[i][j]) return false;
        if (
          (i < GRID_SIZE - 1 && grid[i][j] === grid[i + 1][j]) ||
          (j < GRID_SIZE - 1 && grid[i][j] === grid[i][j + 1])
        ) {
          return false;
        }
      }
    }
    return true;
  };

  const handleDragStart = (e, row, col) => {
    setDragStart({ row, col, clientX: e.clientX, clientY: e.clientY });
  };

  const handleDragEnd = (e) => {
    if (!dragStart) return;

    const dx = e.clientX - dragStart.clientX;
    const dy = e.clientY - dragStart.clientY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 20) {
      if (absDx > absDy) {
        moveCells(dx > 0 ? "right" : "left");
      } else {
        moveCells(dy > 0 ? "down" : "up");
      }
    }

    setDragStart(null);
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleDragEnd);
    return () => {
      window.removeEventListener("mouseup", handleDragEnd);
    };
  }, [dragStart]);

  const HowToPlayModal = () => (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">How To Play: Pokémon Evolution</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <ul className="list-disc pl-5 space-y-2">
            <li>Swipe or use arrow keys to move Pokémon on the grid</li>
            <li>Combine identical Pokémon to evolve them</li>
            <li>Each Pokémon has its own evolution chain:
              <ul className="list-disc pl-5 mt-1">
                <li>Grass: Bulbasaur → Ivysaur → Venusaur</li>
                <li>Fire: Charmander → Charmeleon → Charizard</li>
                <li>Water: Squirtle → Wartortle → Blastoise</li>
                <li>Bug: Caterpie → Metapod → Butterfree</li>
                <li>Bug: Weedle → Kakuna → Beedrill</li>
                <li>Normal: Pidgey → Pidgeotto → Pidgeot</li>
              </ul>
            </li>
            <li>Evolve to the final form of any Pokémon to win!</li>
            <li>The game ends when the grid is full and no more moves are possible</li>
          </ul>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );

  const WinModal = () => (
    <Dialog open={showWinModal} onOpenChange={setShowWinModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Congratulations! You Won!</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="space-y-4">
            <p>You evolved a {winningPokemon}! 🎉</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Final Score: {score}</li>
              <li>Moves Made: {moves}</li>
              <li>Winning Pokémon: {winningPokemon}</li>
            </ul>
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button onClick={() => { setShowWinModal(false); initializeGrid(); }}>Play Again</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="game-container"
      style={{ 
        width: GRID_SIZE * (CELL_SIZE + GAP_SIZE) + GAP_SIZE, 
        margin: "0 auto",
        visibility: isLoading ? "hidden" : "visible" 
      }}
    >
      <HowToPlayModal />
      <WinModal />
      <h1>Pokémon Evolution Game</h1>
      <div className="game-info">
        <p>Score: {score}</p>
        <p>Moves: {moves}</p>
        <p>Goal: Evolve to the final form of any Pokémon!</p>
      </div>
      <div className="grid" style={{
        display: "grid",
        gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
        gridGap: `${GAP_SIZE}px`,
        backgroundColor: "#bbada0",
        borderRadius: "6px",
        padding: `${GAP_SIZE}px`,
      }}>
        <AnimatePresence>
          {grid.flat().map((cell, index) => {
            const row = Math.floor(index / GRID_SIZE);
            const col = index % GRID_SIZE;
            const pokemonType = Object.keys(POKEMON).find(type => POKEMON[type].includes(cell));
            return (
              <motion.div
                key={`${row}-${col}`}
                className="cell"
                style={{
                  width: `${CELL_SIZE}px`,
                  height: `${CELL_SIZE}px`,
                  backgroundColor: pokemonType ? COLOR_SCHEME[pokemonType] : "#cdc1b4",
                  borderRadius: "3px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  userSelect: "none",
                  overflow: "hidden",
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onMouseDown={(e) => handleDragStart(e, row, col)}
              >
                {cell && (
                  <img
                    src={`/images/${cell}.avif`}
                    alt={POKEMON_NAMES[pokemonType][POKEMON[pokemonType].indexOf(cell)]}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {gameOver && !win && (
        <div className="game-over">
          Game Over!
          <Button onClick={initializeGrid}>Play Again</Button>
        </div>
      )}
    </motion.div>
  );
};

export default PokemonEvolutionGame