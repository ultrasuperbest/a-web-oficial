'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronDown, Brain } from 'lucide-react';
import { getNextMouseMove, onInit, onCheeseFound, onRetry, BEHAVIOR_NAME } from './MouseBehavior';

// Constantes
const MIN_SIZE = 10;
const MAX_SIZE = 60;
const DEFAULT_SIZE = 30;
const MIN_DENSITY = 10; // %
const MAX_DENSITY = 50; // %
const DEFAULT_DENSITY = 25;
const INITIAL_SPEED = 150;
const MIN_CRAZY = 0;
const MAX_CRAZY = 100;
const DEFAULT_CRAZY = 10; // 10% de locura

// Tipos de celdas
export type CellType = 'empty' | 'wall' | 'mouse' | 'cheese';

// Posición
export interface Position {
  x: number;
  y: number;
}

// Direcciones
const DIRECTIONS = [
  { x: 0, y: -1 }, // arriba
  { x: 0, y: 1 },  // abajo
  { x: -1, y: 0 }, // izquierda
  { x: 1, y: 0 },  // derecha
];

interface MazeSimulatorProps {
  onClose: () => void;
}

// Algoritmo de búsqueda BFS para verificar si hay camino
const hasPath = (
  grid: CellType[][],
  start: Position,
  target: Position
): boolean => {
  const size = grid.length;
  const visited = Array(size).fill(false).map(() => Array(size).fill(false));
  const queue: Position[] = [start];
  visited[start.y][start.x] = true;

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current.x === target.x && current.y === target.y) {
      return true;
    }

    for (const dir of DIRECTIONS) {
      const newX = current.x + dir.x;
      const newY = current.y + dir.y;
      
      if (newX >= 0 && newX < size && newY >= 0 && newY < size && 
          !visited[newY][newX] && grid[newY][newX] !== 'wall') {
        visited[newY][newX] = true;
        queue.push({ x: newX, y: newY });
      }
    }
  }
  
  return false;
};

// Generar posición aleatoria válida (no pared)
const getRandomEmptyPosition = (grid: CellType[][], exclude?: Position): Position => {
  const size = grid.length;
  let attempts = 0;
  const maxAttempts = 1000;
  
  while (attempts < maxAttempts) {
    const x = Math.floor(Math.random() * (size - 2)) + 1; // evitar bordes
    const y = Math.floor(Math.random() * (size - 2)) + 1;
    if (grid[y][x] === 'empty' && (!exclude || !(x === exclude.x && y === exclude.y))) {
      return { x, y };
    }
    attempts++;
  }
  
  // Si no encuentra, devolver una posición por defecto
  return { x: 1, y: 1 };
};

