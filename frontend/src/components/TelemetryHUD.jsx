import React from 'react';
import { Html } from '@react-three/drei';

export default function TelemetryHUD({ scrollProgress }) {
  return (
    <>
      <Html position={[0, 3.4, 0]} distanceFactor={7} zIndexRange={[100, 0]}>
        <div className="flex flex-col items-center select-none pointer-events-none">
          <div className="text-[10px] tracking-[0.2em] font-extrabold text-[#46F3FF] bg-[#050816]/75 border border-[#46F3FF]/30 px-3 py-1 rounded-full uppercase backdrop-blur-md whitespace-nowrap shadow-xl">
            StadiumOS Digital Twin
          </div>
          <div className="w-[1px] h-10 bg-gradient-to-b from-[#46F3FF] to-transparent mt-1"></div>
        </div>
      </Html>

      {scrollProgress > 0.1 && (
        <Html position={[4.2, 1.8, 2.5]} distanceFactor={7} zIndexRange={[100, 0]}>
          <div className="p-2 bg-slate-950/80 border border-emerald-500/30 rounded-xl text-[10px] text-white backdrop-blur shadow-2xl min-w-[120px]">
            <div className="text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Live Telemetry
            </div>
            <div className="font-medium text-slate-300">Concourse Flow: Normal</div>
            <div className="font-semibold text-emerald-400">Rate: 1.2 fans/sec</div>
          </div>
        </Html>
      )}

      {scrollProgress > 0.3 && (
        <Html position={[-4.5, 1.2, 1.5]} distanceFactor={7} zIndexRange={[100, 0]}>
          <div className="p-2 bg-slate-950/80 border border-amber-500/30 rounded-xl text-[10px] text-white backdrop-blur shadow-2xl min-w-[120px]">
            <div className="text-amber-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span> Crowd Warning
            </div>
            <div className="font-medium text-slate-300">Gate C: High Flow</div>
            <div className="font-semibold text-amber-400">Bypass Route 1 Active</div>
          </div>
        </Html>
      )}
    </>
  );
}
