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

  // --- NÚCLEO DEL MOTOR DE JUEGO ---
  const runGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajustes de dificultad Pro
    let ballRadius = 7;
    let x = canvas.width / 2;
    let y = canvas.height - 30;
    let baseSpeed = 4;
    let dx = baseSpeed;
    let dy = -baseSpeed;
    
    let paddleHeight = 12;
    let paddleWidth = 90;
    let paddleX = (canvas.width - paddleWidth) / 2;
    
    let rightPressed = false;
    let leftPressed = false;

    // Configuración de Ladrillos
    const brickRowCount = 6;
    const brickColumnCount = 9;
    const brickWidth = 60;
    const brickHeight = 20;
    const brickPadding = 8;
    const brickOffsetTop = 40;
    const brickOffsetLeft = 30;

    let bricks: any[] = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1, color: `hsl(${r * 40 + 200}, 70%, 50%)` };
      }
    }

    // Controles
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
      if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
    };
    const keyUpHandler = (e: KeyboardEvent) => {
      if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
      if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
    };
    const mouseMoveHandler = (e: MouseEvent) => {
      const relativeX = e.clientX - canvas.getBoundingClientRect().left;
      if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
      }
    };
    const touchHandler = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const relativeX = touch.clientX - canvas.getBoundingClientRect().left;
      if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
      }
    };

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);
    document.addEventListener("mousemove", mouseMoveHandler);
    canvas.addEventListener("touchmove", touchHandler, { passive: false });

    function drawBall() {
      ctx!.beginPath();
      ctx!.arc(x, y, ballRadius, 0, Math.PI * 2);
      ctx!.fillStyle = "#FFF";
      ctx!.shadowBlur = 10;
      ctx!.shadowColor = "#6366f1";
      ctx!.fill();
      ctx!.closePath();
    }

    function drawPaddle() {
      ctx!.beginPath();
      ctx!.roundRect(paddleX, canvas!.height - paddleHeight - 5, paddleWidth, paddleHeight, 5);
      ctx!.fillStyle = "#6366f1";
      ctx!.fill();
      ctx!.closePath();
    }

    function collisionDetection() {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const b = bricks[c][r];
          if (b.status === 1) {
            if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
              dy = -dy;
              b.status = 0;
              setScore(s => s + 15);
              // Aceleración Progresiva
              dx *= 1.01;
              dy *= 1.01;
            }
          }
        }
      }
    }

    function draw() {
      if (gameOver) return;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      
      // Dibujar Ladrillos
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
      collisionDetection();

      // Rebotes laterales
      if (x + dx > canvas!.width - ballRadius || x + dx < ballRadius) dx = -dx;
      // Rebote superior
      if (y + dy < ballRadius) dy = -dy;
      // Rebote inferior (Pala o Muerte)
      else if (y + dy > canvas!.height - ballRadius - 5) {
        if (x > paddleX && x < paddleX + paddleWidth) {
          // FÍSICA PRO: Ángulo basado en dónde golpea la pala
          let hitPoint = (x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
          dx = hitPoint * baseSpeed * 1.5;
          dy = -Math.abs(dy);
        } else {
          setLives(l => {
            if (l <= 1) {
              setGameOver(true);
              return 0;
            }
            // Reset posición bola
            x = canvas!.width / 2;
            y = canvas!.height - 30;
            dx = baseSpeed;
            dy = -baseSpeed;
            return l - 1;
          });
        }
      }

      if (rightPressed && paddleX < canvas!.width - paddleWidth) paddleX += 8;
      else if (leftPressed && paddleX > 0) paddleX -= 8;

      x += dx;
      y += dy;
      if (!gameOver) requestAnimationFrame(draw);
    }

    draw();

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
      document.removeEventListener("keyup", keyUpHandler);
      document.removeEventListener("mousemove", mouseMoveHandler);
    };
  }, [gameOver]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      runGame();
    }
  }, [gameStarted, gameOver, runGame]);

  return (
    <div className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-xl flex items-center justify-center p-0 md:p-4">
      <div ref={containerRef} className="relative bg-[#050505] w-full max-w-[700px] aspect-[4/5] md:aspect-video border border-white/10 md:rounded-[32px] overflow-hidden flex flex-col">
        
        {/* Cabecera Pro */}
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex gap-4">
             <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                <Zap size={14} className="text-indigo-400" />
                <span className="font-mono font-bold text-indigo-400 uppercase text-xs">{score}</span>
             </div>
             <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                <Heart size={14} className="text-red-400" />
                <span className="font-mono font-bold text-red-400 text-xs">{lives}</span>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <XCircle size={28} />
          </button>
        </div>

        {/* Área de Juego */}
        <div className="relative flex-1 bg-black touch-none">
          <canvas 
            ref={canvasRef} 
            width={650} 
            height={450} 
            className="w-full h-full object-contain"
            style={{ touchAction: 'none' }}
          />

          {!gameStarted && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-6">
              <h2 className="text-4xl font-black italic mb-4 tracking-tighter uppercase">Arcanoid <span className="text-indigo-500">Pro</span></h2>
              <p className="text-gray-400 mb-8 text-sm uppercase tracking-widest max-w-xs">Física real. Control táctil de alta precisión. Máximo rendimiento.</p>
              <button 
                onClick={() => setGameStarted(true)}
                className="bg-white text-black px-12 py-4 rounded-full font-bold uppercase hover:bg-indigo-500 hover:text-white transition-all scale-110"
              >
                Comenzar Partida
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center">
              <Trophy size={60} className="text-indigo-500 mb-6 animate-pulse" />
              <h3 className="text-5xl font-black text-white mb-2 uppercase italic">Game Over</h3>
              <p className="text-xl text-indigo-400 font-mono mb-8 uppercase tracking-widest">Score: {score}</p>
              <button 
                onClick={() => { window.location.reload(); }}
                className="bg-indigo-600 text-white px-10 py-4 rounded-full font-bold uppercase hover:bg-indigo-700 transition-all"
              >
                Reiniciar Sistema
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}