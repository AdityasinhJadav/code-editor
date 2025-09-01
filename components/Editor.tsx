
import React, { useRef, useEffect, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { useYjs } from '../hooks/useYjs';

interface EditorProps {
  fileId: string;
}

const Editor: React.FC<EditorProps> = ({ fileId }) => {
  const editorRef = useRef<any>(null);
  const { fileContents, awareness, doc } = useYjs();
  const [monacoBinding, setMonacoBinding] = useState<MonacoBinding | null>(null);

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

  return (
    <div className="flex-grow w-full h-full">
      <MonacoEditor
        height="100%"
        width="100%"
        theme="vs-dark"
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
