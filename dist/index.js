var y = Object.defineProperty;
var C = (d, e, t) => e in d ? y(d, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : d[e] = t;
var a = (d, e, t) => C(d, typeof e != "symbol" ? e + "" : e, t);
class E {
  constructor(e) {
    a(this, "root");
    a(this, "fileCache");
    this.root = {
      type: "directory",
      path: "/",
      children: /* @__PURE__ */ new Map(),
      metadata: {
        created: /* @__PURE__ */ new Date(),
        modified: /* @__PURE__ */ new Date(),
        size: 0
      }
    }, this.fileCache = /* @__PURE__ */ new Map(), e && e.forEach((t) => this.writeFileSync(t.path, t.content));
  }
  async readFile(e, t) {
    const r = this.normalizePath(e), n = this.fileCache.get(r);
    if (n === void 0)
      throw new Error(`ENOENT: no such file or directory, open '${e}'`);
    return t && typeof n == "string" ? Buffer.from(n, t) : n;
  }
  writeFileSync(e, t) {
    const r = this.normalizePath(e), n = r.split("/").filter((h) => h);
    let i = this.root;
    for (let h = 0; h < n.length - 1; h++) {
      const l = n[h];
      i.children || (i.children = /* @__PURE__ */ new Map()), i.children.has(l) || i.children.set(l, {
        type: "directory",
        path: `${i.path}${l}/`,
        children: /* @__PURE__ */ new Map(),
        metadata: {
          created: /* @__PURE__ */ new Date(),
          modified: /* @__PURE__ */ new Date(),
          size: 0
        }
      }), i = i.children.get(l);
    }
    const s = n[n.length - 1];
    i.children || (i.children = /* @__PURE__ */ new Map());
    const c = typeof t == "string" ? t : t.toString();
    i.children.set(s, {
      type: "file",
      path: r,
      content: c,
      metadata: {
        created: /* @__PURE__ */ new Date(),
        modified: /* @__PURE__ */ new Date(),
        size: c.length
      }
    }), this.fileCache.set(r, c);
  }
  async writeFile(e, t) {
    this.writeFileSync(e, t);
  }
  async mkdir(e) {
    const r = this.normalizePath(e).split("/").filter((i) => i);
    let n = this.root;
    for (const i of r)
      n.children || (n.children = /* @__PURE__ */ new Map()), n.children.has(i) || n.children.set(i, {
        type: "directory",
        path: `${n.path}${i}/`,
        children: /* @__PURE__ */ new Map(),
        metadata: {
          created: /* @__PURE__ */ new Date(),
          modified: /* @__PURE__ */ new Date(),
          size: 0
        }
      }), n = n.children.get(i);
  }
  async rm(e, t = !1) {
    var h;
    const r = this.normalizePath(e), n = r.split("/").filter((l) => l);
    if (n.length === 0)
      throw new Error("Cannot delete root directory");
    let i = this.root;
    const s = [];
    for (const l of n) {
      if (!i.children || !i.children.has(l))
        throw new Error(`ENOENT: no such file or directory, rm '${e}'`);
      s.push({ parent: i, key: l }), i = i.children.get(l);
    }
    if (i.type === "directory" && i.children && i.children.size > 0 && !t)
      throw new Error(`EISDIRM: illegal operation on a directory, rm '${e}'`);
    const c = s[s.length - 1];
    (h = c.parent.children) == null || h.delete(c.key), this.fileCache.delete(r);
  }
  async ls(e) {
    var n;
    const t = this.normalizePath(e), r = this.findEntry(t);
    if (!r)
      throw new Error(`ENOENT: no such file or directory, scandir '${e}'`);
    if (r.type !== "directory")
      throw new Error(`ENOTDIR: not a directory, scandir '${e}'`);
    return Array.from(((n = r.children) == null ? void 0 : n.keys()) || []);
  }
  async exists(e) {
    const t = this.normalizePath(e);
    return this.findEntry(t) !== void 0;
  }
  async stat(e) {
    var n, i;
    const t = this.normalizePath(e), r = this.findEntry(t);
    if (!r)
      throw new Error(`ENOENT: no such file or directory, stat '${e}'`);
    return {
      isFile: () => r.type === "file",
      isDirectory: () => r.type === "directory",
      size: ((n = r.metadata) == null ? void 0 : n.size) || 0,
      mtime: ((i = r.metadata) == null ? void 0 : i.modified) || /* @__PURE__ */ new Date()
    };
  }
  findEntry(e) {
    const t = e.split("/").filter((n) => n);
    if (t.length === 0)
      return this.root;
    let r = this.root;
    for (const n of t)
      if (!r || !r.children || (r = r.children.get(n), !r))
        return;
    return r;
  }
  normalizePath(e) {
    return e.startsWith("/") || (e = "/" + e), e.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
  }
  getRoot() {
    return this.root;
  }
}
class M {
  constructor() {
    a(this, "moduleCache");
    a(this, "globalContext");
    this.moduleCache = {}, this.globalContext = {
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
      Math
    };
  }
  async execute(e, t) {
    const r = performance.now();
    let n = "", i = "", s = 0;
    const c = (t == null ? void 0 : t.cwd) || "/", h = { ...process.env, ...t == null ? void 0 : t.env }, l = (t == null ? void 0 : t.timeout) || 3e4, m = {
      log: (...o) => {
        n += o.map((u) => String(u)).join(" ") + `
`;
      },
      error: (...o) => {
        i += o.map((u) => String(u)).join(" ") + `
`;
      },
      warn: (...o) => {
        i += o.map((u) => String(u)).join(" ") + `
`;
      },
      info: (...o) => {
        n += o.map((u) => String(u)).join(" ") + `
`;
      },
      debug: (...o) => {
        n += o.map((u) => String(u)).join(" ") + `
`;
      }
    }, g = {
      ...this.globalContext,
      console: m,
      __dirname: c,
      __filename: `${c}/index.js`,
      process: {
        cwd: () => c,
        env: h,
        argv: ["node", "script.js"],
        exit: (o) => {
          s = o;
        }
      }
    };
    try {
      const o = new Function(...Object.keys(g), e);
      await Promise.race([
        o(...Object.values(g)),
        new Promise(
          (u, w) => setTimeout(() => w(new Error("Execution timeout")), l)
        )
      ]);
    } catch (o) {
      o instanceof Error ? i += o.message + `
` + (o.stack || "") : i += String(o), s = 1;
    }
    const p = performance.now();
    return {
      stdout: n,
      stderr: i,
      code: s,
      time: p - r
    };
  }
  eval(e) {
    const t = this.globalContext;
    return new Function(...Object.keys(t), `return (${e})`)(...Object.values(t));
  }
  getModuleCache() {
    return this.moduleCache;
  }
  setModuleCache(e) {
    this.moduleCache = e;
  }
  getGlobalContext() {
    return this.globalContext;
  }
  setGlobalContext(e) {
    this.globalContext = e;
  }
}
class S {
  constructor(e) {
    a(this, "moduleCache");
    a(this, "fs");
    a(this, "packages");
    this.moduleCache = {}, this.fs = e, this.packages = /* @__PURE__ */ new Map();
  }
  async install(e, t = "latest") {
    const r = `${e}@${t}`;
    if (this.packages.has(r))
      return;
    const n = {
      name: e,
      version: t,
      main: `dist/${e}.js`
    };
    this.packages.set(r, n);
    const i = `/node_modules/${e}`;
    await this.fs.mkdir(i);
    const s = JSON.stringify(n, null, 2);
    await this.fs.writeFile(`${i}/package.json`, s);
  }
  require(e) {
    if (this.moduleCache[e])
      return this.moduleCache[e];
    const t = {
      fs: this.getfsModule(),
      path: this.getPathModule(),
      buffer: this.getBufferModule(),
      events: this.getEventsModule(),
      util: this.getUtilModule()
    };
    if (t[e])
      return t[e];
    throw new Error(`Module not found: ${e}`);
  }
  getfsModule() {
    return {
      readFile: (e, t) => {
        t && this.fs.readFile(e, "utf-8").then((r) => t(null, r)).catch((r) => t(r));
      },
      writeFile: (e, t, r) => {
        r && this.fs.writeFile(e, t).then(() => r(null)).catch(r);
      },
      mkdir: (e, t) => {
        t && this.fs.mkdir(e).then(() => t(null)).catch(t);
      },
      readFileSync: (e) => {
        const t = this.moduleCache[`_file_${e}`];
        if (t) return t;
        throw new Error(`File not found: ${e}`);
      },
      writeFileSync: (e, t) => {
        this.moduleCache[`_file_${e}`] = t;
      }
    };
  }
  getPathModule() {
    return {
      join: (...e) => e.join("/").replace(/\/+/g, "/"),
      resolve: (...e) => {
        let t = e.join("/").replace(/\/+/g, "/");
        return t.startsWith("/") || (t = "/" + t), t;
      },
      dirname: (e) => e.split("/").slice(0, -1).join("/") || "/",
      basename: (e, t) => {
        const r = e.split("/").pop() || "";
        return t && r.endsWith(t) ? r.slice(0, -t.length) : r;
      },
      extname: (e) => {
        const t = e.split("/").pop() || "", r = t.lastIndexOf(".");
        return r >= 0 ? t.slice(r) : "";
      }
    };
  }
  getBufferModule() {
    return {
      from: (e, t) => typeof e == "string" ? Buffer.from(e, t) : e,
      alloc: (e) => Buffer.alloc(e),
      allocUnsafe: (e) => Buffer.allocUnsafe(e),
      isBuffer: (e) => Buffer.isBuffer(e)
    };
  }
  getEventsModule() {
    class e {
      constructor() {
        a(this, "listeners", /* @__PURE__ */ new Map());
      }
      on(r, n) {
        return this.listeners.has(r) || this.listeners.set(r, []), this.listeners.get(r).push(n), this;
      }
      off(r, n) {
        const i = this.listeners.get(r);
        if (i) {
          const s = i.indexOf(n);
          s >= 0 && i.splice(s, 1);
        }
        return this;
      }
      emit(r, ...n) {
        const i = this.listeners.get(r);
        return i && i.forEach((s) => s(...n)), !0;
      }
    }
    return {
      EventEmitter: e
    };
  }
  getUtilModule() {
    return {
      format: (e, ...t) => {
        let r = 0;
        return e.replace(/%[sdif%]/g, (n) => {
          if (n === "%%") return "%";
          const i = t[r++];
          return n === "%s" ? String(i) : n === "%d" ? String(Number(i)) : n === "%i" ? String(Math.floor(Number(i))) : n === "%f" ? String(parseFloat(String(i))) : n;
        });
      },
      inspect: (e) => JSON.stringify(e, null, 2),
      inherits: (e, t) => {
        Object.setPrototypeOf(e, t);
      }
    };
  }
  getModuleCache() {
    return this.moduleCache;
  }
  getPackages() {
    return this.packages;
  }
}
class x {
  constructor(e, t, r) {
    a(this, "routes", []);
    a(this, "config");
    this.config = r || { port: 3e3, host: "localhost", cors: !0 };
  }
  createServer(e) {
    typeof globalThis < "u" && "addEventListener" in globalThis && globalThis.addEventListener("fetch", (t) => {
      t.respondWith(e(t.request));
    });
  }
  route(e, t) {
    const r = this.patternToRegex(e);
    this.routes.push({
      pattern: r,
      handler: async (n) => {
        const i = await t(n);
        return this.addCorsHeaders(i);
      }
    });
  }
  patternToRegex(e) {
    const t = e.replace(/\//g, "\\/").replace(/:([a-zA-Z]+)/g, "(?<$1>[^/]+)").replace(/\*/g, ".*");
    return new RegExp(`^${t}$`);
  }
  addCorsHeaders(e) {
    if (!this.config.cors)
      return e;
    const t = new Headers(e.headers);
    return t.set("Access-Control-Allow-Origin", "*"), t.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"), t.set("Access-Control-Allow-Headers", "Content-Type, Authorization"), new Response(e.body, {
      status: e.status,
      statusText: e.statusText,
      headers: t
    });
  }
  async handleRequest(e) {
    const t = new URL(e.url);
    for (const r of this.routes)
      if (r.pattern.exec(t.pathname))
        return r.handler(e);
    return new Response("Not Found", { status: 404 });
  }
  getConfig() {
    return this.config;
  }
  setConfig(e) {
    this.config = { ...this.config, ...e };
  }
}
class f {
  constructor(e, t, r, n) {
    a(this, "fs");
    a(this, "runtime");
    a(this, "packageManager");
    a(this, "serverBridge");
    this.fs = e, this.runtime = t, this.packageManager = r, this.serverBridge = n;
  }
  static create(e) {
    const t = e != null && e.fs ? Array.from(e.fs.values()).map((c) => ({
      path: c.path,
      content: c.content || ""
    })) : [], r = new E(t), n = new M(), i = new S(r), s = new x(n, r, e == null ? void 0 : e.serverConfig);
    return new f(r, n, i, s);
  }
  static createWithDefaults() {
    return this.create();
  }
  async setupFileSystem(e) {
    for (const t of e)
      await this.fs.mkdir(t.path.substring(0, t.path.lastIndexOf("/"))), await this.fs.writeFile(t.path, t.content);
  }
  getFileSystem() {
    return this.fs;
  }
  getRuntime() {
    return this.runtime;
  }
  getPackageManager() {
    return this.packageManager;
  }
  getServerBridge() {
    return this.serverBridge;
  }
}
function v() {
  return f.create();
}
function z() {
  return f.createWithDefaults();
}
const P = {
  createContainer: v,
  createDefaultContainer: z,
  Container: f
};
export {
  P as AlmostNode,
  f as AlmostNodeContainerImpl,
  S as PackageManagerImpl,
  M as RuntimeImpl,
  x as ServerBridgeImpl,
  E as VirtualFileSystemImpl,
  v as createContainer,
  z as createDefaultContainer,
  P as default
};
