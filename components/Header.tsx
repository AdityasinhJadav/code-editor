
import React, { useEffect, useState } from 'react';
import { useYjs } from '../hooks/useYjs';
import Tooltip from './ui/Tooltip';

interface User {
  name: string;
  color: string;
}

const Header: React.FC = () => {
  const { awareness } = useYjs();
  const [users, setUsers] = useState<Map<number, { user: User }>>(new Map());

  useEffect(() => {
    if (!awareness) return;

    const updateUsers = () => {
      setUsers(new Map(awareness.getStates()));
    };

    awareness.on('change', updateUsers);
    updateUsers(); // Initial load

    return () => {
      awareness.off('change', updateUsers);
    };
  }, [awareness]);

  return (
    <header className="flex items-center justify-between bg-[#3c3c3c] px-4 py-2 flex-shrink-0 z-10 shadow-md">
      <div className="flex items-center">
        <div className="w-5 h-5 bg-blue-500 rounded-full mr-2"></div>
        <h1 className="text-lg font-semibold text-gray-200">CodeSync</h1>
      </div>
      <div className="flex items-center space-x-2">
        <div className="text-sm text-gray-400 mr-2">
          {users.size} user{users.size === 1 ? '' : 's'} online
        </div>
        <div className="flex -space-x-2">
          {Array.from(users.values()).map(({ user }, index) =>
            user ? (
              <Tooltip key={index} text={user.name}>
                <div
                  className="w-8 h-8 rounded-full border-2 border-[#3c3c3c] flex items-center justify-center font-bold text-white"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </Tooltip>
            ) : null
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
