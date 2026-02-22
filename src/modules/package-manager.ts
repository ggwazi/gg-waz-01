import {
  PackageManager,
  PackageInfo,
  ModuleCache,
  VirtualFileSystem,
} from '../types/index.js';

export class PackageManagerImpl implements PackageManager {
  private moduleCache: ModuleCache;
  private fs: VirtualFileSystem;
  private packages: Map<string, PackageInfo>;

  constructor(fs: VirtualFileSystem) {
    this.moduleCache = {};
    this.fs = fs;
    this.packages = new Map();
  }

  async install(name: string, version = 'latest'): Promise<void> {
    const pkgKey = `${name}@${version}`;

    if (this.packages.has(pkgKey)) {
      return;
    }

    const packageInfo: PackageInfo = {
      name,
      version,
      main: `dist/${name}.js`,
    };

    this.packages.set(pkgKey, packageInfo);

    const nodeModulesPath = `/node_modules/${name}`;
    await this.fs.mkdir(nodeModulesPath);

    const packageJson = JSON.stringify(packageInfo, null, 2);
    await this.fs.writeFile(`${nodeModulesPath}/package.json`, packageJson);
  }

  require(moduleName: string): unknown {
    if (this.moduleCache[moduleName]) {
      return this.moduleCache[moduleName];
    }

    const coreModules: Record<string, unknown> = {
      fs: this.getfsModule(),
      path: this.getPathModule(),
      buffer: this.getBufferModule(),
      events: this.getEventsModule(),
      util: this.getUtilModule(),
    };

    if (coreModules[moduleName]) {
      return coreModules[moduleName];
    }

    throw new Error(`Module not found: ${moduleName}`);
  }

  private getfsModule(): Record<string, unknown> {
    return {
      readFile: (path: string, callback?: (err: Error | null, data?: string) => void) => {
        if (callback) {
          this.fs
            .readFile(path as string, 'utf-8')
            .then((data) => callback(null, data as string))
            .catch((err) => callback(err));
        }
      },
      writeFile: (
        path: string,
        data: string,
        callback?: (err: Error | null) => void
      ) => {
        if (callback) {
          this.fs.writeFile(path as string, data).then(() => callback(null)).catch(callback);
        }
      },
      mkdir: (path: string, callback?: (err: Error | null) => void) => {
        if (callback) {
          this.fs.mkdir(path as string).then(() => callback(null)).catch(callback);
        }
      },
      readFileSync: (path: string) => {
        const content = this.moduleCache[`_file_${path}`];
        if (content) return content;
        throw new Error(`File not found: ${path}`);
      },
      writeFileSync: (path: string, data: string) => {
        this.moduleCache[`_file_${path}`] = data;
      },
    };
  }

  private getPathModule(): Record<string, unknown> {
    return {
      join: (...parts: string[]) => {
        return parts.join('/').replace(/\/+/g, '/');
      },
      resolve: (...parts: string[]) => {
        let path = parts.join('/').replace(/\/+/g, '/');
        if (!path.startsWith('/')) {
          path = '/' + path;
        }
        return path;
      },
      dirname: (path: string) => {
        const parts = path.split('/');
        return parts.slice(0, -1).join('/') || '/';
      },
      basename: (path: string, ext?: string) => {
        const name = path.split('/').pop() || '';
        return ext && name.endsWith(ext) ? name.slice(0, -ext.length) : name;
      },
      extname: (path: string) => {
        const name = path.split('/').pop() || '';
        const idx = name.lastIndexOf('.');
        return idx >= 0 ? name.slice(idx) : '';
      },
    };
  }

  private getBufferModule(): Record<string, unknown> {
    return {
      from: (data: string | Buffer, encoding?: BufferEncoding) => {
        return typeof data === 'string' ? Buffer.from(data, encoding) : data;
      },
      alloc: (size: number) => Buffer.alloc(size),
      allocUnsafe: (size: number) => Buffer.allocUnsafe(size),
      isBuffer: (obj: unknown) => Buffer.isBuffer(obj),
    };
  }

  private getEventsModule(): Record<string, unknown> {
    class EventEmitter {
      private listeners: Map<string, Array<(...args: unknown[]) => void>> = new Map();

      on(event: string, listener: (...args: unknown[]) => void) {
        if (!this.listeners.has(event)) {
          this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(listener);
        return this;
      }

      off(event: string, listener: (...args: unknown[]) => void) {
        const listeners = this.listeners.get(event);
        if (listeners) {
          const idx = listeners.indexOf(listener);
          if (idx >= 0) {
            listeners.splice(idx, 1);
          }
        }
        return this;
      }

      emit(event: string, ...args: unknown[]) {
        const listeners = this.listeners.get(event);
        if (listeners) {
          listeners.forEach((listener) => listener(...args));
        }
        return true;
      }
    }

    return {
      EventEmitter,
    };
  }

  private getUtilModule(): Record<string, unknown> {
    return {
      format: (f: string, ...args: unknown[]) => {
        let i = 0;
        return f.replace(/%[sdif%]/g, (match: string): string => {
          if (match === '%%') return '%';
          const arg = args[i++];
          if (match === '%s') return String(arg);
          if (match === '%d') return String(Number(arg));
          if (match === '%i') return String(Math.floor(Number(arg)));
          if (match === '%f') return String(parseFloat(String(arg)));
          return match;
        });
      },
      inspect: (obj: unknown) => JSON.stringify(obj as any, null, 2),
      inherits: (ctor: any, superCtor: any) => {
        Object.setPrototypeOf(ctor, superCtor);
      },
    };
  }

  getModuleCache(): ModuleCache {
    return this.moduleCache;
  }

  getPackages(): Map<string, PackageInfo> {
    return this.packages;
  }
}
