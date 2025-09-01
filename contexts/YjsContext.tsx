import React, { createContext, useEffect, useState, ReactNode } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { USER_COLORS, FAKE_USERNAMES, WEBSOCKET_URL } from '../constants';
import { FileNode } from '../types';
import { nanoid } from 'nanoid';

interface YjsContextType {
  doc: Y.Doc;
  provider: WebsocketProvider | null;
  awareness: WebsocketProvider['awareness'] | null;
  fileTree: Y.Array<any> | null;
  fileContents: Y.Map<any> | null;
  isSynced: boolean;
}

export const YjsContext = createContext<YjsContextType | null>(null);

// Helper to get workspace ID from URL or create a new one
const getWorkspaceId = (): string => {
  const urlParams = new URLSearchParams(window.location.search);
  let workspaceId = urlParams.get('workspace');

  if (!workspaceId) {
    workspaceId = nanoid(10); // Create a new unique ID
    // Update the URL without reloading the page
    const newUrl = `${window.location.pathname}?workspace=${workspaceId}${window.location.hash}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
  }
  
  return workspaceId;
}

export const YjsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contextValue, setContextValue] = useState<YjsContextType | null>(null);

  useEffect(() => {
    const workspaceId = getWorkspaceId();
    const yDoc = new Y.Doc();
    const yProvider = new WebsocketProvider(WEBSOCKET_URL, workspaceId, yDoc);
    const yAwareness = yProvider.awareness;

    const randomColor = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
    const randomName = FAKE_USERNAMES[Math.floor(Math.random() * FAKE_USERNAMES.length)];
    
    yAwareness.setLocalStateField('user', {
      name: randomName,
      color: randomColor,
    });

    const yFileTree = yDoc.getArray<FileNode>('fileTree');
    const yFileContents = yDoc.getMap<Y.Text>('fileContents');
    
    const onSync = (isSynced: boolean) => {
        setContextValue(prev => prev ? {...prev, isSynced} : prev);
    };
    yProvider.on('sync', onSync);

    setContextValue({
      doc: yDoc,
      provider: yProvider,
      awareness: yAwareness,
      fileTree: yFileTree,
      fileContents: yFileContents,
      isSynced: yProvider.synced,
    });

    return () => {
      yProvider.off('sync', onSync);
      yProvider.disconnect();
      yDoc.destroy();
    };
  }, []);

  if (!contextValue) {
    return <div className="flex items-center justify-center h-screen bg-[#1e1e1e] text-white">Loading collaboration session...</div>;
  }

  return (
    <YjsContext.Provider value={contextValue}>
      {children}
    </YjsContext.Provider>
  );
};