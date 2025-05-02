
import React, { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QRCodeSVG } from 'qrcode.react';
import { Link, Zap } from 'lucide-react';
import { getRandomMessage, errorMessages, statusMessages } from '@/utils/chaoticMessages';
import { playRandomSound } from '@/utils/soundEffects';
import { Peer, DataConnection } from 'peerjs';
import { generateShortUrl, storeIdMapping } from '@/utils/urlShortener';

interface PeerConnectionProps {
  files: File[];
  onReset: () => void;
  initialConnectionId?: string;
  receiveMode?: boolean;
}

const PeerConnection: React.FC<PeerConnectionProps> = ({ 
  files, 
  onReset, 
  initialConnectionId = '', 
  receiveMode = false 
}) => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [peerId, setPeerId] = useState<string>("");
  const [remotePeerId, setRemotePeerId] = useState<string>(initialConnectionId);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [status, setStatus] = useState<string>("initializing");
  const [receivedFiles, setReceivedFiles] = useState<{name: string, data: ArrayBuffer, type: string}[]>([]);
  const [showQrCode, setShowQrCode] = useState<boolean>(false);
  const [connectionAttempted, setConnectionAttempted] = useState<boolean>(false);
  
  // Initialize peer connection
  useEffect(() => {
    console.log("Initializing PeerConnection with initialConnectionId:", initialConnectionId);
    console.log("Receive mode:", receiveMode);
    
    const newPeer = new Peer();
    
    newPeer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
      setPeerId(id);
      setStatus("ready");
      
      // Sometimes show silly status
      if (Math.random() > 0.7) {
        setStatus(getRandomMessage(statusMessages));
      }
    });
    
    newPeer.on('connection', (conn) => {
      console.log("Incoming connection from:", conn.peer);
      setConnection(conn);
      setStatus("connected");
      toast({
        title: "Someone wants your data!",
        description: "Connection established... most likely",
      });
      
      setupConnectionHandlers(conn);
    });
    
    newPeer.on('error', (err) => {
      console.error('Peer connection error:', err);
      setStatus("error");
      toast({
        title: "Something broke!",
        description: getRandomMessage(errorMessages),
        variant: "destructive",
      });
      playRandomSound();
    });
    
    setPeer(newPeer);
    
    return () => {
      newPeer.destroy();
    };
  }, []);
  
  // Auto-connect when in receive mode and we have an initialConnectionId
  useEffect(() => {
    if (receiveMode && initialConnectionId && peer && peer.id && !connectionAttempted) {
      console.log("Auto-connecting to:", initialConnectionId);
      connectToPeer(initialConnectionId);
      setConnectionAttempted(true);
    }
  }, [receiveMode, initialConnectionId, peer, peer?.id, connectionAttempted]);
  
  const setupConnectionHandlers = (conn: DataConnection) => {
    conn.on('data', (data: any) => {
      console.log('Received data:', data);
      
      if (data.type === 'file-header') {
        // Prepare for file chunks
        setStatus(`Receiving: ${data.name}`);
        toast({
          title: "Incoming file!",
          description: `"${data.name}" is being yeeted to you at HYPER SPEED!`,
        });
      } else if (data.type === 'file-chunk') {
        // Handle file chunk - don't update status for every chunk to improve performance
        if (data.chunkIndex % 10 === 0) {
          setStatus(`Receiving chunk ${data.chunkIndex + 1}/${data.totalChunks}`);
        }
      } else if (data.type === 'file-complete') {
        // File transfer complete
        setReceivedFiles(prev => [...prev, {
          name: data.name,
          data: data.fileData,
          type: data.fileType
        }]);
        
        setStatus("transfer complete");
        toast({
          title: "File received!",
          description: `"${data.name}" has successfully invaded your computer at light speed`,
        });
      }
    });
    
    conn.on('open', () => {
      setStatus("connected");
    });
    
    conn.on('close', () => {
      setStatus("connection closed");
      setConnection(null);
    });
    
    conn.on('error', (err) => {
      console.error('Connection error:', err);
      toast({
        title: "Connection Error!",
        description: getRandomMessage(errorMessages),
        variant: "destructive",
      });
      playRandomSound();
      setStatus("error");
      setConnection(null);
    });
  };
  
  const connectToPeer = (idToConnect = remotePeerId) => {
    console.log("Attempting to connect to peer:", idToConnect);
    if (!peer || !idToConnect) {
      console.log("Cannot connect: peer or idToConnect is missing");
      return;
    }
    
    // Reduced chance for fake connection error to make things faster
    if (Math.random() > 0.95) {
      toast({
        title: "Connection failed!",
        description: getRandomMessage(errorMessages),
        variant: "destructive",
      });
      playRandomSound();
      return;
    }
    
    try {
      console.log("Creating connection to:", idToConnect);
      const conn = peer.connect(idToConnect);
      setConnection(conn);
      setStatus("connecting");
      
      setupConnectionHandlers(conn);
      
      toast({
        title: "Connecting...",
        description: getRandomMessage(statusMessages),
      });
    } catch (err) {
      console.error("Failed to connect:", err);
      toast({
        title: "Connection failed!",
        description: getRandomMessage(errorMessages),
        variant: "destructive",
      });
      playRandomSound();
    }
  };
  
  const sendFiles = async () => {
    if (!connection || files.length === 0) return;
    
    // Reduced chance to fail to make transfers more reliable
    if (Math.random() > 0.98) {
      toast({
        title: "Transfer failed!",
        description: getRandomMessage(errorMessages),
        variant: "destructive",
      });
      playRandomSound();
      return;
    }
    
    try {
      for (const file of files) {
        const fileReader = new FileReader();
        
        fileReader.onload = (e) => {
          if (!e.target || !e.target.result || !connection) return;
          
          const fileData = e.target.result as ArrayBuffer;
          // Increased chunk size for faster transfers - 64KB chunks
          const chunkSize = 65536; 
          const totalChunks = Math.ceil(fileData.byteLength / chunkSize);
          
          // Send file header first
          connection.send({
            type: 'file-header',
            name: file.name,
            size: file.size,
            fileType: file.type,
            totalChunks
          });
          
          // Send file in chunks - optimized to send more chunks at once
          for (let i = 0; i < totalChunks; i++) {
            const chunk = fileData.slice(i * chunkSize, (i + 1) * chunkSize);
            
            connection.send({
              type: 'file-chunk',
              chunkIndex: i,
              totalChunks,
              data: chunk
            });
            
            // Only update status occasionally to avoid unnecessary renders
            if (i % 10 === 0) {
              setStatus(`Sending chunk ${i + 1}/${totalChunks}`);
            }
          }
          
          // Send complete signal
          setTimeout(() => {
            connection.send({
              type: 'file-complete',
              name: file.name,
              fileType: file.type,
              fileData
            });
            
            toast({
              title: "File sent!",
              description: `"${file.name}" was yeeted at SUPER SPEED!`,
            });
            
            setStatus("transfer complete");
          }, 20); // Short delay for UI feedback
        };
        
        fileReader.readAsArrayBuffer(file);
      }
    } catch (err) {
      console.error("Error sending files:", err);
      toast({
        title: "Send failed!",
        description: getRandomMessage(errorMessages),
        variant: "destructive",
      });
      playRandomSound();
    }
  };
  
  const downloadFile = (index: number) => {
    const file = receivedFiles[index];
    const blob = new Blob([file.data], { type: file.type || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "File downloaded!",
      description: `"${file.name}" is now yours forever`,
    });
  };
  
  // Generate shareable connection URL
  const getConnectionUrl = () => {
    const url = new URL(window.location.href);
    // If we're already on the receive page, just update the connect param
    if (url.pathname === "/receive") {
      url.searchParams.set('connect', peerId);
      return url.toString();
    }
    // Otherwise create a URL to the receive page
    const receiveUrl = new URL("/receive", window.location.origin);
    receiveUrl.searchParams.set('connect', peerId);
    return receiveUrl.toString();
  };
  
  const getShortUrl = () => {
    if (!peerId) return '';
    storeIdMapping(peerId);
    return generateShortUrl(peerId);
  };
  
  const copyPeerId = (shortUrl = false) => {
    const urlToCopy = shortUrl ? getShortUrl() : getConnectionUrl();
    navigator.clipboard.writeText(urlToCopy);
    toast({
      title: "URL Copied!",
      description: shortUrl ? "Shortened URL copied to clipboard" : "Connection URL copied to clipboard",
    });
  };
  
  const toggleQrCode = () => {
    setShowQrCode(prev => !prev);
  };
  
  const handlePasteId = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Check if it's a URL with connection parameter
      try {
        const url = new URL(text);
        const connectionParam = url.searchParams.get('connect');
        if (connectionParam) {
          setRemotePeerId(connectionParam);
          toast({
            title: "ID Extracted!",
            description: "Connection ID extracted from URL",
          });
        } else {
          // If it's just an ID, use it directly
          setRemotePeerId(text);
          toast({
            title: "ID Pasted!",
            description: "Connection ID pasted from clipboard",
          });
        }
      } catch (e) {
        // Not a URL, just use as ID directly
        setRemotePeerId(text);
        toast({
          title: "ID Pasted!",
          description: "Connection ID pasted from clipboard",
        });
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
      toast({
        title: "Paste failed!",
        description: getRandomMessage(errorMessages),
        variant: "destructive",
      });
      playRandomSound();
    }
  };
  
  const getStatusEmoji = () => {
    switch(status) {
      case 'initializing': return '🤔';
      case 'ready': return '👍';
      case 'connecting': return '🔄';
      case 'connected': return '🤝';
      case 'transfer complete': return '✅';
      case 'error': return '💩';
      default: return '🤷‍♂️';
    }
  };

  return (
    <div className="space-y-6">
      {!receiveMode && (
        <div className="bg-white p-4 rounded-lg border-2 border-emerald-400 shadow-neon">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-comic font-bold text-indigo-600">Your Connection URL:</h3>
            <div className="flex gap-2">
              <Button 
                onClick={toggleQrCode} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={!peerId}
                title={showQrCode ? "Hide QR Code" : "Show QR Code"}
              >
                <Link className="h-4 w-4 mr-1" /> 
                {showQrCode ? "Hide" : "QR"}
              </Button>
              <Button 
                onClick={() => copyPeerId(false)} 
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={!peerId}
              >
                Copy URL
              </Button>
              <Button 
                onClick={() => copyPeerId(true)} 
                className="bg-amber-400 hover:bg-amber-500 text-black"
                disabled={!peerId}
              >
                Copy Short
              </Button>
            </div>
          </div>
          <div className="p-2 bg-gray-100 rounded flex items-center justify-between">
            <code className="font-mono text-sm break-all">
              {peerId ? getConnectionUrl().substring(0, 40) + '...' : "Generating..."}
            </code>
            <span className="ml-2 text-2xl">{getStatusEmoji()}</span>
          </div>
          
          {peerId && (
            <div className="mt-2 p-2 bg-gray-100 rounded flex items-center justify-between">
              <code className="font-mono text-sm">
                Short URL: {peerId ? getShortUrl() : "Generating..."}
              </code>
              <span className="ml-2 text-lg">🔗</span>
            </div>
          )}
          
          {showQrCode && peerId && (
            <div className="mt-4 p-4 bg-white border-2 border-indigo-300 rounded-lg flex flex-col items-center">
              <p className="text-sm text-gray-500 mb-2">Scan to connect:</p>
              <QRCodeSVG 
                value={getConnectionUrl()} 
                size={180} 
                bgColor={"#ffffff"} 
                fgColor={"#4f46e5"} 
                level={"L"} 
                includeMargin={false}
              />
            </div>
          )}
        </div>
      )}

      {!connection && !receiveMode && (
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex w-full gap-2">
            <Input 
              placeholder="Enter friend's ID or URL" 
              value={remotePeerId} 
              onChange={(e) => setRemotePeerId(e.target.value)}
              className="border-indigo-300"
            />
            <Button
              onClick={handlePasteId}
              className="bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
              title="Paste ID from clipboard"
            >
              Paste
            </Button>
          </div>
          <Button 
            onClick={() => connectToPeer()}
            className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
            disabled={!remotePeerId || status === 'connecting' || !!connection}
          >
            Connect
          </Button>
        </div>
      )}
      
      {receiveMode && status === "ready" && !connection && (
        <div className="flex justify-center">
          <div className="animate-pulse p-6 text-center">
            <p className="text-xl font-comic font-bold text-indigo-600">Waiting for connection...</p>
            <p className="text-gray-500 mt-2">{getStatusEmoji()}</p>
            <Button 
              onClick={() => {
                if (initialConnectionId) {
                  console.log("Manual reconnect to:", initialConnectionId);
                  connectToPeer(initialConnectionId);
                }
              }}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700"
              disabled={!initialConnectionId}
            >
              Retry Connection
            </Button>
          </div>
        </div>
      )}

      {status === 'connected' && files.length > 0 && !receiveMode && (
        <Button 
          onClick={sendFiles} 
          className="w-full p-6 text-2xl font-comic font-bold bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white animate-wiggle shadow-neon"
        >
          <Zap className="mr-2 h-6 w-6" /> HYPER-SPEED TRANSFER!
        </Button>
      )}

      <div className="p-4 border-2 border-amber-400 rounded-lg bg-white">
        <h3 className="font-comic font-bold mb-2 text-amber-600">Status: {getStatusEmoji()}</h3>
        <p className="text-gray-600 italic">{status}</p>
      </div>

      {receivedFiles.length > 0 && (
        <div className="border-2 border-emerald-400 rounded-lg p-4 bg-white">
          <h3 className="font-comic font-bold mb-2 text-emerald-600">Received Files:</h3>
          <ul className="space-y-2">
            {receivedFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                <span className="truncate">{file.name}</span>
                <Button 
                  onClick={() => downloadFile(index)}
                  variant="outline"
                  className="border-emerald-400 text-emerald-600 hover:bg-emerald-50"
                >
                  Download
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button 
        onClick={onReset} 
        variant="outline" 
        className="w-full border-red-400 text-red-500 hover:bg-red-50"
      >
        Reset & Start Over
      </Button>
    </div>
  );
};

export default PeerConnection;
