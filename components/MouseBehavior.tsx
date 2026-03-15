// components/MouseBehavior.ts
// 🐭 Comportamiento: "Pegado a las paredes" con dosis de locura

import { Position, CellType } from './MazeSimulator';

// ============================================
// CONFIGURACIÓN DEL COMPORTAMIENTO
// ============================================
export const BEHAVIOR_NAME = "🧱 Pegado a paredes (con locura)";

// ============================================
// ESTADO INTERNO DEL COMPORTAMIENTO
// ============================================
interface BehaviorState {
  // Dirección actual
  currentDirection: { x: number; y: number };
  // Modo exploración después de un choque
  exploring: boolean;
  // Dirección que causó el choque (la que está bloqueada)
  blockedDirection: { x: number; y: number };
  // Direcciones ya probadas en la exploración actual
  triedDirections: Array<{ x: number; y: number }>;
  // Posición original desde la que se explora (la casilla pegada al obstáculo)
  originalPos: Position | null;
  // Última dirección tomada (para evitar repeticiones)
  lastDirection: { x: number; y: number };
}

let state: BehaviorState = {
  currentDirection: { x: 0, y: 0 },
  exploring: false,
  blockedDirection: { x: 0, y: 0 },
  triedDirections: [],
  originalPos: null,
  lastDirection: { x: 0, y: 0 }
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================

const DIRECTIONS = [
  { x: 0, y: -1 }, // arriba
  { x: 0, y: 1 },  // abajo
  { x: -1, y: 0 }, // izquierda
  { x: 1, y: 0 },  // derecha
];

const directionNames: Record<string, string> = {
  '0,-1': '⬆️ arriba',
  '0,1': '⬇️ abajo',
  '-1,0': '⬅️ izquierda',
  '1,0': '➡️ derecha',
};

const getDirectionKey = (dir: { x: number; y: number }) => `${dir.x},${dir.y}`;

const isSameDirection = (a: { x: number; y: number }, b: { x: number; y: number }) => 
  a.x === b.x && a.y === b.y;

// Verifica si una posición es válida (no pared ni fuera de límites)
const isValidPosition = (
  x: number,
  y: number,
  grid: CellType[][],
  gridSize: number
): boolean => {
  if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return false;
  return grid[y][x] !== 'wall';
};

// Verifica si una posición está vacía (incluyendo queso)
const isEmpty = (x: number, y: number, grid: CellType[][]): boolean => {
  return grid[y][x] === 'empty' || grid[y][x] === 'cheese';
};

// Verifica si una casilla tiene al menos una pared adyacente (colindante)
const hasAdjacentWall = (x: number, y: number, grid: CellType[][], gridSize: number): boolean => {
  for (const dir of DIRECTIONS) {
    const nx = x + dir.x;
    const ny = y + dir.y;
    if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
      if (grid[ny][nx] === 'wall') return true;
    }
  }
  return false;
};

// Obtiene todas las direcciones posibles desde una posición (excluyendo paredes)
const getPossibleDirections = (
  pos: Position,
  grid: CellType[][],
  gridSize: number
): Array<{ x: number; y: number }> => {
  const possible: Array<{ x: number; y: number }> = [];
  for (const dir of DIRECTIONS) {
    const nx = pos.x + dir.x;
    const ny = pos.y + dir.y;
    if (isValidPosition(nx, ny, grid, gridSize) && isEmpty(nx, ny, grid)) {
      possible.push(dir);
    }
  }
  return possible;
};

// Elige una dirección aleatoria de una lista
const randomDirection = (dirs: Array<{ x: number; y: number }>) => {
  return dirs[Math.floor(Math.random() * dirs.length)];
};

// ============================================
// FUNCIÓN PRINCIPAL DE MOVIMIENTO
// ============================================

