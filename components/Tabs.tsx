import React, { useState, useEffect } from 'react';
import { useUiStore } from '../hooks/useUiStore';
import { useYjs } from '../hooks/useYjs';
import { FileNode } from '../types';
import { findNodeById } from '../utils/fileTreeUtils';
import { CloseIcon, FileIcon } from './icons';

const Tabs: React.FC = () => {
  const { openFileIds, activeFileId, closeFile, openFile } = useUiStore();
  const { fileTree } = useYjs();
  const [treeData, setTreeData] = useState<FileNode[]>([]);

  useEffect(() => {
    if (!fileTree) return;
    const observer = () => setTreeData(fileTree.toJSON());
    fileTree.observe(observer);
    setTreeData(fileTree.toJSON()); // Initial load
    return () => fileTree.unobserve(observer);
  }, [fileTree]);

  if (openFileIds.length === 0) {
    return null;
  }

  return (
    <div className="flex bg-[#252526] flex-shrink-0" role="tablist">
      {openFileIds.map(id => {
        const file = findNodeById(treeData, id)?.node;
        const isActive = activeFileId === id;
        
        if (!file) {
            // This can happen briefly if a file is deleted by another user
            return null;
        }

        return (
          <div
            key={id}
            onClick={() => openFile(id)}
            role="tab"
            aria-selected={isActive}
            className={`flex items-center justify-between px-4 py-2 cursor-pointer border-r border-t text-sm ${
              isActive
                ? 'bg-[#1e1e1e] text-white border-t-blue-500'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border-t-transparent'
            }`}
          >
            <div className="flex items-center">
                <FileIcon className="w-4 h-4 mr-2 text-gray-400" />
                <span className="truncate">{file.name}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeFile(id);
              }}
              className="ml-4 p-0.5 rounded hover:bg-gray-600"
              aria-label={`Close ${file.name}`}
            >
              <CloseIcon className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Tabs;
