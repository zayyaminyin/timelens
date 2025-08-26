
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'figma:asset/cca0ac8ac0201f3d187a6a9c88b4ec51862740bb.png': path.resolve(__dirname, './src/assets/cca0ac8ac0201f3d187a6a9c88b4ec51862740bb.png'),
        'figma:asset/adef9cd01acff62d93683887e4a1421f8e9eb5ad.png': path.resolve(__dirname, './src/assets/adef9cd01acff62d93683887e4a1421f8e9eb5ad.png'),
        'figma:asset/83b50d96bb280a1120afb29cc3676390e8682b6d.png': path.resolve(__dirname, './src/assets/83b50d96bb280a1120afb29cc3676390e8682b6d.png'),
        'figma:asset/39f4f9d6b35eb4d7492b57525c197fc95743a082.png': path.resolve(__dirname, './src/assets/39f4f9d6b35eb4d7492b57525c197fc95743a082.png'),
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
    },
  });