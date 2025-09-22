import {execSync} from 'child_process';

const [maj] = process.versions.node.split('.').map(Number);

if (maj < 18) {
	console.log('Node version is less than 18, skipping');
	process.exit(0);
}

execSync('bunx vitest src/test --browser --run', {
	stdio: 'inherit',
});
