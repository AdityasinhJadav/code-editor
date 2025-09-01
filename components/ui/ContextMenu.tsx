import React, { useEffect, useRef } from 'react';

interface MenuItem {
  label: string;
  action: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const style: React.CSSProperties = {
    top: `${y}px`,
    left: `${x}px`,
  };

  return (
    <div
      ref={menuRef}
      style={style}
      className="fixed bg-[#252526] border border-gray-900/50 rounded-md shadow-lg py-1 z-50 min-w-[150px]"
    >
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <button
              onClick={item.action}
              className="w-full text-left px-4 py-1.5 text-sm text-gray-200 hover:bg-blue-600 hover:text-white"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContextMenu;
