import fs from 'fs';
import {
	ORIGINAL_CONTENT_FILE,
	ORIGINAL_ERROR_OVERLAY_E2E_FILE,
	ORIGINAL_HOOK_ORDER_CHANGE_E2E_FILE,
	ORIGINAL_LOST_NODE_PATH_E2E_FILE,
	ORIGINAL_VISUAL_CONTROLS_FILE,
	errorOverlayE2eFile,
	hookOrderChangeE2eFile,
	lostNodePathE2eFile,
	rootFile,
	visualControlsFile,
} from './constants.mts';

export default async function globalTeardown(): Promise<void> {
	if (fs.existsSync(ORIGINAL_CONTENT_FILE)) {
		fs.writeFileSync(rootFile, fs.readFileSync(ORIGINAL_CONTENT_FILE, 'utf-8'));
		fs.unlinkSync(ORIGINAL_CONTENT_FILE);
	}

	if (fs.existsSync(ORIGINAL_VISUAL_CONTROLS_FILE)) {
		fs.writeFileSync(
			visualControlsFile,
			fs.readFileSync(ORIGINAL_VISUAL_CONTROLS_FILE, 'utf-8'),
		);
		fs.unlinkSync(ORIGINAL_VISUAL_CONTROLS_FILE);
	}

	if (fs.existsSync(ORIGINAL_LOST_NODE_PATH_E2E_FILE)) {
		fs.writeFileSync(
			lostNodePathE2eFile,
			fs.readFileSync(ORIGINAL_LOST_NODE_PATH_E2E_FILE, 'utf-8'),
		);
		fs.unlinkSync(ORIGINAL_LOST_NODE_PATH_E2E_FILE);
	}

	if (fs.existsSync(ORIGINAL_ERROR_OVERLAY_E2E_FILE)) {
		fs.writeFileSync(
			errorOverlayE2eFile,
			fs.readFileSync(ORIGINAL_ERROR_OVERLAY_E2E_FILE, 'utf-8'),
		);
		fs.unlinkSync(ORIGINAL_ERROR_OVERLAY_E2E_FILE);
	}

	if (fs.existsSync(ORIGINAL_HOOK_ORDER_CHANGE_E2E_FILE)) {
		fs.writeFileSync(
			hookOrderChangeE2eFile,
			fs.readFileSync(ORIGINAL_HOOK_ORDER_CHANGE_E2E_FILE, 'utf-8'),
		);
		fs.unlinkSync(ORIGINAL_HOOK_ORDER_CHANGE_E2E_FILE);
	}
}
