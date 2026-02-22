export * from './types/index.js';
export * from './modules/virtual-fs.js';
export * from './modules/runtime.js';
export * from './modules/package-manager.js';
export * from './modules/server-bridge.js';
export * from './modules/container.js';

import { AlmostNodeContainerImpl } from './modules/container.js';

export function createContainer() {
  return AlmostNodeContainerImpl.create();
}

export function createDefaultContainer() {
  return AlmostNodeContainerImpl.createWithDefaults();
}

export const AlmostNode = {
  createContainer,
  createDefaultContainer,
  Container: AlmostNodeContainerImpl,
};

export default AlmostNode;
