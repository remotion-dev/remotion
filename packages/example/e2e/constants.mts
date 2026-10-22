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
export const effectKeyframeE2eFile = path.join(
	exampleDir,
	'src',
	'EffectKeyframeE2e.tsx',
);
export const lostNodePathE2eFile = path.join(
	exampleDir,
	'src',
	'LostNodePathE2e',
	'LostNodePathRepro.tsx',
);
export const errorOverlayE2eFile = path.join(
	exampleDir,
	'src',
	'ErrorOverlayE2e',
	'ErrorOverlayRepro.tsx',
);
export const hookOrderChangeE2eFile = path.join(
	exampleDir,
	'src',
	'HookOrderChangeE2e',
	'HookOrderChangeRepro.tsx',
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
export const ORIGINAL_EFFECT_KEYFRAME_E2E_FILE = path.join(
	os.tmpdir(),
	'remotion-e2e-original-effect-keyframe-e2e.tsx',
);
export const ORIGINAL_LOST_NODE_PATH_E2E_FILE = path.join(
	os.tmpdir(),
	'remotion-e2e-original-lost-node-path-repro.tsx',
);
export const ORIGINAL_ERROR_OVERLAY_E2E_FILE = path.join(
	os.tmpdir(),
	'remotion-e2e-original-error-overlay-repro.tsx',
);
export const ORIGINAL_HOOK_ORDER_CHANGE_E2E_FILE = path.join(
	os.tmpdir(),
	'remotion-e2e-original-hook-order-change-repro.tsx',
);
export const PID_FILE = path.join(os.tmpdir(), 'remotion-e2e-studio.pid');
export const EXPANDED_SIDEBAR_STATE = path.join(
	os.tmpdir(),
	'remotion-e2e-expanded-sidebar.json',
);
