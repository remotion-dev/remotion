import fs from 'fs';
import {ORIGINAL_CONTENT_FILE, PID_FILE, rootFile} from './constants.mts';

export default async function globalTeardown(): Promise<void> {
	if (fs.existsSync(PID_FILE)) {
		const pid = parseInt(fs.readFileSync(PID_FILE, 'utf-8'), 10);
		try {
			process.kill(pid, 'SIGTERM');
		} catch {
			// Process might already be dead
		}

		fs.unlinkSync(PID_FILE);
	}

	if (fs.existsSync(ORIGINAL_CONTENT_FILE)) {
		fs.writeFileSync(
			rootFile,
			fs.readFileSync(ORIGINAL_CONTENT_FILE, 'utf-8'),
		);
		fs.unlinkSync(ORIGINAL_CONTENT_FILE);
	}
}
