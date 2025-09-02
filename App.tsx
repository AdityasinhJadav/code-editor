import React from 'react';
import { YjsProvider } from './contexts/YjsContext';
import FileTree from './components/FileTree';
import Editor from './components/Editor';
import Header from './components/Header';
import { useUiStore } from './hooks/useUiStore';
import Tabs from './components/Tabs';
import ResizablePanel from './components/ui/ResizablePanel';
import LivePreview from './components/LivePreview';
import LoginModal from './components/LoginModal';

const App: React.FC = () => {
  const { activeFileId, isPreviewOpen } = useUiStore();

  const editorPane = (
    <main className="flex-grow flex flex-col min-w-0 h-full">
      <Tabs />
      {activeFileId ? (
        <Editor key={activeFileId} fileId={activeFileId} />
      ) : (
        <WelcomeScreen />
      )}
    </main>
  );

  return (
    <YjsProvider>
      <div className="flex flex-col h-screen bg-[#1e1e1e] font-sans">
        <Header />
        <div className="flex flex-grow overflow-hidden">
          <div className="w-64 bg-[#252526] flex-shrink-0 flex flex-col">
            <FileTree />
          </div>
          <div className="flex-grow flex min-w-0">
             <ResizablePanel 
              left={editorPane}
              right={<LivePreview />}
              showRightPanel={isPreviewOpen}
            />
          </div>
        </div>
        <LoginModal />
      </div>
    </YjsProvider>
  );
};

const WelcomeScreen: React.FC = () => (
  <div className="flex-grow flex items-center justify-center bg-[#1e1e1e] text-gray-400">
    <div className="text-center p-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-gray-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
      <h1 className="text-2xl font-semibold mb-2">Welcome to CodeSync</h1>
      <p>Your collaborative workspace is ready.</p>
      <p className="text-sm text-gray-500 mt-2">Create a new file or folder using the icons in the explorer to get started.</p>
      <p className="text-sm text-gray-500 mt-1">Try creating `index.html`, `style.css`, and `script.js` then hit the preview button!</p>
    </div>
  </div>
);

export default App;
