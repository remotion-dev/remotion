import os from 'os';
import path from 'path';

export const STUDIO_PORT = 3123;
export const STUDIO_URL = `http://localhost:${STUDIO_PORT}`;

export const exampleDir = path.resolve(
	// @ts-expect-error
	new URL('.', import.meta.url).pathname,
	'..',
);

export const rootFile = path.join(exampleDir, 'src', 'E2eTestRoot.tsx');
export const e2eEntryPoint = path.join(exampleDir, 'src', 'e2e-test-entry.ts');
export const visualControlsFile = path.join(
	exampleDir,
	'src',
	'VisualControls',
	'index.tsx',
);
export const newVideoFile = path.join(exampleDir, 'src', 'NewVideo.tsx');
export const remotionBin = path.join(
	exampleDir,
	'node_modules',
	'.bin',
	'remotion',
);

export const LOGS_FILE = path.join(
	os.tmpdir(),
	'remotion-e2e-studio-logs.ndjson',
);
export const ORIGINAL_CONTENT_FILE = path.join(
	os.tmpdir(),
	'remotion-e2e-original-e2e-test-root.tsx',
);
export const ORIGINAL_VISUAL_CONTROLS_FILE = path.join(
	os.tmpdir(),
	'remotion-e2e-original-visual-controls.tsx',
);
export const PID_FILE = path.join(os.tmpdir(), 'remotion-e2e-studio.pid');
export const EXPANDED_SIDEBAR_STATE = path.join(
	os.tmpdir(),
	'remotion-e2e-expanded-sidebar.json',
);
