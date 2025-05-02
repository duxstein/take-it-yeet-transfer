
import React, { useState, useEffect } from 'react';
import FileDrop from '@/components/FileDrop';
import PeerConnection from '@/components/PeerConnection';
import { getRandomMessage, statusMessages, funnyLoadingPhrases } from '@/utils/chaoticMessages';
import { playRandomSound } from '@/utils/soundEffects';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Laugh, PartyPopper, Smile, Sparkles, Dices, Zap } from 'lucide-react';

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [fakeLoading, setFakeLoading] = useState<string | null>(null);
  const [randomEmoji, setRandomEmoji] = useState<string>("⚡");
  
  // Random emoji effect
  useEffect(() => {
    const emojis = ["⚡", "💫", "✨", "🚀", "⚡", "💨", "🔥", "💎", "🌟", "✨", "💯", "🌈"];
    const interval = setInterval(() => {
      setRandomEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  const handleFilesAdded = (newFiles: File[]) => {
    // Fake loading for comedic effect - but make it faster
    setFakeLoading(funnyLoadingPhrases[Math.floor(Math.random() * funnyLoadingPhrases.length)]);
    
    setTimeout(() => {
      setFiles(newFiles);
      setShowInstructions(false);
      setFakeLoading(null);
      
      toast({
        title: "Files added",
        description: getRandomMessage(statusMessages),
      });
      
      // 50% chance to play a sound on file add
      if (Math.random() > 0.5) {
        playRandomSound();
      }
    }, 500); // Reduced from 1500ms to 500ms for faster response
  };
  
  const handleReset = () => {
    setFiles([]);
    setShowInstructions(true);
    
    // 50% chance to play a sound on reset
    if (Math.random() > 0.5) {
      playRandomSound();
    }
    
    toast({
      title: "Reset",
      description: "Everything is gone forever now",
    });
  };
  
  const handleRandomMessage = () => {
    toast({
      title: "Random Update",
      description: getRandomMessage(statusMessages),
    });
    
    // 80% chance to play a sound
    if (Math.random() > 0.2) {
      playRandomSound();
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-emerald-100 to-amber-100 py-8 px-4 relative overflow-hidden">
      {/* Fun background elements */}
      <div className="absolute top-20 right-10 text-6xl animate-bounce opacity-30">⚡</div>
      <div className="absolute bottom-20 left-10 text-6xl animate-pulse opacity-30">🚀</div>
      <div className="absolute top-1/3 left-1/4 text-7xl animate-spin-slow opacity-20">💫</div>
      
      <div className="max-w-2xl mx-auto relative">
        <header className="text-center mb-12 relative">
          <div className="absolute -top-10 -right-10 text-6xl rotate-12 animate-spark">{randomEmoji}</div>
          
          <h1 className="text-5xl font-comic font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-emerald-500 chaotic-rotate mb-4 flex items-center justify-center">
            <Zap className="mr-2 h-8 w-8" /> UhhJustTakeIt
          </h1>
          <p className="text-lg text-gray-600 chaotic-rotate-reverse">
            The <span className="text-indigo-600 font-bold">HYPER-SPEED</span> file transfer app
          </p>
          
          {/* Hidden button that does absolutely nothing but show a random status message */}
          <Button 
            onClick={handleRandomMessage} 
            className="mt-4 animate-pulse bg-amber-400 hover:bg-amber-500 text-black group"
          >
            <Laugh className="mr-2 group-hover:animate-spin" />
            Do something (in milliseconds!)
          </Button>
        </header>
        
        <div className="bg-white rounded-xl p-6 shadow-neon relative">
          {fakeLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
              <div className="text-center">
                <div className="text-3xl animate-bounce mb-4">⚙️</div>
                <p className="text-xl font-comic font-bold text-indigo-600">{fakeLoading}</p>
                <p className="text-sm text-gray-500 mt-2">Processing at HYPER SPEED!</p>
              </div>
            </div>
          )}
          
          {files.length > 0 ? (
            <div className="mb-4">
              <h2 className="text-lg font-comic font-bold mb-2 chaotic-rotate flex items-center">
                <PartyPopper className="mr-2 text-indigo-600" /> Selected Files:
              </h2>
              <ul className="bg-gray-50 rounded p-3">
                {files.map((file, index) => (
                  <li key={index} className="py-1 flex justify-between">
                    <span className="truncate">{file.name}</span>
                    <span className="text-gray-500 text-sm">{(file.size / 1024).toFixed(1)} KB</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <FileDrop onFilesAdded={handleFilesAdded} disabled={false} />
          )}
          
          {files.length > 0 && <PeerConnection files={files} onReset={handleReset} />}
          
          {showInstructions && (
            <div className="mt-8 p-4 border-2 border-dashed border-indigo-200 rounded-lg">
              <h2 className="text-lg font-comic font-bold chaotic-rotate flex items-center">
                <Dices className="mr-2 text-indigo-600" /> 
                How it works (at HYPER SPEED):
              </h2>
              <ol className="list-decimal pl-5 mt-2 space-y-1 text-gray-600">
                <li>Drop your files in the box above <span className="text-emerald-500 font-bold">INSTANTLY</span></li>
                <li>Share your ID with someone else using this site</li>
                <li>They connect to you using your ID <span className="text-xs">(at the speed of light)</span></li>
                <li>Click the big HYPER-SPEED TRANSFER button</li>
                <li>The files teleport straight to them <span className="text-xs">(milliseconds only)</span></li>
                <li>Enjoy your lightning-fast transfers <span className="text-xs">(faster than a sneeze)</span></li>
              </ol>
              
              <p className="mt-4 text-sm text-gray-500 italic">
                * This actually uses WebRTC for peer-to-peer file transfer with no server storage
                <br/>
                <span className="text-xs">Unlike other parts of this app, this statement is 100% true</span>
              </p>
            </div>
          )}
        </div>
        
        <footer className="mt-8 text-center text-sm text-gray-500 chaotic-rotate">
          <p>
            Made with <span className="text-red-500">♥</span> and questionable design choices
            <br/>
            <span className="text-xs">Transfer speed: SUPER DUPER FAST™</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
