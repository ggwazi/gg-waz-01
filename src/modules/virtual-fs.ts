import { FileSystemEntry, VirtualFile, VirtualFileSystem } from '../types/index.js';

export class VirtualFileSystemImpl implements VirtualFileSystem {
  private root: FileSystemEntry;
  private fileCache: Map<string, string | Buffer>;

  constructor(initialFiles?: VirtualFile[]) {
    this.root = {
      type: 'directory',
      path: '/',
      children: new Map(),
      metadata: {
        created: new Date(),
        modified: new Date(),
        size: 0,
      },
    };
    this.fileCache = new Map();

    if (initialFiles) {
      initialFiles.forEach((file) => this.writeFileSync(file.path, file.content));
    }
  }

  async readFile(
    path: string,
    encoding?: BufferEncoding
  ): Promise<string | Buffer> {
    const normalized = this.normalizePath(path);
    const content = this.fileCache.get(normalized);

    if (content === undefined) {
      throw new Error(`ENOENT: no such file or directory, open '${path}'`);
    }

    if (encoding && typeof content === 'string') {
      return Buffer.from(content, encoding as BufferEncoding);
    }

    return content;
  }

  private writeFileSync(path: string, content: string | Buffer): void {
    const normalized = this.normalizePath(path);
    const parts = normalized.split('/').filter((p) => p);

    let current = this.root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current.children) {
        current.children = new Map();
      }
      if (!current.children.has(part)) {
        current.children.set(part, {
          type: 'directory',
          path: `${current.path}${part}/`,
          children: new Map(),
          metadata: {
            created: new Date(),
            modified: new Date(),
            size: 0,
          },
        });
      }
      current = current.children.get(part)!;
    }

    const filename = parts[parts.length - 1];
    if (!current.children) {
      current.children = new Map();
    }

    const fileContent = typeof content === 'string' ? content : content.toString();
    current.children.set(filename, {
      type: 'file',
      path: normalized,
      content: fileContent,
      metadata: {
        created: new Date(),
        modified: new Date(),
        size: fileContent.length,
      },
    });

    this.fileCache.set(normalized, fileContent);
  }

  async writeFile(path: string, content: string | Buffer): Promise<void> {
    this.writeFileSync(path, content);
  }

  async mkdir(path: string): Promise<void> {
    const normalized = this.normalizePath(path);
    const parts = normalized.split('/').filter((p) => p);

    let current = this.root;
    for (const part of parts) {
      if (!current.children) {
        current.children = new Map();
      }
      if (!current.children.has(part)) {
        current.children.set(part, {
          type: 'directory',
          path: `${current.path}${part}/`,
          children: new Map(),
          metadata: {
            created: new Date(),
            modified: new Date(),
            size: 0,
          },
        });
      }
      current = current.children.get(part)!;
    }
  }

  async rm(path: string, recursive = false): Promise<void> {
    const normalized = this.normalizePath(path);
    const parts = normalized.split('/').filter((p) => p);

    if (parts.length === 0) {
      throw new Error('Cannot delete root directory');
    }

    let current = this.root;
    const pathSegments: Array<{ parent: FileSystemEntry; key: string }> = [];

    for (const part of parts) {
      if (!current.children || !current.children.has(part)) {
        throw new Error(`ENOENT: no such file or directory, rm '${path}'`);
      }
      pathSegments.push({ parent: current, key: part });
      current = current.children.get(part)!;
    }

    if (current.type === 'directory' && current.children && current.children.size > 0 && !recursive) {
      throw new Error(`EISDIRM: illegal operation on a directory, rm '${path}'`);
    }

    const lastSegment = pathSegments[pathSegments.length - 1];
    lastSegment.parent.children?.delete(lastSegment.key);
    this.fileCache.delete(normalized);
  }

  async ls(path: string): Promise<string[]> {
    const normalized = this.normalizePath(path);
    const entry = this.findEntry(normalized);

    if (!entry) {
      throw new Error(`ENOENT: no such file or directory, scandir '${path}'`);
    }

    if (entry.type !== 'directory') {
      throw new Error(`ENOTDIR: not a directory, scandir '${path}'`);
    }

    return Array.from(entry.children?.keys() || []);
  }

  async exists(path: string): Promise<boolean> {
    const normalized = this.normalizePath(path);
    return this.findEntry(normalized) !== undefined;
  }

  async stat(
    path: string
  ): Promise<{
    isFile: () => boolean;
    isDirectory: () => boolean;
    size: number;
    mtime: Date;
  }> {
    const normalized = this.normalizePath(path);
    const entry = this.findEntry(normalized);

    if (!entry) {
      throw new Error(`ENOENT: no such file or directory, stat '${path}'`);
    }

    return {
      isFile: () => entry.type === 'file',
      isDirectory: () => entry.type === 'directory',
      size: entry.metadata?.size || 0,
      mtime: entry.metadata?.modified || new Date(),
    };
  }

  private findEntry(path: string): FileSystemEntry | undefined {
    const parts = path.split('/').filter((p) => p);

    if (parts.length === 0) {
      return this.root;
    }

    let current: FileSystemEntry | undefined = this.root;
    for (const part of parts) {
      if (!current || !current.children) {
        return undefined;
      }
      current = current.children.get(part);
      if (!current) {
        return undefined;
      }
    }

    return current;
  }

  private normalizePath(path: string): string {
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }

  getRoot(): FileSystemEntry {
    return this.root;
  }
}
