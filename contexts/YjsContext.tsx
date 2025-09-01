
import React, { createContext, useEffect, useState, ReactNode } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { USER_COLORS, FAKE_USERNAMES, WEBSOCKET_URL, WORKSPACE_ID } from '../constants';
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

const initializeDefaultFileTree = (fileTree: Y.Array<any>) => {
    const readmeId = nanoid();
    const indexHtmlId = nanoid();
    const styleCssId = nanoid();
    const scriptJsId = nanoid();
    const appComponentId = nanoid();

    const defaultTree: FileNode[] = [
        { id: readmeId, name: 'README.md', isFolder: false },
        {
            id: nanoid(), name: 'public', isFolder: true, children: [
                { id: indexHtmlId, name: 'index.html', isFolder: false }
            ]
        },
        {
            id: nanoid(), name: 'src', isFolder: true, children: [
                { id: styleCssId, name: 'style.css', isFolder: false },
                { id: scriptJsId, name: 'script.js', isFolder: false },
                { id: nanoid(), name: 'components', isFolder: true, children: [
                    { id: appComponentId, name: 'App.jsx', isFolder: false }
                ]}
            ]
        }
    ];
    fileTree.push(defaultTree);
};

const initializeDefaultFileContents = (fileContents: Y.Map<any>) => {
    // Find IDs by traversing the default structure again (a bit redundant but ensures consistency)
    const readmeContent = `# CodeSync Editor\n\nWelcome to your real-time collaborative coding environment!\n\nSelect a file to start editing.`;
    const indexHtmlContent = `<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
    <link rel="stylesheet" href="src/style.css">
  </head>
  <body>
    <h1>Hello, World!</h1>
    <script src="src/script.js"></script>
  </body>
</html>`;
    const styleCssContent = `body {\n  font-family: sans-serif;\n  background-color: #f0f0f0;\n}`;
    const scriptJsContent = `console.log('Hello from script.js!');`;
    const appComponentContent = `import React from 'react';

const App = () => {
  return <h1>Hello from React!</h1>;
};

export default App;`;
    
    // This is brittle. In a real app, IDs would be fetched or predetermined.
    // For this demo, we can't easily get IDs back from initializeDefaultFileTree.
    // So we'll just pre-populate based on a common pattern.
    // The robust solution requires a backend to assign and store these IDs.
    // For the demo, let's keep it simple: we won't pre-populate content to avoid ID mismatches.
    // The user can create content.
};

export const YjsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contextValue, setContextValue] = useState<YjsContextType | null>(null);

  useEffect(() => {
    const yDoc = new Y.Doc();
    const yProvider = new WebsocketProvider(WEBSOCKET_URL, WORKSPACE_ID, yDoc);
    const yAwareness = yProvider.awareness;

    const randomColor = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
    const randomName = FAKE_USERNAMES[Math.floor(Math.random() * FAKE_USERNAMES.length)];
    
    yAwareness.setLocalStateField('user', {
      name: randomName,
      color: randomColor,
    });

    const yFileTree = yDoc.getArray<FileNode>('fileTree');
    const yFileContents = yDoc.getMap<Y.Text>('fileContents');

    yProvider.on('sync', (isSynced: boolean) => {
        if(isSynced && yFileTree.length === 0) {
            yDoc.transact(() => {
                initializeDefaultFileTree(yFileTree);
                // initializeDefaultFileContents(yFileContents); // Disabled for simplicity
            });
        }
        setContextValue(prev => prev ? {...prev, isSynced} : prev);
    });

    setContextValue({
      doc: yDoc,
      provider: yProvider,
      awareness: yAwareness,
      fileTree: yFileTree,
      fileContents: yFileContents,
      isSynced: yProvider.synced,
    });

    return () => {
      yProvider.disconnect();
      yDoc.destroy();
    };
  }, []);

  if (!contextValue) {
    return <div>Loading collaboration session...</div>;
  }

  return (
    <YjsContext.Provider value={contextValue}>
      {children}
    </YjsContext.Provider>
  );
};
