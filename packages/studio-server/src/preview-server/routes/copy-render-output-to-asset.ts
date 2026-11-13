import {constants, existsSync, mkdirSync, statSync} from 'node:fs';
import {copyFile} from 'node:fs/promises';
import path from 'node:path';
import type {
	CopyRenderOutputToAssetRequest,
	CopyRenderOutputToAssetResponse,
	RenderJob,
} from '@remotion/studio-shared';
import {resolveReadableOutputPath} from '../../helpers/resolve-readable-output-path';
import type {ApiHandler} from '../api-types';

export const copyRenderOutputToAssetHandler = async ({
	input: {assetPath, outputPath},
	publicDir,
	remotionRoot,
	getRenderQueue,
}: Parameters<
	ApiHandler<CopyRenderOutputToAssetRequest, CopyRenderOutputToAssetResponse>
>[0] & {
	getRenderQueue: () => RenderJob[];
}): Promise<CopyRenderOutputToAssetResponse> => {
	if (assetPath.length === 0) {
		throw new Error('Asset path cannot be empty');
	}

	const resolvedOutput = resolveReadableOutputPath({
		remotionRoot,
		outputPath,
		getRenderQueue,
	});
	if (resolvedOutput === null) {
		throw new Error('Output file not found');
	}

	const source = resolvedOutput.filePath;
	const destination = path.join(publicDir, assetPath);
	const relativeToPublicDir = path.relative(publicDir, destination);
	if (
		relativeToPublicDir.startsWith('..') ||
		path.isAbsolute(relativeToPublicDir)
	) {
		throw new Error(`Not allowed to write to ${relativeToPublicDir}`);
	}

	if (!existsSync(source)) {
		throw new Error(`${outputPath} does not exist`);
	}

	const sourceStat = statSync(source);
	if (!sourceStat.isFile()) {
		throw new Error(`${outputPath} is not a file`);
	}

	if (source === destination) {
		return {created: false};
	}

	if (existsSync(destination)) {
		const destinationStat = statSync(destination);
		if (!destinationStat.isFile() || destinationStat.size !== sourceStat.size) {
			throw new Error(
				`File with name ${assetPath} already exists and is different`,
			);
		}

		return {created: false};
	}

	mkdirSync(path.dirname(destination), {recursive: true});
	try {
		await copyFile(source, destination, constants.COPYFILE_EXCL);
		return {created: true};
	} catch (error) {
		if (
			error instanceof Error &&
			'code' in error &&
			error.code === 'EEXIST' &&
			existsSync(destination)
		) {
			const destinationStat = statSync(destination);
			if (
				destinationStat.isFile() &&
				destinationStat.size === sourceStat.size
			) {
				return {created: false};
			}
		}

		throw error;
	}
};
