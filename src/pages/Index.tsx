
import React, { useState } from 'react';
import FileDrop from '@/components/FileDrop';
import PeerConnection from '@/components/PeerConnection';
import { getRandomMessage, statusMessages } from '@/utils/chaoticMessages';
import { playRandomSound } from '@/utils/soundEffects';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const handleFilesAdded = (newFiles: File[]) => {
    setFiles(newFiles);
    setShowInstructions(false);
    
    toast({
      title: "Files added",
      description: getRandomMessage(statusMessages),
    });
  };
  
  const handleReset = () => {
    setFiles([]);
    setShowInstructions(true);
    
    // 30% chance to play a sound on reset
    if (Math.random() > 0.7) {
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
    
    // 50% chance to play a sound
    if (Math.random() > 0.5) {
      playRandomSound();
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-cyan-100 to-yellow-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-comic font-bold bg-clip-text text-transparent bg-gradient-to-r from-chaos-neon1 to-chaos-neon2 chaotic-rotate mb-4">
            UhhJustTakeIt
          </h1>
          <p className="text-lg text-gray-600 chaotic-rotate-reverse">
            A ridiculously simple file transfer thing
          </p>
          
          {/* Hidden button that does absolutely nothing but show a random status message */}
          <Button 
            onClick={handleRandomMessage} 
            className="mt-4 animate-pulse bg-chaos-neon3 hover:bg-chaos-neon3/80 text-black"
            variant="outline"
          >
            Do something (maybe)
          </Button>
        </header>
        
        <div className="bg-white rounded-xl p-6 shadow-xl chaotic-shadow">
          {files.length > 0 ? (
            <div className="mb-4">
              <h2 className="text-lg font-comic font-bold mb-2 chaotic-rotate">Selected Files:</h2>
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
            <div className="mt-8 p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <h2 className="text-lg font-comic font-bold chaotic-rotate">How it works (kinda):</h2>
              <ol className="list-decimal pl-5 mt-2 space-y-1 text-gray-600">
                <li>Drop your files in the box above</li>
                <li>Share your ID with someone else using this site</li>
                <li>They connect to you using your ID</li>
                <li>Click the big JUST TAKE IT button</li>
                <li>The files go straight to them (no server storage)</li>
                <li>Hope for the best</li>
              </ol>
              
              <p className="mt-4 text-sm text-gray-500 italic">
                * This actually uses WebRTC for peer-to-peer file transfer with no server storage
              </p>
            </div>
          )}
        </div>
        
        <footer className="mt-8 text-center text-sm text-gray-500 chaotic-rotate">
          <p>
            Made with <span className="text-red-500">♥</span> and questionable design choices
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
