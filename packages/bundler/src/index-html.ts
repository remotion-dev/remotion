import path from 'node:path';
import type {StaticFile} from 'remotion';
import {Internals} from 'remotion';

export type RenderDefaults = {
	jpegQuality: number;
	scale: number;
	logLevel: string;
	codec: string;
	concurrency: number;
	minConcurrency: number;
	muted: boolean;
	maxConcurrency: number;
	stillImageFormat: 'png' | 'jpeg' | 'webp' | 'pdf';
	videoImageFormat: 'png' | 'jpeg' | 'none';
	audioCodec: string | null;
	enforceAudioTrack: boolean;
	proResProfile: string;
	pixelFormat: string;
	audioBitrate: string | null;
	videoBitrate: string | null;
	everyNthFrame: number;
	numberOfGifLoops: number | null;
	delayRenderTimeout: number;
	disableWebSecurity: boolean;
	openGlRenderer: string | null;
	ignoreCertificateErrors: boolean;
	headless: boolean;
};

declare global {
	interface Window {
		remotion_renderDefaults: RenderDefaults | undefined;
	}
}

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
	includeFavicon: boolean;
	title: string;
	renderDefaults: RenderDefaults | undefined;
}) =>
	`
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link rel="preconnect" href="https://fonts.gstatic.com" />
${
	includeFavicon
		? `		<link rel="icon" type="image/png" href="/remotion.png" />\n`
		: ''
}
		<title>${title}</title>
	</head>
	<body>
    <script>window.remotion_numberOfAudioTags = ${numberOfAudioTags};</script>
    <script>window.remotion_staticBase = "${staticHash}";</script>
		<div id="video-container"></div>
		<div id="explainer-container"></div>
		${
			editorName
				? `<script>window.remotion_editorName = "${editorName}";</script>`
				: '<script>window.remotion_editorName = null;</script>'
		}
		<script>window.remotion_projectName = ${JSON.stringify(
			path.basename(remotionRoot)
		)};</script>
		<script>window.remotion_renderDefaults = ${JSON.stringify(
			renderDefaults
		)};</script>
		<script>window.remotion_cwd = ${JSON.stringify(remotionRoot)};</script>
		<script>window.remotion_studioServerCommand = ${
			studioServerCommand ? JSON.stringify(studioServerCommand) : 'null'
		};</script>
		${
			inputProps
				? `<script>window.remotion_inputProps = ${JSON.stringify(
						JSON.stringify(inputProps)
				  )};</script>
			`
				: ''
		}
		${
			renderQueue
				? `<script>window.remotion_initialRenderQueue = ${JSON.stringify(
						renderQueue
				  )};</script>
			`
				: ''
		}
		${
			envVariables
				? `<script> window.process = {
    						env: ${JSON.stringify(envVariables)}
 				};</script>
			`
				: ''
		}
		<script>window.remotion_staticFiles = ${JSON.stringify(publicFiles)}</script>
		
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
