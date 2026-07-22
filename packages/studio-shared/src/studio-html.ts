import type {LogLevel, StaticFile} from 'remotion';
import {Internals, VERSION} from 'remotion';
import type {GitSource} from './git-source';
import type {PackageManager} from './package-manager';
import type {RenderDefaults} from './render-defaults';
import type {StudioRuntimeConfig} from './studio-runtime-config';

export type StudioHtmlOptions = {
	staticHash: string;
	publicPath: string;
	editorName: string | null;
	inputProps: object | null;
	envVariables?: Record<string, string>;
	remotionRoot: string;
	studioServerCommand: string | null;
	renderQueue: unknown | null;
	completedClientRenders?: unknown | null;
	numberOfAudioTags: number;
	audioLatencyHint: AudioContextLatencyCategory;
	sampleRate: number | null;
	publicFiles: StaticFile[];
	publicFolderExists: string | null;
	fileSystemPlatform: string | null;
	includeFavicon: boolean;
	title: string;
	renderDefaults: RenderDefaults | undefined;
	gitSource: GitSource | null;
	projectName: string;
	installedDependencies: string[] | null;
	packageManager: PackageManager | 'unknown';
	logLevel: LogLevel;
	mode: 'dev' | 'bundle';
	bundleScriptUrl?: string;
	readOnlyStudio?: boolean;
	studioRuntimeConfig?: StudioRuntimeConfig;
};

export const studioHtml = ({
	publicPath,
	editorName,
	inputProps,
	envVariables,
	staticHash,
	remotionRoot,
	studioServerCommand,
	renderQueue,
	completedClientRenders,
	numberOfAudioTags,
	publicFiles,
	includeFavicon,
	title,
	renderDefaults,
	publicFolderExists,
	fileSystemPlatform,
	gitSource,
	projectName,
	installedDependencies,
	packageManager,
	audioLatencyHint,
	sampleRate,
	logLevel,
	mode,
	bundleScriptUrl,
	readOnlyStudio,
	studioRuntimeConfig,
}: StudioHtmlOptions) => {
	const scriptUrl = bundleScriptUrl ?? `${publicPath}bundle.js`;

	return `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		${
			includeFavicon
				? `<link id="__remotion_favicon" rel="icon" type="image/png" href="${publicPath}favicon.ico" />`
				: ''
		}
		<title>${title}</title>
	</head>
	<body>
		<script>window.remotion_numberOfAudioTags = ${numberOfAudioTags};</script>
		<script>window.remotion_audioLatencyHint = "${audioLatencyHint}";</script>
		<script>window.remotion_sampleRate = ${sampleRate};</script>
		<script>window.remotion_previewSampleRate = ${sampleRate};</script>
		${mode === 'dev' ? `<script>window.remotion_logLevel = "${logLevel}";</script>` : ''}
		<script>window.remotion_staticBase = "${staticHash}";</script>
		${
			editorName
				? `<script>window.remotion_editorName = "${editorName}";</script>`
				: '<script>window.remotion_editorName = null;</script>'
		}
		<script>window.remotion_projectName = ${JSON.stringify(projectName)};</script>
		<script>window.remotion_publicPath = ${JSON.stringify(publicPath)};</script>
		<script>window.remotion_audioEnabled = true;</script>
		<script>window.remotion_videoEnabled = true;</script>
		<script>window.remotion_studioConfig = ${JSON.stringify(
			studioRuntimeConfig ?? null,
		)};</script>
		<script>window.remotion_renderDefaults = ${JSON.stringify(
			renderDefaults,
		)};</script>
		<script>window.remotion_cwd = ${JSON.stringify(remotionRoot)};</script>
		<script>window.remotion_fileSystemPlatform = ${JSON.stringify(fileSystemPlatform)};</script>
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
			completedClientRenders
				? `<script>window.remotion_initialClientRenders = ${JSON.stringify(
						completedClientRenders,
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
				: ''
		}
		${
			mode === 'dev'
				? `
		<script>window.remotion_isStudio = true;</script>
		<script>window.remotion_isReadOnlyStudio = ${readOnlyStudio ? 'true' : 'false'};</script>`.trimStart()
				: ''
		}
		<script>window.remotion_staticFiles = ${JSON.stringify(publicFiles)}</script>
		<script>window.remotion_installedPackages = ${JSON.stringify(installedDependencies)}</script>
		<script>window.remotion_packageManager = ${JSON.stringify(packageManager)}</script>
		<script>window.remotion_publicFolderExists = ${JSON.stringify(publicFolderExists)};</script>
		<script>
				// Increment this value when the generated bundle format or behavior changes
				// in a backwards-incompatible way. It is not the Remotion package version
				// and should not be bumped for every generated HTML change.
				// Keep it synchronized with requiredVersion in
				// packages/renderer/src/set-props-and-env.ts by incrementing both values.
				window.siteVersion = '11';
				window.remotion_version = '${VERSION}';
		</script>
		
		<div id="video-container"></div>
		<div id="${Internals.REMOTION_STUDIO_CONTAINER_ELEMENT}"></div>
		<div id="remotion-error-overlay"></div>
		<div id="server-disconnected-overlay"></div>
		<div id="menuportal-0"></div>
		<div id="menuportal-1"></div>
		<div id="menuportal-2"></div>
		<div id="menuportal-3"></div>
		<div id="menuportal-4"></div>
		<div id="menuportal-5"></div>
		<script src="${scriptUrl}"></script>
	</body>
</html>
`.trim();
};
