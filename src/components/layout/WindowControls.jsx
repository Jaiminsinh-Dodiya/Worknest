import { useState } from 'react';
import { X, Minus, Maximize2 } from 'lucide-react';

export default function WindowControls({ className = '' }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClose = (e) => {
    e.stopPropagation();
    if (window.electronAPI?.closeWindow) {
      window.electronAPI.closeWindow();
    } else {
      console.log('Close window action triggered');
    }
  };

  const handleMinimize = (e) => {
    e.stopPropagation();
    if (window.electronAPI?.minimizeWindow) {
      window.electronAPI.minimizeWindow();
    } else {
      console.log('Minimize window action triggered');
    }
  };

  const handleMaximize = (e) => {
    e.stopPropagation();
    if (window.electronAPI?.maximizeWindow) {
      window.electronAPI.maximizeWindow();
    } else {
      console.log('Maximize window action triggered');
    }
  };

  return (
    <div
      className={`flex items-center gap-2 select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ WebkitAppRegion: 'no-drag' }}
    >
      {/* Close - Red */}
      <button
        type="button"
        onClick={handleClose}
        className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:bg-[#E0443E] active:bg-[#BF4C47] flex items-center justify-center transition-all duration-150 focus:outline-none shadow-sm cursor-pointer"
        title="Close"
        aria-label="Close Window"
      >
        <X
          size={8}
          strokeWidth={3}
          className={`text-[#4C0000] opacity-0 ${isHovered ? 'opacity-100' : ''} transition-opacity duration-150`}
        />
      </button>

      {/* Minimize - Yellow */}
      <button
        type="button"
        onClick={handleMinimize}
        className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123] hover:bg-[#DEA123] active:bg-[#BF8E22] flex items-center justify-center transition-all duration-150 focus:outline-none shadow-sm cursor-pointer"
        title="Minimize"
        aria-label="Minimize Window"
      >
        <Minus
          size={8}
          strokeWidth={3.5}
          className={`text-[#5C4000] opacity-0 ${isHovered ? 'opacity-100' : ''} transition-opacity duration-150`}
        />
      </button>

      {/* Maximize - Green */}
      <button
        type="button"
        onClick={handleMaximize}
        className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29] hover:bg-[#1AAB29] active:bg-[#1D9730] flex items-center justify-center transition-all duration-150 focus:outline-none shadow-sm cursor-pointer"
        title="Maximize / Fullscreen"
        aria-label="Maximize Window"
      >
        <Maximize2
          size={7}
          strokeWidth={3}
          className={`text-[#0A4D14] opacity-0 ${isHovered ? 'opacity-100' : ''} transition-opacity duration-150`}
        />
      </button>
    </div>
  );
}
