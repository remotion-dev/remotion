import * as fs from 'fs/promises';
import os from 'os';
import path from 'path';

export const assetsToFfmpegInputs = async ({
	assets,
	isAudioOnly,
	frameCount,
	fps,
}: {
	assets: string[];
	isAudioOnly: boolean;
	frameCount: number;
	fps: number;
}): Promise<{
	ffmpegAssetFlag: [string, string] | [string, string][] | null;
	assetCleanUp: () => void;
}> => {
	if (isAudioOnly && assets.length === 0) {
		return {
			ffmpegAssetFlag: [
				['-f', 'lavfi'],
				['-i', 'anullsrc'],
				['-t', (frameCount / fps).toFixed(4)],
			],
			assetCleanUp: () => undefined,
		};
	}

	const tempPath = await fs.mkdtemp(path.join(os.tmpdir(), 'remotion-assets'));
	const filterFile = path.join(tempPath, 'assets-file.txt');
	let allAssets = '';
	for (const asset of assets) {
		allAssets += `file 'file:${asset}'\n`;
	}

	await fs.writeFile(filterFile, allAssets);
	console.log('assets', allAssets);

	return {
		ffmpegAssetFlag: assets.length > 0 ? ['-i', filterFile] : null,
		assetCleanUp: () => {
			(fs.rm ?? fs.rmdir)(tempPath, {
				recursive: true,
			}).catch((err) => {
				console.error('Could not delete a temp file');
				console.error(err);
				console.error('Do you have the minimum Node.JS installed?');
			});
		},
	};
};
