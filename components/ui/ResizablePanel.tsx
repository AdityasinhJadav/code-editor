import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ResizablePanelProps {
  left: React.ReactNode;
  right: React.ReactNode;
  showRightPanel: boolean;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({ left, right, showRightPanel }) => {
  const [panelWidth, setPanelWidth] = useState(50); // initial width as percentage
  const isResizing = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = 'auto';
    document.body.style.userSelect = 'auto';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current || !containerRef.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
    if (newWidth > 20 && newWidth < 80) { // constrain width
      setPanelWidth(newWidth);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  if (!showRightPanel) {
    return <div className="flex-grow min-w-0">{left}</div>;
  }

  return (
    <div ref={containerRef} className="flex h-full w-full flex-grow">
      <div style={{ width: `${panelWidth}%` }} className="min-w-0 h-full flex flex-col">
        {left}
      </div>
      <div 
        onMouseDown={handleMouseDown}
        className="w-1.5 cursor-col-resize bg-[#252526] hover:bg-blue-600 transition-colors duration-200 flex-shrink-0"
        title="Resize panels"
      >
        <div className="w-px h-full bg-gray-900/50 mx-auto"></div>
      </div>
      <div style={{ width: `${100 - panelWidth}%` }} className="min-w-0 h-full flex flex-col">
        {right}
      </div>
    </div>
  );
};

export default ResizablePanel;
