import { describe, it, expect, beforeEach } from 'vitest';
import { RuntimeImpl } from '../../src/modules/runtime';

describe('Runtime', () => {
  let runtime: RuntimeImpl;

  beforeEach(() => {
    runtime = new RuntimeImpl();
  });

  describe('execute', () => {
    it('should execute simple code', async () => {
      const result = await runtime.execute('console.log("Hello World");');
      expect(result.stdout).toContain('Hello World');
      expect(result.code).toBe(0);
    });

    it('should capture console output', async () => {
      const result = await runtime.execute('console.log(2 + 2);');
      expect(result.stdout).toContain('4');
    });

    it('should handle errors', async () => {
      const result = await runtime.execute('throw new Error("Test error");');
      expect(result.stderr).toContain('Test error');
      expect(result.code).toBe(1);
    });

    it('should have access to process object', async () => {
      const result = await runtime.execute('console.log(typeof process);');
      expect(result.stdout).toContain('object');
    });

    it('should have access to Math object', async () => {
      const result = await runtime.execute('console.log(Math.sqrt(16));');
      expect(result.stdout).toContain('4');
    });

    it('should have access to JSON object', async () => {
      const result = await runtime.execute('console.log(JSON.stringify({a: 1}));');
      expect(result.stdout).toContain('{"a":1}');
    });
  });

  describe('eval', () => {
    it('should evaluate expressions', () => {
      const result = runtime.eval('2 + 2');
      expect(result).toBe(4);
    });

    it('should evaluate objects', () => {
      const result = runtime.eval('({a: 1, b: 2})');
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should evaluate arrays', () => {
      const result = runtime.eval('[1, 2, 3]');
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('module cache', () => {
    it('should store and retrieve modules', () => {
      const cache = runtime.getModuleCache();
      cache['test'] = { value: 42 };
      expect(cache['test']).toEqual({ value: 42 });
    });
  });

  describe('global context', () => {
    it('should have console available', () => {
      const context = runtime.getGlobalContext();
      expect(context.console).toBeDefined();
    });

    it('should have Promise available', () => {
      const context = runtime.getGlobalContext();
      expect(context.Promise).toBeDefined();
    });
  });
});
