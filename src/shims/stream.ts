export class Readable {
  private chunks: any[] = [];
  private listeners: { [key: string]: Function[] } = {};

  push(chunk: any): void {
    if (chunk === null) {
      this.emit('end');
    } else {
      this.chunks.push(chunk);
      this.emit('data', chunk);
    }
  }

  on(event: string, listener: (...args: any[]) => void): this {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
    return this;
  }

  off(event: string, listener: (...args: any[]) => void): this {
    const listeners = this.listeners[event];
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    }
    return this;
  }

  private emit(event: string, ...args: any[]): void {
    const listeners = this.listeners[event];
    if (listeners) {
      listeners.forEach((listener) => listener(...args));
    }
  }
}

export class Writable {
  private listeners: { [key: string]: Function[] } = {};
  private chunks: any[] = [];

  write(chunk: any, callback?: () => void): void {
    this.chunks.push(chunk);
    this.emit('data', chunk);
    if (callback) {
      callback();
    }
  }

  end(chunk?: any, callback?: () => void): void {
    if (chunk) {
      this.write(chunk);
    }
    this.emit('end');
    if (callback) {
      callback();
    }
  }

  on(event: string, listener: (...args: any[]) => void): this {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
    return this;
  }

  off(event: string, listener: (...args: any[]) => void): this {
    const listeners = this.listeners[event];
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    }
    return this;
  }

  private emit(event: string, ...args: any[]): void {
    const listeners = this.listeners[event];
    if (listeners) {
      listeners.forEach((listener) => listener(...args));
    }
  }
}

export class Transform extends Readable {
  _transform?: (
    chunk: any,
    encoding: string,
    callback: (err?: any, data?: any) => void
  ) => void;

  write(chunk: any, callback?: () => void): void {
    if (this._transform) {
      this._transform(chunk, 'utf8', (err, data) => {
        if (!err) {
          this.push(data);
        }
        if (callback) {
          callback();
        }
      });
    }
  }
}

export const streamShim = {
  Readable,
  Writable,
  Transform,
};

export default streamShim;
