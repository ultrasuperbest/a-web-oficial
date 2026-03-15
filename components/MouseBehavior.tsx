// components/MouseBehavior.ts
// 🐭 Comportamiento: Dirección con Memoria y Pasos Variables (3-6)

import { Position } from './MazeSimulator';

// ============================================
// CONFIGURACIÓN DEL COMPORTAMIENTO
// ============================================
export const BEHAVIOR_NAME = "Dirección con Memoria (3-6 pasos aleatorios)";

// Constantes de configuración
const MIN_STEPS = 3;
const MAX_STEPS = 6;
const PAUSE_DURATION = 1; // segundos

// ============================================
// ESTADO INTERNO DEL COMPORTAMIENTO
// ============================================
interface BehaviorState {
  currentDirection: { x: number; y: number };
  stepsTaken: number;
  stepsLimit: number;
  isPaused: boolean;
  pauseStartTime: number;
  totalDirectionChanges: number;
}

// Estado inicial
let state: BehaviorState = {
  currentDirection: { x: 0, y: 0 },
  stepsTaken: 0,
  stepsLimit: MIN_STEPS,
  isPaused: false,
  pauseStartTime: 0,
  totalDirectionChanges: 0
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Genera un número aleatorio entre min y max (inclusive)
 */
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Obtiene todas las direcciones posibles
 */
const getDirections = () => [
  { x: 0, y: -1, name: '⬆️ arriba' },
  { x: 0, y: 1, name: '⬇️ abajo' },
  { x: -1, y: 0, name: '⬅️ izquierda' },
  { x: 1, y: 0, name: '➡️ derecha' },
];

/**
 * Verifica si una posición es válida para moverse
 */
const isValidPosition = (
  x: number, 
  y: number, 
  grid: string[][], 
  gridSize: number
): boolean => {
  if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return false;
  return grid[y][x] === 'empty' || grid[y][x] === 'cheese';
};

/**
 * Encuentra todos los movimientos posibles desde la posición actual
 */
const findPossibleMoves = (
  grid: string[][],
  mousePos: Position,
  gridSize: number
): Position[] => {
  const possibleMoves: Position[] = [];
  const directions = getDirections();
  
  for (const dir of directions) {
    const newX = mousePos.x + dir.x;
    const newY = mousePos.y + dir.y;
    
    if (isValidPosition(newX, newY, grid, gridSize)) {
      possibleMoves.push({ x: newX, y: newY });
    }
  }
  
  return possibleMoves;
};

/**
 * Elige una dirección aleatoria válida
 */
const chooseRandomDirection = (
  grid: string[][],
  mousePos: Position,
  gridSize: number
): { x: number; y: number } => {
  const possibleMoves = findPossibleMoves(grid, mousePos, gridSize);
  
  if (possibleMoves.length === 0) {
    return { x: 0, y: 0 };
  }
  
  const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  return {
    x: randomMove.x - mousePos.x,
    y: randomMove.y - mousePos.y
  };
};

/**
 * Verifica si la dirección actual tiene un obstáculo delante
 */
const hasObstacleAhead = (
  direction: { x: number; y: number },
  grid: string[][],
  mousePos: Position,
  gridSize: number
): boolean => {
  const newX = mousePos.x + direction.x;
  const newY = mousePos.y + direction.y;
  
  return !isValidPosition(newX, newY, grid, gridSize);
};

// ============================================
// FUNCIÓN PRINCIPAL DE MOVIMIENTO
// ============================================

export function getNextMouseMove(
  grid: string[][],
  mousePos: Position,
  cheesePos: Position,
  moves: number,
  time: number,
  gridSize: number
): Position | null {
  
  // ========================================
  // MANEJO DE PAUSA
  // ========================================
  if (state.isPaused) {
    // Inicializar tiempo de pausa si es primera vez
    if (state.pauseStartTime === 0) {
      state.pauseStartTime = time;
      console.log('⏸️ Ratón en pausa...');
    }
    
    // Verificar si ya pasó el tiempo de pausa
    if (time - state.pauseStartTime >= PAUSE_DURATION) {
      state.isPaused = false;
      state.pauseStartTime = 0;
      console.log('▶️ Ratón reanuda movimiento');
    } else {
      // Todavía en pausa
      return null;
    }
  }
  
  // ========================================
  // INICIALIZACIÓN (PRIMER MOVIMIENTO)
  // ========================================
  if (state.currentDirection.x === 0 && state.currentDirection.y === 0) {
    state.currentDirection = chooseRandomDirection(grid, mousePos, gridSize);
    state.stepsLimit = randomInt(MIN_STEPS, MAX_STEPS);
    state.stepsTaken = 0;
    state.totalDirectionChanges = 0;
    
    console.log(`🆕 Primera dirección: ${getDirections().find(d => 
      d.x === state.currentDirection.x && d.y === state.currentDirection.y
    )?.name || 'desconocida'} (${state.stepsLimit} pasos máx.)`);
  }
  
  // ========================================
  // VERIFICAR CONDICIONES DE CAMBIO
  // ========================================
  
  // Condición 1: Obstáculo delante
  const obstacleDetected = hasObstacleAhead(
    state.currentDirection, 
    grid, 
    mousePos, 
    gridSize
  );
  
  // Condición 2: Límite de pasos alcanzado
  const limitReached = state.stepsTaken >= state.stepsLimit;
  
  // Si se cumple alguna condición, cambiar dirección
  if (obstacleDetected || limitReached) {
    
    // Activar pausa
    state.isPaused = true;
    state.pauseStartTime = 0; // Se inicializará en el próximo ciclo
    state.stepsTaken = 0;
    state.totalDirectionChanges++;
    
    // Elegir nueva dirección
    const newDirection = chooseRandomDirection(grid, mousePos, gridSize);
    
    // Si no hay dirección posible, devolver null
    if (newDirection.x === 0 && newDirection.y === 0) {
      console.log('⚠️ ¡Ratón atrapado! No hay movimientos posibles');
      return null;
    }
    
    state.currentDirection = newDirection;
    state.stepsLimit = randomInt(MIN_STEPS, MAX_STEPS);
    
    // Log del cambio
    const directionName = getDirections().find(d => 
      d.x === state.currentDirection.x && d.y === state.currentDirection.y
    )?.name || 'desconocida';
    
    if (obstacleDetected) {
      console.log(`🚧 Obstáculo encontrado después de ${state.stepsTaken} pasos - Cambio #${state.totalDirectionChanges} → ${directionName} (${state.stepsLimit} pasos)`);
    } else {
      console.log(`⏱️ Límite de ${state.stepsLimit} pasos alcanzado - Cambio #${state.totalDirectionChanges} → ${directionName} (${state.stepsLimit} pasos)`);
    }
    
    return null; // No se mueve en este ciclo (entra en pausa)
  }
  
  // ========================================
  // MOVERSE EN LA DIRECCIÓN ACTUAL
  // ========================================
  const nextPos = {
    x: mousePos.x + state.currentDirection.x,
    y: mousePos.y + state.currentDirection.y
  };
  
  // Verificación de seguridad
  if (!isValidPosition(nextPos.x, nextPos.y, grid, gridSize)) {
    console.log('⚠️ Posición inválida detectada, recalculando...');
    state.currentDirection = chooseRandomDirection(grid, mousePos, gridSize);
    state.stepsLimit = randomInt(MIN_STEPS, MAX_STEPS);
    state.stepsTaken = 0;
    return null;
  }
  
  // Incrementar contador de pasos
  state.stepsTaken++;
  
  // Verificar si encontró el queso (para log opcional)
  if (nextPos.x === cheesePos.x && nextPos.y === cheesePos.y) {
    console.log(`🧀 ¡QUESO A LA VISTA! Posición: (${nextPos.x}, ${nextPos.y})`);
  }
  
  return nextPos;
}

// ============================================
// FUNCIONES DE CICLO DE VIDA
// ============================================

export function onInit(
  grid: string[][],
  mousePos: Position,
  cheesePos: Position,
  gridSize: number
): void {
  // Reiniciar estado completo
  state = {
    currentDirection: { x: 0, y: 0 },
    stepsTaken: 0,
    stepsLimit: MIN_STEPS,
    isPaused: false,
    pauseStartTime: 0,
    totalDirectionChanges: 0
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('🧠 NUEVA SIMULACIÓN INICIADA');
  console.log(`📋 Comportamiento: ${BEHAVIOR_NAME}`);
  console.log(`⚙️ Configuración: Pasos entre ${MIN_STEPS}-${MAX_STEPS} | Pausa: ${PAUSE_DURATION}s`);
  console.log(`📍 Ratón: (${mousePos.x}, ${mousePos.y}) | Queso: (${cheesePos.x}, ${cheesePos.y})`);
  console.log('='.repeat(50) + '\n');
}

export function onCheeseFound(
  moves: number,
  time: number
): void {
  console.log('\n' + '🎉'.repeat(15));
  console.log('🎉 ¡QUESO ENCONTRADO! 🎉');
  console.log('🎉'.repeat(15));
  console.log(`📊 Estadísticas finales:`);
  console.log(`   • Movimientos totales: ${moves}`);
  console.log(`   • Tiempo: ${time} segundos`);
  console.log(`   • Cambios de dirección: ${state.totalDirectionChanges}`);
  console.log(`   • Promedio: ${(moves / time).toFixed(2)} mov/seg`);
  console.log(`   • Eficiencia: ${(state.totalDirectionChanges / moves * 100).toFixed(1)}% cambios/mov`);
  console.log('='.repeat(30) + '\n');
}

export function onRetry(): void {
  // Reiniciar estado pero mantener el mismo laberinto
  state = {
    currentDirection: { x: 0, y: 0 },
    stepsTaken: 0,
    stepsLimit: MIN_STEPS,
    isPaused: false,
    pauseStartTime: 0,
    totalDirectionChanges: 0
  };
  
  console.log('🔄 RETRY - Reiniciando con mismo laberinto');
}