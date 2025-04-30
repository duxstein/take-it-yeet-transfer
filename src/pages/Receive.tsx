
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import PeerConnection from '@/components/PeerConnection';
import { getRandomMessage, statusMessages } from '@/utils/chaoticMessages';

const Receive = () => {
  const [searchParams] = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  
  // Extract connection ID from URL
  const connectionId = searchParams.get('connect');
  
  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-cyan-100 to-yellow-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-comic font-bold bg-clip-text text-transparent bg-gradient-to-r from-chaos-neon1 to-chaos-neon2 chaotic-rotate mb-4">
            UhhJustTakeIt
          </h1>
          <p className="text-lg text-gray-600 chaotic-rotate-reverse">
            Receiving Files Mode
          </p>
        </header>
        
        <div className="bg-white rounded-xl p-6 shadow-xl chaotic-shadow">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-comic font-bold text-chaos-neon1 mb-2">
              Ready to receive files
            </h2>
            <p className="text-gray-600">
              {connectionId 
                ? `Connecting to sender ID: ${connectionId}...` 
                : "No connection ID provided. Add ?connect=ID to the URL."}
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
              className="w-full"
            >
              Go to Sending Mode
            </Button>
          </div>
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

export default Receive;
