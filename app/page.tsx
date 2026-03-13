import React from 'react';
import { Metadata } from 'next';
import { Play, Gamepad2, Newspaper, ArrowRight, Zap, Globe, ShieldCheck } from 'lucide-react';

// SEO: Configuración de Metadatos para Google
export const metadata: Metadata = {
  title: 'A-WEB | Plataforma Definitiva de Videos, Juegos y Blog',
  description: 'Explora A-WEB, el ecosistema digital líder en entretenimiento. Videos exclusivos, juegos interactivos y noticias de última hora en un solo lugar.',
  keywords: ['A-WEB', 'videos online', 'juegos gratis', 'blog tecnología', 'entretenimiento digital'],
  openGraph: {
    title: 'A-WEB Experience',
    description: 'Contenido curado para la nueva generación digital.',
    type: 'website',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* DATOS ESTRUCTURADOS (JSON-LD) PARA SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "A-WEB",
            "url": "https://a-web-oficial.vercel.app",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://a-web-oficial.vercel.app/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }),
        }}
      />

      {/* --- NAVEGACIÓN SEMÁNTICA --- */}
      <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Zap size={18} fill="white" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">a-web</span>
          </div>
          
          <div className="hidden md:flex gap-10 items-center">
            {['Videos', 'Juegos', 'Blog'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 hover:text-indigo-400 transition-colors"
              >
                {item}
              </a>
            ))}
            <button className="bg-white text-black px-5 py-2 rounded-full text-xs font-bold uppercase hover:bg-indigo-500 hover:text-white transition-all">
              Suscribirse
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* --- HERO SECTION: LCP OPTIMIZED --- */}
        <section className="relative pt-40 pb-24 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full -z-10" />
          
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none mb-8">
              EL FUTURO DEL <br />
              <span className="text-indigo-500 italic">ENTRETENIMIENTO</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
              Una plataforma integral diseñada para la velocidad. Accede a contenido multimedia premium, 
              micro-juegos y análisis profundos sin fricciones.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a href="#videos" className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-2xl font-bold transition-all transform hover:-translate-y-1">
                Explorar Ahora <ArrowRight size={20} />
              </a>
              <div className="flex items-center gap-6 px-6 py-4 bg-white/5 rounded-2xl border border-white/10 italic text-gray-400">
                <span className="flex items-center gap-2"><Globe size={16} /> Global</span>
                <span className="flex items-center gap-2"><ShieldCheck size={16} /> Seguro</span>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN VIDEOS --- */}
        <section id="videos" className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">VIDEOS DESTACADOS</h2>
              <div className="h-1 w-20 bg-indigo-600" />
            </div>
            <p className="text-gray-500 text-sm hidden md:block uppercase tracking-widest">Contenido 4K disponible</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <article key={i} className="group cursor-pointer">
                <div className="relative aspect-video bg-white/5 rounded-3xl border border-white/10 overflow-hidden mb-4">
                  <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Play size={48} fill="white" className="text-white opacity-50" />
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-mono">
                    12:45
                  </div>
                </div>
                <h3 className="text-xl font-bold group-hover:text-indigo-400 transition-colors">Producción Exclusiva A-WEB 0{i}</h3>
                <p className="text-gray-500 text-sm mt-2">Explora los límites de la tecnología visual en este episodio semanal.</p>
              </article>
            ))}
          </div>
        </section>

        {/* --- SECCIÓN JUEGOS --- */}
        <section id="juegos" className="bg-indigo-600 py-24">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6">
                <Gamepad2 size={32} />
              </div>
              <h2 className="text-5xl font-black mb-6 tracking-tight leading-none">GAMING ZONE <br />SIN DESCARGAS</h2>
              <p className="text-indigo-100 text-xl mb-8 leading-relaxed italic">
                Hemos optimizado el motor para que juegues directamente desde el navegador con latencia cero.
              </p>
              <button className="bg-black text-white px-10 py-5 rounded-full font-bold uppercase tracking-tighter hover:scale-105 transition-transform">
                Lanzar Arcade
              </button>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
              <div className="aspect-square bg-black/20 rounded-3xl border border-white/10 backdrop-blur-3xl animate-pulse" />
              <div className="aspect-square bg-black/40 rounded-3xl border border-white/10 mt-8" />
            </div>
          </div>
        </section>

        {/* --- SECCIÓN BLOG --- */}
        <section id="blog" className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex flex-col items-center mb-16">
            <Newspaper size={40} className="mb-4 text-indigo-500" />
            <h2 className="text-4xl font-black italic uppercase">The Blog</h2>
          </div>
          
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <article key={i} className="flex flex-col md:flex-row gap-8 p-8 bg-white/5 border border-white/10 rounded-[40px] hover:bg-white/[0.08] transition-all">
                <div className="md:w-1/3 h-48 bg-indigo-900/30 rounded-[30px]" />
                <div className="md:w-2/3 flex flex-col justify-center">
                  <span className="text-xs font-bold text-indigo-500 mb-2 tracking-[0.3em]">TECNOLOGÍA</span>
                  <h3 className="text-3xl font-bold mb-4">El impacto de la IA en el entretenimiento de 2026</h3>
                  <p className="text-gray-400 mb-6 line-clamp-2">Analizamos cómo los algoritmos están redefiniendo la forma en que consumimos videos y juegos interactivos...</p>
                  <a href="#" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest group">
                    Leer más <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* --- FOOTER SEO OPTIMIZED --- */}
      <footer className="bg-black py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <span className="text-3xl font-black italic italic tracking-tighter uppercase mb-6 block">a-web</span>
            <p className="text-gray-500 max-w-sm leading-relaxed text-sm">
              La plataforma líder en integración de contenido digital. Calidad, velocidad y diseño minimalista.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-[0.2em] text-indigo-500">Legal</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Privacidad</a></li>
              <li><a href="#" className="hover:text-white">Términos</a></li>
              <li><a href="#" className="hover:text-white">Cookies</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-[0.2em] text-indigo-500">Newsletter</h4>
            <div className="flex bg-white/5 rounded-xl border border-white/10 p-1">
              <input type="email" placeholder="Email" className="bg-transparent px-4 py-2 outline-none w-full text-sm" />
              <button className="bg-indigo-600 px-4 py-2 rounded-lg text-xs font-bold">UNIRSE</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}