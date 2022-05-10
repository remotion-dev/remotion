import path from 'path';

export const indexHtml = (
	staticHash: string,
	baseDir: string,
	editorName: string | null
) =>
	`
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link rel="preconnect" href="https://fonts.gstatic.com" />
		<link rel="icon" type="image/png" href="/favicon.png" />
		<title>Remotion Preview</title>
	</head>
	<body>
    <script>window.remotion_staticBase = "${staticHash}";</script>
		<div id="video-container"></div>
		<div id="explainer-container"></div>
		${
			editorName
				? `<script>window.remotion_editorName = "${editorName}";</script>`
				: '<script>window.remotion_editorName = null;</script>'
		}
		<script>window.remotion_projectName = ${JSON.stringify(
			path.basename(process.cwd())
		)};</script>
		<script>window.remotion_cwd = ${JSON.stringify(process.cwd())};</script>
		
		<div id="container"></div>
		<div id="menuportal-0"></div>
		<div id="menuportal-1"></div>
		<div id="menuportal-2"></div>
		<div id="menuportal-3"></div>
		<div id="menuportal-4"></div>
		<div id="menuportal-5"></div>
		<div id="remotion-error-overlay"></div>
		<script src="${baseDir}bundle.js"></script>
	</body>
</html>
`.trim();
