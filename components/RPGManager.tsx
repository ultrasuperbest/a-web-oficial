import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Coins, 
  Sword, 
  HeartPulse, 
  Hammer, 
  Trophy, 
  ArrowRight,
  Shield,
  Zap,
  ShoppingBag,
  Home,
  X,
  ChevronRight,
  PieChart,
  Building2,
  Calendar,
  UserPlus,
  ArrowLeftCircle,
  Save,
  Film,
  ScrollText,
  Flame,
  Wand2,
  Gem
} from 'lucide-react';

// --- TYPES & INTERFACES ---

interface Adventurer {
  id: string;
  name: string;
  class: 'GUERRERO' | 'MAGO' | 'PÍCARO' | 'PALADÍN';
  level: number;
  hp: number;
  maxHp: number;
  mana: number;
  attack: number;
  defense: number;
  willpower: number;
  salary: number; // Oro por semana
  price: number;  // Coste de reclutamiento
  image: string;
  stars: number;
}

interface Building {
  name: string;
  level: number;
  effect: string;
  upgradeCost: number;
}

interface GameState {
  gold: number;
  reputation: number;
  week: number;
  date: string;
  guildName: string;
  adventurers: Adventurer[];
  market: Adventurer[];
  buildings: Building[];
  logs: string[];
}

interface RPGManagerProps {
  onClose: () => void;
}

// --- CONSTANTS & GENERATORS ---

const CLASSES: ('GUERRERO' | 'MAGO' | 'PÍCARO' | 'PALADÍN')[] = ['GUERRERO', 'MAGO', 'PÍCARO', 'PALADÍN'];

