'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Gamepad2, Target, XCircle } from 'lucide-react';

export default function QuantumClicker({ onClose }: { onClose: () => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ top: '50%', left: '50%' });

  const moveTarget = useCallback(() => {
    const top = Math.random() * 80 + 10;
    const left = Math.random() * 80 + 10;
    setTargetPosition({ top: `${top}%`, left: `${left}%` });
  }, []);

  const handleTargetClick = () => {
    if (gameActive) {
      setScore((prev) => prev + 1);
      moveTarget();
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(15);
    setGameActive(true);
    moveTarget();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setGameActive(false);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [gameActive, timeLeft]);

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-[#0a0a0a] border border-indigo-500/30 w-full max-w-3xl rounded-3xl p-8 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <XCircle size={32} />
        </button>
        <div className="text-center mb-8">
          <h3 className="text-xs font-bold text-indigo-400 tracking-[0.4em] uppercase mb-2">Quantum Clicker v1.0</h3>
          <div className="flex justify-center gap-12 bg-white/5 rounded-full py-3 max-w-sm mx-auto border border-white/10 font-mono text-xl">
            <div>Score: <span className="font-bold text-white text-3xl">{score}</span></div>
            <div>Time: <span className="font-bold text-indigo-400 text-3xl">{timeLeft}s</span></div>
          </div>
        </div>
        <div className="relative aspect-[16/10] bg-black rounded-2xl border-2 border-dashed border-white/10 overflow-hidden">
          {!gameActive && timeLeft === 15 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4">
              <Gamepad2 size={64} className="text-indigo-500" />
              <button onClick={startGame} className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase hover:bg-indigo-500 hover:text-white transition-colors">Empezar</button>
            </div>
          )}
          {!gameActive && timeLeft === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4 z-10">
              <h4 className="text-6xl font-black text-white italic">¡FIN!</h4>
              <button onClick={startGame} className="bg-indigo-600 px-8 py-3 rounded-full font-bold uppercase hover:bg-indigo-700 transition-colors">Reintentar</button>
            </div>
          )}
          {(gameActive || (!gameActive && timeLeft === 15)) && (
            <div 
              onClick={handleTargetClick}
              className={`absolute w-12 h-12 rounded-full cursor-pointer flex items-center justify-center transition-all duration-150 ${gameActive ? 'bg-indigo-500 shadow-lg shadow-indigo-500/50 hover:scale-110' : 'bg-gray-700'}`}
              style={{ top: targetPosition.top, left: targetPosition.left, transform: 'translate(-50%, -50%)' }}
            >
              <Target size={24} className="text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}