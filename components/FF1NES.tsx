// components/FF1NES.tsx
'use client'

import { useEffect, useState } from 'react'

interface FF1NESProps {
  onClose: () => void
}

interface Character {
  name: string
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  str: number
  agi: number
  vit: number
  wis: number
  exp: number
  level: number
  class: 'WARRIOR' | 'THIEF' | 'MONK' | 'WHITE MAGE' | 'BLACK MAGE' | 'RED MAGE'
}

interface Enemy {
  name: string
  hp: number
  maxHp: number
  attack: number
  exp: number
  gold: number
}

export default function FF1NES({ onClose }: FF1NESProps) {
  const [screen, setScreen] = useState<'title' | 'overworld' | 'battle' | 'inn' | 'shop'>('title')
  const [party, setParty] = useState<Character[]>([
    { name: 'WARRIOR', hp: 28, maxHp: 28, mp: 0, maxMp: 0, str: 18, agi: 8, vit: 16, wis: 6, exp: 0, level: 1, class: 'WARRIOR' },
    { name: 'THIEF', hp: 22, maxHp: 22, mp: 0, maxMp: 0, str: 12, agi: 18, vit: 10, wis: 8, exp: 0, level: 1, class: 'THIEF' },
    { name: 'MONK', hp: 24, maxHp: 24, mp: 0, maxMp: 0, str: 16, agi: 14, vit: 14, wis: 8, exp: 0, level: 1, class: 'MONK' },
    { name: 'RED MAGE', hp: 20, maxHp: 20, mp: 8, maxMp: 8, str: 12, agi: 10, vit: 8, wis: 14, exp: 0, level: 1, class: 'RED MAGE' }
  ])
  const [gold, setGold] = useState(100)
  const [position, setPosition] = useState({ x: 15, y: 15 })
  const [message, setMessage] = useState('')
  const [battleEnemy, setBattleEnemy] = useState<Enemy | null>(null)
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [turn, setTurn] = useState<'player' | 'enemy'>('player')
  
  // Mapa del mundo (20x20, 0=agua, 1=llanura, 2=bosque, 3=montaña, 4=ciudad)
  const worldMap = Array(20).fill(0).map(() => Array(20).fill(1))
  // Añadir características
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 20; j++) {
      if (i === 0 || j === 0 || i === 19 || j === 19) worldMap[i][j] = 3 // montañas borde
      if (i > 5 && i < 10 && j > 5 && j < 10) worldMap[i][j] = 4 // ciudad
      if (Math.random() < 0.1 && worldMap[i][j] === 1) worldMap[i][j] = 2 // bosques aleatorios
    }
  }
  
  const enemies: Enemy[] = [
    { name: 'IMP', hp: 8, maxHp: 8, attack: 6, exp: 10, gold: 15 },
    { name: 'GOBLIN', hp: 12, maxHp: 12, attack: 8, exp: 15, gold: 20 },
    { name: 'WOLF', hp: 18, maxHp: 18, attack: 12, exp: 25, gold: 30 },
    { name: 'SCORPION', hp: 24, maxHp: 24, attack: 16, exp: 40, gold: 50 }
  ]
  
  // Movimiento en overworld
  const move = (dx: number, dy: number) => {
    if (screen !== 'overworld') return
    
    const newX = position.x + dx
    const newY = position.y + dy
    if (newX < 0 || newX >= 20 || newY < 0 || newY >= 20) return
    if (worldMap[newY][newX] === 3) return // montañas infranqueables
    
    setPosition({ x: newX, y: newY })
    
    // Encuentro aleatorio (10% en llanura, 20% en bosque)
    const terrain = worldMap[newY][newX]
    if (terrain === 1 && Math.random() < 0.1) startBattle()
    if (terrain === 2 && Math.random() < 0.2) startBattle()
    if (terrain === 4) setMessage('¡Has llegado a la ciudad!')
  }
  
  const startBattle = () => {
    const enemy = { ...enemies[Math.floor(Math.random() * enemies.length)] }
    setBattleEnemy(enemy)
    setBattleLog([`¡${enemy.name} aparece!`])
    setTurn('player')
    setScreen('battle')
  }
  
  const playerAttack = () => {
    if (!battleEnemy || turn !== 'player') return
    
    // Cálculo de daño simplificado
    const attacker = party[0]
    const damage = Math.max(1, Math.floor(attacker.str / 2) + Math.floor(Math.random() * 6))
    const newEnemy = { ...battleEnemy, hp: battleEnemy.hp - damage }
    
    setBattleLog([...battleLog, `${attacker.name} ataca! ${damage} daño!`])
    setBattleEnemy(newEnemy)
    
    if (newEnemy.hp <= 0) {
      // Victoria
      const expGain = newEnemy.exp
      const goldGain = newEnemy.gold
      setGold(gold + goldGain)
      
      // Subir de nivel (simplificado)
      setParty(party.map(char => ({
        ...char,
        exp: char.exp + expGain,
        ...(char.exp + expGain >= 100 && char.level === 1 ? {
          level: 2,
          maxHp: char.maxHp + 10,
          hp: char.hp + 10,
          str: char.str + 2
        } : {})
      })))
      
      setBattleLog([...battleLog, `¡Victoria! +${expGain} EXP, +${goldGain} G`])
      setTimeout(() => setScreen('overworld'), 1500)
    } else {
      setTurn('enemy')
      setTimeout(enemyAttack, 1000)
    }
  }
  
  const enemyAttack = () => {
    if (!battleEnemy) return
    
    const target = party[Math.floor(Math.random() * party.length)]
    const damage = Math.max(1, battleEnemy.attack - Math.floor(target.vit / 4) + Math.floor(Math.random() * 4))
    
    setParty(party.map(char => 
      char === target ? { ...char, hp: char.hp - damage } : char
    ))
    
    setBattleLog([...battleLog, `${battleEnemy.name} ataca a ${target.name}! ${damage} daño!`])
    
    // Comprobar si alguien murió
    if (party.some(char => char.hp <= 0)) {
      setBattleLog([...battleLog, '¡GAME OVER!'])
      setTimeout(() => setScreen('title'), 2000)
    } else {
      setTurn('player')
    }
  }
  
  const usePotion = () => {
    if (turn !== 'player') return
    if (gold < 10) {
      setBattleLog([...battleLog, 'No tienes suficiente G'])
      return
    }
    
    const target = party.find(char => char.hp < char.maxHp)
    if (!target) return
    
    setGold(gold - 10)
    setParty(party.map(char => 
      char === target ? { ...char, hp: Math.min(char.maxHp, char.hp + 20) } : char
    ))
    setBattleLog([...battleLog, `${target.name} usa poción! +20 HP`])
    setTurn('enemy')
    setTimeout(enemyAttack, 1000)
  }
  
  const flee = () => {
    if (turn !== 'player') return
    
    if (Math.random() < 0.5) {
      setBattleLog([...battleLog, 'Logras huir!'])
      setTimeout(() => setScreen('overworld'), 1000)
    } else {
      setBattleLog([...battleLog, 'No puedes huir!'])
      setTurn('enemy')
      setTimeout(enemyAttack, 1000)
    }
  }
  
  const innRest = () => {
    if (gold < 20) {
      setMessage('No tienes suficiente G')
      return
    }
    setGold(gold - 20)
    setParty(party.map(char => ({ ...char, hp: char.maxHp, mp: char.maxMp })))
    setMessage('Descansas en la posada. HP/MP recuperados!')
  }
  
  const shopBuy = (item: 'potion' | 'tent') => {
    if (item === 'potion' && gold >= 10) {
      setGold(gold - 10)
      setMessage('Compraste una poción!')
    } else if (item === 'tent' && gold >= 50) {
      setGold(gold - 50)
      setMessage('Compraste una tienda!')
    } else {
      setMessage('No tienes suficiente G')
    }
  }
  
  // Renderizado de pantallas
  const renderTitle = () => (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4 text-yellow-400">FINAL FANTASY</h1>
      <h2 className="text-xl mb-8 text-gray-400">™ NES EDITION</h2>
      <button
        onClick={() => setScreen('overworld')}
        className="bg-indigo-600 text-white px-8 py-3 rounded hover:bg-indigo-700 mb-4 w-48"
      >
        NUEVA PARTIDA
      </button>
      <button className="bg-gray-700 text-white px-8 py-3 rounded w-48">
        CONTINUAR
      </button>
    </div>
  )
  
  const renderOverworld = () => (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex justify-between w-full">
        <div className="text-yellow-400">G: {gold}</div>
        <div className="text-green-400">HP: {party.reduce((sum, c) => sum + c.hp, 0)}/{party.reduce((sum, c) => sum + c.maxHp, 0)}</div>
      </div>
      
      {/* Mapa minimalista */}
      <div className="grid grid-cols-20 gap-0 border border-gray-700">
        {worldMap.map((row, y) => (
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`w-5 h-5 ${
                x === position.x && y === position.y ? 'bg-yellow-400' :
                cell === 0 ? 'bg-blue-900' :
                cell === 1 ? 'bg-green-700' :
                cell === 2 ? 'bg-green-900' :
                cell === 3 ? 'bg-gray-600' :
                'bg-amber-800'
              }`}
            />
          ))
        ))}
      </div>
      
      {/* Controles */}
      <div className="mt-4 text-gray-400 text-sm">
        <div>WASD: Mover | C: Ciudad | +: Inn | -: Shop</div>
        <div className="text-yellow-400/50 mt-2">{message}</div>
      </div>
    </div>
  )
  
  const renderBattle = () => (
    <div className="w-full">
      <div className="bg-gray-900 border border-red-600 p-4 mb-4 h-32 overflow-y-auto font-mono text-sm">
        {battleLog.map((log, i) => (
          <div key={i} className="text-gray-300">{log}</div>
        ))}
      </div>
      
      {battleEnemy && (
        <div className="mb-4 text-center">
          <div className="text-red-400 font-bold">{battleEnemy.name}</div>
          <div className="w-full bg-gray-700 h-2 rounded">
            <div 
              className="bg-red-600 h-2 rounded" 
              style={{ width: `${(battleEnemy.hp / battleEnemy.maxHp) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        {party.map((char, i) => (
          <div key={i} className={`text-xs p-1 rounded ${char.hp <= 0 ? 'bg-red-900/50' : 'bg-gray-800'}`}>
            <div className="text-cyan-400">{char.name}</div>
            <div className="text-green-400">HP {char.hp}/{char.maxHp}</div>
            {char.mp > 0 && <div className="text-blue-400">MP {char.mp}/{char.maxMp}</div>}
          </div>
        ))}
      </div>
      
      {turn === 'player' && (
        <div className="grid grid-cols-2 gap-2">
          <button onClick={playerAttack} className="bg-red-700 p-2 rounded hover:bg-red-800">⚔️ ATACAR</button>
          <button onClick={usePotion} className="bg-green-700 p-2 rounded hover:bg-green-800">🧪 POCIÓN</button>
          <button className="bg-blue-700 p-2 rounded hover:bg-blue-800">✨ MAGIA</button>
          <button onClick={flee} className="bg-gray-700 p-2 rounded hover:bg-gray-800">🏃 H U I R</button>
        </div>
      )}
    </div>
  )
  
  const renderInn = () => (
    <div className="text-center">
      <h2 className="text-2xl mb-4">POSADA</h2>
      <p className="mb-4">Descansar: 20G (HP/MP completo)</p>
      <p className="mb-4 text-yellow-400">G: {gold}</p>
      <div className="flex gap-2 justify-center">
        <button onClick={innRest} className="bg-indigo-600 px-4 py-2 rounded">DESCANSAR</button>
        <button onClick={() => setScreen('overworld')} className="bg-gray-700 px-4 py-2 rounded">VOLVER</button>
      </div>
    </div>
  )
  
  const renderShop = () => (
    <div className="text-center">
      <h2 className="text-2xl mb-4">TIENDA</h2>
      <p className="mb-4 text-yellow-400">G: {gold}</p>
      <div className="space-y-2">
        <button onClick={() => shopBuy('potion')} className="bg-indigo-600 px-4 py-2 rounded w-48">POCIÓN - 10G</button>
        <button onClick={() => shopBuy('tent')} className="bg-indigo-600 px-4 py-2 rounded w-48">TIENDA - 50G</button>
        <button onClick={() => setScreen('overworld')} className="bg-gray-700 px-4 py-2 rounded w-48">VOLVER</button>
      </div>
    </div>
  )
  
  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (screen === 'overworld') {
        if (e.key === 'w') move(0, -1)
        if (e.key === 's') move(0, 1)
        if (e.key === 'a') move(-1, 0)
        if (e.key === 'd') move(1, 0)
        if (e.key === 'c' && worldMap[position.y][position.x] === 4) setScreen('shop')
        if (e.key === '+' && worldMap[position.y][position.x] === 4) setScreen('inn')
        if (e.key === '-' && worldMap[position.y][position.x] === 4) setScreen('shop')
      }
    }
    
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [screen, position])
  
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative bg-gray-950 border-2 border-indigo-500 p-6 rounded-lg w-[600px]">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-red-600 rounded-full text-white hover:bg-red-700 flex items-center justify-center"
        >
          ✕
        </button>
        
        <div className="min-h-[400px] flex items-center justify-center text-white font-mono">
          {screen === 'title' && renderTitle()}
          {screen === 'overworld' && renderOverworld()}
          {screen === 'battle' && renderBattle()}
          {screen === 'inn' && renderInn()}
          {screen === 'shop' && renderShop()}
        </div>
      </div>
    </div>
  )
}