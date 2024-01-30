import type {GitSource, RenderDefaults} from '@remotion/studio';
import path from 'node:path';
import type {StaticFile} from 'remotion';
import {Internals} from 'remotion';

export const indexHtml = ({
	baseDir,
	editorName,
	inputProps,
	envVariables,
	staticHash,
	remotionRoot,
	studioServerCommand,
	renderQueue,
	numberOfAudioTags,
	publicFiles,
	includeFavicon,
	title,
	renderDefaults,
	publicFolderExists,
	gitSource,
}: {
	staticHash: string;
	baseDir: string;
	editorName: string | null;
	inputProps: object | null;
	envVariables?: Record<string, string>;
	remotionRoot: string;
	studioServerCommand: string | null;
	renderQueue: unknown | null;
	numberOfAudioTags: number;
	publicFiles: StaticFile[];
	publicFolderExists: string | null;
	includeFavicon: boolean;
	title: string;
	renderDefaults: RenderDefaults | undefined;
	gitSource: GitSource | null;
}) =>
	// Must setup remotion_editorName and remotion.remotion_projectName before bundle.js is loaded
	`
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link rel="preconnect" href="https://fonts.gstatic.com" />
		${
			includeFavicon
				? `<link id="__remotion_favicon" rel="icon" type="image/png" href="/remotion.png" />`
				: ''
		}
		<title>${title}</title>
	</head>
	<body>
		<script>window.remotion_numberOfAudioTags = ${numberOfAudioTags};</script>
		<script>window.remotion_staticBase = "${staticHash}";</script>
		${
			editorName
				? `<script>window.remotion_editorName = "${editorName}";</script>`
				: '<script>window.remotion_editorName = null;</script>'
		}
		<script>window.remotion_projectName = ${JSON.stringify(
			path.basename(remotionRoot),
		)};</script>
		<script>window.remotion_renderDefaults = ${JSON.stringify(
			renderDefaults,
		)};</script>
		<script>window.remotion_cwd = ${JSON.stringify(remotionRoot)};</script>
		<script>window.remotion_studioServerCommand = ${
			studioServerCommand ? JSON.stringify(studioServerCommand) : 'null'
		};</script>
		${
			inputProps
				? `<script>window.remotion_inputProps = ${JSON.stringify(
						JSON.stringify(inputProps),
					)};</script>`
				: ''
		}
		${
			renderQueue
				? `<script>window.remotion_initialRenderQueue = ${JSON.stringify(
						renderQueue,
					)};</script>`
				: ''
		}
		${
			envVariables
				? `<script>window.process = {env: ${JSON.stringify(
						envVariables,
					)}};</script>`
				: ''
		}
		${
			gitSource
				? `<script>window.remotion_gitSource = ${JSON.stringify(
						gitSource,
					)};</script>`
				: null
		}
		<script>window.remotion_staticFiles = ${JSON.stringify(publicFiles)}</script>
		<script>window.remotion_publicFolderExists = ${
			publicFolderExists ? `"${publicFolderExists}"` : 'null'
		};</script>
		
		<div id="video-container"></div>
		<div id="${Internals.REMOTION_STUDIO_CONTAINER_ELEMENT}"></div>
		<div id="menuportal-0"></div>
		<div id="menuportal-1"></div>
		<div id="menuportal-2"></div>
		<div id="menuportal-3"></div>
		<div id="menuportal-4"></div>
		<div id="menuportal-5"></div>
		<div id="remotion-error-overlay"></div>
		<div id="server-disconnected-overlay"></div>
		<script src="${baseDir}bundle.js"></script>
	</body>
</html>
`.trim();
