import {defineConfig} from 'vite';

// Build de arquivo único (dist-single/): tudo embutido em um só HTML, que abre
// com duplo clique ou pode ser hospedado em qualquer lugar sem pasta de assets.
export default defineConfig({
	base: './',
	build: {
		target: 'es2020',
		outDir: 'dist-single',
		assetsInlineLimit: Number.MAX_SAFE_INTEGER,
		cssCodeSplit: false,
		chunkSizeWarningLimit: 2000,
		rolldownOptions: {
			output: {inlineDynamicImports: true},
		},
	},
});
