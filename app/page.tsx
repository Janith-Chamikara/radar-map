"use client";
import { useState } from "react";
import HackerRadar from "@/components/hacker-radar";

export default function Home() {
  const [targetImage, setTargetImage] = useState("/wanted.png");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-mono text-xl font-bold text-green-500">
            SYSTEM INFILTRATION
          </h1>
          <div className="font-mono text-sm text-green-400">
            <span className="animate-pulse">SCANNING...</span>
            <span className="ml-2">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-md border border-green-500/30 bg-black p-4 shadow-lg shadow-green-500/10">
          <div className="absolute left-2 top-2 font-mono text-xs text-green-500">
            TARGET ACQUISITION
          </div>
          <div className="absolute right-2 top-2 font-mono text-xs text-green-500">
            SEC LEVEL: ALPHA
          </div>

          <HackerRadar targetImagePath={targetImage} />

          <div className="mt-4 grid grid-cols-2 gap-4 font-mono text-xs text-green-400">
            <div>
              <div className="mb-1 text-green-500">TARGET INFO</div>
              <div>ID: XR-7429</div>
              <div>TYPE: SECURE SERVER</div>
              <div>VULN: HIGH</div>
            </div>
            <div>
              <div className="mb-1 text-green-500">SYSTEM STATUS</div>
              <div>CPU: 87%</div>
              <div>MEM: 1.2GB/8GB</div>
              <div>UPTIME: 14:27:33</div>
            </div>
          </div>

          <div className="mt-4 flex justify-center gap-4"></div>
        </div>

        <div className="mt-4 font-mono text-xs text-green-500/70">
          <div className="animate-typing overflow-hidden whitespace-nowrap">
            &gt; Initializing breach protocol... Target identified... Preparing
            exploit vectors...
          </div>
        </div>
      </div>
    </main>
  );
}
