import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Coins, 
  Sword, 
  HeartPulse, 
  Stethoscope, 
  Hammer, 
  Trophy, 
  ArrowRight,
  Shield,
  Zap,
  ShoppingBag,
  Home,
  X,
  ChevronRight
} from 'lucide-react';

// --- TYPES & INTERFACES ---

interface Fighter {
  id: string;
  name: string;
  type: 'Hero' | 'Monster' | 'Villain';
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  salary: number;
  price: number;
  image: string;
  injured: boolean;
  durability: number; // Durability of equipment (0-100)
}

interface Staff {
  blacksmiths: number;
  healers: number;
  marketing: number;
}

interface GameState {
  gold: number;
  reputation: number;
  day: number;
  league: string;
  fighters: Fighter[];
  market: Fighter[];
  staff: Staff;
  coliseumLevel: number;
  logs: string[];
}

interface RPGManagerProps {
  onClose: () => void;
}

// --- CONSTANTS & MOCK DATA ---

const FIGHTER_NAMES = ["Alaric", "Gromm", "Zola", "Xenon", "Valeria", "Gorg", "Balthazar", "Nyx", "Ignis", "Kael"];
const MONSTER_NAMES = ["Skulker", "Behemoth", "Ravager", "Voidling", "Gnasher", "Troll Lord"];

const generateFighter = (isMarket = true): Fighter => {
  const isMonster = Math.random() > 0.7;
  const name = isMonster ? MONSTER_NAMES[Math.floor(Math.random() * MONSTER_NAMES.length)] : FIGHTER_NAMES[Math.floor(Math.random() * FIGHTER_NAMES.length)];
  const level = Math.floor(Math.random() * 5) + 1;
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    type: isMonster ? 'Monster' : 'Hero',
    level,
    hp: 100 + (level * 20),
    maxHp: 100 + (level * 20),
    attack: 15 + (level * 5),
    defense: 10 + (level * 3),
    speed: 10 + (level * 2),
    salary: (level * 50) + (isMonster ? 20 : 10),
    price: (level * 500),
    image: isMonster ? '👹' : '⚔️',
    injured: false,
    durability: 100
  };
};

// --- MAIN COMPONENT ---

