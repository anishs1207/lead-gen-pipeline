"use client";

import React, { useState } from "react";
import { Play, Music, Video, FileText, Settings, Subtitles, Download, Sparkles, Mic } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export default function ExplainerVideoGenerator() {
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState("");
  const [bgClip, setBgClip] = useState("subway_surfer_01.mp4");
  const [musicTrack, setMusicTrack] = useState("lofi_chill_01.mp3");
  const [voice, setVoice] = useState("elevenlabs_josh");
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(1);

  // Date: 2026-03-20
  // Step 1: Generate Script using Gemini AI based on the user's topic
  const generateScript = async () => {
    setGenerating(true);
    // Simulated Gemini AI Script Generation
    setTimeout(() => {
      setScript(
        `Did you know that water makes up about 60% of the human body? \n\nEvery day you lose water through your breath, perspiration, urine and bowel movements.\n\nFor your body to function properly, you must replenish its water supply by consuming beverages and foods that contain water.\n\nStay hydrated!`
      );
      setGenerating(false);
      setStep(2);
    }, 1500);
  };

  // Date: 2026-03-20
  // Step 2: Combine Script with Audio, Video, and Subtitles to generate the final explainer
  const generateVideo = () => {
    setGenerating(true);
    // Simulated Assembly Process Timeline Generation & Subtitling
    setTimeout(() => {
      setGenerating(false);
      setStep(3);
    }, 3000);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 bg-zinc-950 text-white rounded-xl border border-zinc-800 shadow-2xl mt-12">
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <Sparkles className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold tracking-tight">AI Explainer Video Generator</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Settings and Inputs */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">1. Video Topic for Gemini AI</label>
            <Textarea
              className="resize-none bg-zinc-900 border-zinc-700 h-24 text-white hover:border-blue-500 focus:border-blue-500"
              placeholder="e.g. The importance of drinking water..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all font-semibold" 
              onClick={generateScript}
              disabled={!topic || generating}
            >
              {generating && step === 1 ? "Generating Script..." : "Generate Script"}
            </Button>
          </div>

          {step >= 2 && (
            <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-500">
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" /> 2. Review generated script
                </label>
                <Textarea
                  className="bg-zinc-900 border-zinc-700 h-40 font-mono text-sm leading-relaxed text-white hover:border-blue-500 focus:border-blue-500"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-purple-400" /> 3. Video Assembly Assets
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 flex items-center gap-1"><Video className="w-3 h-3"/> Gameplay Clip</label>
                    <select 
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      value={bgClip}
                      onChange={(e) => setBgClip(e.target.value)}
                    >
                      <option value="subway_surfer_01.mp4">Subway Surfers</option>
                      <option value="minecraft_parkour.mp4">Minecraft Parkour</option>
                      <option value="gta_racing.mp4">GTA 5 Racing</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-xs text-zinc-500 flex items-center gap-1"><Music className="w-3 h-3"/> Background Music</label>
                     <select 
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      value={musicTrack}
                      onChange={(e) => setMusicTrack(e.target.value)}
                    >
                      <option value="lofi_chill_01.mp3">Lofi Chill</option>
                      <option value="sigma_drift.mp3">Phonk Drift</option>
                      <option value="ambient_focus.mp3">Ambient Focus</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                     <label className="text-xs text-zinc-500 flex items-center gap-1"><Mic className="w-3 h-3"/> Text-to-Speech Voice</label>
                     <select 
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      value={voice}
                      onChange={(e) => setVoice(e.target.value)}
                    >
                      <option value="elevenlabs_josh">Josh (Deep, Engaging)</option>
                      <option value="elevenlabs_rachel">Rachel (Energetic)</option>
                      <option value="tiktok_default">TikTok Standard</option>
                    </select>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 shadow-lg hover:shadow-green-900/50 transition-all border border-green-400/20" 
                onClick={generateVideo}
                disabled={generating}
              >
                {generating && step === 2 ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> 
                    Assembling Video & Subtitling Timeline...
                  </span>
                ) : (
                  <span className="flex items-center gap-2"><Play className="w-5 h-5"/> Generate Explainer Video</span>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Preview and Output */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden shadow-inner">
           {step === 3 ? (
             <div className="w-full h-full flex flex-col items-center justify-between text-center relative isolate animate-in zoom-in-95 duration-500">
                {/* Simulated Video Player */}
                <div className="absolute inset-0 bg-black rounded-lg overflow-hidden flex items-center justify-center border border-zinc-700 shadow-2xl">
                  {/* Fake background image representing the clip/gameplay */}
                  <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
                  
                  <div className="text-zinc-400 flex flex-col items-center gap-4 z-0 bg-black/50 p-6 rounded-2xl backdrop-blur-sm border border-white/5">
                     <Play className="w-16 h-16 opacity-80" />
                     <p className="font-semibold text-lg text-white">Video Preview Ready</p>
                     <div className="flex flex-col gap-1 items-center">
                        <p className="text-xs font-mono opacity-80 px-2 py-1 bg-zinc-800/80 rounded">Gameplay: {bgClip}</p>
                        <p className="text-xs font-mono opacity-80 px-2 py-1 bg-zinc-800/80 rounded">Music: {musicTrack}</p>
                     </div>
                  </div>

                  {/* Simulated Explainer Style Subtitles */}
                  <div className="absolute top-1/2 -translate-y-1/2 transform left-0 right-0 text-center px-4 z-10 font-sans flex flex-col items-center justify-center pointer-events-none">
                     <span className="bg-yellow-400 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-black font-black text-3xl px-4 py-2 leading-snug rounded-xl box-decoration-clone inline-block transform -rotate-2 border-4 border-black tracking-tight">
                        DID YOU KNOW
                     </span>
                     <span className="bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] text-black font-black text-3xl px-4 py-2 leading-snug rounded-xl box-decoration-clone inline-block transform rotate-1 border-4 border-black mt-2 tracking-tight">
                        THAT WATER
                     </span>
                  </div>
                </div>
                
                <div className="w-full mt-auto pt-4 relative z-20 flex justify-between gap-4 mt-96 bg-zinc-900/90 p-4 rounded-xl backdrop-blur-md border border-zinc-700/50 shadow-xl">
                  <Button className="flex-1 bg-white text-black hover:bg-gray-200 font-bold transition-transform hover:scale-105 active:scale-95">
                    <Download className="w-4 h-4 mr-2" /> Download MP4
                  </Button>
                  <Button className="flex-1 border-white/20 hover:bg-white/10 transition-colors" variant="outline">
                    <Subtitles className="w-4 h-4 mr-2" /> Export .SRT
                  </Button>
                </div>
             </div>
           ) : (
             <div className="text-center text-zinc-500 space-y-4">
               <Video className="w-24 h-24 mx-auto opacity-10" />
               <p className="max-w-[200px] text-sm opacity-60">Your fully assembled explainer video will appear here.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
