import {$} from 'bun';
import {tmpdir} from 'node:os';
import path from 'path';

const folder = path.join(process.cwd(), '..', 'template-blank');

const tmpDir = tmpdir();
const workingDir = path.join(tmpDir, `template-${Math.random()}`);

const files = await $`git ls-files`.cwd(folder);
const filesInTemplate = files.stdout.toString('utf-8');
console.log({filesInTemplate});
console.log(workingDir);

await $`git clone git@github.com:remotion-dev/template-empty.git ${workingDir}`;
await $`git checkout -b ${Math.random().toString().replace('0.', '')}`.cwd(
	workingDir,
);
