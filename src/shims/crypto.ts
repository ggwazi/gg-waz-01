export const cryptoShim = {
  randomUUID: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  randomBytes: (size: number): Buffer => {
    const buffer = new Uint8Array(size);
    if (typeof globalThis !== 'undefined' && 'crypto' in globalThis) {
      globalThis.crypto.getRandomValues(buffer);
    } else {
      for (let i = 0; i < size; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
      }
    }
    return Buffer.from(buffer);
  },

  getRandomValues: (array: any) => {
    if (typeof globalThis !== 'undefined' && 'crypto' in globalThis) {
      return globalThis.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }
  },

  subtleShim: {
    digest: async (algorithm: string) => {
      console.warn(`crypto.subtle.digest not fully implemented for ${algorithm}`);
      return new ArrayBuffer(32);
    },
  },

  subtle: {
    digest: async (algorithm: string, data: ArrayBuffer) => {
      if (
        typeof globalThis !== 'undefined' &&
        'crypto' in globalThis &&
        'subtle' in globalThis.crypto
      ) {
        return globalThis.crypto.subtle.digest(algorithm, data);
      }
      console.warn(`crypto.subtle.digest not available for ${algorithm}`);
      return new ArrayBuffer(32);
    },
  },
};

export default cryptoShim;
