// `bun testoffthreadvideo.ts`

import {execSync} from 'node:child_process';
import {readdirSync} from 'node:fs';

const files = readdirSync('public/offthreadvideoregression').filter(
	(f) => !f.startsWith('.'),
);

for (const file of files) {
	console.log(`Rendering ${file}`);
	execSync(
		`pnpm exec remotion render OffthreadRemoteVideo --props='{"src": "offthreadvideoregression/${file}"}' out/regressions/${file}.mp4 --log=verbose`,
		{stdio: 'inherit'},
	);
}
