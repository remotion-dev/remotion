import {execSync} from 'child_process';

const [maj, min] = process.versions.node.split('.').map(Number);

if (!((maj === 22 && min >= 12) || maj === 24 || maj >= 26)) {
	console.log('Vitest requires Node.js 22 (>=22.12), 24 or >=26, skipping');
	process.exit(0);
}

execSync('bunx vitest --run', {
	stdio: 'inherit',
});
