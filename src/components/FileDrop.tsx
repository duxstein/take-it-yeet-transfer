
import React, { useState, useRef, DragEvent } from 'react';
import { getRandomMessage, errorMessages, statusMessages } from '@/utils/chaoticMessages';
import { playRandomSound } from '@/utils/soundEffects';
import { toast } from '@/components/ui/use-toast';

interface FileDropProps {
  onFilesAdded: (files: File[]) => void;
  disabled: boolean;
}

const FileDrop: React.FC<FileDropProps> = ({ onFilesAdded, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      
      // Sometimes randomly "reject" files for chaos
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
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !e.target.files || e.target.files.length === 0) return;
    
    const fileArray = Array.from(e.target.files);
    
    // Sometimes randomly "reject" files for chaos
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

  return (
    <div
      className={`w-full rounded-xl p-8 border-4 border-dashed transition-colors relative overflow-hidden cursor-pointer
        ${isDragging ? 'border-chaos-neon1 bg-chaos-neon1/10' : 'border-chaos-neon2 file-drop-area'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-chaos-neon3/10'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
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
          <span className="text-4xl">⬇️</span>
        </div>
      </div>
    </div>
  );
};

export default FileDrop;
