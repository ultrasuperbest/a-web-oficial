'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { XCircle, Trophy, Zap, Heart } from 'lucide-react';

export default function Arcanoid({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const runGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuración Pro
    let ballRadius = 7;
    let x = canvas.width / 2;
    let y = canvas.height - 40; // Ajustado para que no empiece tan abajo
    let baseSpeed = 4;
    let dx = baseSpeed;
    let dy = -baseSpeed;
    
    let paddleHeight = 12;
    let paddleWidth = 90;
    let paddleX = (canvas.width - paddleWidth) / 2;
    
    let rightPressed = false;
    let leftPressed = false;

    const brickRowCount = 5;
    const brickColumnCount = 8;
    const brickWidth = 65;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 50;
    const brickOffsetLeft = (canvas.width - (brickColumnCount * (brickWidth + brickPadding))) / 2;

    let bricks: any[] = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1, color: `hsl(${r * 40 + 210}, 70%, 50%)` };
      }
    }

    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
      if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
    };
    const keyUpHandler = (e: KeyboardEvent) => {
      if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
      if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
    };

    const mouseMoveHandler = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width; 
      const relativeX = (e.clientX - rect.left) * scaleX;
      paddleX = relativeX - paddleWidth / 2;
    };

    const touchHandler = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const touch = e.touches[0];
      const relativeX = (touch.clientX - rect.left) * scaleX;
      paddleX = relativeX - paddleWidth / 2;
    };

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);
    document.addEventListener("mousemove", mouseMoveHandler);
    canvas.addEventListener("touchmove", touchHandler, { passive: false });

    function drawBall() {
      ctx!.beginPath();
      ctx!.arc(x, y, ballRadius, 0, Math.PI * 2);
      ctx!.fillStyle = "#FFF";
      ctx!.fill();
      ctx!.closePath();
    }

    function drawPaddle() {
      ctx!.beginPath();
      // Dibujamos la pala un poco más arriba del borde inferior absoluto
      ctx!.roundRect(paddleX, canvas!.height - paddleHeight - 10, paddleWidth, paddleHeight, 5);
      ctx!.fillStyle = "#6366f1";
      ctx!.fill();
      ctx!.closePath();
    }

    function draw() {
      if (gameOver) return;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      
      // Dibujar Bricks
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx!.beginPath();
            ctx!.roundRect(brickX, brickY, brickWidth, brickHeight, 4);
            ctx!.fillStyle = bricks[c][r].color;
            ctx!.fill();
            ctx!.closePath();
          }
        }
      }

      drawBall();
      drawPaddle();

      // Colisiones Bricks
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const b = bricks[c][r];
          if (b.status === 1) {
            if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
              dy = -dy;
              b.status = 0;
              setScore(s => s + 10);
            }
          }
        }
      }

      // Rebotes
      if (x + dx > canvas!.width - ballRadius || x + dx < ballRadius) dx = -dx;
      if (y + dy < ballRadius) dy = -dy;
      else if (y + dy > canvas!.height - ballRadius - 10) {
        if (x > paddleX && x < paddleX + paddleWidth) {
          let hitPoint = (x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
          dx = hitPoint * baseSpeed * 1.5;
          dy = -Math.abs(dy);
        } else {
          setLives(l => {
            if (l <= 1) { setGameOver(true); return 0; }
            x = canvas!.width / 2; y = canvas!.height - 40;
            dx = baseSpeed; dy = -baseSpeed;
            return l - 1;
          });
        }
      }

      if (rightPressed && paddleX < canvas!.width - paddleWidth) paddleX += 7;
      else if (leftPressed && paddleX > 0) paddleX -= 7;

      x += dx;
      y += dy;
      requestAnimationFrame(draw);
    }

    draw();
    return () => {
      document.removeEventListener("keydown", keyDownHandler);
      document.removeEventListener("keyup", keyUpHandler);
      document.removeEventListener("mousemove", mouseMoveHandler);
    };
  }, [gameOver]);

  useEffect(() => {
    if (gameStarted && !gameOver) runGame();
  }, [gameStarted, gameOver, runGame]);

  return (
    <div className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
      <div className="relative bg-[#0a0a0a] border border-white/10 w-full max-w-[600px] flex flex-col rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Header con Score y Vidas */}
        <div className="flex justify-between items-center p-4 border-b border-white/5 bg-white/[0.02]">
          <div className="flex gap-3">
             <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                <Zap size={14} className="text-indigo-400" />
                <span className="font-mono font-bold text-indigo-400 text-sm">{score}</span>
             </div>
             <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20">
                <Heart size={14} className="text-red-400" />
                <span className="font-mono font-bold text-red-400 text-sm">{lives}</span>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <XCircle size={28} />
          </button>
        </div>

        {/* CONTENEDOR DEL CANVAS (Aquí está el truco) */}
        <div className="relative w-full aspect-[4/5] bg-black overflow-hidden flex items-center justify-center p-2">
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={750} 
            className="w-full h-full object-contain touch-none"
          />

          {!gameStarted && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-6">
              <h2 className="text-4xl font-black italic mb-2 tracking-tighter uppercase text-white">Arcanoid <span className="text-indigo-500">Pro</span></h2>
              <p className="text-gray-400 mb-8 text-[10px] uppercase tracking-[0.3em]">Responsive Engine v2.0</p>
              <button 
                onClick={() => setGameStarted(true)}
                className="bg-white text-black px-10 py-4 rounded-full font-bold uppercase hover:bg-indigo-500 hover:text-white transition-all"
              >
                Jugar Ahora
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center text-center">
              <Trophy size={48} className="text-indigo-500 mb-4 animate-bounce" />
              <h3 className="text-4xl font-black text-white mb-2 uppercase italic">¡FIN!</h3>
              <p className="text-indigo-400 font-mono mb-8 uppercase tracking-widest text-lg">Puntos: {score}</p>
              <button 
                onClick={() => { window.location.reload(); }}
                className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold uppercase hover:bg-indigo-700 transition-all"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="mt-4 text-[10px] text-gray-600 uppercase tracking-widest hidden md:block">Arrastra el ratón o usa las flechas para mover la pala</p>
    </div>
  );
}