'use client';
import React, { useState } from 'react';
import { Play, Gamepad2, Newspaper, ArrowRight, Zap, Globe, ShieldCheck, Target } from 'lucide-react';
import QuantumClicker from '@/components/QuantumClicker'; // Importamos el componente
import Arcanoid from '@/components/Arcanoid';

export default function Home() {
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isArcanoidOpen, setIsArcanoidOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Zap size={18} fill="white" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic text-white">a-web</span>
          </div>
          <div className="hidden md:flex gap-10 items-center">
            {['Videos', 'Juegos', 'Blog'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 hover:text-indigo-400 transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </nav>

      <main>
        {/* --- HERO --- */}
        <section className="relative pt-40 pb-24 px-6 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-none">A-WEB<br/><span className="text-indigo-500">EXPERIENCE</span></h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-12">Entretenimiento digital de alto rendimiento. Videos, juegos y contenido exclusivo.</p>
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-6 px-6 py-4 bg-white/5 rounded-2xl border border-white/10 italic text-gray-400 text-sm">
              <span className="flex items-center gap-2"><Globe size={16} /> Global</span>
              <span className="flex items-center gap-2"><ShieldCheck size={16} /> Secure</span>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN JUEGOS --- */}
        <section id="juegos" className="bg-indigo-600 py-24">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6">
                <Gamepad2 size={32} />
              </div>
              <h2 className="text-5xl font-black mb-6 tracking-tight leading-none text-white">GAMING ZONE</h2>
              <p className="text-indigo-100 text-xl mb-8 leading-relaxed italic">Prueba nuestro nuevo motor de juegos en el navegador.</p>
              <button 
                onClick={() => setIsGameOpen(true)}
                className="bg-black text-white px-10 py-5 rounded-full font-bold uppercase tracking-tighter hover:scale-105 transition-transform flex items-center gap-3"
              >
                Lanzar Arcade <Target size={20} />
                {/* BOTÓN PARA ARCANOID */}
              <button 
                onClick={() => setIsArcanoidOpen(true)}
                className="bg-white text-black px-10 py-5 rounded-full font-bold uppercase tracking-tighter hover:scale-105 transition-transform flex items-center gap-3 mt-4 md:mt-0"
              >
                Arcanoid Pro <Play size={20} />
              </button>
                            </button>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4 opacity-50">
              <div className="aspect-square bg-black/20 rounded-3xl border border-white/10 animate-pulse" />
              <div className="aspect-square bg-black/40 rounded-3xl border border-white/10 mt-8" />
            </div>
          </div>
        </section>
      </main>

      {/* --- EL JUEGO (Se carga solo cuando se abre) --- */}
      {isGameOpen && <QuantumClicker onClose={() => setIsGameOpen(false)} />}
      {isArcanoidOpen && <Arcanoid onClose={() => setIsArcanoidOpen(false)} />}

      <footer className="py-20 text-center text-gray-600 text-[10px] tracking-[0.3em] uppercase border-t border-white/5">
        © {new Date().getFullYear()} a-web ecosystem
      </footer>
    </div>
  );
}