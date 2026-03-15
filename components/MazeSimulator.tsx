'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';

// Constantes
const GRID_SIZE = 50;
const CELL_SIZE = 10; // Reducido un poco para que quepa mejor en modal
const INITIAL_SPEED = 150; // ms por movimiento

// Tipos de celdas
type CellType = 'empty' | 'wall' | 'mouse' | 'cheese';

// Posición
interface Position {
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
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const movementRef = useRef<NodeJS.Timeout | null>(null);
  
  // Generar laberinto aleatorio
  const generateMaze = useCallback(() => {
    const newGrid: CellType[][] = [];
    
    // Inicializar grid vacío
    for (let y = 0; y < GRID_SIZE; y++) {
      const row: CellType[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        row.push('empty');
      }
      newGrid.push(row);
    }
    
    // Generar paredes aleatorias (alrededor del 30% del laberinto)
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        // Bordes siempre son paredes
        if (x === 0 || y === 0 || x === GRID_SIZE - 1 || y === GRID_SIZE - 1) {
          newGrid[y][x] = 'wall';
        } 
        // Paredes internas aleatorias
        else if (Math.random() < 0.25) { // 25% de probabilidad de pared
          newGrid[y][x] = 'wall';
        }
      }
    }
    
    // Posición inicial del ratón (esquina superior izquierda interior)
    let mouseValid = false;
    let mouseX = 1, mouseY = 1;
    while (!mouseValid) {
      mouseX = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
      mouseY = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
      if (newGrid[mouseY][mouseX] === 'empty') {
        mouseValid = true;
      }
    }
    
    // Posición del queso (esquina inferior derecha interior)
    let cheeseValid = false;
    let cheeseX = GRID_SIZE - 2, cheeseY = GRID_SIZE - 2;
    while (!cheeseValid) {
      cheeseX = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
      cheeseY = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
      if (newGrid[cheeseY][cheeseX] === 'empty' && 
          !(cheeseX === mouseX && cheeseY === mouseY)) {
        cheeseValid = true;
      }
    }
    
