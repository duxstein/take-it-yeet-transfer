
import React, { useState, useRef, DragEvent } from 'react';
import { getRandomMessage, errorMessages, statusMessages } from '@/utils/chaoticMessages';
import { playRandomSound } from '@/utils/soundEffects';
import { toast } from '@/components/ui/use-toast';
import { Laugh } from 'lucide-react';

interface FileDropProps {
  onFilesAdded: (files: File[]) => void;
  disabled: boolean;
}

const FileDrop: React.FC<FileDropProps> = ({ onFilesAdded, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [hoverCount, setHoverCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Easter egg messages that appear when you hover multiple times
  const hoverMessages = [
    "Still hovering, huh?",
    "You seem indecisive...",
    "Just drop the file already!",
    "I'm getting impatient now...",
    "Are we doing this or what?",
    "Is this some kind of game to you?",
    "Fine, I'll wait. I've got all day.",
    "This is awkward now.",
    "Seriously?",
    "*Dramatic sigh*"
  ];

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files);
      
      // 20% chance to "reject" files for chaos
      if (Math.random() > 0.8) {
        toast({
          title: "File rejected",
          description: getRandomMessage(errorMessages),
          variant: "destructive",
        });
        playRandomSound();
        return;
      }
      
      // 10% chance to fake accept but do nothing
      if (Math.random() > 0.9) {
        toast({
          title: "Files accepted... or were they?",
          description: "Just kidding! Try again.",
        });
        playRandomSound();
        return;
      }
      
      onFilesAdded(fileArray);
      toast({
        title: "File accepted... probably",
        description: getRandomMessage(statusMessages),
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !e.target.files || e.target.files.length === 0) return;
    
    const fileArray = Array.from(e.target.files);
    
    // 20% chance to "reject" files for chaos
    if (Math.random() > 0.8) {
      toast({
        title: "File rejected",
        description: getRandomMessage(errorMessages),
        variant: "destructive",
      });
      playRandomSound();
      return;
    }
    
    onFilesAdded(fileArray);
    toast({
      title: "File accepted... probably",
      description: getRandomMessage(statusMessages),
    });
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleMouseEnter = () => {
    if (hoverCount < hoverMessages.length && Math.random() > 0.7) {
      toast({
        description: hoverMessages[hoverCount],
      });
      setHoverCount(prev => prev + 1);
    }
  };

  return (
    <div
      className={`w-full rounded-xl p-8 border-4 border-dashed transition-colors relative overflow-hidden cursor-pointer
        ${isDragging ? 'border-chaos-neon1 bg-chaos-neon1/10' : 'border-chaos-neon2 file-drop-area'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-chaos-neon3/10'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      <div className="text-center">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        <p className={`text-2xl font-comic mb-2 font-bold ${isDragging ? 'text-chaos-neon1' : 'text-chaos-neon2'} chaotic-rotate`}>
          Uhh... just drop it here, I guess
        </p>
        <p className="text-sm text-gray-500 chaotic-rotate-reverse">
          (or click if you're boring)
        </p>
        
        <div className="mt-6 animate-bounce">
          <Laugh className="w-12 h-12 mx-auto text-chaos-neon2" />
        </div>
        
        <div className="text-xs text-gray-400 mt-4 italic">
          {Math.random() > 0.5 ? 
            "90% chance your file will make it somewhere" : 
            "Guarantee: Files will definitely do something"}
        </div>
      </div>
    </div>
  );
};

export default FileDrop;
