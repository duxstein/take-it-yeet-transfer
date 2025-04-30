import React, { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'lucide-react';
import { getRandomMessage, errorMessages, statusMessages } from '@/utils/chaoticMessages';
import { playRandomSound } from '@/utils/soundEffects';
import { Peer, DataConnection } from 'peerjs';

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
  
  // Initialize peer connection
  useEffect(() => {
    const newPeer = new Peer();
    
    newPeer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
      setPeerId(id);
      setStatus("ready");
      
      // Sometimes show silly status
      if (Math.random() > 0.7) {
        setStatus(getRandomMessage(statusMessages));
      }
      
      // If in receive mode and we have an initial connection ID, connect automatically
      if (receiveMode && initialConnectionId && id) {
        connectToPeer(initialConnectionId);
      }
    });
    
    newPeer.on('connection', (conn) => {
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
  }, [initialConnectionId, receiveMode]);
  
  const setupConnectionHandlers = (conn: DataConnection) => {
    conn.on('data', (data: any) => {
      console.log('Received data:', data);
      
      if (data.type === 'file-header') {
        // Prepare for file chunks
        setStatus(`Receiving: ${data.name}`);
        toast({
          title: "Incoming file!",
          description: `"${data.name}" is being yeeted to you`,
        });
      } else if (data.type === 'file-chunk') {
        // Handle file chunk
        setStatus(`Receiving chunk ${data.chunkIndex + 1}/${data.totalChunks}`);
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
          description: `"${data.name}" has successfully invaded your computer`,
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
    if (!peer || !idToConnect) return;
    
    // Random chance for fake connection error
    if (Math.random() > 0.9) {
      toast({
        title: "Connection failed!",
        description: getRandomMessage(errorMessages),
        variant: "destructive",
      });
      playRandomSound();
      return;
    }
    
    try {
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
    
    // Random chance to fail
    if (Math.random() > 0.95) {
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
          const chunkSize = 16384; // 16KB chunks
          const totalChunks = Math.ceil(fileData.byteLength / chunkSize);
          
          // Send file header first
          connection.send({
            type: 'file-header',
            name: file.name,
            size: file.size,
            fileType: file.type,
            totalChunks
          });
          
          // Send file in chunks
          for (let i = 0; i < totalChunks; i++) {
            const chunk = fileData.slice(i * chunkSize, (i + 1) * chunkSize);
            
            connection.send({
              type: 'file-chunk',
              chunkIndex: i,
              totalChunks,
              data: chunk
            });
            
            setStatus(`Sending chunk ${i + 1}/${totalChunks}`);
          }
          
          // Send complete signal
          connection.send({
            type: 'file-complete',
            name: file.name,
            fileType: file.type,
            fileData
          });
          
          toast({
            title: "File sent!",
            description: `"${file.name}" was yeeted successfully... maybe`,
          });
          
          setStatus("transfer complete");
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
  
  const copyPeerId = () => {
    const connectionUrl = getConnectionUrl();
    navigator.clipboard.writeText(connectionUrl);
    toast({
      title: "URL Copied!",
      description: "Connection URL was copied to clipboard",
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
        <div className="bg-white p-4 rounded-lg border-2 border-chaos-neon2 chaotic-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-comic font-bold text-chaos-neon1">Your Connection URL:</h3>
            <div className="flex gap-2">
              <Button 
                onClick={toggleQrCode} 
                className="bg-chaos-neon1 hover:bg-chaos-neon1/80 text-black"
                disabled={!peerId}
                title={showQrCode ? "Hide QR Code" : "Show QR Code"}
              >
                <Link className="h-4 w-4 mr-1" /> 
                {showQrCode ? "Hide" : "QR"}
              </Button>
              <Button 
                onClick={copyPeerId} 
                className="bg-chaos-neon2 hover:bg-chaos-neon2/80 text-black"
                disabled={!peerId}
              >
                Copy URL
              </Button>
            </div>
          </div>
          <div className="p-2 bg-gray-100 rounded flex items-center justify-between">
            <code className="font-mono text-sm break-all">
              {peerId ? getConnectionUrl().substring(0, 40) + '...' : "Generating..."}
            </code>
            <span className="ml-2 text-2xl">{getStatusEmoji()}</span>
          </div>
          
          {showQrCode && peerId && (
            <div className="mt-4 p-4 bg-white border-2 border-chaos-neon1 rounded-lg flex flex-col items-center">
              <p className="text-sm text-gray-500 mb-2">Scan to connect:</p>
              <QRCodeSVG 
                value={getConnectionUrl()} 
                size={180} 
                bgColor={"#ffffff"} 
                fgColor={"#000000"} 
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
              className="border-chaos-neon1"
            />
            <Button
              onClick={handlePasteId}
              className="bg-chaos-neon2 hover:bg-chaos-neon2/80 text-black shrink-0"
              title="Paste ID from clipboard"
            >
              Paste
            </Button>
          </div>
          <Button 
            onClick={() => connectToPeer()}
            className="bg-chaos-neon1 hover:bg-chaos-neon1/80 w-full sm:w-auto"
            disabled={!remotePeerId || status === 'connecting' || !!connection}
          >
            Connect
          </Button>
        </div>
      )}
      
      {receiveMode && status === "ready" && !connection && (
        <div className="flex justify-center">
          <div className="animate-pulse p-6 text-center">
            <p className="text-xl font-comic font-bold text-chaos-neon1">Waiting for connection...</p>
            <p className="text-gray-500 mt-2">{getStatusEmoji()}</p>
          </div>
        </div>
      )}

      {status === 'connected' && files.length > 0 && !receiveMode && (
        <Button 
          onClick={sendFiles} 
          className="w-full p-6 text-3xl font-comic font-bold bg-chaos-neon3 hover:bg-chaos-neon3/80 text-black animate-wiggle chaotic-shadow"
        >
          JUST TAKE IT!!!
        </Button>
      )}

      <div className="p-4 border-2 border-chaos-ugly1 rounded-lg bg-white">
        <h3 className="font-comic font-bold mb-2 text-chaos-ugly1">Status: {getStatusEmoji()}</h3>
        <p className="text-gray-600 italic">{status}</p>
      </div>

      {receivedFiles.length > 0 && (
        <div className="border-2 border-chaos-neon3 rounded-lg p-4 bg-white">
          <h3 className="font-comic font-bold mb-2 text-chaos-neon3">Received Files:</h3>
          <ul className="space-y-2">
            {receivedFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                <span className="truncate">{file.name}</span>
                <Button 
                  onClick={() => downloadFile(index)}
                  variant="outline"
                  className="border-chaos-neon3 text-chaos-neon3"
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
        className="w-full border-chaos-error text-chaos-error hover:bg-chaos-error/10"
      >
        Reset & Start Over
      </Button>
    </div>
  );
};

export default PeerConnection;
