import React, { useEffect, useState } from 'react';
import { useYjs } from '../hooks/useYjs';
import { useUiStore } from '../hooks/useUiStore';
import Tooltip from './ui/Tooltip';
import { ShareIcon, PlayIcon, PanelRightIcon, UserIcon } from './icons';

interface User {
  name: string;
  color: string;
}

const Header: React.FC = () => {
  const { awareness, isSynced, fileContents, fileTree } = useYjs();
  // The user property on an awareness state is not guaranteed, so it should be optional.
  const [users, setUsers] = useState<Map<number, { user?: User }>>(new Map());
  const [copied, setCopied] = useState(false);
  const { 
    isPreviewOpen, 
    togglePreview, 
    isAuthenticated, 
    username, 
    openLoginModal, 
    logout 
  } = useUiStore();

  useEffect(() => {
    if (!awareness) return;

    const updateUsers = () => {
      // No need to cast with the corrected optional type
      setUsers(new Map(awareness.getStates()));
    };

    awareness.on('change', updateUsers);
    updateUsers();

    return () => {
      awareness.off('change', updateUsers);
    };
  }, [awareness]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePreview = () => {
    if (!fileTree || !fileContents) return;

    const treeData = fileTree.toJSON();
    
    const findFileContent = (fileName: string): string => {
        const fileNode = treeData.find(node => node && !node.isFolder && node.name === fileName);
        if (fileNode) {
            const yText = fileContents.get(fileNode.id);
            return yText ? yText.toString() : '';
        }
        return '';
    }

    const htmlContent = findFileContent('index.html');
    if (!htmlContent) {
        alert('Could not find index.html at the root of the project to create a preview.');
        return;
    }

    const cssContent = findFileContent('style.css');
    const jsContent = findFileContent('script.js');
    
    // Replace link and script tags in the user's HTML for a more realistic preview
    const blobContent = htmlContent
        .replace(/<link[^>]*href="[^"]*style\.css"[^>]*>/, `<style>${cssContent}</style>`)
        .replace(/<script[^>]*src="[^"]*script\.js"[^>]*><\/script>/, `<script>${jsContent}</script>`);

    const blob = new Blob([blobContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <header className="flex items-center justify-between bg-[#3c3c3c] px-4 py-2 flex-shrink-0 z-10 shadow-md">
      <div className="flex items-center">
        <div className="w-5 h-5 bg-blue-500 rounded-full mr-2"></div>
        <h1 className="text-lg font-semibold text-gray-200">CodeSync</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Tooltip text="Preview Project in new tab">
            <button onClick={handlePreview} className="bg-gray-700 hover:bg-gray-600 p-2 rounded-md flex items-center gap-2 text-sm text-white">
                <PlayIcon className="w-4 h-4" />
            </button>
        </Tooltip>

         <Tooltip text={isPreviewOpen ? "Hide Live Preview" : "Show Live Preview"}>
            <button 
              onClick={togglePreview} 
              className={`${isPreviewOpen ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'} hover:bg-gray-600 p-2 rounded-md flex items-center gap-2 text-sm`}>
                <PanelRightIcon className="w-4 h-4" />
            </button>
        </Tooltip>

        <div className="flex items-center space-x-2 border-l border-gray-600 pl-4">
            <Tooltip text={isSynced ? 'Synced' : 'Connecting...'}>
                <div className={`w-3 h-3 rounded-full ${isSynced ? 'bg-green-500' : 'bg-yellow-500'} transition-colors`}></div>
            </Tooltip>
            <div className="text-sm text-gray-400">
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
        
        <div className="border-l border-gray-600 pl-4 flex items-center gap-4">
            <Tooltip text={copied ? "Link Copied!" : "Share Project"}>
                <button onClick={handleShare} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-md flex items-center gap-2 text-sm">
                    <ShareIcon className="w-4 h-4" />
                    <span>Share</span>
                </button>
            </Tooltip>

             {isAuthenticated ? (
                <div className="flex items-center gap-2">
                <span className="text-sm text-white font-medium">Welcome, {username}!</span>
                <button onClick={logout} className="bg-red-600 hover:bg-red-500 text-white py-2 px-3 rounded-md text-sm">
                    Logout
                </button>
                </div>
            ) : (
                <button onClick={openLoginModal} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-md flex items-center gap-2 text-sm">
                    <UserIcon className="w-4 h-4" />
                    <span>Login</span>
                </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;