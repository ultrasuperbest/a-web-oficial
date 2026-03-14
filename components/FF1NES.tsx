// components/FF1NES.tsx
'use client'

import { useEffect, useState } from 'react'

interface FF1NESProps {
  onClose: () => void
}

interface Character {
  id: number
  name: string
  class: 'FI' | 'TH' | 'BB' | 'RM' | 'WM' | 'BM'
  level: number
  exp: number
  nextExp: number
  hp: number
  maxHp: number
  mp: number[]
  maxMp: number[]
  
  // Basic stats
  str: number
  agi: number
  vit: number
  int: number
  luk: number
  
  // Derived stats
  attack: number
  hit: number    
  absorb: number  
  evade: number  
  
  // Equipment indices
  weapon: number
  armor: number
  shield: number
  helmet: number
  gloves: number
  
  // Status
  status: 'OK' | 'POISON' | 'STONE' | 'DEAD' | 'SILENCE' | 'SLEEP' | 'PARALYZE'
  formation: 0 | 1 | 2 | 3
}

interface Enemy {
  id: number
  name: string
  hp: number
  maxHp: number
  attack: number
  hit: number
  absorb: number
  evade: number
  exp: number
  gold: number
  elements: {
    fire: 'WEAK' | 'NORMAL' | 'RESIST' | 'NULL' | 'ABSORB'
    ice: 'WEAK' | 'NORMAL' | 'RESIST' | 'NULL' | 'ABSORB'
    lightning: 'WEAK' | 'NORMAL' | 'RESIST' | 'NULL' | 'ABSORB'
    poison: 'WEAK' | 'NORMAL' | 'RESIST' | 'NULL' | 'ABSORB'
  }
  statusAttacks: Array<'POISON' | 'STONE' | 'SLEEP' | 'PARALYZE' | 'DEATH'>
  specialAttack: string | null
  sprite: number
}

interface Item {
  id: number
  name: string
  type: 'WEAPON' | 'ARMOR' | 'SHIELD' | 'HELMET' | 'GLOVES' | 'ITEM' | 'KEY'
  price: number
  equipClass: Array<'FI' | 'TH' | 'BB' | 'RM' | 'WM' | 'BM'>
  effect: {
    attack?: number
    hit?: number
    absorb?: number
    evade?: number
    str?: number
    agi?: number
    vit?: number
    int?: number
    luk?: number
    element?: 'FIRE' | 'ICE' | 'LIGHTNING' | 'POISON'
    status?: string
    spell?: string
  }
}

interface Spell {
  id: number
  name: string
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  type: 'WHITE' | 'BLACK'
  target: 'SELF' | 'ALLY' | 'ALLIES' | 'ENEMY' | 'ALL_ENEMIES'
  power: number
  hit: number
  effect: string
  element?: 'FIRE' | 'ICE' | 'LIGHTNING'
  learnedBy: Array<'FI' | 'TH' | 'BB' | 'RM' | 'WM' | 'BM'>
}

// Item database completa
const ITEMS: Item[] = [
  // Weapons
  { id: 1, name: 'WOODEN NUNCHUK', type: 'WEAPON', price: 10, equipClass: ['BB', 'TH'], effect: { attack: 4, hit: 5 } },
  { id: 2, name: 'SMALL KNIFE', type: 'WEAPON', price: 5, equipClass: ['TH', 'RM', 'WM', 'BM'], effect: { attack: 3, hit: 10 } },
  { id: 3, name: 'RAPIER', type: 'WEAPON', price: 10, equipClass: ['FI', 'TH', 'RM'], effect: { attack: 6, hit: 5 } },
  { id: 4, name: 'IRON HAMMER', type: 'WEAPON', price: 10, equipClass: ['FI', 'BB'], effect: { attack: 8, hit: -5 } },
  { id: 5, name: 'SHORT SWORD', type: 'WEAPON', price: 550, equipClass: ['FI', 'TH', 'RM'], effect: { attack: 12, hit: 5 } },
  { id: 6, name: 'HAND AXE', type: 'WEAPON', price: 550, equipClass: ['FI', 'BB'], effect: { attack: 14, hit: -10 } },
  { id: 7, name: 'SCIMITAR', type: 'WEAPON', price: 200, equipClass: ['FI', 'TH', 'RM'], effect: { attack: 9, hit: 5 } },
  { id: 8, name: 'SILVER SWORD', type: 'WEAPON', price: 4000, equipClass: ['FI', 'TH', 'RM'], effect: { attack: 22, hit: 10 } },
  { id: 9, name: 'LONG SWORD', type: 'WEAPON', price: 1500, equipClass: ['FI'], effect: { attack: 18, hit: 0 } },
  
  // Armors
  { id: 20, name: 'CLOTH', type: 'ARMOR', price: 10, equipClass: ['FI', 'TH', 'BB', 'RM', 'WM', 'BM'], effect: { absorb: 2, evade: -2 } },
  { id: 21, name: 'WOODEN ARMOR', type: 'ARMOR', price: 50, equipClass: ['FI', 'TH', 'BB', 'RM'], effect: { absorb: 8, evade: -10 } },
  { id: 22, name: 'CHAIN MAIL', type: 'ARMOR', price: 80, equipClass: ['FI', 'TH', 'RM'], effect: { absorb: 12, evade: -15 } },
  { id: 23, name: 'IRON ARMOR', type: 'ARMOR', price: 800, equipClass: ['FI'], effect: { absorb: 20, evade: -25 } },
  { id: 24, name: 'STEEL ARMOR', type: 'ARMOR', price: 45000, equipClass: ['FI'], effect: { absorb: 34, evade: -30 } },
  
  // Shields
  { id: 30, name: 'WOODEN SHIELD', type: 'SHIELD', price: 15, equipClass: ['FI', 'TH', 'RM'], effect: { absorb: 2, evade: -5 } },
  { id: 31, name: 'IRON SHIELD', type: 'SHIELD', price: 100, equipClass: ['FI'], effect: { absorb: 6, evade: -10 } },
  
  // Helms
  { id: 40, name: 'CAP', type: 'HELMET', price: 80, equipClass: ['FI', 'TH', 'RM', 'WM', 'BM'], effect: { absorb: 1, evade: -2 } },
  { id: 41, name: 'WOODEN HELMET', type: 'HELMET', price: 100, equipClass: ['FI', 'TH', 'BB', 'RM'], effect: { absorb: 4, evade: -5 } },
  { id: 42, name: 'IRON HELMET', type: 'HELMET', price: 450, equipClass: ['FI'], effect: { absorb: 8, evade: -8 } },
  
  // Gloves
  { id: 50, name: 'GLOVES', type: 'GLOVES', price: 60, equipClass: ['FI', 'TH', 'BB', 'RM'], effect: { attack: 2, hit: 2, absorb: 1 } },
  { id: 51, name: 'COPPER GLOVES', type: 'GLOVES', price: 200, equipClass: ['FI', 'TH', 'BB'], effect: { attack: 4, hit: 3, absorb: 3 } },
  { id: 52, name: 'IRON GLOVES', type: 'GLOVES', price: 750, equipClass: ['FI'], effect: { attack: 6, hit: 4, absorb: 5 } },
  
  // Items
  { id: 60, name: 'POTION', type: 'ITEM', price: 60, equipClass: [], effect: { spell: 'CURE' } },
  { id: 61, name: 'ANTIDOTE', type: 'ITEM', price: 75, equipClass: [], effect: { status: 'POISON' } },
  { id: 62, name: 'GOLD NEEDLE', type: 'ITEM', price: 800, equipClass: [], effect: { status: 'STONE' } },
  { id: 63, name: 'TENT', type: 'ITEM', price: 75, equipClass: [], effect: { spell: 'TENT' } },
  { id: 64, name: 'CABIN', type: 'ITEM', price: 250, equipClass: [], effect: { spell: 'CABIN' } },
  { id: 65, name: 'HOUSE', type: 'ITEM', price: 3000, equipClass: [], effect: { spell: 'HOUSE' } },
  
  // Key items
  { id: 100, name: 'LUTE', type: 'KEY', price: 0, equipClass: [], effect: {} },
  { id: 101, name: 'CROWN', type: 'KEY', price: 0, equipClass: [], effect: {} },
  { id: 102, name: 'CRYSTAL', type: 'KEY', price: 0, equipClass: [], effect: {} },
  { id: 103, name: 'SHIP', type: 'KEY', price: 0, equipClass: [], effect: {} },
  { id: 104, name: 'CANOE', type: 'KEY', price: 0, equipClass: [], effect: {} },
  { id: 105, name: 'AIRSHIP', type: 'KEY', price: 0, equipClass: [], effect: {} },
]

