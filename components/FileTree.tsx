
import React, { useState, useEffect } from 'react';
import { useYjs } from '../hooks/useYjs';
import { useUiStore } from '../hooks/useUiStore';
import { FileNode } from '../types';
import { ChevronDownIcon, ChevronRightIcon, FileIcon, FolderIcon } from './icons';

const FileTree: React.FC = () => {
  const { fileTree, isSynced } = useYjs();
  const [treeData, setTreeData] = useState<FileNode[]>([]);

  useEffect(() => {
    if (!fileTree || !isSynced) return;

    const observer = () => {
      setTreeData(fileTree.toJSON());
    };
    
    fileTree.observe(observer);
    // Initial load
    setTreeData(fileTree.toJSON());

    return () => {
      fileTree.unobserve(observer);
    };
  }, [fileTree, isSynced]);

  return (
    <div className="p-2 text-gray-300">
      <h2 className="text-xs font-bold uppercase tracking-wider mb-2 px-2">Explorer</h2>
      {!isSynced && <div className="px-2 text-sm text-gray-500">Syncing...</div>}
      {treeData.map((node, index) => (
        <TreeNode key={node.id} node={node} level={0} />
      ))}
    </div>
  );
};

interface TreeNodeProps {
  node: FileNode;
  level: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level }) => {
  const [isOpen, setIsOpen] = useState(true);
  const activeFileId = useUiStore((state) => state.activeFileId);
  const setActiveFileId = useUiStore((state) => state.setActiveFileId);

  const isFolder = node.isFolder;
  const isActive = !isFolder && activeFileId === node.id;

  const handleToggle = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      setActiveFileId(node.id);
    }
  };

  const iconSize = "w-4 h-4 mr-2 flex-shrink-0";

  return (
    <div>
      <div
        onClick={handleToggle}
        className={`flex items-center py-1 px-2 rounded cursor-pointer hover:bg-gray-700 ${isActive ? 'bg-blue-800/50' : ''}`}
        style={{ paddingLeft: `${level * 1 + 0.5}rem` }}
      >
        {isFolder ? (
          <>
            {isOpen ? <ChevronDownIcon className={iconSize} /> : <ChevronRightIcon className={iconSize} />}
            <FolderIcon className={`${iconSize} text-sky-400`} />
          </>
        ) : (
          <FileIcon className={`${iconSize} ml-4 text-gray-400`} />
        )}
        <span className="truncate text-sm">{node.name}</span>
      </div>
      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((childNode) => (
            <TreeNode key={childNode.id} node={childNode} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTree;
