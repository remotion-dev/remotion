import type {InsertCompositionElementRequest} from '@remotion/studio-shared';
import {addElement} from './add-element';
import type {CodemodProject} from './codemod-project';
import {getNodes} from './get-nodes';
import {createElementFromInsertable} from './insertable-element';

export const insertElementIntoTrack = ({
	project,
	request,
}: {
	project: CodemodProject;
	request: InsertCompositionElementRequest;
}) => {
	const {track, element, from} = request;
	if (
		!track ||
		(element.type !== 'asset' && element.type !== 'solid') ||
		from === null ||
		!Number.isFinite(from) ||
		from < 0 ||
		!Number.isFinite(track.durationInFrames) ||
		track.durationInFrames <= 0
	) {
		throw new Error('Invalid element insertion into a Track');
	}

	const node = {
		filePath: track.targetNodePath.absolutePath,
		nodePath: track.targetNodePath.nodePath,
	};
	const target = getNodes({project, filePath: node.filePath}).find(
		(candidate) =>
			JSON.stringify(candidate.nodePath) === JSON.stringify(node.nodePath),
	);
	if (target?.componentIdentity !== 'dev.remotion.remotion.Track')
		throw new Error('The destination is no longer a Track');
	return addElement({
		project,
		target: {type: 'inside', node},
		element: createElementFromInsertable({
			element,
			from: null,
			wrapInSequence: {
				from,
				durationInFrames: track.durationInFrames,
				dimensions: null,
				name:
					element.type === 'asset'
						? (element.src.split('/').pop() ?? element.src)
						: 'Solid',
				position: null,
			},
		}),
	});
};
