import { AlmostNodeContainer } from '../src/types/index.js';

export interface ShellCommand {
  name: string;
  execute: (args: string[], container: AlmostNodeContainer) => Promise<string>;
}

export const builtinCommands: { [key: string]: ShellCommand } = {
  ls: {
    name: 'ls',
    execute: async (args, container) => {
      const dir = args[0] || '.';
      try {
        const files = await container.fs.ls(dir);
        return files.join('\n');
      } catch (error) {
        return `ls: cannot access '${dir}': No such file or directory`;
      }
    },
  },

  pwd: {
    name: 'pwd',
    execute: async () => {
      return '/';
    },
  },

  cd: {
    name: 'cd',
    execute: async (args, container) => {
      const dir = args[0] || '/';
      const exists = await container.fs.exists(dir);
      if (!exists) {
        return `cd: no such file or directory: ${dir}`;
      }
      return '';
    },
  },

  mkdir: {
    name: 'mkdir',
    execute: async (args, container) => {
      if (args.length === 0) {
        return 'mkdir: missing operand';
      }
      for (const dir of args) {
        await container.fs.mkdir(dir);
      }
      return '';
    },
  },

  touch: {
    name: 'touch',
    execute: async (args, container) => {
      if (args.length === 0) {
        return 'touch: missing file operand';
      }
      for (const file of args) {
        await container.fs.writeFile(file, '');
      }
      return '';
    },
  },

  echo: {
    name: 'echo',
    execute: async (args) => {
      return args.join(' ');
    },
  },

  cat: {
    name: 'cat',
    execute: async (args, container) => {
      if (args.length === 0) {
        return 'cat: missing file operand';
      }
      try {
        const content = await container.fs.readFile(args[0], 'utf-8');
        return String(content);
      } catch (error) {
        return `cat: ${args[0]}: No such file or directory`;
      }
    },
  },

  rm: {
    name: 'rm',
    execute: async (args, container) => {
      if (args.length === 0) {
        return 'rm: missing operand';
      }
      for (const file of args) {
        await container.fs.rm(file);
      }
      return '';
    },
  },

  help: {
    name: 'help',
    execute: async () => {
      const commands = Object.keys(builtinCommands).join(', ');
      return `Available commands: ${commands}`;
    },
  },

  exit: {
    name: 'exit',
    execute: async () => {
      return 'exit';
    },
  },
};

export class BashShell {
  private container: AlmostNodeContainer;
  private cwd: string;

  constructor(container: AlmostNodeContainer) {
    this.container = container;
    this.cwd = '/';
  }

  async execute(input: string): Promise<string> {
    const trimmed = input.trim();
    if (!trimmed) {
      return '';
    }

    const [command, ...args] = trimmed.split(/\s+/);

    if (builtinCommands[command]) {
      return builtinCommands[command].execute(args, this.container);
    }

    return `${command}: command not found`;
  }

  getCurrentDirectory(): string {
    return this.cwd;
  }

  setCurrentDirectory(dir: string): void {
    this.cwd = dir;
  }
}

export async function createBashShell(container: AlmostNodeContainer): Promise<BashShell> {
  return new BashShell(container);
}
