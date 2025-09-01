
export type FileNode = {
  id: string;
  name: string;
  content?: string; // Only for files
  children?: FileNode[]; // Only for folders
  isFolder: boolean;
};
