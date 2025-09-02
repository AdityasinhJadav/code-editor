import React, { useRef, useEffect, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { useYjs } from '../hooks/useYjs';
import { findNodeById } from '../utils/fileTreeUtils';
import { getLanguageFromFileName } from '../utils/languageUtils';

interface EditorProps {
  fileId: string;
}

const Editor: React.FC<EditorProps> = ({ fileId }) => {
  const editorRef = useRef<any>(null);
  const { fileContents, awareness, doc, fileTree } = useYjs();
  const [monacoBinding, setMonacoBinding] = useState<MonacoBinding | null>(null);
  const [fileName, setFileName] = useState<string>('');
  
  useEffect(() => {
    if (!fileTree) return;
    
    const updateFileName = () => {
      try {
        const treeData = fileTree.toJSON();
        const found = findNodeById(treeData, fileId);
        if(found?.node?.name) {
            setFileName(found.node.name);
        }
      } catch (e) {
        // Can happen if tree is in inconsistent state during transaction
      }
    };

    updateFileName(); // Initial call
    fileTree.observe(updateFileName);

    return () => {
        fileTree.unobserve(updateFileName);
    }
  }, [fileId, fileTree]);


  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    if (!fileContents || !awareness || !doc) return;

    let yText = fileContents.get(fileId);
    if (!yText) {
      yText = new Y.Text();
      doc.transact(() => {
        fileContents.set(fileId, yText);
      });
    }

    const binding = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      awareness
    );
    setMonacoBinding(binding);
  };

  useEffect(() => {
    return () => {
      monacoBinding?.destroy();
    };
  }, [monacoBinding]);

  const language = getLanguageFromFileName(fileName);

  return (
    <div className="flex-grow w-full h-full min-h-0">
      <MonacoEditor
        height="100%"
        width="100%"
        theme="vs-dark"
        path={fileName}
        language={language}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default Editor;
