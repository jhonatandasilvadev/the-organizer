export interface Note {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  content: string;
  color: string;
  zIndex: number;
  folderId?: string | null; // ID da pasta que contém a nota (null = master workflow)
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
  x: number;
  y: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

