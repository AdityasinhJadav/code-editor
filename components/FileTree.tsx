import React, { useState, useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { useYjs } from '../hooks/useYjs';
import { useUiStore } from '../hooks/useUiStore';
import { FileNode } from '../types';
import { ChevronDownIcon, ChevronRightIcon, FileIcon, FolderIcon, NewFileIcon, NewFolderIcon } from './icons';
import { addFile, addFolder, deleteNode, renameNode } from '../utils/fileTreeUtils';
import ContextMenu from './ui/ContextMenu';
import Tooltip from './ui/Tooltip';

const FileTree: React.FC = () => {
  const { fileTree, isSynced, doc } = useYjs();
  const [treeData, setTreeData] = useState<FileNode[]>([]);
  const openFile = useUiStore((state) => state.openFile);

  useEffect(() => {
    if (!fileTree || !isSynced) return;

    const observer = () => {
      setTreeData(fileTree.toJSON());
    };
    
    fileTree.observe(observer);
    setTreeData(fileTree.toJSON());

    return () => {
      fileTree.unobserve(observer);
    };
  }, [fileTree, isSynced]);

  const handleAddFile = () => {
    if (!doc) return;
    addFile(doc, null, 'new-file.txt');
  };
  
  const handleAddFolder = () => {
    if (!doc) return;
    addFolder(doc, null, 'new-folder');
  };

  return (
    <div className="p-2 text-gray-300 flex-grow flex flex-col">
      <div className="flex justify-between items-center mb-2 px-2">
        <h2 className="text-xs font-bold uppercase tracking-wider">Explorer</h2>
        <div className="flex items-center gap-2">
            <Tooltip text="New File">
                <button onClick={handleAddFile} className="text-gray-400 hover:text-white">
                    <NewFileIcon className="w-4 h-4" />
                </button>
            </Tooltip>
            <Tooltip text="New Folder">
                <button onClick={handleAddFolder} className="text-gray-400 hover:text-white">
                    <NewFolderIcon className="w-4 h-4" />
                </button>
            </Tooltip>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        {!isSynced && <div className="px-2 text-sm text-gray-500">Syncing...</div>}
        {treeData.map((node) => (
          <TreeNode key={node.id} node={node} level={0} />
        ))}
      </div>
    </div>
  );
};

interface TreeNodeProps {
  node: FileNode;
  level: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null);
  const { doc } = useYjs();
  const { activeFileId, openFile, closeFile } = useUiStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  const isFolder = node.isFolder;
  const isActive = !isFolder && activeFileId === node.id;

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      openFile(node.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleRename = () => {
    setContextMenu(null);
    setIsRenaming(true);
  };
  
  const handleDelete = () => {
    setContextMenu(null);
    if (!doc || !window.confirm(`Are you sure you want to delete "${node.name}"?`)) return;
    deleteNode(doc, node.id);
    closeFile(node.id);
  };

  const handleRenameSubmit = (newName: string) => {
    setIsRenaming(false);
    if (!doc || newName.trim() === '' || newName === node.name) return;
    renameNode(doc, node.id, newName.trim());
  };

  const iconSize = "w-4 h-4 mr-2 flex-shrink-0";
  const menuItems = [
    { label: 'Rename', action: handleRename },
    { label: 'Delete', action: handleDelete },
  ];

  return (
    <div>
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
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
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            defaultValue={node.name}
            onBlur={(e) => handleRenameSubmit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit(e.currentTarget.value);
              if (e.key === 'Escape') setIsRenaming(false);
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 border border-blue-500 text-white text-sm rounded w-full -m-1 p-0.5"
          />
        ) : (
          <span className="truncate text-sm">{node.name}</span>
        )}
      </div>
      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((childNode) => (
            <TreeNode key={childNode.id} node={childNode} level={level + 1} />
          ))}
        </div>
      )}
      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} items={menuItems} onClose={() => setContextMenu(null)} />}
    </div>
  );
};

export default FileTree;
