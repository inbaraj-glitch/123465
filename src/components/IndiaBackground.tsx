/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Landmark, Network, Sparkles, TrendingUp } from "lucide-react";

export default function IndiaBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#081426]">
      {/* Dynamic Saffron/White/Green soft background radial glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-orange-600/10 blur-[150px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/[0.02] blur-[180px]" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-[150px]" />

      {/* Cyber Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Animated network constellation particles */}
      <div className="absolute top-1/4 left-1/3 text-blue-500/20 animate-pulse">
        <Network size={200} strokeWidth={0.5} />
      </div>
      <div className="absolute bottom-1/4 right-1/4 text-emerald-500/10 animate-pulse [animation-delay:2s]">
        <Network size={160} strokeWidth={0.5} />
      </div>

      {/* India Map Silhouette & Tricolor Center Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.035]">
        <svg
          viewBox="0 0 1000 1100"
          className="w-[80vh] h-[80vh] text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          {/* Conceptual Stylized India Map path */}
          <path
            d="M 500,100 
               C 520,120 550,150 560,180
               C 570,210 590,220 610,230
               C 630,240 650,220 660,240
               C 670,260 660,300 680,320
               C 700,340 730,330 750,350
               C 770,370 780,400 770,420
               C 760,440 720,430 710,450
               C 700,470 720,500 700,520
               C 680,540 650,530 630,550
               C 610,570 590,610 590,640
               C 590,670 630,710 650,740
               C 670,770 680,810 660,840
               C 640,870 590,870 570,900
               C 550,930 530,970 510,1020
               C 500,1040 495,1040 490,1020
               C 470,970 450,930 430,900
               C 410,870 360,870 340,840
               C 320,810 330,770 350,740
               C 370,710 410,670 410,640
               C 410,610 390,570 370,550
               C 350,530 320,540 300,520
               C 280,500 300,470 290,450
               C 280,430 240,440 230,420
               C 220,400 230,370 250,350
               C 270,330 300,340 320,320
               C 340,300 330,260 340,240
               C 350,220 370,240 390,230
               C 410,220 430,210 440,180
               C 450,150 480,120 500,100 Z"
            fill="url(#tricolorGrad)"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="3"
          />
          <defs>
            <linearGradient id="tricolorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF9933" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#128807" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Ashoka Chakra integrated inside the India map */}
        <div className="absolute w-36 h-36 border-[4px] border-dashed border-blue-500/40 rounded-full animate-[spin_40s_linear_infinite] flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-500/60 rounded-full" />
          {Array.from({ length: 24 }).map((_, idx) => (
            <div
              key={idx}
              className="absolute w-0.5 h-16 bg-blue-500/30 origin-bottom"
              style={{
                transform: `rotate(${idx * 15}deg) translateY(-32px)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating Rupees Symbols & Particles */}
      <div className="absolute inset-0">
        <div className="absolute top-1/6 left-[12%] text-orange-500/10 text-4xl font-semibold animate-bounce [animation-duration:8s]">₹</div>
        <div className="absolute top-[55%] left-[8%] text-blue-500/10 text-5xl font-semibold animate-pulse">₹</div>
        <div className="absolute top-[20%] right-[15%] text-emerald-500/10 text-4xl font-semibold animate-bounce [animation-duration:10s]">₹</div>
        <div className="absolute bottom-[20%] right-[10%] text-saffron-500/10 text-5xl font-semibold animate-pulse">₹</div>
        <div className="absolute top-[45%] right-[22%] text-white/[0.03] text-6xl font-light">₹</div>

        {/* Particles / Sparkles */}
        <div className="absolute top-1/3 right-1/3 text-yellow-500/15 animate-ping [animation-duration:4s]">
          <Sparkles size={24} />
        </div>
        <div className="absolute bottom-1/3 left-1/4 text-emerald-500/15 animate-ping [animation-duration:6s]">
          <Sparkles size={16} />
        </div>
      </div>

      {/* Indian Landmarks Silhouettes at the very bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-44 opacity-[0.06] flex items-end justify-between px-12 select-none pointer-events-none">
        {/* Gateway of India / Mumbai */}
        <div className="flex flex-col items-center">
          <svg className="w-24 h-24 text-white fill-current" viewBox="0 0 100 100">
            <path d="M 10,95 L 90,95 L 90,85 L 85,85 L 85,30 L 75,20 L 70,30 L 65,30 L 65,55 C 65,40 35,40 35,55 L 35,30 L 30,30 L 25,20 L 15,30 L 15,85 L 10,85 Z" />
          </svg>
          <span className="text-[10px] font-mono tracking-widest mt-1 uppercase text-gray-500">Gateway of India</span>
        </div>

        {/* Qutub Minar / Delhi */}
        <div className="flex flex-col items-center">
          <svg className="w-16 h-36 text-white fill-current" viewBox="0 0 60 120">
            <path d="M 25,120 L 35,120 L 33,10 L 27,10 Z M 22,110 L 38,110 L 37,108 L 23,108 Z M 24,80 L 36,80 L 35,78 L 25,78 Z M 26,50 L 34,50 L 33,48 L 27,48 Z" />
          </svg>
          <span className="text-[10px] font-mono tracking-widest mt-1 uppercase text-gray-500">Qutub Minar</span>
        </div>

        {/* Taj Mahal / Agra */}
        <div className="flex flex-col items-center">
          <svg className="w-36 h-28 text-white fill-current" viewBox="0 0 160 100">
            {/* Minarets */}
            <path d="M 15,95 L 20,95 L 18,10 L 17,10 Z" />
            <path d="M 140,95 L 145,95 L 143,10 L 142,10 Z" />
            {/* Main structure */}
            <path d="M 30,95 L 130,95 L 130,50 L 115,50 L 115,35 L 100,35 C 100,10 60,10 60,35 L 45,35 L 45,50 L 30,50 Z" />
            {/* Arches */}
            <path d="M 70,95 C 70,75 90,75 90,95 Z" fill="#081426" />
          </svg>
          <span className="text-[10px] font-mono tracking-widest mt-1 uppercase text-gray-500">Taj Mahal</span>
        </div>

        {/* India Gate / Delhi */}
        <div className="flex flex-col items-center">
          <svg className="w-24 h-28 text-white fill-current" viewBox="0 0 100 100">
            <path d="M 15,95 L 85,95 L 85,85 L 75,85 L 75,30 L 70,20 L 30,20 L 25,30 L 25,85 L 15,85 Z" />
            <path d="M 35,95 C 35,60 65,60 65,95 Z" fill="#081426" />
          </svg>
          <span className="text-[10px] font-mono tracking-widest mt-1 uppercase text-gray-500">India Gate</span>
        </div>

        {/* Charminar / Hyderabad */}
        <div className="flex flex-col items-center">
          <svg className="w-28 h-28 text-white fill-current" viewBox="0 0 100 100">
            {/* 4 Minarets and central archway */}
            <path d="M 5,95 L 95,95 L 95,85 L 90,85 L 90,40 L 95,40 L 95,10 L 90,10 L 90,40 L 80,40 L 80,85 L 20,85 L 20,40 L 10,40 L 10,10 L 5,10 L 5,40 L 10,40 L 10,85 L 5,85 Z" />
            <path d="M 30,95 C 30,65 70,65 70,95 Z" fill="#081426" />
          </svg>
          <span className="text-[10px] font-mono tracking-widest mt-1 uppercase text-gray-500">Charminar</span>
        </div>
      </div>
    </div>
  );
}
