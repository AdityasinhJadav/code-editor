import React, { useState, useEffect, useMemo } from 'react';
import * as Y from 'yjs';
import { useYjs } from '../hooks/useYjs';
import { useDebounce } from '../hooks/useDebounce';
import { FileNode } from '../types';

const LivePreview: React.FC = () => {
  const { fileTree, fileContents, isSynced } = useYjs();
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');

  const debouncedHtml = useDebounce(html, 300);
  const debouncedCss = useDebounce(css, 300);
  const debouncedJs = useDebounce(js, 300);

  useEffect(() => {
    if (!fileContents || !isSynced || !fileTree) return;

    const observer = () => {
      let treeData: FileNode[] = [];
      try {
        treeData = fileTree.toJSON();
      } catch (e) {
        return; // fileTree might not be ready
      }

      const findFileContent = (fileName: string): Y.Text | undefined => {
        // Simple recursive search, assumes flat structure for simplicity of preview
        // A more robust solution would traverse folders
        const fileNode = treeData.find(node => node && !node.isFolder && node.name.toLowerCase() === fileName.toLowerCase());
        return fileNode ? fileContents.get(fileNode.id) : undefined;
      }

      const htmlYText = findFileContent('index.html');
      const cssYText = findFileContent('style.css');
      const jsYText = findFileContent('script.js');
      
      setHtml(htmlYText?.toString() || '');
      setCss(cssYText?.toString() || '');
      setJs(jsYText?.toString() || '');
    };
    
    observer(); // Initial call

    fileContents.observe(observer);
    fileTree.observe(observer);

    return () => {
      fileContents.unobserve(observer);
      fileTree.unobserve(observer);
    };

  }, [fileContents, isSynced, fileTree]);
  
  const srcDoc = useMemo(() => {
    if (!debouncedHtml && !debouncedCss && !debouncedJs) {
        return `
            <body style="background-color: #1e1e1e; color: #ccc; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
                <div style="text-align: center;">
                    <p>Create an <strong>index.html</strong> file to start the live preview.</p>
                </div>
            </body>
        `;
    }
    return debouncedHtml
      .replace(/<link[^>]*href="[^"]*style\.css"[^>]*>/, `<style>${debouncedCss}</style>`)
      .replace(/<script[^>]*src="[^"]*script\.js"[^>]*><\/script>/, `<script type="module">${debouncedJs}</script>`);
  }, [debouncedHtml, debouncedCss, debouncedJs]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
        <div className="bg-[#252526] px-4 py-2 text-sm text-gray-300 font-medium border-b border-gray-900/50 flex-shrink-0">
            Live Preview
        </div>
        <iframe
            srcDoc={srcDoc}
            title="Live Preview"
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full border-none bg-white"
        />
    </div>
  );
};

export default LivePreview;