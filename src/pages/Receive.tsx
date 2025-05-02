
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import PeerConnection from '@/components/PeerConnection';
import { getRandomMessage, statusMessages, funnyLoadingPhrases } from '@/utils/chaoticMessages';
import { Laugh, PartyPopper, Smile } from 'lucide-react';

const Receive = () => {
  const [searchParams] = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [randomTip, setRandomTip] = useState<string>("");
  
  // Random tips that appear
  const tips = [
    "Try standing on your head while files transfer for better luck",
    "If transfer fails, try sacrificing a rubber duck to the coding gods",
    "For best results, perform the file transfer dance around your device",
    "9 out of 10 digital hamsters recommend this file transfer method",
    "Your file is being escorted by elite pixel bodyguards",
    "Files transfer faster if you squint at the screen really hard",
    "Secret tip: Yelling at your computer doesn't actually help",
    "If all else fails, try turning it off and... nope, just off",
  ];
  
  // Extract connection ID from URL
  const connectionId = searchParams.get('connect');
  
  useEffect(() => {
    // Set a random tip
    setRandomTip(tips[Math.floor(Math.random() * tips.length)]);
    
    if (connectionId) {
      setIsConnecting(true);
      
      // Log the connection ID for debugging
      console.log("Attempting to connect with ID:", connectionId);
      
      toast({
        title: "Auto-connecting...",
        description: getRandomMessage(statusMessages),
      });
    }
  }, [connectionId]);
  
  const handleReset = () => {
    setFiles([]);
    window.location.href = '/'; // Redirect to home page on reset
    
    toast({
      title: "Reset",
      description: "Everything is gone forever now",
    });
  };
  
  const handleFunnyMessage = () => {
    toast({
      title: "Pro Tip",
      description: tips[Math.floor(Math.random() * tips.length)],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-cyan-100 to-yellow-100 py-8 px-4 relative overflow-hidden">
      {/* Fun background elements */}
      <div className="absolute top-40 left-10 text-6xl animate-pulse opacity-30">📥</div>
      <div className="absolute bottom-40 right-10 text-6xl animate-bounce opacity-30">📂</div>
      <div className="absolute top-2/3 left-1/3 text-7xl animate-spin-slow opacity-20">💾</div>
      
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-12 relative">
          <h1 className="text-5xl font-comic font-bold bg-clip-text text-transparent bg-gradient-to-r from-chaos-neon1 to-chaos-neon2 chaotic-rotate mb-4">
            UhhJustTakeIt
          </h1>
          <p className="text-lg text-gray-600 chaotic-rotate-reverse">
            Receiving Files Mode <span className="text-xs">(we hope)</span>
          </p>
          
          <Button
            onClick={handleFunnyMessage}
            className="mt-2 bg-transparent hover:bg-transparent text-gray-500 hover:text-chaos-neon1 px-0"
            variant="ghost"
          >
            <Smile className="w-4 h-4 mr-1" />
            <span className="text-xs underline">Helpful Tip</span>
          </Button>
        </header>
        
        <div className="bg-white rounded-xl p-6 shadow-xl chaotic-shadow">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-comic font-bold text-chaos-neon1 mb-2 flex items-center justify-center">
              <PartyPopper className="mr-2" />
              Ready to receive files
            </h2>
            <p className="text-gray-600">
              {connectionId 
                ? `Connecting to sender ID: ${connectionId}...` 
                : "No connection ID provided. Add ?connect=ID to the URL."}
            </p>
            <p className="text-xs text-gray-400 mt-1 italic">
              {randomTip}
            </p>
          </div>
          
          <PeerConnection 
            files={files} 
            onReset={handleReset}
            initialConnectionId={connectionId || ''}
            receiveMode={true}
          />
          
          <div className="mt-8">
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline" 
              className="w-full group"
            >
              <Laugh className="mr-2 group-hover:rotate-12" />
              Go to Sending Mode
            </Button>
          </div>
        </div>
        
        <footer className="mt-8 text-center text-sm text-gray-500 chaotic-rotate">
          <p>
            Made with <span className="text-red-500">♥</span> and questionable design choices
            <br/>
            <span className="text-xs">File reception success rate: yes%</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Receive;
