import {execSync} from 'child_process';
import os from 'os';

const isWin = os.platform() === 'win32';
const where = isWin ? 'where' : 'which';

const hasCargo = () => {
	try {
		execSync(`${where} cargo`);
		return true;
	} catch (err) {
		return false;
	}
};

if (hasCargo()) {
	execSync('cargo build --release', {
		stdio: 'inherit',
	});
} else {
	console.log('Environment has no cargo. Skipping Rust builds.');
}
