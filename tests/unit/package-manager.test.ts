import { describe, it, expect, beforeEach } from 'vitest';
import { VirtualFileSystemImpl } from '../../src/modules/virtual-fs';
import { PackageManagerImpl } from '../../src/modules/package-manager';

describe('PackageManager', () => {
  let fs: VirtualFileSystemImpl;
  let pm: PackageManagerImpl;

  beforeEach(() => {
    fs = new VirtualFileSystemImpl();
    pm = new PackageManagerImpl(fs);
  });

  describe('install', () => {
    it('should install packages', async () => {
      await pm.install('lodash', '4.17.21');
      const packages = pm.getPackages();
      expect(packages.has('lodash@4.17.21')).toBe(true);
    });

    it('should not duplicate packages', async () => {
      await pm.install('lodash', '4.17.21');
      await pm.install('lodash', '4.17.21');
      const packages = pm.getPackages();
      const count = Array.from(packages.keys()).filter(
        (key) => key.startsWith('lodash')
      ).length;
      expect(count).toBe(1);
    });
  });

  describe('require', () => {
    it('should require fs module', () => {
      const fsModule = pm.require('fs');
      expect(fsModule).toBeDefined();
      expect(typeof fsModule).toBe('object');
    });

    it('should require path module', () => {
      const pathModule = pm.require('path');
      expect(pathModule).toBeDefined();
      expect(typeof pathModule).toBe('object');
    });

    it('should require buffer module', () => {
      const bufferModule = pm.require('buffer');
      expect(bufferModule).toBeDefined();
    });

    it('should require events module', () => {
      const eventsModule = pm.require('events');
      expect(eventsModule).toBeDefined();
    });

    it('should require util module', () => {
      const utilModule = pm.require('util');
      expect(utilModule).toBeDefined();
    });

    it('should throw for non-existent module', () => {
      expect(() => pm.require('nonexistent')).toThrow();
    });

    it('should cache modules', () => {
      const mod1 = pm.require('path');
      const mod2 = pm.require('path');
      expect(mod1).toBe(mod2);
    });
  });

  describe('path module', () => {
    it('should join paths', () => {
      const pathModule = pm.require('path') as any;
      const result = pathModule.join('/a', 'b', 'c');
      expect(result).toBe('/a/b/c');
    });

    it('should resolve paths', () => {
      const pathModule = pm.require('path') as any;
      const result = pathModule.resolve('a', 'b');
      expect(result).toContain('/');
    });

    it('should get dirname', () => {
      const pathModule = pm.require('path') as any;
      const result = pathModule.dirname('/a/b/c.js');
      expect(result).toBe('/a/b');
    });

    it('should get basename', () => {
      const pathModule = pm.require('path') as any;
      const result = pathModule.basename('/a/b/c.js');
      expect(result).toBe('c.js');
    });

    it('should get extension', () => {
      const pathModule = pm.require('path') as any;
      const result = pathModule.extname('/a/b/c.js');
      expect(result).toBe('.js');
    });
  });
});