// Spell database completa
const SPELLS: Spell[] = [
  // White Magic Level 1
  { id: 1, name: 'CURE', level: 1, type: 'WHITE', target: 'ALLY', power: 20, hit: 100, effect: 'HEAL', learnedBy: ['WM', 'RM'] },
  { id: 2, name: 'HARM', level: 1, type: 'WHITE', target: 'ENEMY', power: 16, hit: 90, effect: 'DAMAGE', learnedBy: ['WM'] },
  { id: 3, name: 'FOG', level: 1, type: 'WHITE', target: 'ALLY', power: 0, hit: 100, effect: 'PROTECT', learnedBy: ['WM', 'RM'] },
  { id: 4, name: 'RUSE', level: 1, type: 'WHITE', target: 'SELF', power: 0, hit: 100, effect: 'BLINK', learnedBy: ['WM', 'RM'] },
  
  // White Magic Level 2
  { id: 5, name: 'LAMP', level: 2, type: 'WHITE', target: 'ENEMY', power: 0, hit: 70, effect: 'BLIND', learnedBy: ['WM'] },
  { id: 6, name: 'MUTE', level: 2, type: 'WHITE', target: 'ENEMY', power: 0, hit: 70, effect: 'SILENCE', learnedBy: ['WM'] },
  { id: 7, name: 'ALIT', level: 2, type: 'WHITE', target: 'ALLY', power: 0, hit: 100, effect: 'RESIST_LIGHTNING', learnedBy: ['WM', 'RM'] },
  { id: 8, name: 'INVS', level: 2, type: 'WHITE', target: 'ALLY', power: 0, hit: 100, effect: 'INVISIBLE', learnedBy: ['WM', 'RM'] },
  
  // White Magic Level 3
  { id: 9, name: 'CUR2', level: 3, type: 'WHITE', target: 'ALLY', power: 50, hit: 100, effect: 'HEAL', learnedBy: ['WM', 'RM'] },
  { id: 10, name: 'HRM2', level: 3, type: 'WHITE', target: 'ENEMY', power: 40, hit: 95, effect: 'DAMAGE', learnedBy: ['WM'] },
  { id: 11, name: 'AFIR', level: 3, type: 'WHITE', target: 'ALLY', power: 0, hit: 100, effect: 'RESIST_FIRE', learnedBy: ['WM', 'RM'] },
  { id: 12, name: 'HEAL', level: 3, type: 'WHITE', target: 'ALLY', power: 0, hit: 100, effect: 'CURE_STATUS', learnedBy: ['WM', 'RM'] },
  
  // White Magic Level 4
  { id: 13, name: 'CUR3', level: 4, type: 'WHITE', target: 'ALLY', power: 120, hit: 100, effect: 'HEAL', learnedBy: ['WM', 'RM'] },
  { id: 14, name: 'HRM3', level: 4, type: 'WHITE', target: 'ALL_ENEMIES', power: 80, hit: 95, effect: 'DAMAGE', learnedBy: ['WM'] },
  { id: 15, name: 'AICE', level: 4, type: 'WHITE', target: 'ALLY', power: 0, hit: 100, effect: 'RESIST_ICE', learnedBy: ['WM', 'RM'] },
  { id: 16, name: 'BANE', level: 4, type: 'WHITE', target: 'ENEMY', power: 0, hit: 50, effect: 'DEATH', learnedBy: ['WM'] },
  
  // Black Magic Level 1
  { id: 20, name: 'FIRE', level: 1, type: 'BLACK', target: 'ENEMY', power: 20, hit: 90, element: 'FIRE', effect: 'DAMAGE', learnedBy: ['BM', 'RM'] },
  { id: 21, name: 'SLEP', level: 1, type: 'BLACK', target: 'ALL_ENEMIES', power: 0, hit: 60, effect: 'SLEEP', learnedBy: ['BM'] },
  { id: 22, name: 'LOCK', level: 1, type: 'BLACK', target: 'ENEMY', power: 0, hit: 70, effect: 'PARALYZE', learnedBy: ['BM'] },
  { id: 23, name: 'LIT', level: 1, type: 'BLACK', target: 'ENEMY', power: 20, hit: 90, element: 'LIGHTNING', effect: 'DAMAGE', learnedBy: ['BM', 'RM'] },
  
  // Black Magic Level 2
  { id: 24, name: 'ICE', level: 2, type: 'BLACK', target: 'ENEMY', power: 40, hit: 96, element: 'ICE', effect: 'DAMAGE', learnedBy: ['BM', 'RM'] },
  { id: 25, name: 'DARK', level: 2, type: 'BLACK', target: 'ALL_ENEMIES', power: 0, hit: 70, effect: 'BLIND', learnedBy: ['BM'] },
  { id: 26, name: 'TMPR', level: 2, type: 'BLACK', target: 'ALLY', power: 0, hit: 100, effect: 'ATTACK_UP', learnedBy: ['BM', 'RM'] },
  { id: 27, name: 'SLOW', level: 2, type: 'BLACK', target: 'ENEMY', power: 0, hit: 75, effect: 'SLOW', learnedBy: ['BM'] },
  
  // Black Magic Level 3
  { id: 28, name: 'FIR2', level: 3, type: 'BLACK', target: 'ALL_ENEMIES', power: 60, hit: 96, element: 'FIRE', effect: 'DAMAGE', learnedBy: ['BM', 'RM'] },
  { id: 29, name: 'HOLD', level: 3, type: 'BLACK', target: 'ENEMY', power: 0, hit: 65, effect: 'PARALYZE', learnedBy: ['BM'] },
  { id: 30, name: 'LIT2', level: 3, type: 'BLACK', target: 'ALL_ENEMIES', power: 60, hit: 96, element: 'LIGHTNING', effect: 'DAMAGE', learnedBy: ['BM', 'RM'] },
  { id: 31, name: 'LOK2', level: 3, type: 'BLACK', target: 'ENEMY', power: 0, hit: 70, effect: 'LOCK', learnedBy: ['BM'] },
  
  // Black Magic Level 4
  { id: 32, name: 'ICE2', level: 4, type: 'BLACK', target: 'ALL_ENEMIES', power: 100, hit: 98, element: 'ICE', effect: 'DAMAGE', learnedBy: ['BM', 'RM'] },
  { id: 33, name: 'FAST', level: 4, type: 'BLACK', target: 'ALLY', power: 0, hit: 100, effect: 'HASTE', learnedBy: ['BM'] },
  { id: 34, name: 'CONF', level: 4, type: 'BLACK', target: 'ENEMY', power: 0, hit: 60, effect: 'CONFUSE', learnedBy: ['BM'] },
]

