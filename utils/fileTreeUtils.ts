import * as Y from 'yjs';
import { nanoid } from 'nanoid';
import { FileNode } from '../types';
import { getBoilerplate } from './fileTemplates';

/**
 * Finds a node in a plain JavaScript file tree structure by its ID.
 * This function is now more robust against malformed tree data.
 * @param nodes The array of FileNode to search in.
 * @param nodeId The ID of the node to find.
 * @returns An object containing the found FileNode, or null.
 */
export function findNodeById(nodes: FileNode[], nodeId: string): { node: FileNode } | null {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    
    // Defensively check if node is a valid object before accessing properties
    if (!node || typeof node !== 'object') {
        continue;
    }

    if (node.id === nodeId) {
      return { node };
    }

    // Check that children is an array before recursing
    if (node.isFolder && Array.isArray(node.children)) {
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
 * This function is now more robust, checking types before operating to prevent crashes.
 * @param nodes Y.Array of file nodes.
 * @param nodeId The ID of the node to find.
 * @param operation A callback to execute on the found node, its parent array, and its index.
 * @returns boolean - True if the node was found and operated on, false otherwise.
 */
function findAndOperate(
    nodes: Y.Array<any>,
    nodeId: string,
    operation: (node: Y.Map<any>, parent: Y.Array<any>, index: number) => void
  ): boolean {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes.get(i);

      // Defensively check if the item is a Y.Map, as expected for our tree structure.
      if (!(node instanceof Y.Map)) {
        console.warn('Skipping an item in Y.Array because it is not a Y.Map:', node);
        continue;
      }

      if (node.get('id') === nodeId) {
        operation(node, nodes, i);
        return true;
      }

      if (node.get('isFolder')) {
        const children = node.get('children');
        // Check if children is a Y.Array before recursing
        if (children instanceof Y.Array) {
            if (findAndOperate(children, nodeId, operation)) {
              return true;
            }
        }
      }
    }
    return false;
}

export const deleteNode = (doc: Y.Doc, nodeId: string) => {
    if(!doc) return;
    const fileTree = doc.getArray<FileNode>('fileTree');
    const fileContents = doc.getMap<Y.Text>('fileContents');

    // This function recursively finds all file IDs within a given node structure (file or folder)
    const collectFileIds = (node: Y.Map<any>): string[] => {
        const ids: string[] = [];
        if (!node.get('isFolder')) {
            const id = node.get('id');
            if (typeof id === 'string') {
                ids.push(id);
            }
        } else {
            const children = node.get('children');
            if (children instanceof Y.Array) {
                for(let i = 0; i < children.length; i++) {
                    const childNode = children.get(i);
                    if (childNode instanceof Y.Map) {
                        ids.push(...collectFileIds(childNode));
                    }
                }
            }
        }
        return ids;
    };

    doc.transact(() => {
        findAndOperate(fileTree, nodeId, (node, parent, index) => {
            // Collect all file IDs from the node to be deleted (and its children if it's a folder)
            const fileIdsToDelete = collectFileIds(node);
            
            // Delete the content for each file
            fileIdsToDelete.forEach(id => {
                if (fileContents.has(id)) {
                    fileContents.delete(id);
                }
            });

            // Delete the node itself from the tree structure
            parent.delete(index, 1);
        });
    });
};

export const renameNode = (doc: Y.Doc, nodeId: string, newName: string) => {
    if(!doc) return;
    const fileTree = doc.getArray<FileNode>('fileTree');
    doc.transact(() => {
        findAndOperate(fileTree, nodeId, (node) => {
            node.set('name', newName);
        });
    });
};

const _addNode = (doc: Y.Doc, parentId: string | null, node: FileNode) => {
    if(!doc) return;
    const fileTree = doc.getArray<FileNode>('fileTree');
    const fileContents = doc.getMap<Y.Text>('fileContents');
    
    doc.transact(() => {
        if (parentId === null) {
            fileTree.push([node]);
        } else {
            findAndOperate(fileTree, parentId, (parentNode) => {
                if (parentNode.get('isFolder')) {
                    let children = parentNode.get('children');
                    if (!(children instanceof Y.Array)) {
                        children = new Y.Array();
                        parentNode.set('children', children);
                    }
                    children.push([node]);
                }
            });
        }
        // If adding a file, also create its content with boilerplate
        if (!node.isFolder) {
            const boilerplate = getBoilerplate(node.name);
            fileContents.set(node.id, new Y.Text(boilerplate));
        }
    });
};

export const addFile = (doc: Y.Doc | null, parentId: string | null, name: string) => {
    if (!doc || !name || name.trim() === '') return;
    const newFile: FileNode = { id: nanoid(), name: name.trim(), isFolder: false };
    _addNode(doc, parentId, newFile);
};

export const addFolder = (doc: Y.Doc | null, parentId: string | null, name: string) => {
    if (!doc || !name || name.trim() === '') return;
    const newFolder: FileNode = { id: nanoid(), name: name.trim(), isFolder: true, children: [] };
    _addNode(doc, parentId, newFolder);
};