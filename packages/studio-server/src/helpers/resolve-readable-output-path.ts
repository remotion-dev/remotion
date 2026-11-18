import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';
import type {RenderJob} from '@remotion/studio-shared';

export const resolveReadableOutputPath = ({
	remotionRoot,
	outputPath,
	getRenderQueue,
}: {
	remotionRoot: string;
	outputPath: string;
	getRenderQueue: () => RenderJob[];
}): {filePath: string; allowOutsideProject: boolean} | null => {
	const filePath = path.resolve(remotionRoot, outputPath);
	const outsideProject = !RenderInternals.isPathInside(filePath, remotionRoot);
	const isCompletedOutput =
		outsideProject &&
		getRenderQueue().some(
			(job) =>
				job.status === 'done' &&
				(job.type === 'video' || job.type === 'still') &&
				!job.deletedOutputLocation &&
				path.resolve(remotionRoot, job.outName) === filePath,
		);
	if (outsideProject && !isCompletedOutput) {
		return null;
	}

	return {filePath, allowOutsideProject: isCompletedOutput};
};
