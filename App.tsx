
import React from 'react';
import { YjsProvider } from './contexts/YjsContext';
import FileTree from './components/FileTree';
import Editor from './components/Editor';
import Header from './components/Header';
import { useUiStore } from './hooks/useUiStore';

const App: React.FC = () => {
  const activeFileId = useUiStore((state) => state.activeFileId);

  return (
    <YjsProvider>
      <div className="flex flex-col h-screen bg-[#1e1e1e] font-sans">
        <Header />
        <div className="flex flex-grow overflow-hidden">
          <div className="w-64 bg-[#252526] flex-shrink-0">
            <FileTree />
          </div>
          <main className="flex-grow flex flex-col">
            {activeFileId ? (
              <Editor key={activeFileId} fileId={activeFileId} />
            ) : (
              <WelcomeScreen />
            )}
          </main>
        </div>
      </div>
    </YjsProvider>
  );
};

const WelcomeScreen: React.FC = () => (
  <div className="flex-grow flex items-center justify-center bg-[#1e1e1e] text-gray-400">
    <div className="text-center">
      <h1 className="text-2xl font-semibold mb-2">Welcome to CodeSync</h1>
      <p>Select a file from the explorer to start editing.</p>
    </div>
  </div>
);

export default App;
