import {
  AlmostNodeContainer,
  ContainerConfig,
  VirtualFile,
} from '../types/index.js';
import { VirtualFileSystemImpl } from './virtual-fs.js';
import { RuntimeImpl } from './runtime.js';
import { PackageManagerImpl } from './package-manager.js';
import { ServerBridgeImpl } from './server-bridge.js';

export class AlmostNodeContainerImpl implements AlmostNodeContainer {
  fs: VirtualFileSystemImpl;
  runtime: RuntimeImpl;
  packageManager: PackageManagerImpl;
  serverBridge: ServerBridgeImpl;

  private constructor(
    fs: VirtualFileSystemImpl,
    runtime: RuntimeImpl,
    packageManager: PackageManagerImpl,
    serverBridge: ServerBridgeImpl
  ) {
    this.fs = fs;
    this.runtime = runtime;
    this.packageManager = packageManager;
    this.serverBridge = serverBridge;
  }

  static create(config?: ContainerConfig): AlmostNodeContainerImpl {
    const initialFiles: VirtualFile[] = config?.fs
      ? Array.from(config.fs.values()).map((entry) => ({
          path: entry.path,
          content: entry.content || '',
        }))
      : [];

    const fs = new VirtualFileSystemImpl(initialFiles);
    const runtime = new RuntimeImpl();
    const packageManager = new PackageManagerImpl(fs);
    const serverBridge = new ServerBridgeImpl(runtime, fs, config?.serverConfig);

    return new AlmostNodeContainerImpl(fs, runtime, packageManager, serverBridge);
  }

  static createWithDefaults(): AlmostNodeContainerImpl {
    return this.create();
  }

  async setupFileSystem(files: VirtualFile[]): Promise<void> {
    for (const file of files) {
      await this.fs.mkdir(file.path.substring(0, file.path.lastIndexOf('/')));
      await this.fs.writeFile(file.path, file.content);
    }
  }

  getFileSystem(): VirtualFileSystemImpl {
    return this.fs;
  }

  getRuntime(): RuntimeImpl {
    return this.runtime;
  }

  getPackageManager(): PackageManagerImpl {
    return this.packageManager;
  }

  getServerBridge(): ServerBridgeImpl {
    return this.serverBridge;
  }
}
