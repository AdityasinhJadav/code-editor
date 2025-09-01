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

const initializeDefaultFileTree = (fileTree: Y.Array<any>, fileIds: Record<string, string>) => {
    const defaultTree: FileNode[] = [
        { id: fileIds.readme, name: 'README.md', isFolder: false },
        {
            id: nanoid(), name: 'public', isFolder: true, children: [
                { id: fileIds.indexHtml, name: 'index.html', isFolder: false }
            ]
        },
        {
            id: nanoid(), name: 'src', isFolder: true, children: [
                { id: fileIds.styleCss, name: 'style.css', isFolder: false },
                { id: fileIds.scriptJs, name: 'script.js', isFolder: false },
                { id: nanoid(), name: 'components', isFolder: true, children: [
                    { id: fileIds.appComponent, name: 'App.jsx', isFolder: false }
                ]}
            ]
        }
    ];
    fileTree.push(defaultTree);
};

const initializeDefaultFileContents = (fileContents: Y.Map<any>, fileIds: Record<string, string>) => {
    const readmeContent = `# CodeSync Editor\n\nWelcome to your real-time collaborative coding environment!\n\nThis is a demo using Yjs and Monaco Editor.\n\nSelect a file to start editing, or create new files and folders using the icons in the explorer.`;
    const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My App</title>
    <link rel="stylesheet" href="src/style.css">
  </head>
  <body>
    <h1>Hello, World!</h1>
    <div id="root"></div>
    <script src="src/script.js" type="module"></script>
  </body>
</html>`;
    const styleCssContent = `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f0f0f0;
  color: #333;
  margin: 2rem;
}`;
    const scriptJsContent = `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App.jsx';

console.log('Hello from script.js!');

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);`;

    const appComponentContent = `import React from 'react';

const App = () => {
  return <h1>Hello from React!</h1>;
};

export default App;`;
    
    fileContents.set(fileIds.readme, new Y.Text(readmeContent));
    fileContents.set(fileIds.indexHtml, new Y.Text(indexHtmlContent));
    fileContents.set(fileIds.styleCss, new Y.Text(styleCssContent));
    fileContents.set(fileIds.scriptJs, new Y.Text(scriptJsContent));
    fileContents.set(fileIds.appComponent, new Y.Text(appComponentContent));
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
            const fileIds = {
              readme: nanoid(),
              indexHtml: nanoid(),
              styleCss: nanoid(),
              scriptJs: nanoid(),
              appComponent: nanoid(),
            };
            yDoc.transact(() => {
                initializeDefaultFileTree(yFileTree, fileIds);
                initializeDefaultFileContents(yFileContents, fileIds);
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
    return <div className="flex items-center justify-center h-screen bg-[#1e1e1e] text-white">Loading collaboration session...</div>;
  }

  return (
    <YjsContext.Provider value={contextValue}>
      {children}
    </YjsContext.Provider>
  );
};