const MazeSimulator: React.FC<MazeSimulatorProps> = ({ onClose }) => {
  // Estados principales
  const [grid, setGrid] = useState<CellType[][]>([]);
  const [mousePos, setMousePos] = useState<Position>({ x: 0, y: 0 });
  const [cheesePos, setCheesePos] = useState<Position>({ x: 0, y: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [speed] = useState(INITIAL_SPEED);
  const [foundCheese, setFoundCheese] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(true);
  const [gridSize, setGridSize] = useState(DEFAULT_SIZE);
  const [wallDensity, setWallDensity] = useState(DEFAULT_DENSITY);
  const [crazyPercentage, setCrazyPercentage] = useState(DEFAULT_CRAZY);
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const movementRef = useRef<NodeJS.Timeout | null>(null);
  
  // Generar laberinto con camino garantizado y posiciones aleatorias
  const generateMaze = useCallback((size: number, density: number) => {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const newGrid: CellType[][] = [];
      
      // Inicializar grid vacío
      for (let y = 0; y < size; y++) {
        const row: CellType[] = [];
        for (let x = 0; x < size; x++) {
          row.push('empty');
        }
        newGrid.push(row);
      }
      
      // Bordes siempre son paredes
      for (let y = 0; y < size; y++) {
        newGrid[y][0] = 'wall';
        newGrid[y][size - 1] = 'wall';
      }
      for (let x = 0; x < size; x++) {
        newGrid[0][x] = 'wall';
        newGrid[size - 1][x] = 'wall';
      }
      
      // Generar paredes internas según densidad
      const wallProbability = density / 100;
      for (let y = 1; y < size - 1; y++) {
        for (let x = 1; x < size - 1; x++) {
          if (Math.random() < wallProbability) {
            newGrid[y][x] = 'wall';
          }
        }
      }
      
      // Elegir posiciones aleatorias para ratón y queso
      const mousePosTemp = getRandomEmptyPosition(newGrid);
      const cheesePosTemp = getRandomEmptyPosition(newGrid, mousePosTemp);
      
      // Verificar si hay camino entre ellos
      if (hasPath(newGrid, mousePosTemp, cheesePosTemp)) {
        newGrid[mousePosTemp.y][mousePosTemp.x] = 'mouse';
        newGrid[cheesePosTemp.y][cheesePosTemp.x] = 'cheese';
        
        setMousePos(mousePosTemp);
        setCheesePos(cheesePosTemp);
        setGrid(newGrid);
        setMoves(0);
        setTime(0);
        setFoundCheese(false);
        setShowSizeSelector(false);
        
        // Llamar al onInit del comportamiento
        onInit(newGrid, mousePosTemp, cheesePosTemp, size);
        
        return true;
      }
      
      attempts++;
    }
    
    // Si no se pudo generar después de muchos intentos, crear un laberinto simple sin paredes internas
    const simpleGrid: CellType[][] = [];
    for (let y = 0; y < size; y++) {
      const row: CellType[] = [];
      for (let x = 0; x < size; x++) {
        if (x === 0 || y === 0 || x === size - 1 || y === size - 1) {
          row.push('wall');
        } else {
          row.push('empty');
        }
      }
      simpleGrid.push(row);
    }
    
    // Posiciones aleatorias en el laberinto simple
    const mousePosTemp = getRandomEmptyPosition(simpleGrid);
    const cheesePosTemp = getRandomEmptyPosition(simpleGrid, mousePosTemp);
    
    simpleGrid[mousePosTemp.y][mousePosTemp.x] = 'mouse';
    simpleGrid[cheesePosTemp.y][cheesePosTemp.x] = 'cheese';
    
    setMousePos(mousePosTemp);
    setCheesePos(cheesePosTemp);
    setGrid(simpleGrid);
    setMoves(0);
    setTime(0);
    setFoundCheese(false);
    setShowSizeSelector(false);
    
    onInit(simpleGrid, mousePosTemp, cheesePosTemp, size);
    
    return true;
  }, []);
  
  // Inicializar con valores por defecto
  useEffect(() => {
    generateMaze(DEFAULT_SIZE, DEFAULT_DENSITY);
  }, [generateMaze]);
  
  // Timer
  useEffect(() => {
    if (isRunning && !foundCheese) {
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, foundCheese]);
  
  // Movimiento del ratón usando el comportamiento externo
  const moveMouse = useCallback(() => {
    if (!isRunning || foundCheese) return;
    
    // Obtener el siguiente movimiento desde el comportamiento externo
    const nextMove = getNextMouseMove(
      grid,
      mousePos,
      cheesePos,
      moves,
      time,
      gridSize,
      crazyPercentage // Pasamos el porcentaje de locura al comportamiento
    );
    
    // Si no hay movimiento posible, no hacer nada
    if (!nextMove) return;
    
    // Verificar que el movimiento sea válido (por seguridad)
    const isValidMove = (() => {
      if (nextMove.x < 0 || nextMove.x >= gridSize || nextMove.y < 0 || nextMove.y >= gridSize) {
        return false;
      }
      if (grid[nextMove.y][nextMove.x] === 'wall') {
        return false;
      }
      return true;
    })();
    
    if (!isValidMove) return;
    
    // Actualizar grid
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      
      // Limpiar posición anterior del ratón
      newGrid[mousePos.y][mousePos.x] = 'empty';
      
      // Verificar si encontró el queso
      if (nextMove.x === cheesePos.x && nextMove.y === cheesePos.y) {
        setFoundCheese(true);
        setIsRunning(false);
        newGrid[nextMove.y][nextMove.x] = 'cheese';
        
        // Llamar al onCheeseFound del comportamiento
        onCheeseFound(moves + 1, time);
      } else {
        newGrid[nextMove.y][nextMove.x] = 'mouse';
      }
      
      return newGrid;
    });
    
    setMousePos(nextMove);
    setMoves(prev => prev + 1);
    
    // Si encontró el queso, detener todo
    if (nextMove.x === cheesePos.x && nextMove.y === cheesePos.y) {
      if (movementRef.current) {
        clearInterval(movementRef.current);
      }
    }
  }, [isRunning, mousePos, cheesePos, grid, foundCheese, gridSize, moves, time, crazyPercentage]);
  
  // Controlar el movimiento automático
  useEffect(() => {
    if (isRunning && !foundCheese) {
      movementRef.current = setInterval(moveMouse, speed);
    } else {
      if (movementRef.current) {
        clearInterval(movementRef.current);
      }
    }
    
    return () => {
      if (movementRef.current) {
        clearInterval(movementRef.current);
      }
    };
  }, [isRunning, speed, moveMouse, foundCheese]);
  
  // Iniciar búsqueda
  const startSearch = () => {
    setIsRunning(true);
  };
  
  // Detener búsqueda (abrir menú)
  const stopSearch = () => {
    setIsRunning(false);
    setShowSettings(true);
  };
  
  // CONTINUE: Salir del menú y continuar
  const handleContinue = () => {
    setShowSettings(false);
    setIsRunning(true);
  };
  
  // RETRY: Reiniciar con el mismo laberinto (nuevas posiciones aleatorias)
  const handleRetry = () => {
    setShowSettings(false);
    
    // Generar nuevas posiciones aleatorias en el mismo grid
    const newGrid = grid.map(row => [...row]);
    
    // Limpiar ratón y queso actuales
    newGrid[mousePos.y][mousePos.x] = 'empty';
    newGrid[cheesePos.y][cheesePos.x] = 'empty';
    
    // Elegir nuevas posiciones
    const newMousePos = getRandomEmptyPosition(newGrid);
    const newCheesePos = getRandomEmptyPosition(newGrid, newMousePos);
    
    newGrid[newMousePos.y][newMousePos.x] = 'mouse';
    newGrid[newCheesePos.y][newCheesePos.x] = 'cheese';
    
    setGrid(newGrid);
    setMousePos(newMousePos);
    setCheesePos(newCheesePos);
    setMoves(0);
    setTime(0);
    setFoundCheese(false);
    setIsRunning(true);
    
    // Llamar al onRetry del comportamiento
    onRetry();
    // También onInit para reiniciar estado interno
    onInit(newGrid, newMousePos, newCheesePos, gridSize);
  };
  
  // RESTART: Nuevo laberinto del mismo tamaño y densidad
  const handleRestart = () => {
    setShowSettings(false);
    generateMaze(gridSize, wallDensity);
    setIsRunning(true);
  };
  
  // Cambiar tamaño y generar nuevo laberinto
  const handleSizeChange = (newSize: number) => {
    setGridSize(newSize);
    generateMaze(newSize, wallDensity);
  };
  
  // Cambiar densidad y generar nuevo laberinto
  const handleDensityChange = (newDensity: number) => {
    setWallDensity(newDensity);
    generateMaze(gridSize, newDensity);
  };
  
  // Calcular tamaño de celda basado en el grid
  const getCellSize = () => {
    if (gridSize <= 20) return 18;
    if (gridSize <= 30) return 14;
    if (gridSize <= 40) return 10;
    return 8;
  };
  
  const cellSize = getCellSize();
  
  // Renderizar el grid
  const renderGrid = () => {
    const gridWithMouse = grid.map((row, y) => [...row]);
    
    // Actualizar con posiciones actuales si no hay grid
    if (gridWithMouse.length > 0) {
      // Asegurar que el ratón y el queso estén representados
      if (!foundCheese) {
        gridWithMouse[cheesePos.y][cheesePos.x] = 'cheese';
      }
      
      if (isRunning && !foundCheese) {
        gridWithMouse[mousePos.y][mousePos.x] = 'mouse';
      } else if (foundCheese) {
        gridWithMouse[cheesePos.y][cheesePos.x] = 'cheese';
      }
    }
    
    return (
      <div 
        className="grid gap-px bg-gray-800 p-1 overflow-auto max-h-[500px]"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
        }}
      >
        {gridWithMouse.map((row, y) => (
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className="transition-all duration-150"
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: 
                  cell === 'mouse' ? '#FF4500' : // Naranja brillante
                  cell === 'cheese' ? '#FFD700' : // Amarillo dorado
                  cell === 'wall' ? '#1E3A5F' : // Azul oscuro
                  '#E8F0FE', // Azul muy claro para caminos
                boxShadow: cell === 'mouse' ? '0 0 8px #FF4500' :
                          cell === 'cheese' ? '0 0 8px #FFD700' : 'none',
                border: cell === 'wall' ? '1px solid #0A1929' : 'none',
              }}
            />
          ))
        ))}
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-indigo-500/30">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-indigo-500/30 bg-gradient-to-r from-gray-900 to-indigo-900/30">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">🐭</span> 
            <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
              Ratón en busca del Queso
            </span>
            <span className="text-3xl">🧀</span>
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-sm bg-indigo-900/50 px-3 py-1 rounded-full text-indigo-300 border border-indigo-500/30">
              🧠 {BEHAVIOR_NAME}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
            >
              <X className="text-gray-400 group-hover:text-white" size={24} />
            </button>
          </div>
        </div>
        
        {/* Contenido */}
        <div className="flex-1 overflow-auto p-6">
          
          {/* Selector de tamaño y densidad */}
          {showSizeSelector && (
            <div className="mb-6 p-6 bg-indigo-900/30 rounded-xl border border-indigo-500/30 space-y-4">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ChevronDown className="text-indigo-400" />
                Configuración del laberinto
              </h3>
              
              {/* Tamaño */}
              <div>
                <label className="block text-sm font-medium text-indigo-300 mb-2">
                  Tamaño: {gridSize}x{gridSize}
                </label>
                <input
                  type="range"
                  min={MIN_SIZE}
                  max={MAX_SIZE}
                  value={gridSize}
                  onChange={(e) => setGridSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-indigo-900 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-indigo-300 mt-1">
                  {gridSize <= 20 ? '🍬 Pequeño' : gridSize <= 40 ? '📏 Mediano' : '🏰 Gigante'}
                </p>
              </div>
              
              {/* Densidad de paredes */}
              <div>
                <label className="block text-sm font-medium text-indigo-300 mb-2">
                  Densidad de paredes: {wallDensity}%
                </label>
                <input
                  type="range"
                  min={MIN_DENSITY}
                  max={MAX_DENSITY}
                  value={wallDensity}
                  onChange={(e) => setWallDensity(parseInt(e.target.value))}
                  className="w-full h-2 bg-indigo-900 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-indigo-300 mt-1">
                  {wallDensity <= 20 ? '🌿 Pocas paredes' : wallDensity <= 35 ? '🌲 Normal' : '🏢 Muy laberíntico'}
                </p>
              </div>
              
              {/* Porcentaje de locura */}
              <div>
                <label className="block text-sm font-medium text-indigo-300 mb-2">
                  🎲 Locura: {crazyPercentage}% (probabilidad de movimiento aleatorio)
                </label>
                <input
                  type="range"
                  min={MIN_CRAZY}
                  max={MAX_CRAZY}
                  value={crazyPercentage}
                  onChange={(e) => setCrazyPercentage(parseInt(e.target.value))}
                  className="w-full h-2 bg-indigo-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <button
                onClick={() => handleSizeChange(gridSize)}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold"
              >
                Generar Laberinto
              </button>
            </div>
          )}
          
          {/* Panel de control */}
          <div className="flex gap-4 mb-4 justify-center">
            {!isRunning && !foundCheese && (
              <button
                onClick={startSearch}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-bold text-lg shadow-lg shadow-green-600/20"
              >
                🚀 INICIAR BÚSQUEDA
              </button>
            )}
            
            {isRunning && (
              <button
                onClick={stopSearch}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition font-bold text-lg shadow-lg shadow-red-600/20"
              >
                ⏹️ STOP
              </button>
            )}
            
            {foundCheese && (
              <div className="text-3xl text-yellow-400 font-bold animate-bounce flex items-center gap-4">
                <span>🎉</span> ENCONTRÓ EL QUESO! <span>🎉</span>
              </div>
            )}
          </div>
          
          {/* Estadísticas */}
          <div className="flex gap-8 text-white mb-6 justify-center">
            <div className="text-xl px-6 py-3 bg-indigo-900/30 rounded-xl border border-indigo-500/30">
              📊 Movimientos: <span className="font-bold text-indigo-400 text-2xl">{moves}</span>
            </div>
            <div className="text-xl px-6 py-3 bg-indigo-900/30 rounded-xl border border-indigo-500/30">
              ⏱️ Tiempo: <span className="font-bold text-indigo-400 text-2xl">{time}s</span>
            </div>
          </div>
          
          {/* Laberinto */}
          <div className="bg-gray-800 p-4 rounded-xl shadow-2xl overflow-auto flex justify-center border-2 border-indigo-500/30">
            {grid.length > 0 && renderGrid()}
          </div>
          
          {/* Leyenda */}
          <div className="flex gap-6 mt-6 text-white justify-center flex-wrap">
            <div className="flex items-center gap-2 bg-indigo-900/30 px-4 py-2 rounded-lg">
              <div className="w-4 h-4 bg-[#E8F0FE] border border-indigo-300"></div>
              <span>Camino</span>
            </div>
            <div className="flex items-center gap-2 bg-indigo-900/30 px-4 py-2 rounded-lg">
              <div className="w-4 h-4 bg-[#1E3A5F] border border-indigo-300"></div>
              <span>Pared</span>
            </div>
            <div className="flex items-center gap-2 bg-indigo-900/30 px-4 py-2 rounded-lg">
              <div className="w-4 h-4 bg-[#FF4500] shadow-lg shadow-orange-500/50"></div>
              <span>Ratón</span>
            </div>
            <div className="flex items-center gap-2 bg-indigo-900/30 px-4 py-2 rounded-lg">
              <div className="w-4 h-4 bg-[#FFD700] shadow-lg shadow-yellow-500/50"></div>
              <span>Queso</span>
            </div>
          </div>
          
          {/* Botón para cambiar configuración durante el juego */}
          {!showSizeSelector && !isRunning && !foundCheese && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowSizeSelector(true)}
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                Cambiar configuración del laberinto
              </button>
            </div>
          )}
        </div>
        
        {/* Menú SETTINGS */}
        {showSettings && (
          <div className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-96 border-2 border-indigo-500">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                ⚙️ CONFIGURACIÓN
              </h2>
              
              <div className="space-y-4">
                <button
                  onClick={handleContinue}
                  className="w-full px-4 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition text-lg font-bold"
                >
                  ▶️ CONTINUAR
                </button>
                
                <button
                  onClick={handleRetry}
                  className="w-full px-4 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-xl hover:from-yellow-700 hover:to-amber-700 transition text-lg font-bold"
                >
                  🔄 RETRY (Nuevas posiciones)
                </button>
                
                <button
                  onClick={handleRestart}
                  className="w-full px-4 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition text-lg font-bold"
                >
                  🎲 RESTART (Nuevo laberinto)
                </button>
              </div>
              
              <button
                onClick={() => setShowSettings(false)}
                className="mt-6 w-full px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MazeSimulator;