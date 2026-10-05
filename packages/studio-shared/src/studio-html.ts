import type {LogLevel, StaticFile} from 'remotion';
import {Internals, VERSION} from 'remotion';
import type {GitSource} from './git-source';
import type {PackageManager} from './package-manager';
import type {RenderDefaults} from './render-defaults';
import type {StudioRuntimeConfig} from './studio-runtime-config';

declare global {
	interface Window {
		remotion_browserStudioReload: (() => void) | null;
		remotion_studioStartup: {
			takeErrors: () => Error[];
			dismiss: () => void;
		} | null;
	}
}

export type StudioHtmlOptions = {
	staticHash: string;
	outputHash: string | null;
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
	experimentalKeepAudioContextAlive: boolean;
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
	bundleScriptType?: 'classic' | 'module';
	importMap: Record<string, string> | null;
	readOnlyStudio?: boolean;
	studioRuntimeConfig?: StudioRuntimeConfig;
};

export const studioHtml = ({
	publicPath,
	editorName,
	inputProps,
	envVariables,
	staticHash,
	outputHash,
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
	experimentalKeepAudioContextAlive,
	sampleRate,
	logLevel,
	mode,
	bundleScriptUrl,
	bundleScriptType,
	importMap,
	readOnlyStudio,
	studioRuntimeConfig,
}: StudioHtmlOptions) => {
	const scriptUrl = bundleScriptUrl ?? `${publicPath}bundle.js`;
	const isRelativeBundle = mode === 'bundle' && publicPath === './';
	const staticBaseValue = isRelativeBundle
		? `new URL(${JSON.stringify(staticHash)}, window.location.href).pathname`
		: JSON.stringify(staticHash);
	const staticFilesValue = isRelativeBundle
		? `${JSON.stringify(publicFiles)}.map((file) => ({...file, src: new URL(file.src, window.location.href).pathname}))`
		: JSON.stringify(publicFiles);
	const publicFolderExistsValue =
		isRelativeBundle && publicFolderExists
			? `new URL(${JSON.stringify(publicFolderExists)}, window.location.href).pathname`
			: JSON.stringify(publicFolderExists);
	const startupErrorHtml =
		mode === 'dev'
			? `
		<style>
			#remotion-studio-startup-reload { appearance: none; background: transparent; border: none; border-radius: 3px; color: #a6a7a9; cursor: default; padding: 8px 16px; font: inherit; }
			#remotion-studio-startup-reload:hover { color: white; }
			#remotion-studio-startup-reload:focus { outline: none; box-shadow: none; }
			#remotion-studio-startup-reload:focus-visible { box-shadow: inset 1px 1px #555, inset -1px -1px #555, inset 1px -1px #555, inset -1px 1px #555; }
		</style>
		<div id="remotion-studio-startup-error" role="alert" hidden style="position: fixed; inset: 0; overflow: auto; z-index: 2147483647; box-sizing: border-box; padding: 40px; background: #1f1f1f; color: white; font-family: sans-serif;">
			<h1 style="margin-top: 0; font-size: 24px;">Studio could not start</h1>
			<pre id="remotion-studio-startup-error-message" style="white-space: pre-wrap; overflow-wrap: anywhere; font-size: 14px; line-height: 1.5;"></pre>
			<p>Fix the error in your project, then reload Studio.</p>
			<button id="remotion-studio-startup-reload" type="button">Reload Studio</button>
		</div>
		<script>
			(function () {
				var errors = [];
				var fallback = document.getElementById('remotion-studio-startup-error');
				var message = document.getElementById('remotion-studio-startup-error-message');
				function showError(error) {
					var normalized = error instanceof Error ? error : new Error(String(error));
					errors.push(normalized);
					message.textContent = normalized.stack || normalized.message;
					fallback.hidden = false;
				}
				function onError(event) {
					if (event.target instanceof HTMLScriptElement && event.target.id === '__remotion_bundle') {
						showError(new Error('Could not load the Studio JavaScript bundle. Check that the Studio server is running and reload the page.'));
					} else if (event instanceof ErrorEvent) {
						showError(event.error || new Error(event.message));
					}
				}
				function onUnhandledRejection(event) {
					showError(event.reason);
				}
				window.addEventListener('error', onError, true);
				window.addEventListener('unhandledrejection', onUnhandledRejection);
				document.getElementById('remotion-studio-startup-reload').addEventListener('click', function () {
					if (typeof window.remotion_browserStudioReload === 'function') {
						window.remotion_browserStudioReload();
					} else {
						window.location.reload();
					}
				});
				window.remotion_studioStartup = {
					takeErrors: function () {
						return errors.splice(0);
					},
					dismiss: function () {
						window.removeEventListener('error', onError, true);
						window.removeEventListener('unhandledrejection', onUnhandledRejection);
						errors.length = 0;
						fallback.remove();
						window.remotion_studioStartup = null;
					}
				};
			})();
		</script>`
			: '';

	return `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		${
			importMap
				? `<script type="importmap">${JSON.stringify({imports: importMap}).replaceAll('<', '\\u003c')}</script>`
				: ''
		}
		${
			includeFavicon
				? `<link id="__remotion_favicon" rel="icon" type="image/png" href="${publicPath}favicon.ico" />`
				: ''
		}
		<title>${title}</title>
	</head>
	<body>
		${startupErrorHtml}
		<script>window.remotion_numberOfAudioTags = ${numberOfAudioTags};</script>
		<script>window.remotion_audioLatencyHint = "${audioLatencyHint}";</script>
		<script>window.remotion_experimentalKeepAudioContextAlive = ${experimentalKeepAudioContextAlive};</script>
		<script>window.remotion_sampleRate = ${sampleRate};</script>
		<script>window.remotion_previewSampleRate = ${sampleRate};</script>
		${mode === 'dev' ? `<script>window.remotion_logLevel = "${logLevel}";</script>` : ''}
		<script>window.remotion_staticBase = ${staticBaseValue};</script>
		<script>window.remotion_outputsBase = ${JSON.stringify(outputHash)};</script>
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
		<script>window.remotion_staticFiles = ${staticFilesValue}</script>
		<script>window.remotion_installedPackages = ${JSON.stringify(installedDependencies)}</script>
		<script>window.remotion_packageManager = ${JSON.stringify(packageManager)}</script>
		<script>window.remotion_publicFolderExists = ${publicFolderExistsValue};</script>
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
		<script${mode === 'dev' ? ' id="__remotion_bundle"' : ''}${bundleScriptType === 'module' ? ' type="module"' : ''} src="${scriptUrl}"></script>
	</body>
</html>
`.trim();
};
