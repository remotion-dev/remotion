import child_process from 'node:child_process';

type Editor = string;

const getVsCodeUrlScheme = (editor: Editor): string | null => {
	switch (editor) {
		case 'code':
		case 'Code.exe':
			return 'vscode';
		case 'code-insiders':
		case 'Code - Insiders.exe':
			return 'vscode-insiders';
		case 'vscodium':
		case 'VSCodium.exe':
			return 'vscodium';
		case 'cursor':
		case 'Cursor.exe':
			return 'cursor';
		case 'windsurf':
		case 'Windsurf.exe':
			return 'windsurf';
		default:
			return null;
	}
};

// On macOS, use URL protocol handler for VS Code derivatives.
// This is faster than spawning the CLI which boots a Node.js process.
export const openInEditorViaUrlScheme = ({
	editor,
	fileName,
	lineNumber,
	colNumber,
}: {
	editor: string;
	fileName: string;
	lineNumber: number;
	colNumber: number;
}): Promise<boolean> | null => {
	if (process.platform !== 'darwin') {
		return null;
	}

	const urlScheme = getVsCodeUrlScheme(editor);
	if (!urlScheme) {
		return null;
	}

	const filePath = fileName.startsWith('/') ? fileName.substring(1) : fileName;
	const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
	const url = `${urlScheme}://file/${encodedPath}:${lineNumber}:${colNumber}`;
	return new Promise<boolean>((resolve) => {
		const proc = child_process.spawn('open', [url], {
			stdio: 'ignore',
		});
		proc.on('error', () => resolve(false));
		proc.on('close', (code) => resolve(code === 0));
	});
};
