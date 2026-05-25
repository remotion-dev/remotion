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

export default async function globalSetup(): Promise<void> {
	fs.writeFileSync(ORIGINAL_CONTENT_FILE, fs.readFileSync(rootFile, 'utf-8'));
	fs.writeFileSync(
		ORIGINAL_VISUAL_CONTROLS_FILE,
		fs.readFileSync(visualControlsFile, 'utf-8'),
	);
	fs.writeFileSync(
		ORIGINAL_LOST_NODE_PATH_E2E_FILE,
		fs.readFileSync(lostNodePathE2eFile, 'utf-8'),
	);
	fs.writeFileSync(
		ORIGINAL_ERROR_OVERLAY_E2E_FILE,
		fs.readFileSync(errorOverlayE2eFile, 'utf-8'),
	);
	fs.writeFileSync(
		ORIGINAL_HOOK_ORDER_CHANGE_E2E_FILE,
		fs.readFileSync(hookOrderChangeE2eFile, 'utf-8'),
	);
}