// Enemy database completa
const ENEMIES: Enemy[] = [
  // Temple of Fiends
  { id: 1, name: 'IMP', hp: 8, maxHp: 8, attack: 6, hit: 70, absorb: 0, evade: 10, exp: 10, gold: 15,
    elements: { fire: 'WEAK', ice: 'NORMAL', lightning: 'WEAK', poison: 'NORMAL' },
    statusAttacks: [], specialAttack: null, sprite: 1 },
  { id: 2, name: 'WOLF', hp: 15, maxHp: 15, attack: 10, hit: 75, absorb: 2, evade: 15, exp: 20, gold: 25,
    elements: { fire: 'NORMAL', ice: 'NORMAL', lightning: 'NORMAL', poison: 'NORMAL' },
    statusAttacks: [], specialAttack: null, sprite: 2 },
  { id: 3, name: 'BAT', hp: 6, maxHp: 6, attack: 4, hit: 90, absorb: 0, evade: 30, exp: 8, gold: 10,
    elements: { fire: 'WEAK', ice: 'NORMAL', lightning: 'WEAK', poison: 'NORMAL' },
    statusAttacks: [], specialAttack: null, sprite: 3 },
  { id: 4, name: 'GARLAND', hp: 42, maxHp: 42, attack: 18, hit: 85, absorb: 10, evade: 20, exp: 100, gold: 200,
    elements: { fire: 'NORMAL', ice: 'NORMAL', lightning: 'NORMAL', poison: 'NORMAL' },
    statusAttacks: [], specialAttack: null, sprite: 4 },
  
  // Marsh Cave
  { id: 5, name: 'CREEP', hp: 18, maxHp: 18, attack: 12, hit: 75, absorb: 4, evade: 15, exp: 30, gold: 40,
    elements: { fire: 'WEAK', ice: 'RESIST', lightning: 'NORMAL', poison: 'NULL' },
    statusAttacks: ['POISON'], specialAttack: 'POISON', sprite: 5 },
  { id: 6, name: 'GHAST', hp: 24, maxHp: 24, attack: 14, hit: 70, absorb: 8, evade: 10, exp: 40, gold: 50,
    elements: { fire: 'WEAK', ice: 'NORMAL', lightning: 'WEAK', poison: 'NULL' },
    statusAttacks: ['PARALYZE'], specialAttack: 'PARALYZE', sprite: 6 },
  { id: 7, name: 'WIZARD', hp: 30, maxHp: 30, attack: 10, hit: 80, absorb: 6, evade: 25, exp: 55, gold: 70,
    elements: { fire: 'NORMAL', ice: 'NORMAL', lightning: 'NORMAL', poison: 'NORMAL' },
    statusAttacks: [], specialAttack: 'FIRE', sprite: 7 },
  
  // Earth Cave
  { id: 8, name: 'VAMPIRE', hp: 68, maxHp: 68, attack: 24, hit: 85, absorb: 16, evade: 30, exp: 180, gold: 250,
    elements: { fire: 'WEAK', ice: 'RESIST', lightning: 'WEAK', poison: 'NULL' },
    statusAttacks: ['DEATH'], specialAttack: 'DEATH', sprite: 8 },
  { id: 9, name: 'LICH', hp: 240, maxHp: 240, attack: 40, hit: 95, absorb: 30, evade: 40, exp: 1000, gold: 0,
    elements: { fire: 'RESIST', ice: 'RESIST', lightning: 'RESIST', poison: 'NULL' },
    statusAttacks: ['POISON', 'PARALYZE', 'DEATH'], specialAttack: 'EARTHQUAKE', sprite: 9 },
]

// Town database
const TOWNS = [
  { id: 1, name: 'CORNELIA', x: 15, y: 20, type: 'TOWN' as const,
    shops: {
      weapon: [1, 2, 3, 4],
      armor: [20, 21, 22],
      shield: [30],
      helmet: [40, 41],
      gloves: [50],
      item: [60, 61, 62],
      white: [1, 2, 3, 4],
      black: [20, 21, 22, 23],
      inn: 30,
      clinic: 40
    },
    keyItems: [100] // Lute
  },
  { id: 2, name: 'PRAVOKA', x: 22, y: 18, type: 'TOWN' as const,
    shops: {
      weapon: [4, 5, 6, 7],
      armor: [21, 22, 23],
      shield: [30, 31],
      helmet: [41, 42],
      gloves: [50, 51],
      item: [60, 61, 63, 64],
      white: [5, 6, 7, 8],
      black: [24, 25, 26, 27],
      inn: 50,
      clinic: 80
    },
    keyItems: [103] // Ship
  },
  { id: 3, name: 'ELFHEIM', x: 12, y: 25, type: 'TOWN' as const,
    shops: {
      weapon: [1, 2, 3, 7, 8],
      armor: [22, 23],
      shield: [31],
      helmet: [42],
      gloves: [51, 52],
      item: [60, 61, 63, 64, 65, 62],
      white: [9, 10, 11, 12],
      black: [28, 29, 30, 31],
      inn: 100,
      clinic: 200
    },
    keyItems: [101] // Crown
  },
]

// World map (32x32 grid - 0: plains, 1: forest, 2: mountain, 3: water, 4: town, 5: dungeon, 6: bridge, 7: desert, 8: swamp)
const WORLD_MAP = (() => {
  const map = Array(32).fill(0).map(() => Array(32).fill(0))
  
  // Continent layout - mountains border
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      // Mountains border around continent
      if (i < 2 || i > 29 || j < 2 || j > 29) map[i][j] = 2
      else if (i > 28 && j > 28) map[i][j] = 3 // ocean corners
      
      // Inner sea
      if (i > 10 && i < 22 && j > 12 && j < 20) map[i][j] = 3
      
      // Forests
      if ((i > 5 && i < 10 && j > 5 && j < 15) || 
          (i > 15 && i < 20 && j > 5 && j < 10)) map[i][j] = 1
      
      // Deserts
      if (i > 20 && i < 28 && j > 8 && j < 15) map[i][j] = 7
      
      // Swamps
      if (i > 8 && i < 12 && j > 22 && j < 26) map[i][j] = 8
    }
  }
  
  // Place towns
  TOWNS.forEach(town => {
    if (town.x >= 0 && town.x < 32 && town.y >= 0 && town.y < 32) {
      map[town.y][town.x] = 4
    }
  })
  
  // Place dungeons
  map[5][8] = 5  // Temple of Fiends
  map[18][8] = 5 // Marsh Cave
  map[24][12] = 5 // Earth Cave
  map[6][25] = 5 // Ice Cave
  
  // Bridges
  map[19][14] = 6
  map[19][15] = 6
  map[19][16] = 6
  
  return map
})()

