// components/MouseBehavior.ts
// 🐭 Comportamiento: Dirección con Memoria (3 pasos)

import { Position } from './MazeSimulator';

// ============================================
// CONFIGURACIÓN RÁPIDA
// ============================================
export const BEHAVIOR_NAME = "Dirección con Memoria (3 pasos)";

// ============================================
// ESTADO INTERNO DEL COMPORTAMIENTO
// ============================================
// Estas variables persisten entre llamadas
let currentDirection = { x: 0, y: 0 };
let stepsInCurrentDirection = 0;
let isPaused = false;
let pauseStartTime = 0;

// ============================================
// FUNCIÓN PRINCIPAL DE MOVIMIENTO
// ============================================
export function getNextMouseMove(
  grid: string[][],           // Matriz del laberinto
  mousePos: Position,         // Posición actual del ratón
  cheesePos: Position,        // Posición del queso
  moves: number,              // Número de movimientos realizados
  time: number,               // Tiempo transcurrido en segundos
  gridSize: number            // Tamaño del laberinto
): Position | null {
  
  // Direcciones posibles
  const directions = [
    { x: 0, y: -1, name: 'arriba' },    // arriba
    { x: 0, y: 1, name: 'abajo' },      // abajo
    { x: -1, y: 0, name: 'izquierda' }, // izquierda
    { x: 1, y: 0, name: 'derecha' },    // derecha
  ];
  
  // ========================================
  // LÓGICA DE PAUSA (1 segundo)
  // ========================================
  if (isPaused) {
    // Si está en pausa, verificar si ya pasó 1 segundo
    if (pauseStartTime === 0) {
      pauseStartTime = time;
    }
    
    // Si ya pasó 1 segundo, salir de pausa
    if (time - pauseStartTime >= 1) {
      isPaused = false;
      pauseStartTime = 0;
      console.log('▶️ Reanudando movimiento');
    } else {
      // Durante la pausa, no se mueve
      return null;
    }
  }
  
  // ========================================
  // ENCONTRAR MOVIMIENTOS POSIBLES
  // ========================================
  const getPossibleMoves = (): Position[] => {
    const possible: Position[] = [];
    
    for (const dir of directions) {
      const newX = mousePos.x + dir.x;
      const newY = mousePos.y + dir.y;
      
      if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
        if (grid[newY][newX] === 'empty' || grid[newY][newX] === 'cheese') {
          possible.push({ x: newX, y: newY });
        }
      }
    }
    
    return possible;
  };
  
  // ========================================
  // VERIFICAR SI LA DIRECCIÓN ACTUAL ES VÁLIDA
  // ========================================
  const isDirectionValid = (dir: { x: number; y: number }): boolean => {
    const newX = mousePos.x + dir.x;
    const newY = mousePos.y + dir.y;
    
    if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) {
      return false;
    }
    
    return grid[newY][newX] === 'empty' || grid[newY][newX] === 'cheese';
  };
  
  // ========================================
  // ELEGIR NUEVA DIRECCIÓN ALEATORIA
  // ========================================
  const chooseNewDirection = (): { x: number; y: number } => {
    const possibleMoves = getPossibleMoves();
    
    if (possibleMoves.length === 0) {
      return { x: 0, y: 0 };
    }
    
    // Elegir un movimiento aleatorio y determinar la dirección
    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    const newDir = {
      x: randomMove.x - mousePos.x,
      y: randomMove.y - mousePos.y
    };
    
    console.log(`🎲 Nueva dirección elegida: (${newDir.x}, ${newDir.y})`);
    return newDir;
  };
  
  // ========================================
  // LÓGICA PRINCIPAL
  // ========================================
  
  // Si no hay dirección actual (principio), elegir una
  if (currentDirection.x === 0 && currentDirection.y === 0) {
    currentDirection = chooseNewDirection();
    stepsInCurrentDirection = 0;
    console.log('🆕 Iniciando con nueva dirección');
  }
  
  // Verificar condiciones para cambiar de dirección:
  // 1. Obstáculo enfrente
  // 2. Ya recorrió 3 casillas
  
  const hasObstacle = !isDirectionValid(currentDirection);
  const hasCompletedSteps = stepsInCurrentDirection >= 3;
  
  if (hasObstacle || hasCompletedSteps) {
    // Activar pausa de 1 segundo
    isPaused = true;
    pauseStartTime = time;
    stepsInCurrentDirection = 0;
    
    // Elegir nueva dirección después de la pausa
    currentDirection = chooseNewDirection();
    
    if (hasObstacle) {
      console.log('🚧 Obstáculo encontrado - Pausa 1s');
    } else {
      console.log('⏱️ 3 pasos completados - Pausa 1s');
    }
    
    return null; // No se mueve en este frame (entra en pausa)
  }
  
  // Si todo está bien, moverse en la dirección actual
  const nextPos = {
    x: mousePos.x + currentDirection.x,
    y: mousePos.y + currentDirection.y
  };
  
  // Verificar que la posición sea válida
  if (nextPos.x >= 0 && nextPos.x < gridSize && nextPos.y >= 0 && nextPos.y < gridSize) {
    if (grid[nextPos.y][nextPos.x] !== 'wall') {
      stepsInCurrentDirection++;
      return nextPos;
    }
  }
  
  // Si por alguna razón no es válida, elegir nueva dirección
  currentDirection = chooseNewDirection();
  stepsInCurrentDirection = 0;
  return null;
}

// ============================================
// INICIALIZACIÓN
// ============================================
export function onInit(
  grid: string[][],
  mousePos: Position,
  cheesePos: Position,
  gridSize: number
): void {
  // Reiniciar el estado
  currentDirection = { x: 0, y: 0 };
  stepsInCurrentDirection = 0;
  isPaused = false;
  pauseStartTime = 0;
  
  console.log('🧠 Comportamiento "Dirección con Memoria" inicializado');
  console.log('📋 Reglas:');
  console.log('   - Sigue una dirección hasta:');
  console.log('     1️⃣ Encontrar obstáculo');
  console.log('     2️⃣ Completar 3 pasos');
  console.log('   - Pausa de 1 segundo al cambiar de dirección');
}

// ============================================
// QUESO ENCONTRADO
// ============================================
export function onCheeseFound(
  moves: number,
  time: number
): void {
  console.log(`🧀 ¡Queso encontrado en ${moves} movimientos y ${time} segundos!`);
  console.log('📊 Estadísticas finales:');
  console.log(`   - Direcciones cambiadas: varias`);
  console.log(`   - Eficiencia: ${Math.round((moves/time)*100)/100} movimientos/segundo`);
}

// ============================================
// REINTENTAR MISMO LABERINTO
// ============================================
export function onRetry(): void {
  // Reiniciar el estado
  currentDirection = { x: 0, y: 0 };
  stepsInCurrentDirection = 0;
  isPaused = false;
  pauseStartTime = 0;
  
  console.log('🔄 Reiniciando mismo laberinto - Estado reiniciado');
}