export function getNextMouseMove(
  grid: CellType[][],
  mousePos: Position,
  cheesePos: Position,
  moves: number,
  time: number,
  gridSize: number,
  crazyPercentage: number // Nuevo parámetro
): Position | null {
  
  // ========================================
  // PROBABILIDAD DE LOCURA
  // ========================================
  const randomValue = Math.random() * 100;
  if (randomValue < crazyPercentage) {
    // Movimiento aleatorio entre los posibles
    const possibleDirs = getPossibleDirections(mousePos, grid, gridSize);
    if (possibleDirs.length === 0) return null;
    const randomDir = randomDirection(possibleDirs);
    console.log('🤪 ¡LOCURA! Movimiento aleatorio');
    return {
      x: mousePos.x + randomDir.x,
      y: mousePos.y + randomDir.y
    };
  }
  
  // ========================================
  // COMPORTAMIENTO NORMAL
  // ========================================
  
  // Si estamos en modo exploración (después de un choque)
  if (state.exploring && state.originalPos) {
    // Verificamos si la posición actual es la original (debería serlo)
    // Si no, algo salió mal, salimos del modo exploración
    if (mousePos.x !== state.originalPos.x || mousePos.y !== state.originalPos.y) {
      console.warn('⚠️ Salida del modo exploración por posición incorrecta');
      state.exploring = false;
      state.triedDirections = [];
      state.originalPos = null;
    } else {
      // Estamos en la posición original, probamos una nueva dirección no probada
      const possibleDirs = getPossibleDirections(mousePos, grid, gridSize).filter(
        dir => !state.triedDirections.some(d => isSameDirection(d, dir)) &&
               !isSameDirection(dir, state.blockedDirection)
      );
      
      if (possibleDirs.length === 0) {
        // No hay más direcciones para probar, elegimos una aleatoria de las posibles originales
        // (esto no debería ocurrir si hay al menos una salida)
        console.log('⚠️ Sin direcciones nuevas, saliendo de exploración');
        state.exploring = false;
        state.triedDirections = [];
        state.originalPos = null;
        // Intentar movimiento normal
      } else {
        // Elegir una dirección aleatoria entre las posibles
        const newDir = randomDirection(possibleDirs);
        const newX = mousePos.x + newDir.x;
        const newY = mousePos.y + newDir.y;
        
        // Verificar si la nueva posición tiene una pared adyacente
        if (hasAdjacentWall(newX, newY, grid, gridSize)) {
          // Si tiene pared, nos movemos y salimos del modo exploración
          console.log(`🧱 Encontrada dirección con pared: ${directionNames[getDirectionKey(newDir)]}`);
          state.exploring = false;
          state.triedDirections = [];
          state.originalPos = null;
          state.currentDirection = newDir;
          return { x: newX, y: newY };
        } else {
          // No tiene pared, marcamos como probada y volvemos a la original (sin mover)
          console.log(`↩️ Dirección ${directionNames[getDirectionKey(newDir)]} sin pared, probando otra`);
          state.triedDirections.push(newDir);
          // No nos movemos, devolvemos null para que el ratón no se mueva en este ciclo
          // Pero necesitamos que en el próximo ciclo se vuelva a llamar a getNextMouseMove
          // con la misma posición. Devolvemos null para indicar que no hay movimiento.
          return null;
        }
      }
    }
  }
  
  // Si no estamos en modo exploración, comportamiento normal
  
  // Verificar si hay un obstáculo delante en la dirección actual
  const nextX = mousePos.x + state.currentDirection.x;
  const nextY = mousePos.y + state.currentDirection.y;
  
  const isObstacle = !isValidPosition(nextX, nextY, grid, gridSize) || grid[nextY][nextX] === 'wall';
  
  if (isObstacle) {
    // ¡Chocamos! Entramos en modo exploración
    console.log(`🚧 Choque con obstáculo en dirección ${directionNames[getDirectionKey(state.currentDirection)]}`);
    state.exploring = true;
    state.blockedDirection = { ...state.currentDirection };
    state.triedDirections = [];
    state.originalPos = { ...mousePos };
    // No nos movemos, devolvemos null para que en el próximo ciclo explore
    return null;
  }
  
  // No hay obstáculo, podemos movernos en la dirección actual
  // Pero antes, verificamos si la nueva posición tiene pared adyacente? No, según la descripción,
  // si no hay obstáculo, simplemente seguimos en esa dirección. La condición de "si tras elegir una dirección y moverse a una casilla vacía, esta es colindante con un obstáculo, no se aplicará lo anterior" se refiere al proceso de exploración.
  
  // Movimiento normal
  return { x: nextX, y: nextY };
}

// ============================================
// FUNCIONES DE CICLO DE VIDA
// ============================================

export function onInit(
  grid: CellType[][],
  mousePos: Position,
  cheesePos: Position,
  gridSize: number
): void {
  // Reiniciar estado
  state = {
    currentDirection: { x: 0, y: 1 }, // empezamos hacia abajo por defecto
    exploring: false,
    blockedDirection: { x: 0, y: 0 },
    triedDirections: [],
    originalPos: null,
    lastDirection: { x: 0, y: 0 }
  };
  
  // Elegir una dirección inicial aleatoria entre las posibles
  const possibleDirs = getPossibleDirections(mousePos, grid, gridSize);
  if (possibleDirs.length > 0) {
    state.currentDirection = randomDirection(possibleDirs);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🧠 NUEVO COMPORTAMIENTO: Pegado a paredes');
  console.log(`📍 Ratón: (${mousePos.x}, ${mousePos.y}) | Queso: (${cheesePos.x}, ${cheesePos.y})`);
  console.log(`🎲 Dirección inicial: ${directionNames[getDirectionKey(state.currentDirection)]}`);
  console.log('='.repeat(50) + '\n');
}

export function onCheeseFound(
  moves: number,
  time: number
): void {
  console.log('\n' + '🎉'.repeat(15));
  console.log('🎉 ¡QUESO ENCONTRADO! 🎉');
  console.log('🎉'.repeat(15));
  console.log(`📊 Movimientos: ${moves} | Tiempo: ${time}s`);
}

export function onRetry(): void {
  // Reiniciar estado, pero la dirección se recalculará en el próximo movimiento
  state = {
    currentDirection: { x: 0, y: 1 },
    exploring: false,
    blockedDirection: { x: 0, y: 0 },
    triedDirections: [],
    originalPos: null,
    lastDirection: { x: 0, y: 0 }
  };
  console.log('🔄 RETRY - Reiniciando comportamiento');
}