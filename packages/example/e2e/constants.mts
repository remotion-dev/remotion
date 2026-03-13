import os from 'os';
import path from 'path';

export const STUDIO_PORT = 3123;
export const STUDIO_URL = `http://localhost:${STUDIO_PORT}`;

export const exampleDir = path.resolve(
	// @ts-expect-error
	new URL('.', import.meta.url).pathname,
	'..',
);

export const rootFile = path.join(exampleDir, 'src', 'Root.tsx');
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
	'remotion-e2e-original-root.tsx',
);
export const PID_FILE = path.join(os.tmpdir(), 'remotion-e2e-studio.pid');
export const EXPANDED_SIDEBAR_STATE = path.join(
	os.tmpdir(),
	'remotion-e2e-expanded-sidebar.json',
);
