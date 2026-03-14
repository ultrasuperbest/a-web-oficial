// app/page.tsx (fragmento actualizado)
'use client';

import React, { useState } from 'react';
import { Play, Gamepad2, Newspaper, ArrowRight, Zap, Globe, ShieldCheck, Target } from 'lucide-react';
import QuantumClicker from '@/components/QuantumClicker';
import Arcanoid from '@/components/Arcanoid';
import RPGManager from '@/components/RPGManager';
import Pong from '@/components/Pong'; // <-- IMPORTAR PONG

export default function Home() {
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isArcanoidOpen, setIsArcanoidOpen] = useState(false);
  const [isRPGOpen, setIsRPGOpen] = useState(false);
  const [isPongOpen, setIsPongOpen] = useState(false); // <-- NUEVO ESTADO

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* ... NAVBAR igual ... */}

      <main>
        {/* ... HERO igual ... */}

        {/* SECCIÓN JUEGOS - ACTUALIZADA CON PONG */}
        <section id="juegos" className="bg-indigo-600 py-24">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6">
                <Gamepad2 size={32} />
              </div>
              <h2 className="text-5xl font-black mb-6 tracking-tight leading-none text-white">GAMING ZONE</h2>
              <p className="text-indigo-100 text-xl mb-8 leading-relaxed italic">Prueba nuestros juegos en el navegador.</p>
              
              {/* BOTONES DE JUEGOS */}
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setIsGameOpen(true)}
                  className="bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-tighter hover:scale-105 transition-transform flex items-center gap-3"
                >
                  Quantum <Target size={20} />
                </button>
                
                <button 
                  onClick={() => setIsArcanoidOpen(true)}
                  className="bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-tighter hover:scale-105 transition-transform flex items-center gap-3"
                >
                  Arcanoid <Play size={20} />
                </button>

                <button 
                  onClick={() => setIsPongOpen(true)} // <-- BOTÓN PONG
                  className="bg-indigo-800 text-white px-8 py-4 rounded-full font-bold uppercase tracking-tighter hover:scale-105 transition-transform flex items-center gap-3 border border-white/20"
                >
                  PONG <Play size={20} />
                </button>

                <button 
                  onClick={() => setIsPongOpen(true)} // <-- BOTÓN PONG
                  className="bg-indigo-800 text-white px-8 py-4 rounded-full font-bold uppercase tracking-tighter hover:scale-105 transition-transform flex items-center gap-3 border border-white/20"
                >
                  PONG <Play size={20} />
                </button>

              </div>
            </div>
            
            <div className="md:w-1/2 grid grid-cols-2 gap-4 opacity-50">
              <div className="aspect-square bg-black/20 rounded-3xl border border-white/10 animate-pulse" />
              <div className="aspect-square bg-black/40 rounded-3xl border border-white/10 mt-8" />
            </div>
          </div>
        </section>
      </main>

      {/* MODALES DE JUEGOS */}
      {isGameOpen && <QuantumClicker onClose={() => setIsGameOpen(false)} />}
      {isArcanoidOpen && <Arcanoid onClose={() => setIsArcanoidOpen(false)} />}
      {isRPGOpen && <RPGManager onClose={() => setIsRPGOpen(false)} />}
      {isPongOpen && <Pong onClose={() => setIsPongOpen(false)} />} {/* <-- PONG */}

      {/* ... FOOTER igual ... */}
    </div>
  );
}