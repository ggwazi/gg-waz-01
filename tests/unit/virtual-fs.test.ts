import { describe, it, expect, beforeEach } from 'vitest';
import { VirtualFileSystemImpl } from '../../src/modules/virtual-fs';

describe('VirtualFileSystem', () => {
  let fs: VirtualFileSystemImpl;

  beforeEach(() => {
    fs = new VirtualFileSystemImpl();
  });

  describe('writeFile and readFile', () => {
    it('should write and read files', async () => {
      await fs.writeFile('/test.txt', 'Hello World');
      const content = await fs.readFile('/test.txt', 'utf-8');
      expect(content).toBe('Hello World');
    });

    it('should throw error for non-existent file', async () => {
      await expect(fs.readFile('/nonexistent.txt')).rejects.toThrow();
    });

    it('should handle nested paths', async () => {
      await fs.mkdir('/a/b/c');
      await fs.writeFile('/a/b/c/file.txt', 'nested');
      const content = await fs.readFile('/a/b/c/file.txt', 'utf-8');
      expect(content).toBe('nested');
    });
  });

  describe('mkdir', () => {
    it('should create directories', async () => {
      await fs.mkdir('/testdir');
      const exists = await fs.exists('/testdir');
      expect(exists).toBe(true);
    });

    it('should create nested directories', async () => {
      await fs.mkdir('/a/b/c');
      const exists = await fs.exists('/a/b/c');
      expect(exists).toBe(true);
    });
  });

  describe('ls', () => {
    it('should list files in directory', async () => {
      await fs.writeFile('/file1.txt', 'content1');
      await fs.writeFile('/file2.txt', 'content2');
      await fs.mkdir('/dir1');

      const files = await fs.ls('/');
      expect(files).toContain('file1.txt');
      expect(files).toContain('file2.txt');
      expect(files).toContain('dir1');
    });

    it('should throw error for non-existent directory', async () => {
      await expect(fs.ls('/nonexistent')).rejects.toThrow();
    });
  });

  describe('exists', () => {
    it('should return true for existing files', async () => {
      await fs.writeFile('/test.txt', 'content');
      const exists = await fs.exists('/test.txt');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent files', async () => {
      const exists = await fs.exists('/nonexistent.txt');
      expect(exists).toBe(false);
    });
  });

  describe('rm', () => {
    it('should remove files', async () => {
      await fs.writeFile('/test.txt', 'content');
      await fs.rm('/test.txt');
      const exists = await fs.exists('/test.txt');
      expect(exists).toBe(false);
    });

    it('should remove directories with recursive flag', async () => {
      await fs.mkdir('/testdir');
      await fs.writeFile('/testdir/file.txt', 'content');
      await fs.rm('/testdir', true);
      const exists = await fs.exists('/testdir');
      expect(exists).toBe(false);
    });
  });

  describe('stat', () => {
    it('should get file statistics', async () => {
      await fs.writeFile('/test.txt', 'Hello');
      const stat = await fs.stat('/test.txt');
      expect(stat.isFile()).toBe(true);
      expect(stat.isDirectory()).toBe(false);
      expect(stat.size).toBe(5);
    });

    it('should get directory statistics', async () => {
      await fs.mkdir('/testdir');
      const stat = await fs.stat('/testdir');
      expect(stat.isFile()).toBe(false);
      expect(stat.isDirectory()).toBe(true);
    });
  });
});
