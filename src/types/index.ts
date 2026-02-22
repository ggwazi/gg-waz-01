export interface FileSystemEntry {
  type: 'file' | 'directory';
  path: string;
  content?: string | Buffer;
  children?: Map<string, FileSystemEntry>;
  metadata?: {
    created: Date;
    modified: Date;
    size: number;
  };
}

export interface VirtualFile {
  path: string;
  content: string | Buffer;
  encoding?: BufferEncoding;
}

export interface RuntimeOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  sandbox?: boolean;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  code: number;
  time: number;
}

export interface PackageInfo {
  name: string;
  version: string;
  main?: string;
  exports?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface ModuleCache {
  [key: string]: unknown;
}

export interface ServerConfig {
  port?: number;
  host?: string;
  cors?: boolean;
}

export interface ContainerConfig {
  fs?: Map<string, FileSystemEntry>;
  env?: Record<string, string>;
  serverConfig?: ServerConfig;
}

export interface AlmostNodeContainer {
  fs: VirtualFileSystem;
  runtime: Runtime;
  packageManager: PackageManager;
  serverBridge: ServerBridge;
}

export interface VirtualFileSystem {
  readFile(path: string, encoding?: BufferEncoding): Promise<string | Buffer>;
  writeFile(path: string, content: string | Buffer): Promise<void>;
  mkdir(path: string): Promise<void>;
  rm(path: string, recursive?: boolean): Promise<void>;
  ls(path: string): Promise<string[]>;
  exists(path: string): Promise<boolean>;
  stat(path: string): Promise<{
    isFile: () => boolean;
    isDirectory: () => boolean;
    size: number;
    mtime: Date;
  }>;
}

export interface Runtime {
  execute(code: string, options?: RuntimeOptions): Promise<ExecutionResult>;
  eval(code: string): unknown;
}

export interface PackageManager {
  install(name: string, version?: string): Promise<void>;
  require(moduleName: string): unknown;
}

export interface ServerBridge {
  createServer(handler: (req: Request) => Promise<Response>): void;
  route(pattern: string, handler: (req: Request) => Promise<Response>): void;
}