    setMousePos({ x: mouseX, y: mouseY });
    setCheesePos({ x: cheeseX, y: cheeseY });
    setGrid(newGrid);
    setMoves(0);
    setTime(0);
    setFoundCheese(false);
  }, []);
  
  // Inicializar laberinto
  useEffect(() => {
    generateMaze();
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
  
  // Movimiento aleatorio del ratón
  const moveMouseRandomly = useCallback(() => {
    if (!isRunning || foundCheese) return;
    
    // Obtener movimientos posibles
    const possibleMoves: Position[] = [];
    
    for (const dir of DIRECTIONS) {
      const newX = mousePos.x + dir.x;
      const newY = mousePos.y + dir.y;
      
      // Verificar límites y si la celda está vacía
      if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
        if (grid[newY][newX] === 'empty' || 
            (newX === cheesePos.x && newY === cheesePos.y)) {
          possibleMoves.push({ x: newX, y: newY });
        }
      }
    }
    
    // Si hay movimientos posibles, elegir uno aleatorio
    if (possibleMoves.length > 0) {
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      
      // Actualizar grid
      setGrid(prevGrid => {
        const newGrid = [...prevGrid];
        
        // Limpiar posición anterior del ratón
        newGrid[mousePos.y][mousePos.x] = 'empty';
        
        // Verificar si encontró el queso
        if (randomMove.x === cheesePos.x && randomMove.y === cheesePos.y) {
          setFoundCheese(true);
          setIsRunning(false);
          newGrid[randomMove.y][randomMove.x] = 'cheese'; // Mantener el queso visible
        } else {
          newGrid[randomMove.y][randomMove.x] = 'mouse';
        }
        
        return newGrid;
      });
      
      setMousePos(randomMove);
      setMoves(prev => prev + 1);
      
      // Si encontró el queso, detener todo
      if (randomMove.x === cheesePos.x && randomMove.y === cheesePos.y) {
        if (movementRef.current) {
          clearInterval(movementRef.current);
        }
      }
    }
  }, [isRunning, mousePos, cheesePos, grid, foundCheese]);
  
  // Controlar el movimiento automático
  useEffect(() => {
    if (isRunning && !foundCheese) {
      movementRef.current = setInterval(moveMouseRandomly, speed);
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
  }, [isRunning, speed, moveMouseRandomly, foundCheese]);
  
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
  
  // RETRY: Reiniciar con el mismo laberinto
  const handleRetry = () => {
    setShowSettings(false);
    
    // Restablecer posiciones
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      
      // Limpiar ratón anterior
      newGrid[mousePos.y][mousePos.x] = 'empty';
      
      // Colocar ratón en posición original
      newGrid[1][1] = 'mouse';
      setMousePos({ x: 1, y: 1 });
      
      return newGrid;
    });
    
    setMoves(0);
    setTime(0);
    setFoundCheese(false);
    setIsRunning(true);
  };
  
  // RESTART: Nuevo laberinto
  const handleRestart = () => {
    setShowSettings(false);
    generateMaze();
    setIsRunning(true);
  };
  
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
        className="grid gap-px bg-gray-700 p-1 overflow-auto max-h-[600px]"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
        }}
      >
        {gridWithMouse.map((row, y) => (
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: 
                  cell === 'mouse' ? '#8B4513' : 
                  cell === 'cheese' ? '#FFD700' : 
                  cell === 'wall' ? '#2D2D2D' : '#FFFFFF',
              }}
            />
          ))
        ))}
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-amber-500">🐭</span> Ratón en busca del Queso <span className="text-yellow-400">🧀</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="text-gray-400 hover:text-white" size={24} />
          </button>
        </div>
        
        {/* Contenido */}
        <div className="flex-1 overflow-auto p-6">
          {/* Panel de control */}
          <div className="flex gap-4 mb-4 justify-center">
            {!isRunning && !foundCheese && !showSettings && (
              <button
                onClick={startSearch}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold"
              >
                INICIAR
              </button>
            )}
            
            {isRunning && (
              <button
                onClick={stopSearch}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold"
              >
                STOP
              </button>
            )}
            
            {foundCheese && (
              <div className="text-2xl text-yellow-400 font-bold animate-pulse">
                🎉 ENCONTRÓ EL QUESO! 🎉
              </div>
            )}
          </div>
          
          {/* Estadísticas */}
          <div className="flex gap-8 text-white mb-4 justify-center">
            <div className="text-xl">
              Movimientos: <span className="font-bold text-indigo-400">{moves}</span>
            </div>
            <div className="text-xl">
              Tiempo: <span className="font-bold text-indigo-400">{time}s</span>
            </div>
          </div>
          
          {/* Laberinto */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-2xl overflow-auto flex justify-center">
            {grid.length > 0 && renderGrid()}
          </div>
          
          {/* Leyenda */}
          <div className="flex gap-6 mt-6 text-white justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-gray-300"></div>
              <span>Camino</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#2D2D2D]"></div>
              <span>Pared</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#8B4513]"></div>
              <span>Ratón</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#FFD700]"></div>
              <span>Queso</span>
            </div>
          </div>
        </div>
        
        {/* Menú SETTINGS */}
        {showSettings && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-80">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                ⚙️ CONFIGURACIÓN
              </h2>
              
              <div className="space-y-4">
                <button
                  onClick={handleContinue}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-lg font-semibold"
                >
                  CONTINUAR
                </button>
                
                <button
                  onClick={handleRetry}
                  className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-lg font-semibold"
                >
                  RETRY
                </button>
                
                <button
                  onClick={handleRestart}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
                >
                  RESTART
                </button>
              </div>
              
              <button
                onClick={() => setShowSettings(false)}
                className="mt-6 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
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