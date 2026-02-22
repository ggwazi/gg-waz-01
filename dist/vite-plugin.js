function o() {
  return {
    name: "almostnode-vite-plugin",
    apply: "serve",
    configResolved() {
      console.log("AlmostNode Vite Plugin loaded");
    },
    transformIndexHtml(e) {
      return e.replace(
        "</head>",
        `
    <script type="module">
      import { createDefaultContainer } from '/src/index.js';
      window.almostNode = createDefaultContainer();
      console.log('AlmostNode container initialized');
    <\/script>
    </head>`
      );
    }
  };
}
export {
  o as almostNodeVitePlugin,
  o as default
};
