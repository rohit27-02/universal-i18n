import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        client: 'src/client.tsx',
        server: 'src/server.ts',
        'react-server-stub': 'src/react-server-stub.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    outDir: 'dist',
    external: ['react', 'next'],
    esbuildOptions(options) {
        options.banner = {
            js: '', // Handled by individual file banners usually, but we can instruct Rollup
        };
    },
});
