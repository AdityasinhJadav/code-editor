import * as Y from 'yjs';
import { nanoid } from 'nanoid';
import { FileNode } from '../types';

/**
 * Finds a node in a plain JavaScript file tree structure by its ID.
 * @param nodes The array of FileNode to search in.
 * @param nodeId The ID of the node to find.
 * @returns The found FileNode or null.
 */
export function findNodeById(nodes: FileNode[], nodeId: string): { node: FileNode, parent?: FileNode, index?: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.id === nodeId) {
      return { node };
    }
    if (node.isFolder && node.children) {
      const found = findNodeById(node.children, nodeId);
      if (found) {
        return found;
      }
    }
  }
  return null;
}


// --- Yjs specific utils ---

/**
 * Recursively searches a Y.Array of file nodes and applies an operation when the target node is found.
 * @param nodes Y.Array of file nodes.
 * @param nodeId The ID of the node to find.
 * @param operation A callback to execute on the parent array and index of the found node.
 * @returns boolean - True if the node was found and operated on, false otherwise.
 */
function findAndOperate(
    nodes: Y.Array<any>,
    nodeId: string,
    operation: (parent: Y.Array<any>, index: number) => void
  ): boolean {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes.get(i) as Y.Map<any>;
      if (node.get('id') === nodeId) {
        operation(nodes, i);
        return true;
      }
      if (node.get('isFolder')) {
        const children = node.get('children') as Y.Array<any> | undefined;
        if (children && findAndOperate(children, nodeId, operation)) {
          return true;
        }
      }
    }
    return false;
}

export const deleteNode = (doc: Y.Doc, nodeId: string) => {
    const fileTree = doc.getArray<FileNode>('fileTree');
    const fileContents = doc.getMap<Y.Text>('fileContents');
    doc.transact(() => {
        const deleted = findAndOperate(fileTree, nodeId, (parent, index) => {
            parent.delete(index, 1);
        });
        if (deleted) {
            // Also delete file content if it exists
            if (fileContents.has(nodeId)) {
                fileContents.delete(nodeId);
            }
        }
    });
};

export const renameNode = (doc: Y.Doc, nodeId: string, newName: string) => {
    const fileTree = doc.getArray<FileNode>('fileTree');
    doc.transact(() => {
        findAndOperate(fileTree, nodeId, (parent, index) => {
            const node = parent.get(index) as Y.Map<any>;
            node.set('name', newName);
        });
    });
};

const _addNode = (doc: Y.Doc, parentId: string | null, node: FileNode) => {
    const fileTree = doc.getArray<FileNode>('fileTree');
    doc.transact(() => {
        if (parentId === null) {
            fileTree.push([node]);
        } else {
            findAndOperate(fileTree, parentId, (parent, index) => {
                const parentNode = parent.get(index) as Y.Map<any>;
                if (parentNode.get('isFolder')) {
                    let children = parentNode.get('children') as Y.Array<any> | undefined;
                    if (!children) {
                        children = new Y.Array();
                        parentNode.set('children', children);
                    }
                    children.push([node]);
                }
            });
        }
    });
};

export const addFile = (doc: Y.Doc, parentId: string | null, name: string) => {
    const newFile: FileNode = { id: nanoid(), name, isFolder: false };
    _addNode(doc, parentId, newFile);
};

export const addFolder = (doc: Y.Doc, parentId: string | null, name: string) => {
    const newFolder: FileNode = { id: nanoid(), name, isFolder: true, children: [] };
    _addNode(doc, parentId, newFolder);
};