const generateAdventurer = (levelRange = [1, 3]): Adventurer => {
  const names = ["Thalion", "Elowen", "Kaelen", "Morgath", "Bryn", "Sarith", "Valerius", "Xalvador"];
  const className = CLASSES[Math.floor(Math.random() * CLASSES.length)];
  const level = Math.floor(Math.random() * (levelRange[1] - levelRange[0] + 1)) + levelRange[0];
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: names[Math.floor(Math.random() * names.length)],
    class: className,
    level,
    hp: 100 + (level * 25),
    maxHp: 100 + (level * 25),
    mana: className === 'MAGO' ? 150 : 20,
    attack: 30 + (level * 12),
    defense: 20 + (level * 10),
    willpower: 15 + (level * 5),
    salary: (level * 25),
    price: (level * 600),
    image: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${Math.random()}`,
    stars: Math.min(5, Math.ceil(level / 1.5))
  };
};

export default function RPGManager({ onClose }: RPGManagerProps) {
  const [activeTab, setActiveTab] = useState('PRINCIPAL');
  const [game, setGame] = useState<GameState>({
    gold: 8500,
    reputation: 25,
    week: 1,
    date: "Luna Nueva, Era de los Dragones",
    guildName: "ORDEN DEL FÉNIX",
    adventurers: [generateAdventurer([2, 4]), generateAdventurer([1, 2])],
    market: [generateAdventurer([3, 5]), generateAdventurer([2, 4]), generateAdventurer([1, 3])],
    buildings: [
      { name: "FORJA", level: 1, effect: "+5% Def", upgradeCost: 1500 },
      { name: "BIBLIOTECA", level: 1, effect: "+10% Mana", upgradeCost: 2000 },
      { name: "POSADA", level: 1, effect: "+2 Reclutas", upgradeCost: 1200 }
    ],
    logs: ["Se ha avistado un Dragón en las tierras del Norte.", "Los impuestos imperiales han subido."]
  });

  // --- UI COMPONENTS ---

  const SidebarButton = ({ icon: Icon, label, id }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex flex-col items-center py-4 border-b border-black/40 transition-all ${activeTab === id ? 'bg-indigo-900/60 shadow-inner' : 'hover:bg-white/5'}`}
    >
      <Icon size={26} className={activeTab === id ? 'text-yellow-400' : 'text-slate-500'} />
      <span className={`text-[8px] font-black uppercase mt-1 tracking-widest ${activeTab === id ? 'text-white' : 'text-slate-500'}`}>
        {label}
      </span>
    </button>
  );

  const StatBar = ({ label, value, max, color }: any) => (
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-[9px] font-bold text-slate-700 w-14 uppercase">{label}</span>
      <div className="flex-1 h-2.5 bg-slate-400/30 rounded-sm overflow-hidden flex shadow-inner border border-black/5">
        <div 
          className={`h-full ${color} transition-all duration-700`} 
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[150] bg-[#000a1a] text-slate-200 font-sans flex flex-col overflow-hidden select-none">
      
      {/* --- TOP BAR (ESTÉTICA PC FÚTBOL 7 ADAPTADA) --- */}
      <div className="h-14 bg-gradient-to-b from-[#1e3a8a] to-[#172554] border-b-2 border-black flex items-center justify-between px-6 shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-5">
          <div className="w-10 h-10 bg-gradient-to-tr from-yellow-600 to-yellow-300 rounded-sm rotate-45 border-2 border-white flex items-center justify-center shadow-lg">
            <Flame className="text-white -rotate-45" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none">{game.guildName}</h1>
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mt-0.5">{game.date}</p>
          </div>
        </div>

        <div className="flex items-center gap-10">
           <div className="flex flex-col items-end">
             <span className="text-[9px] font-black text-blue-300 uppercase leading-none">Tesoro Real</span>
             <span className="text-xl font-black text-yellow-400 flex items-center gap-2 italic">{game.gold.toLocaleString()} <Gem size={16} /></span>
           </div>
           <button onClick={onClose} className="hover:bg-red-700 p-1.5 border border-white/10 rounded-md transition-all">
              <X size={20} />
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* --- LEFT SIDEBAR (MECÁNICAS DE JUEGO) --- */}
        <div className="w-18 bg-[#0a0f1e] border-r-2 border-black flex flex-col shadow-2xl">
          <SidebarButton icon={ArrowLeftCircle} label="RETIRARSE" id="EXIT" />
          <SidebarButton icon={Save} label="SELLAR" id="SAVE" />
          <SidebarButton icon={ScrollText} label="MISIONES" id="QUESTS" />
          <SidebarButton icon={Calendar} label="CRÓNICAS" id="CHRONICLES" />
          <SidebarButton icon={Zap} label="SIG. SEMANA" id="NEXT" />
        </div>

        {/* --- CENTRAL MANAGEMENT HUB --- */}
        <div className="flex-1 bg-[#001b44] p-4 overflow-y-auto custom-scrollbar">
          
          {/* TAB: PRINCIPAL (HUB DE GESTIÓN) */}
          {activeTab === 'PRINCIPAL' && (
            <div className="max-w-5xl mx-auto h-full flex flex-col">
              <div className="flex justify-center mb-8">
                 <div className="bg-gradient-to-b from-slate-900 to-black border-2 border-yellow-700/50 px-10 py-2 rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                    <h2 className="text-yellow-500 font-black italic text-xl uppercase tracking-[0.2em]">Cámara de Estrategia</h2>
                 </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-x-24 gap-y-6 px-12 items-center">
                {/* COLUMNA GESTIÓN DE PERSONAJE */}
                <div className="space-y-4">
                  <MenuLink label="DIARIO DE MISIONES" icon={ScrollText} onClick={() => {}} />
                  <MenuLink label="RÁNKING DE GREMIOS" icon={Trophy} onClick={() => {}} />
                  <MenuLink label="CONTRATOS REALES" icon={Calendar} onClick={() => {}} />
                  <div className="h-6 border-b border-white/5"></div>
                  <MenuLink label="RECLUTAR" icon={UserPlus} onClick={() => setActiveTab('MARKET')} isSub />
                  <MenuLink label="MAESTROS" icon={Users} onClick={() => setActiveTab('STAFF')} isSub />
                  <MenuLink label="INVENTARIO GREMIO" icon={Sword} onClick={() => setActiveTab('ROSTER')} isSub />
                </div>
                {/* COLUMNA GESTIÓN DE INFRAESTRUCTURA */}
                <div className="space-y-4">
                  <MenuLink label="FORMACIÓN" icon={Shield} onClick={() => setActiveTab('ROSTER')} isRight />
                  <MenuLink label="HECHIZOS" icon={Wand2} onClick={() => setActiveTab('ROSTER')} isRight />
                  <MenuLink label="BESTIARIO" icon={ShoppingBag} onClick={() => setActiveTab('MARKET')} isRight />
                  <div className="h-6 border-b border-white/5"></div>
                  <MenuLink label="TESORERÍA" icon={Coins} onClick={() => setActiveTab('FINANCE')} isRight isSub />
                  <MenuLink label="DIPLOMACIA" icon={Hammer} onClick={() => {}} isRight isSub />
                  <MenuLink label="CIUDADELA" icon={Building2} onClick={() => setActiveTab('STADIUM')} isRight isSub />
                </div>
              </div>

              {/* REPRESENTACIÓN DE EMPLEADOS / MAESTROS */}
              <div className="mt-auto h-20 bg-black/50 border-t border-yellow-700/30 flex items-center px-6 gap-3">
                 {game.adventurers.slice(0, 8).map((adv, i) => (
                   <div key={i} className="flex-1 h-16 bg-indigo-950/30 border border-white/5 flex flex-col items-center justify-center grayscale hover:grayscale-0 cursor-help transition-all group relative">
                      <img src={adv.image} className="w-10 h-10" />
                      <div className="absolute -top-1 right-0 text-[8px] font-black text-yellow-500">{adv.level}</div>
                      <div className="w-full bg-yellow-600 h-0.5 mt-auto opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   </div>
                 ))}
                 {Array(8 - game.adventurers.length).fill(null).map((_, i) => (
                   <div key={i} className="flex-1 h-16 bg-black/20 border border-white/5 opacity-20"></div>
                 ))}
              </div>
            </div>
          )}

          {/* TAB: ROSTER (MI GREMIO) */}
          {activeTab === 'ROSTER' && (
            <div className="max-w-4xl mx-auto bg-[#c5c9d6] text-slate-900 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden border-2 border-black">
               <div className="bg-[#172554] p-3 flex justify-between items-center text-white border-b-2 border-black">
                 <h3 className="font-black italic px-4 uppercase tracking-tighter">Registros del Gremio</h3>
                 <button onClick={() => setActiveTab('PRINCIPAL')} className="bg-[#1e3a8a] hover:bg-blue-700 px-6 py-1 text-[10px] font-black uppercase border border-black/40">Cerrar</button>
               </div>
               <table className="w-full text-left border-collapse">
                 <thead className="bg-[#a3a9bb] text-[9px] font-black uppercase text-slate-600">
                   <tr>
                     <th className="p-3 border-b border-slate-400">Aventurero</th>
                     <th className="p-3 border-b border-slate-400">Clase</th>
                     <th className="p-3 border-b border-slate-400 text-center">Rango</th>
                     <th className="p-3 border-b border-slate-400 text-center">Atq</th>
                     <th className="p-3 border-b border-slate-400 text-center">Def</th>
                     <th className="p-3 border-b border-slate-400">Salario</th>
                     <th className="p-3 border-b border-slate-400"></th>
                   </tr>
                 </thead>
                 <tbody className="text-[11px] font-bold">
                   {game.adventurers.map(f => (
                     <tr key={f.id} className="hover:bg-blue-200/50 border-b border-slate-300 transition-colors">
                       <td className="p-3">{f.name}</td>
                       <td className="p-3"><span className="bg-slate-800 text-white px-2 py-0.5 rounded-full text-[8px]">{f.class}</span></td>
                       <td className="p-3 text-center text-yellow-700">{"★".repeat(f.stars)}</td>
                       <td className="p-3 text-center text-red-700">{f.attack}</td>
                       <td className="p-3 text-center text-blue-700">{f.defense}</td>
                       <td className="p-3 text-slate-500">{f.salary} G</td>
                       <td className="p-3">
                         <button className="bg-[#1e3a8a] text-white px-3 py-1 rounded-sm text-[8px] font-black uppercase hover:bg-black transition-all">Perfil</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          )}

          {/* TAB: MARKET (RECLUTAR) */}
          {activeTab === 'MARKET' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {game.market.map(f => (
                <div key={f.id} className="bg-[#e2e8f0] text-slate-900 border-x-4 border-b-4 border-t border-slate-400 rounded-sm p-4 shadow-2xl relative">
                  <div className="absolute top-2 right-2 bg-slate-800 text-white text-[8px] font-black px-2 py-1 rounded">NV {f.level}</div>
                  <div className="flex gap-4 mb-4">
                    <div className="w-16 h-16 bg-white border-2 border-[#1e3a8a] flex items-center justify-center p-1">
                       <img src={f.image} alt={f.name} />
                    </div>
                    <div>
                       <h4 className="font-black text-sm uppercase italic text-[#1e3a8a]">{f.name}</h4>
                       <p className="text-[10px] font-bold text-slate-500 uppercase">{f.class}</p>
                       <div className="flex gap-1 mt-1">
                         {Array(5).fill(0).map((_, i) => (
                           <div key={i} className={`w-2 h-2 rounded-full ${i < f.stars ? 'bg-yellow-500' : 'bg-slate-300'}`}></div>
                         ))}
                       </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/50 p-3 rounded-sm border border-slate-300">
                    <StatBar label="Ataque" value={f.attack} max={100} color="bg-red-600" />
                    <StatBar label="Defensa" value={f.defense} max={100} color="bg-blue-600" />
                    <StatBar label="Poder" value={f.willpower} max={100} color="bg-purple-600" />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Coste Firma</p>
                       <p className="text-lg font-black text-[#1e3a8a]">{f.price} <span className="text-[10px]">ORO</span></p>
                    </div>
                    <button 
                      onClick={() => {
                        if (game.gold < f.price) return;
                        setGame(prev => ({
                          ...prev,
                          gold: prev.gold - f.price,
                          adventurers: [...prev.adventurers, f],
                          market: prev.market.filter(m => m.id !== f.id)
                        }));
                      }}
                      className={`px-6 py-2 font-black uppercase italic border-2 border-black transition-all text-xs ${game.gold >= f.price ? 'bg-[#1e3a8a] text-white hover:bg-black hover:scale-105' : 'bg-slate-400 text-slate-600 cursor-not-allowed'}`}
                    >
                      RECLUTAR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: STADIUM (CIUDADELA) */}
          {activeTab === 'STADIUM' && (
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              {game.buildings.map(b => (
                <div key={b.name} className="bg-gradient-to-br from-slate-200 to-slate-400 border-b-4 border-slate-600 p-6 rounded-sm shadow-xl flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-black text-slate-900 italic uppercase">{b.name}</h4>
                    <span className="bg-slate-900 text-white px-3 py-1 text-xs font-black">NIVEL {b.level}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-600 uppercase mb-4 h-10">{b.effect}</p>
                  <div className="mt-auto pt-4 border-t border-slate-500/30 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase">Mejora</p>
                      <p className="text-lg font-black text-[#1e3a8a]">{b.upgradeCost} G</p>
                    </div>
                    <button className="bg-slate-900 text-white px-6 py-2 text-[10px] font-black uppercase hover:bg-blue-900 transition-colors">AMPLIAR</button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* --- RIGHT INFO PANEL (SISTEMA DE LORE Y NOTICIAS) --- */}
        <div className="w-64 bg-[#0a0f1e] border-l-2 border-black p-5 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
          <div className="bg-black/60 border border-blue-900 p-4 rounded-sm mb-6 shadow-inner">
             <h4 className="text-yellow-500 text-[10px] font-black uppercase mb-3 tracking-widest flex items-center gap-2">
               <Coins size={12} /> Estado Financiero
             </h4>
             <div className="flex justify-between text-[11px] font-mono mb-2">
                <span className="text-slate-400">INGRESOS:</span>
                <span className="text-emerald-500 font-bold">+2.400 G</span>
             </div>
             <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">SALARIOS:</span>
                <span className="text-red-500 font-bold">-{game.adventurers.reduce((a,b)=>a+b.salary, 0)} G</span>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
             <h4 className="text-white text-[10px] font-black uppercase border-b border-white/10 pb-2 tracking-[0.2em]">Rumores de Taberna</h4>
             {game.logs.map((log, i) => (
               <div key={i} className="flex gap-3">
                  <div className="w-1 h-auto bg-blue-700 shrink-0"></div>
                  <p className="text-[10px] text-slate-400 leading-relaxed italic">
                    {log}
                  </p>
               </div>
             ))}
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
             <div className="bg-red-950/40 border border-red-900/50 p-3 rounded-sm">
                <p className="text-[9px] font-black text-red-400 uppercase mb-1">Próxima Gran Incursión</p>
                <p className="text-xs font-bold text-white italic">Cataratas del Olvido</p>
                <div className="flex gap-1 mt-2">
                  <div className="flex-1 h-1 bg-red-900/50"></div>
                  <div className="flex-1 h-1 bg-red-900/50"></div>
                  <div className="flex-1 h-1 bg-red-950"></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function MenuLink({ label, icon: Icon, onClick, isRight = false, isSub = false }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 group transition-all w-full ${isRight ? 'flex-row-reverse text-right' : 'text-left'}`}
    >
      <div className={`p-2 bg-gradient-to-br from-indigo-700 to-blue-900 border-2 border-white/10 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:border-yellow-500 transition-all ${isSub ? 'scale-90 opacity-70' : ''}`}>
        <Icon size={isSub ? 16 : 22} className="text-white" />
      </div>
      <span className={`font-black italic tracking-tighter uppercase transition-colors group-hover:text-yellow-400 ${isSub ? 'text-[11px] text-blue-200' : 'text-lg text-white'}`}>
        {label}
      </span>
      {isSub && <div className="flex-1 h-[1px] bg-white/5 mx-2"></div>}
    </button>
  );
}