export default function FF1NES({ onClose }: FF1NESProps) {
  // Game state
  const [screen, setScreen] = useState<'TITLE' | 'OVERWORLD' | 'TOWN' | 'BATTLE' | 'SHOP' | 'INN' | 'MENU' | 'GAMEOVER'>('TITLE')
  const [currentTown, setCurrentTown] = useState<typeof TOWNS[0] | null>(null)
  const [position, setPosition] = useState({ x: 19, y: 19 }) // Start at bridge
  const [vehicle, setVehicle] = useState<'FOOT' | 'SHIP' | 'CANOE' | 'AIRSHIP'>('FOOT')
  const [gold, setGold] = useState(400)
  const [keyItems, setKeyItems] = useState<number[]>([])
  const [message, setMessage] = useState('')
  const [messageTimer, setMessageTimer] = useState<NodeJS.Timeout | null>(null)
  
  // Party state
  const [party, setParty] = useState<Character[]>([
    { id: 0, name: 'FIGHTER', class: 'FI', level: 1, exp: 0, nextExp: 28,
      hp: 28, maxHp: 28, mp: [0,0,0,0,0,0,0,0], maxMp: [0,0,0,0,0,0,0,0],
      str: 18, agi: 8, vit: 16, int: 6, luk: 5,
      attack: 9, hit: 80, absorb: 0, evade: 56,
      weapon: 0, armor: 0, shield: 0, helmet: 0, gloves: 0,
      status: 'OK', formation: 0 },
    { id: 1, name: 'THIEF', class: 'TH', level: 1, exp: 0, nextExp: 28,
      hp: 22, maxHp: 22, mp: [0,0,0,0,0,0,0,0], maxMp: [0,0,0,0,0,0,0,0],
      str: 12, agi: 18, vit: 10, int: 8, luk: 12,
      attack: 6, hit: 85, absorb: 0, evade: 66,
      weapon: 0, armor: 0, shield: 0, helmet: 0, gloves: 0,
      status: 'OK', formation: 1 },
    { id: 2, name: 'BLACK BELT', class: 'BB', level: 1, exp: 0, nextExp: 28,
      hp: 24, maxHp: 24, mp: [0,0,0,0,0,0,0,0], maxMp: [0,0,0,0,0,0,0,0],
      str: 16, agi: 14, vit: 14, int: 8, luk: 8,
      attack: 2, hit: 80, absorb: 0, evade: 62,
      weapon: 0, armor: 0, shield: 0, helmet: 0, gloves: 0,
      status: 'OK', formation: 2 },
    { id: 3, name: 'RED MAGE', class: 'RM', level: 1, exp: 0, nextExp: 28,
      hp: 20, maxHp: 20, mp: [8,0,0,0,0,0,0,0], maxMp: [8,0,0,0,0,0,0,0],
      str: 12, agi: 10, vit: 8, int: 14, luk: 8,
      attack: 6, hit: 76, absorb: 0, evade: 58,
      weapon: 0, armor: 0, shield: 0, helmet: 0, gloves: 0,
      status: 'OK', formation: 3 },
  ])
  
  // Battle state
  const [battleEnemies, setBattleEnemies] = useState<Enemy[]>([])
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [battleTurn, setBattleTurn] = useState<number>(0)
  const [battleActions, setBattleActions] = useState<Array<{ type: string, target: number, spell?: number, item?: number } | null>>([null, null, null, null])
  const [battlePhase, setBattlePhase] = useState<'START' | 'PLAYER_INPUT' | 'PLAYER_ACTION' | 'ENEMY_ACTION' | 'RESULT'>('START')
  
  // Shop state
  const [shopCategory, setShopCategory] = useState<'WEAPON' | 'ARMOR' | 'SHIELD' | 'HELMET' | 'GLOVES' | 'ITEM' | 'WHITE' | 'BLACK'>('WEAPON')
  const [inventory, setInventory] = useState<number[]>([60, 60, 61, 61, 62]) // Start with some items
  
  // Show message with auto-clear
  const showMessage = (msg: string) => {
    if (messageTimer) clearTimeout(messageTimer)
    setMessage(msg)
    const timer = setTimeout(() => setMessage(''), 3000)
    setMessageTimer(timer)
  }
  
  // Calculate derived stats based on level and equipment
  const calculateStats = (char: Character): Character => {
    const newChar = { ...char }
    
    // Base attack: STR/2 + weapon bonus
    const weapon = ITEMS.find(i => i.id === char.weapon)
    newChar.attack = Math.floor(char.str / 2) + (weapon?.effect.attack || 0)
    
    // Black Belt unarmed bonus
    if (char.class === 'BB' && char.weapon === 0) {
      newChar.attack = char.level * 2
      newChar.hit = 80 + (char.level - 1) * 3
      newChar.absorb = char.level // Barehanded defense
    } else {
      // Hit% based on class 
      const classHitBase: Record<string, { base: number, inc: number }> = {
        'FI': { base: 80, inc: 3 },
        'TH': { base: 85, inc: 2 },
        'BB': { base: 80, inc: 3 },
        'RM': { base: 76, inc: 2 },
        'WM': { base: 70, inc: 1 },
        'BM': { base: 70, inc: 1 }
      }
      const hitData = classHitBase[char.class]
      newChar.hit = hitData.base + (char.level - 1) * hitData.inc
      
      // Absorb from armor
      newChar.absorb = 0
      const armor = ITEMS.find(i => i.id === char.armor)
      const shield = ITEMS.find(i => i.id === char.shield)
      const helmet = ITEMS.find(i => i.id === char.helmet)
      const gloves = ITEMS.find(i => i.id === char.gloves)
      
      if (armor) newChar.absorb += armor.effect.absorb || 0
      if (shield) newChar.absorb += shield.effect.absorb || 0
      if (helmet) newChar.absorb += helmet.effect.absorb || 0
      if (gloves) newChar.absorb += gloves.effect.absorb || 0
    }
    
    // Evade: AGI + 48% 
    newChar.evade = char.agi + 48
    
    // Subtract evade penalties from armor
    const armor = ITEMS.find(i => i.id === char.armor)
    const shield = ITEMS.find(i => i.id === char.shield)
    const helmet = ITEMS.find(i => i.id === char.helmet)
    const gloves = ITEMS.find(i => i.id === char.gloves)
    
    if (armor) newChar.evade += (armor.effect.evade || 0)
    if (shield) newChar.evade += (shield.effect.evade || 0)
    if (helmet) newChar.evade += (helmet.effect.evade || 0)
    if (gloves) newChar.evade += (gloves.effect.evade || 0)
    
    return newChar
  }
  
  // Level up character 
  const levelUp = (char: Character): Character => {
    if (char.level >= 50) return char
    
    const newChar = { ...char }
    newChar.level++
    
    // HP gain (random between class min/max)
    const hpGains: Record<string, [number, number]> = {
      'FI': [10, 18], 'TH': [6, 12], 'BB': [8, 14],
      'RM': [5, 10], 'WM': [4, 8], 'BM': [4, 8]
    }
    const gain = hpGains[char.class]
    const hpIncrease = Math.floor(Math.random() * (gain[1] - gain[0] + 1)) + gain[0]
    newChar.maxHp = Math.min(999, newChar.maxHp + hpIncrease)
    newChar.hp = newChar.maxHp
    
    // Stat gains (random 1-2 points)
    const statGain = Math.floor(Math.random() * 2) + 1
    newChar.str += statGain
    newChar.agi += Math.floor(Math.random() * 2) + 1
    newChar.vit += Math.floor(Math.random() * 2) + 1
    newChar.int += Math.floor(Math.random() * 2) + 1
    newChar.luk += Math.floor(Math.random() * 2) + 1
    
    // MP gains for mage classes
    const mpGains: Record<string, number[]> = {
      'RM': [6, 4, 2, 1, 0, 0, 0, 0],
      'WM': [8, 6, 4, 2, 1, 0, 0, 0],
      'BM': [8, 6, 4, 2, 1, 0, 0, 0]
    }
    if (char.class in mpGains) {
      const gains = mpGains[char.class]
      for (let i = 0; i < 8; i++) {
        if (newChar.level % 5 === 0 && i < gains.length) {
          newChar.maxMp[i] = Math.min(99, newChar.maxMp[i] + gains[i])
          newChar.mp[i] = newChar.maxMp[i]
        }
      }
    }
    
    // Next level EXP 
    const expTable = [
      0, 28, 84, 196, 392, 700, 1148, 1764, 2576, 3612, 4900, 6468, 8344, 10556, 13132,
      16100, 19488, 23324, 27636, 32452, 37800, 43708, 50204, 57316, 65072, 73500, 82628,
      92484, 103096, 114492, 126700, 139748, 153664, 168476, 184212, 200900, 218568, 237244,
      256956, 277732, 299600, 322588, 346724, 372036, 398552, 426300, 455300, 484299, 513299,
      542298, 571298, 600297, 629297, 658296, 687296, 716295, 745295, 774294, 803294, 832293,
      861293, 890292, 919292, 948291, 977291, 1006290, 1035290, 1064289, 1093289, 1122288,
      1151288, 1180287, 1209287, 1238286, 1267286, 1296285, 1325285, 1354284, 1383284, 1412283,
      1441283, 1470282, 1499282, 1528281, 1557281, 1586280, 1615280, 1644279, 1673279, 1702278,
      1731278, 1760277, 1789277, 1818276, 1847276, 1876275, 1905275, 1934274, 1963274
    ]
    newChar.nextExp = expTable[newChar.level] || 9999999
    
    return calculateStats(newChar)
  }
  
  // Add experience to party
  const addExperience = (exp: number) => {
    setParty(prev => prev.map(char => {
      let newChar = { ...char }
      newChar.exp += exp
      
      // Check for level up
      while (newChar.exp >= newChar.nextExp && newChar.level < 50) {
        newChar = levelUp(newChar)
      }
      
      return newChar
    }))
  }
  
  // Start random battle based on terrain
  const startBattle = () => {
    const terrain = WORLD_MAP[position.y][position.x]
    
    // Encounter rate based on terrain
    let encounterChance = 0
    if (terrain === 0) encounterChance = 0.08 // plains 8%
    else if (terrain === 1) encounterChance = 0.12 // forest 12%
    else if (terrain === 7) encounterChance = 0.15 // desert 15%
    else if (terrain === 8) encounterChance = 0.10 // swamp 10%
    else if (terrain === 3) encounterChance = 0.12 // water 12%
    else if (terrain === 5) encounterChance = 0.20 // dungeon 20%
    
    if (Math.random() < encounterChance) {
      // Determine enemy group based on location
      let enemyGroup: Enemy[] = []
      
      // Temple of Fiends area
      if (position.x > 5 && position.x < 10 && position.y > 3 && position.y < 8) {
        const r = Math.random()
        if (r < 0.5) enemyGroup = [ENEMIES[0], ENEMIES[2]] // Imp + Bat
        else if (r < 0.8) enemyGroup = [ENEMIES[1]] // Wolf
        else enemyGroup = [ENEMIES[0], ENEMIES[0], ENEMIES[2]] // 2 Imps + Bat
      }
      // Marsh Cave area
      else if (position.x > 6 && position.x < 12 && position.y > 16 && position.y < 22) {
        const r = Math.random()
        if (r < 0.4) enemyGroup = [ENEMIES[5]] // Ghast
        else if (r < 0.7) enemyGroup = [ENEMIES[4], ENEMIES[4]] // 2 Creeps
        else enemyGroup = [ENEMIES[6]] // Wizard
      }
      // Default
      else {
        const r = Math.random()
        if (r < 0.5) enemyGroup = [{...ENEMIES[0]}, {...ENEMIES[0]}]
        else if (r < 0.8) enemyGroup = [{...ENEMIES[1]}]
        else enemyGroup = [{...ENEMIES[0]}, {...ENEMIES[1]}, {...ENEMIES[2]}]
      }
      
      // Reset enemy HP
      enemyGroup = enemyGroup.map(e => ({ ...e, hp: e.maxHp }))
      
      setBattleEnemies(enemyGroup)
      setBattleLog([`¡${enemyGroup.map(e => e.name).join(', ')} aparecen!`])
      setBattlePhase('PLAYER_INPUT')
      setBattleActions([null, null, null, null])
      setScreen('BATTLE')
    }
  }
  
  // Move on overworld
  const move = (dx: number, dy: number) => {
    if (screen !== 'OVERWORLD') return
    
    const newX = position.x + dx
    const newY = position.y + dy
    
    // Check bounds
    if (newX < 0 || newX >= 32 || newY < 0 || newY >= 32) return
    
    const terrain = WORLD_MAP[newY][newX]
    
    // Check movement based on vehicle
    if (vehicle === 'FOOT') {
      if (terrain === 2 || terrain === 3) return // Mountains and water impassable
    } else if (vehicle === 'SHIP') {
      if (terrain !== 3) return // Ship only on water
    } else if (vehicle === 'CANOE') {
      if (terrain !== 3) return // Canoe only on water (rivers)
    }
    
    setPosition({ x: newX, y: newY })
    
    // Check for town entrance
    if (terrain === 4) {
      const town = TOWNS.find(t => t.x === newX && t.y === newY)
      if (town) {
        setCurrentTown(town)
        setScreen('TOWN')
        showMessage(`Bienvenido a ${town.name}`)
        return
      }
    }
    
    // Check for dungeon entrance
    if (terrain === 5) {
      if (newX === 8 && newY === 5) {
        setBattleEnemies([{...ENEMIES[3]}]) // Garland
        setBattleLog(['¡Garland aparece!', 'Os esperaba, Guerreros de la Luz...'])
        setScreen('BATTLE')
        return
      }
    }
    
    // Random encounter
    startBattle()
  }
  
  // Battle: Player attack
  const battleAttack = (charIndex: number, enemyIndex: number) => {
    if (battlePhase !== 'PLAYER_INPUT') return
    
    const newActions = [...battleActions]
    newActions[charIndex] = { type: 'ATTACK', target: enemyIndex }
    setBattleActions(newActions)
    
    // Check if all actions set
    const allSet = party.every((char, i) => 
      char.status !== 'OK' || newActions[i] !== null
    )
    
    if (allSet) {
      setBattlePhase('PLAYER_ACTION')
      executeBattle()
    }
  }
  
  // Battle: Use spell
  const battleSpell = (charIndex: number, spellLevel: number, spellIndex: number, target: number) => {
    if (battlePhase !== 'PLAYER_INPUT') return
    
    const char = party[charIndex]
    if (char.mp[spellLevel] <= 0) return
    
    const spell = SPELLS.filter(s => s.level === spellLevel + 1 && s.type === (char.class === 'WM' ? 'WHITE' : 'BLACK'))[spellIndex]
    
    const newActions = [...battleActions]
    newActions[charIndex] = { type: 'SPELL', target, spell: spell.id }
    setBattleActions(newActions)
    
    // Deduct MP
    setParty(prev => prev.map((c, i) => 
      i === charIndex ? { ...c, mp: c.mp.map((m, l) => l === spellLevel ? m - 1 : m) } : c
    ))
    
    // Check if all actions set
    const allSet = party.every((char, i) => 
      char.status !== 'OK' || newActions[i] !== null
    )
    
    if (allSet) {
      setBattlePhase('PLAYER_ACTION')
      executeBattle()
    }
  }
  
  // Battle: Use item
  const battleItem = (charIndex: number, itemIndex: number, target: number) => {
    if (battlePhase !== 'PLAYER_INPUT') return
    
    const item = ITEMS.find(i => i.id === inventory[itemIndex])
    if (!item) return
    
    const newActions = [...battleActions]
    newActions[charIndex] = { type: 'ITEM', target, item: item.id }
    setBattleActions(newActions)
    
    // Remove item from inventory
    setInventory(prev => prev.filter((_, i) => i !== itemIndex))
    
    // Check if all actions set
    const allSet = party.every((char, i) => 
      char.status !== 'OK' || newActions[i] !== null
    )
    
    if (allSet) {
      setBattlePhase('PLAYER_ACTION')
      executeBattle()
    }
  }
  
  // Battle: Execute all actions
  const executeBattle = () => {
    // Calculate turn order based on AGI 
    const turnOrder = party.map((char, i) => ({ index: i, agi: char.agi }))
      .sort((a, b) => b.agi - a.agi)
    
    // Process player actions in order
    const newLog = [...battleLog]
    const enemies = [...battleEnemies]
    
    for (const { index: i } of turnOrder) {
      const action = battleActions[i]
      const char = party[i]
      
      if (!action || char.status !== 'OK') continue
      
      if (action.type === 'ATTACK') {
        const enemy = enemies[action.target]
        if (!enemy || enemy.hp <= 0) continue
        
        // Calculate hits (1-8 based on weapon) 
        const weapon = ITEMS.find(w => w.id === char.weapon)
        const hitCount = Math.floor(Math.random() * 8) + 1
        
        let totalDamage = 0
        let hits = 0
        
        for (let h = 0; h < hitCount; h++) {
          // Hit chance 
          const hitChance = char.hit - enemy.evade
          if (Math.random() * 100 < hitChance) {
            // Damage calculation: (STR/2 + weapon) +/- variance
            let damage = char.attack + Math.floor(Math.random() * 6) - Math.floor(enemy.absorb / 2)
            damage = Math.max(1, damage)
            totalDamage += damage
            hits++
          }
        }
        
        if (hits > 0) {
          enemies[action.target].hp -= totalDamage
          newLog.push(`${char.name} ataca ${hits} veces! ${totalDamage} daño!`)
          
          if (enemies[action.target].hp <= 0) {
            newLog.push(`${enemies[action.target].name} derrotado!`)
          }
        } else {
          newLog.push(`${char.name} falló!`)
        }
      }
      
      if (action.type === 'SPELL') {
        const spell = SPELLS.find(s => s.id === action.spell)
        if (!spell) continue
        
        if (spell.target === 'ENEMY' || spell.target === 'ALL_ENEMIES') {
          const targets = spell.target === 'ALL_ENEMIES' 
            ? enemies.filter(e => e.hp > 0)
            : [enemies[action.target]]
          
          for (const enemy of targets) {
            if (!enemy) continue
            
            // Spell hit chance 
            const hitChance = spell.hit
            if (Math.random() * 100 < hitChance) {
              if (spell.effect === 'DAMAGE') {
                // Elemental resistance check
                let damage = spell.power
                if (spell.element) {
                  const element = spell.element.toLowerCase() as keyof typeof enemy.elements
                  if (enemy.elements[element] === 'WEAK') damage = Math.floor(damage * 1.5)
                  if (enemy.elements[element] === 'RESIST') damage = Math.floor(damage * 0.5)
                  if (enemy.elements[element] === 'NULL') damage = 0
                }
                
                enemy.hp -= damage
                newLog.push(`${char.name} lanza ${spell.name}! ${damage} daño!`)
              } else if (spell.effect === 'SLEEP' || spell.effect === 'PARALYZE') {
                newLog.push(`${enemy.name} queda ${spell.effect}!`)
              }
            } else {
              newLog.push(`${spell.name} falló!`)
            }
          }
        }
        
        if (spell.effect === 'HEAL') {
          const target = party[action.target]
          const heal = spell.power + Math.floor(char.int / 4)
          const newHp = Math.min(target.maxHp, target.hp + heal)
          setParty(prev => prev.map((c, idx) => 
            idx === action.target ? { ...c, hp: newHp } : c
          ))
          newLog.push(`${spell.name} cura ${heal} HP!`)
        }
      }
    }
    
    // Remove dead enemies
    const aliveEnemies = enemies.filter(e => e.hp > 0)
    
    // Check battle result
    if (aliveEnemies.length === 0) {
      // Victory
      const totalExp = enemies.reduce((sum, e) => sum + e.exp, 0)
      const totalGold = enemies.reduce((sum, e) => sum + e.gold, 0)
      
      addExperience(totalExp)
      setGold(prev => prev + totalGold)
      
      newLog.push(`¡Victoria! +${totalExp} EXP, +${totalGold} G`)
      setBattleLog(newLog)
      
      setTimeout(() => {
        setScreen('OVERWORLD')
        setBattlePhase('START')
      }, 3000)
      return
    }
    
    // Enemy turn
    setBattlePhase('ENEMY_ACTION')
    
    setTimeout(() => {
      const newEnemyLog = [...newLog]
      
      for (const enemy of aliveEnemies) {
        // Target selection based on formation 
        const validTargets = party.filter((c, i) => 
          c.status === 'OK' && 
          (i === 0 || Math.random() > 0.3) // Front character gets targeted more
        )
        
        if (validTargets.length === 0) {
          setScreen('GAMEOVER')
          return
        }
        
        const target = validTargets[Math.floor(Math.random() * validTargets.length)]
        
        // Enemy attack
        const hitChance = enemy.hit - target.evade
        if (Math.random() * 100 < hitChance) {
          const damage = Math.max(1, enemy.attack + Math.floor(Math.random() * 8) - target.absorb)
          
          setParty(prev => prev.map(c => 
            c.id === target.id ? { ...c, hp: c.hp - damage } : c
          ))
          
          newEnemyLog.push(`${enemy.name} ataca a ${target.name}! ${damage} daño!`)
          
          // Check for status effects
          if (enemy.statusAttacks.length > 0 && Math.random() < 0.2) {
            const status = enemy.statusAttacks[Math.floor(Math.random() * enemy.statusAttacks.length)]
            setParty(prev => prev.map(c => 
              c.id === target.id ? { ...c, status: status as any } : c
            ))
            newEnemyLog.push(`${target.name} queda ${status}!`)
          }
        } else {
          newEnemyLog.push(`${enemy.name} falló!`)
        }
      }
      
      // Check if party wiped
      if (party.every(c => c.hp <= 0)) {
        setScreen('GAMEOVER')
        return
      }
      
      setBattleLog(newEnemyLog)
      setBattlePhase('PLAYER_INPUT')
      setBattleActions([null, null, null, null])
    }, 1000)
  }
  
  // Battle: Flee
  const battleFlee = () => {
    if (battlePhase !== 'PLAYER_INPUT') return
    
    // Calculate flee chance 
    const avgAgi = party.reduce((sum, c) => sum + c.agi, 0) / party.length
    const avgEnemyAgi = battleEnemies.reduce((sum, e) => sum + (e.attack / 2), 0) / battleEnemies.length
    const fleeChance = 50 + avgAgi - avgEnemyAgi
    
    if (Math.random() * 100 < fleeChance) {
      setBattleLog([...battleLog, 'Lograste huir!'])
      setTimeout(() => {
        setScreen('OVERWORLD')
        setBattlePhase('START')
      }, 1000)
    } else {
      setBattleLog([...battleLog, 'No puedes huir!'])
      setBattlePhase('ENEMY_ACTION')
      setTimeout(() => executeBattle(), 1000)
    }
  }
  
  // Shop: Buy item
  const shopBuy = (itemId: number) => {
    if (!currentTown) return
    
    const item = ITEMS.find(i => i.id === itemId)
    if (!item) return
    
    if (gold < item.price) {
      showMessage('No tienes suficiente G')
      return
    }
    
    setGold(prev => prev - item.price)
    
    if (item.type === 'ITEM') {
      setInventory(prev => [...prev, itemId])
    } else {
      // Equipment - ask which character
      // Simplified: auto-equip to first eligible character
      const eligibleChar = party.findIndex(c => 
        item.equipClass.includes(c.class) && 
        (item.type === 'WEAPON' ? c.weapon === 0 : true)
      )
      
      if (eligibleChar >= 0) {
        setParty(prev => prev.map((c, i) => {
          if (i !== eligibleChar) return c
          
          if (item.type === 'WEAPON') return { ...c, weapon: itemId }
          if (item.type === 'ARMOR') return { ...c, armor: itemId }
          if (item.type === 'SHIELD') return { ...c, shield: itemId }
          if (item.type === 'HELMET') return { ...c, helmet: itemId }
          if (item.type === 'GLOVES') return { ...c, gloves: itemId }
          return c
        }))
        
        // Recalculate stats
        setParty(prev => prev.map(c => calculateStats(c)))
        showMessage(`${party[eligibleChar].name} equipó ${item.name}`)
      } else {
        showMessage('Nadie puede equipar esto')
      }
    }
  }
  
  // Inn: Rest
  const innRest = () => {
    if (!currentTown) return
    
    const cost = currentTown.shops.inn
    if (gold < cost) {
      showMessage('No tienes suficiente G')
      return
    }
    
    setGold(prev => prev - cost)
    setParty(prev => prev.map(char => ({
      ...char,
      hp: char.maxHp,
      mp: [...char.maxMp],
      status: 'OK'
    })))
    
    showMessage('Descansaste. HP/MP recuperados!')
    setScreen('TOWN')
  }
  
  // Clinic: Cure status
  const clinicCure = () => {
    if (!currentTown) return
    
    const cost = currentTown.shops.clinic
    const hasStatus = party.some(c => c.status !== 'OK' && c.status !== 'DEAD')
    
    if (!hasStatus) {
      showMessage('No necesitas curación')
      return
    }
    
    if (gold < cost) {
      showMessage('No tienes suficiente G')
      return
    }
    
    setGold(prev => prev - cost)
    setParty(prev => prev.map(char => ({
      ...char,
      status: char.status === 'DEAD' ? 'OK' : 
              char.status !== 'OK' ? 'OK' : char.status,
      hp: char.status === 'DEAD' ? Math.floor(char.maxHp / 2) : char.hp
    })))
    
    showMessage('Status curados!')
    setScreen('TOWN')
  }
  
  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (screen === 'OVERWORLD') {
        if (e.key === 'w') move(0, -1)
        if (e.key === 's') move(0, 1)
        if (e.key === 'a') move(-1, 0)
        if (e.key === 'd') move(1, 0)
        if (e.key === 'm') setScreen('MENU')
      }
      
      if (screen === 'TOWN' && currentTown) {
        if (e.key === 'i') setScreen('INN')
        if (e.key === 'c') clinicCure()
        if (e.key === 'w') { setShopCategory('WEAPON'); setScreen('SHOP') }
        if (e.key === 'a') { setShopCategory('ARMOR'); setScreen('SHOP') }
        if (e.key === 't') { setShopCategory('ITEM'); setScreen('SHOP') }
        if (e.key === 'q') setScreen('OVERWORLD')
      }
    }
    
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [screen, position, currentTown])
  
  // Render functions
  const renderTitle = () => (
    <div className="text-center font-mono">
      <h1 className="text-4xl mb-2 text-red-500">FINAL FANTASY</h1>
      <div className="text-sm mb-8 text-gray-400">™ NES ORIGINAL</div>
      
      <div className="space-y-4">
        <button
          onClick={() => setScreen('OVERWORLD')}
          className="block w-48 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          NUEVA PARTIDA
        </button>
        <button className="block w-48 bg-gray-700 text-white px-4 py-2 rounded">
          CONTINUAR
        </button>
      </div>
      
      <div className="mt-8 text-xs text-gray-600">
        Ⓒ 1987 SQUARE SOFT
      </div>
    </div>
  )
  
  const renderOverworld = () => (
    <div className="font-mono">
      <div className="flex justify-between mb-2 text-xs">
        <div className="text-yellow-400">G {gold}</div>
        <div className="text-green-400">
          HP {party.reduce((s, c) => s + c.hp, 0)}/{party.reduce((s, c) => s + c.maxHp, 0)}
        </div>
        <div className="text-blue-400">{vehicle}</div>
      </div>
      
      {/* Mini-map 16x16 viewport */}
      <div className="grid grid-cols-16 gap-0 border border-gray-700">
        {Array.from({ length: 16 }).map((_, y) => (
          Array.from({ length: 16 }).map((_, x) => {
            const worldX = position.x - 8 + x
            const worldY = position.y - 8 + y
            
            if (worldX < 0 || worldX >= 32 || worldY < 0 || worldY >= 32) {
              return <div key={`${x}-${y}`} className="w-4 h-4 bg-black" />
            }
            
            const terrain = WORLD_MAP[worldY][worldX]
            const isPlayer = worldX === position.x && worldY === position.y
            
            let bgColor = ''
            if (isPlayer) bgColor = 'bg-yellow-400'
            else if (terrain === 0) bgColor = 'bg-green-600' // plains
            else if (terrain === 1) bgColor = 'bg-green-800' // forest
            else if (terrain === 2) bgColor = 'bg-gray-500' // mountain
            else if (terrain === 3) bgColor = 'bg-blue-600' // water
            else if (terrain === 4) bgColor = 'bg-amber-700' // town
            else if (terrain === 5) bgColor = 'bg-red-900' // dungeon
            else if (terrain === 6) bgColor = 'bg-stone-500' // bridge
            else if (terrain === 7) bgColor = 'bg-yellow-700' // desert
            else if (terrain === 8) bgColor = 'bg-emerald-900' // swamp
            
            return <div key={`${x}-${y}`} className={`w-4 h-4 ${bgColor}`} />
          })
        ))}
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        WASD:Mover M:Menu | {position.x},{position.y}
      </div>
      {message && <div className="mt-1 text-yellow-400 text-xs">{message}</div>}
    </div>
  )
  
  const renderTown = () => (
    <div className="font-mono w-64">
      <h2 className="text-xl mb-2 text-amber-400">{currentTown?.name}</h2>
      
      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
        <div className="text-yellow-400">G {gold}</div>
        <div className="text-green-400">HP {party[0].hp}/{party[0].maxHp}</div>
      </div>
      
      <div className="space-y-2">
        <button onClick={() => setScreen('INN')} className="w-full bg-indigo-600 px-3 py-2 rounded text-left">
          POSADA ({currentTown?.shops.inn}G)
        </button>
        <button onClick={clinicCure} className="w-full bg-indigo-600 px-3 py-2 rounded text-left">
          CLÍNICA ({currentTown?.shops.clinic}G)
        </button>
        <button onClick={() => { setShopCategory('WEAPON'); setScreen('SHOP') }} className="w-full bg-indigo-600 px-3 py-2 rounded text-left">
          ARMAS
        </button>
        <button onClick={() => { setShopCategory('ARMOR'); setScreen('SHOP') }} className="w-full bg-indigo-600 px-3 py-2 rounded text-left">
          ARMADURAS
        </button>
        <button onClick={() => { setShopCategory('SHIELD'); setScreen('SHOP') }} className="w-full bg-indigo-600 px-3 py-2 rounded text-left">
          ESCUDOS
        </button>
        <button onClick={() => { setShopCategory('HELMET'); setScreen('SHOP') }} className="w-full bg-indigo-600 px-3 py-2 rounded text-left">
          YELMOS
        </button>
        <button onClick={() => { setShopCategory('GLOVES'); setScreen('SHOP') }} className="w-full bg-indigo-600 px-3 py-2 rounded text-left">
          GUANTES
        </button>
        <button onClick={() => { setShopCategory('ITEM'); setScreen('SHOP') }} className="w-full bg-indigo-600 px-3 py-2 rounded text-left">
          ARTÍCULOS
        </button>
        <button onClick={() => setScreen('OVERWORLD')} className="w-full bg-gray-700 px-3 py-2 rounded text-left">
          SALIR
        </button>
      </div>
      
      {message && <div className="mt-2 text-yellow-400 text-xs">{message}</div>}
    </div>
  )
  
  const renderShop = () => {
    if (!currentTown) return null
    
    const shopItems = (() => {
      switch (shopCategory) {
        case 'WEAPON': return currentTown.shops.weapon || []
        case 'ARMOR': return currentTown.shops.armor || []
        case 'SHIELD': return currentTown.shops.shield || []
        case 'HELMET': return currentTown.shops.helmet || []
        case 'GLOVES': return currentTown.shops.gloves || []
        case 'ITEM': return currentTown.shops.item || []
        case 'WHITE': return currentTown.shops.white || []
        case 'BLACK': return currentTown.shops.black || []
        default: return []
      }
    })()
    
    return (
      <div className="font-mono w-72">
        <h2 className="text-xl mb-2 text-amber-400">{currentTown.name} - {shopCategory}</h2>
        <div className="text-yellow-400 mb-2">G {gold}</div>
        
        <div className="max-h-64 overflow-y-auto mb-2">
          {shopItems.map(itemId => {
            const item = ITEMS.find(i => i.id === itemId)
            if (!item) return null
            
            return (
              <div key={item.id} className="flex justify-between items-center mb-1 bg-gray-800 p-2 rounded">
                <div>
                  <div>{item.name}</div>
                  <div className="text-xs text-gray-400">
                    {item.type} {item.effect.attack ? `ATK+${item.effect.attack}` : ''}
                    {item.effect.absorb ? ` DEF+${item.effect.absorb}` : ''}
                  </div>
                </div>
                <button
                  onClick={() => shopBuy(item.id)}
                  className="bg-green-700 px-2 py-1 rounded text-sm"
                  disabled={gold < item.price}
                >
                  {item.price}G
                </button>
              </div>
            )
          })}
        </div>
        
        <button onClick={() => setScreen('TOWN')} className="w-full bg-gray-700 px-3 py-2 rounded">
          VOLVER
        </button>
      </div>
    )
  }
  
  const renderInn = () => {
    if (!currentTown) return null
    
    return (
      <div className="font-mono text-center">
        <h2 className="text-xl mb-4 text-amber-400">POSADA</h2>
        <p className="mb-4">Descansar por {currentTown.shops.inn}G?</p>
        <p className="mb-4 text-yellow-400">G {gold}</p>
        
        <div className="flex gap-2 justify-center">
          <button onClick={innRest} className="bg-indigo-600 px-4 py-2 rounded">SÍ</button>
          <button onClick={() => setScreen('TOWN')} className="bg-gray-700 px-4 py-2 rounded">NO</button>
        </div>
      </div>
    )
  }
  
  const renderMenu = () => (
    <div className="font-mono w-80">
      <h2 className="text-xl mb-2 text-amber-400">MENÚ</h2>
      
      <div className="mb-2 text-yellow-400">G {gold}</div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {party.map((char, i) => (
          <div key={i} className="bg-gray-800 p-2 rounded">
            <div className="flex justify-between">
              <span className="text-cyan-400">{char.name} Lv.{char.level}</span>
              <span className="text-green-400">HP {char.hp}/{char.maxHp}</span>
            </div>
            <div className="text-xs text-gray-400 grid grid-cols-5 mt-1">
              <div>STR{char.str}</div>
              <div>AGI{char.agi}</div>
              <div>VIT{char.vit}</div>
              <div>INT{char.int}</div>
              <div>LUK{char.luk}</div>
            </div>
            <div className="text-xs text-gray-400">
              EXP {char.exp}/{char.nextExp}
            </div>
          </div>
        ))}
      </div>
      
      <button onClick={() => setScreen('OVERWORLD')} className="w-full bg-gray-700 px-3 py-2 rounded mt-2">
        VOLVER
      </button>
    </div>
  )
  
  const renderBattle = () => (
    <div className="font-mono w-full">
      {/* Battle log */}
      <div className="bg-gray-900 border-2 border-red-600 p-2 mb-2 h-24 overflow-y-auto text-xs">
        {battleLog.slice(-4).map((log, i) => (
          <div key={i} className="text-gray-300">{log}</div>
        ))}
      </div>
      
      {/* Enemies */}
      <div className="grid grid-cols-4 gap-1 mb-2">
        {battleEnemies.map((enemy, i) => (
          <div key={i} className="bg-gray-800 p-1 rounded text-center">
            <div className="text-red-400 text-xs">{enemy.name}</div>
            <div className="w-full bg-gray-700 h-1 mt-1">
              <div 
                className="bg-red-600 h-1" 
                style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Party */}
      <div className="grid grid-cols-4 gap-1 mb-2">
        {party.map((char, i) => (
          <div key={i} className={`bg-gray-800 p-1 rounded text-center text-xs
            ${char.status !== 'OK' ? 'bg-red-900' : ''}
            ${i === 0 ? 'border-l-2 border-yellow-400' : ''}`}
          >
            <div className={char.status === 'OK' ? 'text-cyan-400' : 'text-gray-400'}>
              {char.name}
            </div>
            <div className="text-green-400">HP {char.hp}</div>
            {char.status !== 'OK' && <div className="text-red-400">{char.status}</div>}
          </div>
        ))}
      </div>
      
      {/* Actions */}
      {battlePhase === 'PLAYER_INPUT' && (
        <div className="grid grid-cols-4 gap-1">
          {party.map((char, i) => {
            if (char.status !== 'OK') {
              return <div key={i} className="bg-gray-800 p-2 rounded text-center text-xs">INACTIVO</div>
            }
            
            return (
              <div key={i} className="bg-indigo-900 p-1 rounded">
                <div className="text-xs mb-1">{char.name}</div>
                <div className="grid grid-cols-2 gap-1">
                  <button 
                    onClick={() => {
                      // Show enemy selection
                      const enemyIndex = 0 // Simplified
                      battleAttack(i, enemyIndex)
                    }}
                    className="bg-red-700 text-xs px-1 py-1 rounded"
                  >
                    ATK
                  </button>
                  <button className="bg-blue-700 text-xs px-1 py-1 rounded">MAG</button>
                  <button className="bg-green-700 text-xs px-1 py-1 rounded">ITE</button>
                  <button onClick={battleFlee} className="bg-gray-700 text-xs px-1 py-1 rounded">HUI</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      {battlePhase === 'PLAYER_ACTION' && (
        <div className="text-center text-yellow-400">⚔️ EJECUTANDO... ⚔️</div>
      )}
      
      {battlePhase === 'ENEMY_ACTION' && (
        <div className="text-center text-red-400">⚔️ ENEMIGO ATACA ⚔️</div>
      )}
    </div>
  )
  
  const renderGameOver = () => (
    <div className="text-center font-mono">
      <h1 className="text-2xl mb-4 text-red-600">GAME OVER</h1>
      <button
        onClick={() => setScreen('TITLE')}
        className="bg-indigo-600 px-4 py-2 rounded"
      >
        TÍTULO
      </button>
    </div>
  )
  
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative bg-gray-950 border-2 border-indigo-500 p-4 rounded-lg">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-red-600 rounded-full text-white hover:bg-red-700 flex items-center justify-center z-10"
        >
          ✕
        </button>
        
        <div className="min-h-[400px] min-w-[400px] flex items-center justify-center text-white">
          {screen === 'TITLE' && renderTitle()}
          {screen === 'OVERWORLD' && renderOverworld()}
          {screen === 'TOWN' && renderTown()}
          {screen === 'SHOP' && renderShop()}
          {screen === 'INN' && renderInn()}
          {screen === 'BATTLE' && renderBattle()}
          {screen === 'MENU' && renderMenu()}
          {screen === 'GAMEOVER' && renderGameOver()}
        </div>
      </div>
    </div>
  )
}