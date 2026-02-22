import { Plugin } from 'vite';

export function almostNodeVitePlugin(): Plugin {
  return {
    name: 'almostnode-vite-plugin',
    apply: 'serve',
    configResolved() {
      console.log('AlmostNode Vite Plugin loaded');
    },
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        `
    <script type="module">
      import { createDefaultContainer } from '/src/index.js';
      window.almostNode = createDefaultContainer();
      console.log('AlmostNode container initialized');
    </script>
    </head>`
      );
    },
  };
}

export default almostNodeVitePlugin;
