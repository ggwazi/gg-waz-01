import { Runtime, RuntimeOptions, ExecutionResult, ModuleCache } from '../types/index.js';

export class RuntimeImpl implements Runtime {
  private moduleCache: ModuleCache;
  private globalContext: Record<string, unknown>;

  constructor() {
    this.moduleCache = {};
    this.globalContext = {
      console,
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
      Promise,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Date,
      RegExp,
      Error,
      Math,
    };
  }

  async execute(code: string, options?: RuntimeOptions): Promise<ExecutionResult> {
    const startTime = performance.now();
    let stdout = '';
    let stderr = '';
    let code_: number = 0;

    const cwd = options?.cwd || '/';
    const env = { ...process.env, ...options?.env };
    const timeout = options?.timeout || 30000;

    const mockConsole = {
      log: (...args: unknown[]) => {
        stdout += args.map((arg) => String(arg)).join(' ') + '\n';
      },
      error: (...args: unknown[]) => {
        stderr += args.map((arg) => String(arg)).join(' ') + '\n';
      },
      warn: (...args: unknown[]) => {
        stderr += args.map((arg) => String(arg)).join(' ') + '\n';
      },
      info: (...args: unknown[]) => {
        stdout += args.map((arg) => String(arg)).join(' ') + '\n';
      },
      debug: (...args: unknown[]) => {
        stdout += args.map((arg) => String(arg)).join(' ') + '\n';
      },
    };

    const context = {
      ...this.globalContext,
      console: mockConsole,
      __dirname: cwd,
      __filename: `${cwd}/index.js`,
      process: {
        cwd: () => cwd,
        env,
        argv: ['node', 'script.js'],
        exit: (code: number) => {
          code_ = code;
        },
      },
    };

    try {
      const fn = new Function(...Object.keys(context), code);
      await Promise.race([
        fn(...Object.values(context)),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Execution timeout')), timeout)
        ),
      ]);
    } catch (error) {
      if (error instanceof Error) {
        stderr += error.message + '\n' + (error.stack || '');
      } else {
        stderr += String(error);
      }
      code_ = 1;
    }

    const endTime = performance.now();

    return {
      stdout,
      stderr,
      code: code_,
      time: endTime - startTime,
    };
  }

  eval(code: string): unknown {
    const context = this.globalContext;
    const fn = new Function(...Object.keys(context), `return (${code})`);
    return fn(...Object.values(context));
  }

  getModuleCache(): ModuleCache {
    return this.moduleCache;
  }

  setModuleCache(cache: ModuleCache): void {
    this.moduleCache = cache;
  }

  getGlobalContext(): Record<string, unknown> {
    return this.globalContext;
  }

  setGlobalContext(context: Record<string, unknown>): void {
    this.globalContext = context;
  }
}
