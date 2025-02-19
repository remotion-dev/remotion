import type {
	GitSource,
	PackageManager,
	RenderDefaults,
} from '@remotion/studio-shared';
import type {LogLevel, StaticFile} from 'remotion';
import {Internals, VERSION} from 'remotion';

export const indexHtml = ({
	publicPath,
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
	projectName,
	installedDependencies,
	packageManager,
	logLevel,
	mode,
}: {
	staticHash: string;
	publicPath: string;
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
	projectName: string;
	installedDependencies: string[] | null;
	packageManager: PackageManager | 'unknown';
	logLevel: LogLevel;
	mode: 'dev' | 'bundle';
}) =>
	// Must setup remotion_editorName and remotion.remotion_projectName before bundle.js is loaded
	`
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
		${mode === 'dev' ? `<script>window.remotion_logLevel = "${logLevel}";</script>` : ''}
		<script>window.remotion_staticBase = "${staticHash}";</script>
		${
			editorName
				? `<script>window.remotion_editorName = "${editorName}";</script>`
				: '<script>window.remotion_editorName = null;</script>'
		}
		<script>window.remotion_projectName = ${JSON.stringify(projectName)};</script>
		<script>window.remotion_publicPath = ${JSON.stringify(publicPath)};</script>
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
				: ''
		}
		<script>window.remotion_staticFiles = ${JSON.stringify(publicFiles)}</script>
		<script>window.remotion_installedPackages = ${JSON.stringify(installedDependencies)}</script>
		<script>window.remotion_packageManager = ${JSON.stringify(packageManager)}</script>
		<script>window.remotion_publicFolderExists = ${
			publicFolderExists ? `"${publicFolderExists}"` : 'null'
		};</script>
		<script>
				window.siteVersion = '11';
				window.remotion_version = '${VERSION}';
		</script>
		
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
		<script src="${publicPath}bundle.js"></script>
	</body>
</html>
`.trim();
