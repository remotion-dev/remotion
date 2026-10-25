import {defineConfig} from 'vite';

// O Three.js é carregado via import dinâmico (src/scene), então o Vite já o
// separa em um chunk próprio, baixado apenas depois da primeira pintura.
export default defineConfig({
	base: './',
	build: {
		target: 'es2020',
		// O chunk do Three.js (~140 kB gzip) é carregado sob demanda.
		chunkSizeWarningLimit: 700,
	},
});
