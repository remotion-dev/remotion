import {getNodeProps} from '@remotion/codemods';
import type {KeyframeMutationResult} from '@remotion/studio-shared';

export const getKeyframeMutationResults = ({
	fileContents,
	targets,
}: {
	fileContents: string;
	targets: readonly (Pick<
		KeyframeMutationResult,
		'nodePath' | 'effectIndex'
	> & {
		keys: string[];
	})[];
}): KeyframeMutationResult[] => {
	return targets.map(({nodePath, effectIndex, keys}) => {
		const status = getNodeProps({
			project: {rootDir: '/', files: {'source.tsx': fileContents}},
			node: {filePath: 'source.tsx', nodePath: nodePath.nodePath},
			componentIdentity: null,
			keys: effectIndex === null ? keys : [],
			effectKeys:
				effectIndex === null
					? []
					: Array.from({length: effectIndex + 1}, (_, index) =>
							index === effectIndex ? keys : [],
						),
		});
		if (effectIndex === null)
			return {nodePath, effectIndex, props: status.props, sourceVersion: null};
		const effect = status.effects[effectIndex];
		if (!effect?.canUpdate)
			throw new Error('Could not read the updated effect keyframes');
		return {nodePath, effectIndex, props: effect.props, sourceVersion: null};
	});
};
