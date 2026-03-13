'use client';
import React, { useEffect, useRef, useState } from 'react';
import { XCircle, Trophy } from 'lucide-react';

export default function Arcanoid({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuración básica
    let x = canvas.width / 2;
    let y = canvas.height - 30;
    let dx = 3;
    let dy = -3;
    const ballRadius = 8;
    const paddleHeight = 10;
    const paddleWidth = 75;
    let paddleX = (canvas.width - paddleWidth) / 2;
    let rightPressed = false;
    let leftPressed = false;

    // Ladrillos
    const brickRowCount = 5;
    const brickColumnCount = 8;
    const brickWidth = 70;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 35;

    const bricks: any[] = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }

    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
      else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
    };
    const keyUpHandler = (e: KeyboardEvent) => {
      if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
      else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
    };

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    function collisionDetection() {
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
    }

    function drawBall() {
      ctx!.beginPath();
      ctx!.arc(x, y, ballRadius, 0, Math.PI * 2);
      ctx!.fillStyle = "#6366f1"; // Indigo-500
      ctx!.fill();
      ctx!.closePath();
    }

    function drawPaddle() {
      ctx!.beginPath();
      ctx!.rect(paddleX, canvas!.height - paddleHeight, paddleWidth, paddleHeight);
      ctx!.fillStyle = "#ffffff";
      ctx!.fill();
      ctx!.closePath();
    }

    function drawBricks() {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx!.beginPath();
            ctx!.rect(brickX, brickY, brickWidth, brickHeight);
            ctx!.fillStyle = r % 2 === 0 ? "#4f46e5" : "#312e81";
            ctx!.fill();
            ctx!.closePath();
          }
        }
      }
    }

    function draw() {
      if (gameOver) return;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      drawBricks();
      drawBall();
      drawPaddle();
      collisionDetection();

      if (x + dx > canvas!.width - ballRadius || x + dx < ballRadius) dx = -dx;
      if (y + dy < ballRadius) dy = -dy;
      else if (y + dy > canvas!.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) dy = -dy;
        else {
          setGameOver(true);
          return;
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
    };
  }, [gameOver]);

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[40px] p-8 max-w-4xl w-full shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
          <XCircle size={32} />
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">Arcanoid <span className="text-indigo-500">A-WEB</span></h2>
          <div className="flex justify-center gap-8 mt-4 font-mono text-xl text-indigo-400">
            <span>SCORE: {score}</span>
          </div>
        </div>

        <div className="relative bg-black/50 rounded-2xl border border-white/5 overflow-hidden flex justify-center">
          <canvas ref={canvasRef} width={650} height={400} className="max-w-full h-auto" />
          
          {gameOver && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center">
              <Trophy size={64} className="text-yellow-500 mb-4 animate-bounce" />
              <h3 className="text-5xl font-black text-white mb-2 uppercase">Game Over</h3>
              <p className="text-gray-400 mb-8 uppercase tracking-widest">Final Score: {score}</p>
              <button 
                onClick={() => { setScore(0); setGameOver(false); }}
                className="bg-indigo-600 text-white px-10 py-4 rounded-full font-bold uppercase hover:bg-indigo-700 transition-all"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>
        
        <p className="text-center text-gray-500 mt-6 text-xs uppercase tracking-widest">Usa las flechas del teclado para mover la plataforma</p>
      </div>
    </div>
  );
}