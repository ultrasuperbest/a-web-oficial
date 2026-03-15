'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { getNextMouseMove, onInit, onCheeseFound, onRetry, BEHAVIOR_NAME } from './MouseBehavior';

// Constantes
const MIN_SIZE = 10;
const MAX_SIZE = 60;
const DEFAULT_SIZE = 30;
const MIN_WALL_PERCENT = 0;
const MAX_WALL_PERCENT = 40; // Máximo 40% de paredes para garantizar conectividad
const DEFAULT_WALL_PERCENT = 25;
const INITIAL_SPEED = 150;

// Tipos de celdas
export type CellType = 'empty' | 'wall' | 'mouse' | 'cheese';

// Posición
export interface Position {
  x: number;
  y: number;
}

// Direcciones para BFS
const DIRECTIONS = [
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
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

// Obtener todas las posiciones vacías (no pared)
const getEmptyPositions = (grid: CellType[][]): Position[] => {
  const empty: Position[] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid.length; x++) {
      if (grid[y][x] === 'empty') {
        empty.push({ x, y });
      }
    }
  }
  return empty;
};

// Elegir posiciones aleatorias para ratón y queso que tengan camino
const placeMouseAndCheese = (
  grid: CellType[][],
  setMousePos: (pos: Position) => void,
  setCheesePos: (pos: Position) => void,
  setGrid: (grid: CellType[][]) => void
): boolean => {
  const size = grid.length;
  const emptyPositions = getEmptyPositions(grid);
  
  if (emptyPositions.length < 2) return false; // No hay suficientes espacios
  
  // Intentar hasta encontrar un par con camino
  const maxAttempts = 100;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Elegir dos posiciones distintas aleatorias
    const mouseIndex = Math.floor(Math.random() * emptyPositions.length);
    let cheeseIndex;
    do {
      cheeseIndex = Math.floor(Math.random() * emptyPositions.length);
    } while (cheeseIndex === mouseIndex);
    
    const mousePos = emptyPositions[mouseIndex];
    const cheesePos = emptyPositions[cheeseIndex];
    
    // Verificar camino
    if (hasPath(grid, mousePos, cheesePos)) {
      // Colocar en grid (sin modificar el original hasta confirmar)
      const newGrid = grid.map(row => [...row]); // copia
      // Limpiar posibles marcadores anteriores
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (newGrid[y][x] === 'mouse' || newGrid[y][x] === 'cheese') {
            newGrid[y][x] = 'empty';
          }
        }
      }
      newGrid[mousePos.y][mousePos.x] = 'mouse';
      newGrid[cheesePos.y][cheesePos.x] = 'cheese';
      
      setGrid(newGrid);
      setMousePos(mousePos);
      setCheesePos(cheesePos);
      return true;
    }
  }
  
  // Si no se encuentra, usar las dos primeras vacías (debería haber camino en laberinto generado)
  if (emptyPositions.length >= 2) {
    const mousePos = emptyPositions[0];
    const cheesePos = emptyPositions[1];
    const newGrid = grid.map(row => [...row]);
    // Limpiar
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (newGrid[y][x] === 'mouse' || newGrid[y][x] === 'cheese') {
          newGrid[y][x] = 'empty';
        }
      }
    }
    newGrid[mousePos.y][mousePos.x] = 'mouse';
    newGrid[cheesePos.y][cheesePos.x] = 'cheese';
    setGrid(newGrid);
    setMousePos(mousePos);
    setCheesePos(cheesePos);
    return true;
  }
  
  return false;
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
  const [wallPercent, setWallPercent] = useState(DEFAULT_WALL_PERCENT);
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const movementRef = useRef<NodeJS.Timeout | null>(null);
  
  // Generar laberinto con porcentaje de paredes dado y con camino garantizado entre todas las celdas?
  // Nota: No garantizamos que todas las celdas vacías estén conectadas, pero sí que al menos haya un camino entre dos puntos cualesquiera que elijamos después.
  // Para ello, generamos con paredes aleatorias, luego verificamos que haya al menos un par de celdas vacías conectadas.
  // Pero en placeMouseAndCheese nos aseguramos de que el par elegido tenga camino.
  const generateMaze = useCallback((size: number, wallPercent: number): CellType[][] => {
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
    
    // Calcular cuántas paredes internas poner (basado en porcentaje)
    const totalInternalCells = (size - 2) * (size - 2);
    const targetWalls = Math.floor(totalInternalCells * (wallPercent / 100));
    let wallsPlaced = 0;
    
    // Poner paredes aleatorias hasta alcanzar el objetivo
    const maxAttempts = 10000;
    let attempts = 0;
    while (wallsPlaced < targetWalls && attempts < maxAttempts) {
      const x = Math.floor(Math.random() * (size - 2)) + 1;
      const y = Math.floor(Math.random() * (size - 2)) + 1;
      if (newGrid[y][x] === 'empty') {
        newGrid[y][x] = 'wall';
        wallsPlaced++;
      }
      attempts++;
    }
    
    return newGrid;
  }, []);
  
  // Inicializar nuevo laberinto (RESTART)
  const handleRestart = useCallback(() => {
    setIsRunning(false);
    setFoundCheese(false);
    setMoves(0);
    setTime(0);
    
    // Generar nuevo laberinto
    let newGrid = generateMaze(gridSize, wallPercent);
    setGrid(newGrid);
    
    // Colocar ratón y queso aleatoriamente con camino
    const success = placeMouseAndCheese(newGrid, setMousePos, setCheesePos, setGrid);
    if (!success) {
      // Si falla, intentar con menos paredes (regenerar con porcentaje más bajo)
      console.warn('No se pudo colocar ratón y queso, reduciendo paredes');
      const saferPercent = Math.max(10, wallPercent - 10);
      newGrid = generateMaze(gridSize, saferPercent);
      setGrid(newGrid);
      placeMouseAndCheese(newGrid, setMousePos, setCheesePos, setGrid);
    }
    
    setShowSizeSelector(false);
    
    // Llamar al onInit del comportamiento con el nuevo grid
    // Nota: El grid ya tiene mouse y cheese, pero pasamos las posiciones actuales
    onInit(newGrid, mousePos, cheesePos, gridSize); // mousePos y cheesePos aún no actualizados? Usar timeout o efecto.
    // Mejor usar useEffect para cuando cambien las posiciones, pero por ahora podemos llamar después de actualizar.
    // Como setGrid es asíncrono, podemos usar un pequeño timeout o confiar en que el próximo ciclo lo hará.
    // Alternativa: pasar las nuevas posiciones después de set.
    setTimeout(() => {
      onInit(grid, mousePos, cheesePos, gridSize);
    }, 0);
  }, [gridSize, wallPercent, generateMaze, mousePos, cheesePos, grid]);
  
  // RETRY: Reiniciar con el mismo laberinto pero nuevas posiciones aleatorias
  const handleRetry = useCallback(() => {
    setIsRunning(false);
    setFoundCheese(false);
    setMoves(0);
    setTime(0);
    
    // Usar el mismo grid (sin cambios en paredes)
    const currentGrid = grid.map(row => [...row]); // copia
    // Limpiar marcadores de ratón y queso
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (currentGrid[y][x] === 'mouse' || currentGrid[y][x] === 'cheese') {
          currentGrid[y][x] = 'empty';
        }
      }
    }
    setGrid(currentGrid);
    
    // Colocar nuevas posiciones aleatorias
    const success = placeMouseAndCheese(currentGrid, setMousePos, setCheesePos, setGrid);
    if (!success) {
      console.warn('No se pudo colocar en RETRY');
    }
    
    // Llamar a onRetry del comportamiento
    onRetry();
    // Reiniciar también el estado del comportamiento con nuevas posiciones
    setTimeout(() => {
      onInit(grid, mousePos, cheesePos, gridSize);
    }, 0);
  }, [grid, gridSize]);
  
  // Inicializar al montar el componente
  useEffect(() => {
    handleRestart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
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
    
    const nextMove = getNextMouseMove(
      grid,
      mousePos,
      cheesePos,
      moves,
      time,
      gridSize
    );
    
    if (!nextMove) return;
    
    // Validar movimiento
    if (nextMove.x < 0 || nextMove.x >= gridSize || nextMove.y < 0 || nextMove.y >= gridSize) return;
    if (grid[nextMove.y][nextMove.x] === 'wall') return;
    
    // Actualizar grid
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      newGrid[mousePos.y][mousePos.x] = 'empty';
      
      if (nextMove.x === cheesePos.x && nextMove.y === cheesePos.y) {
        setFoundCheese(true);
        setIsRunning(false);
        newGrid[nextMove.y][nextMove.x] = 'cheese';
        onCheeseFound(moves + 1, time);
      } else {
        newGrid[nextMove.y][nextMove.x] = 'mouse';
      }
      
      return newGrid;
    });
    
    setMousePos(nextMove);
    setMoves(prev => prev + 1);
    
    if (nextMove.x === cheesePos.x && nextMove.y === cheesePos.y) {
      if (movementRef.current) {
        clearInterval(movementRef.current);
      }
    }
  }, [isRunning, mousePos, cheesePos, grid, foundCheese, gridSize, moves, time]);
  
  // Controlar movimiento automático
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
  const startSearch = () => setIsRunning(true);
  
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
  
  // Cambiar tamaño y regenerar
  const handleSizeChange = (newSize: number) => {
    setGridSize(newSize);
    // No regeneramos automáticamente, esperamos a que pulsen "Generar"
  };
  
  const handleGenerateClick = () => {
    handleRestart();
  };
  
  // Calcular tamaño de celda
  const getCellSize = () => {
    if (gridSize <= 20) return 18;
    if (gridSize <= 30) return 14;
    if (gridSize <= 40) return 10;
    return 8;
  };
  
  const cellSize = getCellSize();
  
  // Renderizar grid
  const renderGrid = () => {
    return (
      <div 
        className="grid gap-px bg-gray-800 p-1 overflow-auto max-h-[500px]"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
        }}
      >
        {grid.map((row, y) => (
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className="transition-all duration-150"
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: 
                  cell === 'mouse' ? '#FF4500' :
                  cell === 'cheese' ? '#FFD700' :
                  cell === 'wall' ? '#1E3A5F' :
                  '#E8F0FE',
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
          
          {/* Selector de tamaño y porcentaje de paredes */}
          {showSizeSelector && (
            <div className="mb-6 p-6 bg-indigo-900/30 rounded-xl border border-indigo-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ChevronDown className="text-indigo-400" />
                Configuración del laberinto
              </h3>
              
              <div className="space-y-6">
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
                    onChange={(e) => handleSizeChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-indigo-900 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                {/* Porcentaje de paredes */}
                <div>
                  <label className="block text-sm font-medium text-indigo-300 mb-2">
                    Densidad de paredes: {wallPercent}% (máx 40% para garantizar conectividad)
                  </label>
                  <input
                    type="range"
                    min={MIN_WALL_PERCENT}
                    max={MAX_WALL_PERCENT}
                    value={wallPercent}
                    onChange={(e) => setWallPercent(parseInt(e.target.value))}
                    className="w-full h-2 bg-indigo-900 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-indigo-400 mt-1">
                    {wallPercent <= 15 ? '🍃 Laberinto abierto' : 
                     wallPercent <= 25 ? '🌿 Laberinto normal' : 
                     '🌲 Laberinto denso'}
                  </p>
                </div>
                
                <button
                  onClick={handleGenerateClick}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold"
                >
                  Generar Nuevo Laberinto
                </button>
              </div>
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
          
          {/* Botones para cambiar configuración o reiniciar */}
          {!showSizeSelector && !isRunning && !foundCheese && (
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => setShowSizeSelector(true)}
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                Cambiar configuración
              </button>
              <button
                onClick={handleRetry}
                className="text-yellow-400 hover:text-yellow-300 underline"
              >
                Recolocar (RETRY)
              </button>
              <button
                onClick={handleRestart}
                className="text-green-400 hover:text-green-300 underline"
              >
                Nuevo laberinto
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
                  onClick={() => {
                    setShowSettings(false);
                    handleRetry();
                  }}
                  className="w-full px-4 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-xl hover:from-yellow-700 hover:to-amber-700 transition text-lg font-bold"
                >
                  🔄 RETRY (Nuevas posiciones)
                </button>
                
                <button
                  onClick={() => {
                    setShowSettings(false);
                    handleRestart();
                  }}
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