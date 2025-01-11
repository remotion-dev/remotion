import {$} from 'bun';

await $`bunx tailwindcss -i src/index.css -o dist/tailwind.css`;

const result = await Bun.build({
	entrypoints: ['./src/components/Homepage.tsx'],
	experimentalCss: true,
	format: 'cjs',
	external: ['react', 'react-dom', 'lottie-web', 'hls.js', 'plyr', 'zod'],
});

for (const output of result.outputs) {
	await Bun.write('dist/' + output.path, await output.text());
}

export {};