export default function RPGManager({ onClose }: RPGManagerProps) {
  const [view, setView] = useState<'office' | 'market' | 'roster' | 'combat' | 'facilities'>('office');
  const [game, setGame] = useState<GameState>({
    gold: 2500,
    reputation: 10,
    day: 1,
    league: "División de Bronce",
    fighters: [generateFighter(false)],
    market: [generateFighter(), generateFighter(), generateFighter()],
    staff: { blacksmiths: 1, healers: 1, marketing: 0 },
    coliseumLevel: 1,
    logs: ["Bienvenido al Club. Tu primer luchador te espera."]
  });

  // Combat State
  const [inCombat, setInCombat] = useState(false);
  const [enemy, setEnemy] = useState<Fighter | null>(null);
  const [playerCombatant, setPlayerCombatant] = useState<Fighter | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');

  // --- LOGIC FUNCTIONS ---

  const addLog = (msg: string) => {
    setGame(prev => ({ ...prev, logs: [msg, ...prev.logs].slice(0, 5) }));
  };

  const nextDay = () => {
    // Daily expenses
    const totalSalaries = game.fighters.reduce((acc, f) => acc + f.salary, 0);
    const staffCosts = (game.staff.blacksmiths * 30) + (game.staff.healers * 40);
    const totalCosts = totalSalaries + staffCosts;

    setGame(prev => {
      // Passive healing and repairs
      const updatedFighters = prev.fighters.map(f => {
        let newHp = f.hp;
        let newDur = f.durability;
        if (f.injured && prev.staff.healers > 0) newHp = Math.min(f.maxHp, f.hp + (prev.staff.healers * 10));
        if (newHp === f.maxHp) f.injured = false;
        if (prev.staff.blacksmiths > 0) newDur = Math.min(100, f.durability + (prev.staff.blacksmiths * 5));
        return { ...f, hp: newHp, durability: newDur };
      });

      return {
        ...prev,
        day: prev.day + 1,
        gold: prev.gold - totalCosts,
        fighters: updatedFighters,
        market: [generateFighter(), generateFighter(), generateFighter()]
      };
    });
    addLog(`Día ${game.day + 1}: Gastos de mantenimiento: -${totalCosts} oro.`);
  };

  const hireFighter = (fighter: Fighter) => {
    if (game.gold < fighter.price) return;
    setGame(prev => ({
      ...prev,
      gold: prev.gold - fighter.price,
      fighters: [...prev.fighters, fighter],
      market: prev.market.filter(f => f.id !== fighter.id)
    }));
    addLog(`Has contratado a ${fighter.name} por ${fighter.price} oro.`);
  };

  // --- COMBAT SYSTEM ---

  const startCombat = (myFighter: Fighter) => {
    if (myFighter.injured || myFighter.hp <= 0) {
      addLog(`${myFighter.name} está herido y no puede luchar.`);
      return;
    }
    const enemyFighter = generateFighter(false);
    enemyFighter.name = "Rival: " + enemyFighter.name;
    setEnemy(enemyFighter);
    setPlayerCombatant({ ...myFighter });
    setInCombat(true);
    setView('combat');
    setCombatLog(["¡Empieza el combate en el Coliseo!"]);
  };

  const executeTurn = () => {
    if (!playerCombatant || !enemy) return;

    // Player attacks
    const pDamage = Math.max(5, (playerCombatant.attack * (playerCombatant.durability / 100)) - (enemy.defense * 0.5));
    const newEnemyHp = Math.max(0, enemy.hp - pDamage);
    
    setEnemy(prev => prev ? { ...prev, hp: newEnemyHp } : null);
    setCombatLog(prev => [`${playerCombatant.name} ataca y causa ${pDamage.toFixed(0)} de daño.`, ...prev]);

    if (newEnemyHp <= 0) {
      endCombat(true);
      return;
    }

    // Enemy attacks (Delayed for feel)
    setTurn('enemy');
    setTimeout(() => {
      const eDamage = Math.max(5, enemy.attack - (playerCombatant.defense * 0.5));
      const newPlayerHp = Math.max(0, playerCombatant.hp - eDamage);
      
      setPlayerCombatant(prev => prev ? { ...prev, hp: newPlayerHp } : null);
      setCombatLog(prev => [`${enemy.name} contraataca y causa ${eDamage.toFixed(0)} de daño.`, ...prev]);

      if (newPlayerHp <= 0) {
        endCombat(false);
      } else {
        setTurn('player');
      }
    }, 600);
  };

  const endCombat = (victory: boolean) => {
    const reward = victory ? 800 : 100;
    const repGain = victory ? 5 : -2;

    setGame(prev => {
      const updatedFighters = prev.fighters.map(f => {
        if (f.id === playerCombatant?.id) {
          return { 
            ...f, 
            hp: playerCombatant.hp, 
            injured: playerCombatant.hp < (f.maxHp * 0.2),
            durability: Math.max(0, f.durability - 15) 
          };
        }
        return f;
      });
      return {
        ...prev,
        gold: prev.gold + reward,
        reputation: prev.reputation + repGain,
        fighters: updatedFighters
      };
    });

    setTimeout(() => {
      setInCombat(false);
      setView('office');
      addLog(victory ? `¡Victoria! Ganaste ${reward} oro.` : `Derrota... Solo obtuviste ${reward} oro.`);
    }, 1500);
  };

  // --- RENDER HELPERS ---

  const StatBadge = ({ icon: Icon, value, color }: any) => (
    <div className={`flex items-center gap-1 px-2 py-1 rounded bg-${color}-500/20 text-${color}-400 text-xs font-bold`}>
      <Icon size={12} />
      {value}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[150] bg-[#0a0a0c] text-slate-200 font-sans p-4 md:p-8 overflow-y-auto">
      {/* HEADER / TOP BAR */}
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between bg-[#151518] border border-white/5 rounded-2xl p-6 mb-6 gap-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Trophy className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-wider text-white leading-none">RPG Manager</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{game.league} • Día {game.day}</p>
          </div>
        </div>

        <div className="flex gap-6 items-center">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-500">Tesorería</p>
            <p className="text-lg font-mono font-bold text-yellow-500 flex items-center gap-2 justify-end">
              {game.gold.toLocaleString()} <Coins size={18} />
            </p>
          </div>
          <div className="text-right border-l border-white/10 pl-6 pr-4">
            <p className="text-[10px] uppercase font-bold text-slate-500">Reputación</p>
            <p className="text-lg font-mono font-bold text-indigo-400 flex items-center gap-2 justify-end">
              {game.reputation} <Zap size={18} />
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 pb-12">
        {/* SIDEBAR NAVIGATION */}
        <div className="lg:col-span-1 space-y-2">
          <button 
            onClick={() => setView('office')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${view === 'office' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'hover:bg-white/5 text-slate-400'}`}
          >
            <Home size={20} /> Despacho
          </button>
          <button 
            onClick={() => setView('roster')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${view === 'roster' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'hover:bg-white/5 text-slate-400'}`}
          >
            <Users size={20} /> Mi Plantilla ({game.fighters.length})
          </button>
          <button 
            onClick={() => setView('market')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${view === 'market' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'hover:bg-white/5 text-slate-400'}`}
          >
            <ShoppingBag size={20} /> Mercado
          </button>
          <button 
            onClick={() => setView('facilities')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${view === 'facilities' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'hover:bg-white/5 text-slate-400'}`}
          >
            <Hammer size={20} /> Instalaciones
          </button>

          <button 
            onClick={nextDay}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-white text-black px-6 py-4 rounded-xl font-black uppercase tracking-tighter hover:bg-indigo-400 transition-all active:scale-95"
          >
            Siguiente Día <ArrowRight size={18} />
          </button>

          {/* RECENT LOGS */}
          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/5">
            <h3 className="text-[10px] uppercase font-black text-slate-500 mb-3 tracking-widest">Actividad Reciente</h3>
            <div className="space-y-3">
              {game.logs.map((log, i) => (
                <p key={i} className="text-[11px] text-slate-400 leading-relaxed border-l-2 border-indigo-500/30 pl-2">
                  {log}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-3">
          
          {/* OFFICE VIEW */}
          {view === 'office' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-3xl font-black mb-2 text-white italic uppercase">Estado del Club</h2>
                  <p className="text-indigo-200/60 max-w-md">Tu coliseo está al nivel {game.coliseumLevel}. Tienes {game.staff.healers} curanderos y {game.staff.blacksmiths} herreros activos.</p>
                  <div className="mt-6 flex gap-4 flex-wrap">
                    <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 min-w-[120px]">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Poder de Ataque</p>
                      <p className="text-2xl font-black text-white">{game.fighters.reduce((a, b) => a + b.attack, 0)}</p>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 min-w-[120px]">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Gastos Diarios</p>
                      <p className="text-2xl font-black text-red-400">-{game.fighters.reduce((a, b) => a + b.salary, 0) + (game.staff.blacksmiths * 30) + (game.staff.healers * 40)}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                  <Trophy size={220} />
                </div>
              </div>

              <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-8">
                <Zap size={20} className="text-yellow-500" /> Luchadores Listos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {game.fighters.map(f => (
                  <div key={f.id} className="bg-[#151518] p-5 rounded-2xl border border-white/5 flex items-center justify-between hover:border-indigo-500/40 transition-all group">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl group-hover:scale-110 transition-transform">{f.image}</span>
                      <div>
                        <h4 className="font-bold text-white">{f.name}</h4>
                        <div className="flex gap-2 mt-1">
                          <StatBadge icon={Sword} value={f.attack} color="red" />
                          <StatBadge icon={Shield} value={f.defense} color="blue" />
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => startCombat(f)}
                      disabled={f.injured}
                      className={`p-3 rounded-xl transition-all ${f.injured ? 'bg-white/5 text-slate-600' : 'bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white'}`}
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ROSTER VIEW */}
          {view === 'roster' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {game.fighters.map(f => (
                <div key={f.id} className="bg-[#151518] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl bg-white/5 p-3 rounded-2xl group-hover:bg-indigo-500/10 transition-colors">{f.image}</div>
                      <div>
                        <h4 className="text-xl font-bold text-white">{f.name}</h4>
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Nivel {f.level} {f.type}</p>
                      </div>
                    </div>
                    {f.injured && (
                      <div className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase animate-pulse">Lesionado</div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                        <span className="text-slate-500">Salud</span>
                        <span className={f.hp < f.maxHp * 0.3 ? 'text-red-400' : 'text-emerald-400'}>{f.hp} / {f.maxHp}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(f.hp / f.maxHp) * 100}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                        <span className="text-slate-500">Estado del Equipo (Forja)</span>
                        <span className="text-indigo-400">{f.durability}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${f.durability}%` }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="bg-black/20 p-2 rounded-lg text-center border border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Atq</p>
                        <p className="font-bold text-red-400">{f.attack}</p>
                      </div>
                      <div className="bg-black/20 p-2 rounded-lg text-center border border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Def</p>
                        <p className="font-bold text-blue-400">{f.defense}</p>
                      </div>
                      <div className="bg-black/20 p-2 rounded-lg text-center border border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Vel</p>
                        <p className="font-bold text-yellow-400">{f.speed}</p>
                      </div>
                    </div>

                    <button 
                       onClick={() => startCombat(f)}
                       disabled={f.injured}
                       className="w-full mt-2 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
                    >
                      Combatir ahora
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MARKET VIEW */}
          {view === 'market' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {game.market.map(f => (
                <div key={f.id} className="bg-[#151518] border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{f.image}</div>
                      <div>
                        <h4 className="text-xl font-bold text-white">{f.name}</h4>
                        <div className="flex gap-2">
                           <StatBadge icon={Zap} value={`LVL ${f.level}`} color="indigo" />
                           <span className="text-[10px] text-slate-500 font-bold self-center uppercase">{f.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-yellow-500">{f.price}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Oro</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center border-r border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Ataque</p>
                      <p className="text-lg font-bold text-white">{f.attack}</p>
                    </div>
                    <div className="text-center border-r border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Defensa</p>
                      <p className="text-lg font-bold text-white">{f.defense}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Sueldo</p>
                      <p className="text-lg font-bold text-red-400">{f.salary}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => hireFighter(f)}
                    disabled={game.gold < f.price}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${game.gold >= f.price ? 'bg-white text-black hover:bg-indigo-400 hover:scale-[1.02]' : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}
                  >
                    {game.gold >= f.price ? 'Firmar Contrato' : 'Fondos Insuficientes'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* COMBAT VIEW */}
          {view === 'combat' && playerCombatant && enemy && (
            <div className="bg-[#151518] rounded-3xl border border-white/5 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="p-8 h-80 relative flex items-center justify-around bg-gradient-to-b from-indigo-950/20 to-transparent">
                
                {/* PLAYER SIDE */}
                <div className="text-center relative">
                  <div className={`text-8xl mb-4 transition-all duration-300 ${turn === 'player' ? 'scale-125 drop-shadow-[0_0_20px_rgba(79,70,229,0.5)] translate-x-4' : 'opacity-80'}`}>
                    {playerCombatant.image}
                  </div>
                  <h4 className="text-xl font-black text-white italic">{playerCombatant.name}</h4>
                  <div className="w-48 h-3 bg-white/5 rounded-full mt-2 overflow-hidden border border-white/10">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(playerCombatant.hp / playerCombatant.maxHp) * 100}%` }}></div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Mi Luchador</p>
                </div>

                <div className="text-4xl font-black text-white italic opacity-20 animate-pulse">VS</div>

                {/* ENEMY SIDE */}
                <div className="text-center relative">
                  <div className={`text-8xl mb-4 transition-all duration-300 ${turn === 'enemy' ? 'scale-125 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)] -translate-x-4' : 'opacity-80'}`}>
                    {enemy.image}
                  </div>
                  <h4 className="text-xl font-black text-white italic">{enemy.name}</h4>
                  <div className="w-48 h-3 bg-white/5 rounded-full mt-2 overflow-hidden border border-white/10">
                    <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}></div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Oponente</p>
                </div>
              </div>

              {/* ACTION LOG & CONTROLS */}
              <div className="grid grid-cols-1 md:grid-cols-2 border-t border-white/5 h-64 bg-black/40">
                <div className="p-6 border-r border-white/5 overflow-y-auto font-mono text-xs space-y-2">
                  {combatLog.map((log, i) => (
                    <div key={i} className={`${i === 0 ? 'text-white font-bold' : 'text-slate-500'} flex gap-2`}>
                      <span className="opacity-30">[{combatLog.length - i}]</span> {log}
                    </div>
                  ))}
                </div>
                <div className="p-8 flex flex-col justify-center gap-4 bg-indigo-900/10">
                  <button 
                    onClick={executeTurn}
                    disabled={playerCombatant.hp <= 0 || enemy.hp <= 0 || turn === 'enemy'}
                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 ${turn === 'player' ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20' : 'bg-white/5 text-slate-500 cursor-wait'}`}
                  >
                    <Sword size={24} /> {turn === 'player' ? 'Ejecutar Acción' : 'Esperando Rival...'}
                  </button>
                  <p className="text-center text-[10px] uppercase font-bold text-slate-500">
                    La durabilidad del equipo afecta al daño causado
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* FACILITIES VIEW */}
          {view === 'facilities' && (
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#151518] p-8 rounded-3xl border border-white/5 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-indigo-500/10 rounded-2xl text-indigo-400 shadow-inner"><Hammer size={32} /></div>
                  <div>
                    <h4 className="text-xl font-black text-white uppercase italic">Cuerpo de Herreros</h4>
                    <p className="text-sm text-slate-500 max-w-sm">Los herreros mantienen el equipo. Cada herrero repara un 5% de durabilidad de toda la plantilla cada noche.</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 bg-black/40 p-4 rounded-2xl border border-white/5">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Personal</p>
                    <p className="text-2xl font-black text-white">{game.staff.blacksmiths}</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (game.gold < 500) return;
                      setGame(g => ({...g, gold: g.gold - 500, staff: {...g.staff, blacksmiths: g.staff.blacksmiths + 1}}));
                      addLog("Has contratado a un nuevo Herrero.");
                    }}
                    disabled={game.gold < 500}
                    className="bg-white text-black px-6 py-2 rounded-xl text-xs font-black uppercase hover:bg-indigo-400 transition-all disabled:opacity-20"
                  >
                    + (500 Oro)
                  </button>
                </div>
              </div>

              <div className="bg-[#151518] p-8 rounded-3xl border border-white/5 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-emerald-500/10 rounded-2xl text-emerald-400 shadow-inner"><HeartPulse size={32} /></div>
                  <div>
                    <h4 className="text-xl font-black text-white uppercase italic">Clínica Médica</h4>
                    <p className="text-sm text-slate-500 max-w-sm">Los curanderos sanan a los heridos. Cada médico recupera 10 HP por noche a los luchadores lesionados.</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 bg-black/40 p-4 rounded-2xl border border-white/5">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Personal</p>
                    <p className="text-2xl font-black text-white">{game.staff.healers}</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (game.gold < 600) return;
                      setGame(g => ({...g, gold: g.gold - 600, staff: {...g.staff, healers: g.staff.healers + 1}}));
                      addLog("Has contratado a un nuevo Médico.");
                    }}
                    disabled={game.gold < 600}
                    className="bg-white text-black px-6 py-2 rounded-xl text-xs font-black uppercase hover:bg-indigo-400 transition-all disabled:opacity-20"
                  >
                    + (600 Oro)
                  </button>
                </div>
              </div>

              <div className="bg-[#151518] p-8 rounded-3xl border border-white/5 flex flex-wrap items-center justify-between gap-6 opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-yellow-500/10 rounded-2xl text-yellow-400 shadow-inner"><ShoppingBag size={32} /></div>
                  <div>
                    <h4 className="text-xl font-black text-white uppercase italic">Expansión del Coliseo</h4>
                    <p className="text-sm text-slate-500 max-w-sm">Aumenta el aforo para ganar más oro en cada combate. Próximamente en futuras versiones.</p>
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nivel Máx Alcanzado</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}