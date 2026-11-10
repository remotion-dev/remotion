import {useContext, useMemo} from 'react';
import {BufferingContextReact} from './buffering';
import {CompositionManagerRefContext} from './CompositionManagerContext';
import {Log} from './log';
import {useLogLevel} from './log-level-context';
import {bufferingDiagnostics} from './playback-diagnostics';
import {SequenceManagerRefContext} from './sequence-registry-context';
import {SequenceContext} from './SequenceContext';
import {SetTimelineContext} from './TimelineContext';

export type DelayPlaybackHandle = {
	unblock: () => void;
};

export type UseBufferState = {
	delayPlayback: () => DelayPlaybackHandle;
};

export const useBufferState = (): UseBufferState => {
	const buffer = useContext(BufferingContextReact);
	const logLevel = useLogLevel();
	const sequenceId = useContext(SequenceContext)?.id ?? null;
	const registry = useContext(SequenceManagerRefContext);
	const composition = useContext(CompositionManagerRefContext);
	const {frameRef} = useContext(SetTimelineContext);

	// Allows <Img> tag to be rendered without a context
	// https://github.com/remotion-dev/remotion/issues/4007
	const addBlock = buffer ? buffer.addBlock : null;

	return useMemo(
		() => ({
			delayPlayback: () => {
				if (!addBlock) {
					throw new Error(
						'Tried to enable the buffering state, but a Remotion context was not found. This API can only be called in a component that was passed to the Remotion Player or a <Composition>. Or you might have experienced a version mismatch - run `npx remotion versions` and ensure all packages have the same version. This error is thrown by the buffer state https://remotion.dev/docs/player/buffer-state',
					);
				}

				const stack =
					bufferingDiagnostics.isEnabled() || logLevel === 'trace'
						? (new Error().stack ?? null)
						: null;
				Log.trace(
					{logLevel, tag: '[buffer-state]'},
					'Adding buffer handle',
					stack,
				);

				const {unblock} = addBlock(() => {
					const content = composition.current.canvasContent;
					const compositionId =
						content?.type === 'composition' ? content.compositionId : null;
					const owners = [];
					let id = sequenceId;
					while (id !== null && owners.length < 16) {
						const owner = registry.current.find((item) => item.id === id);
						if (!owner) break;
						owners.push({
							sequenceId: owner.id,
							name: owner.displayName || owner.type,
							source: 'src' in owner ? owner.src : null,
							stack: owner.getStack(),
							overrideId: owner.controls?.overrideId ?? null,
						});
						id = owner.parent;
					}

					return {
						compositionId,
						frame:
							compositionId === null
								? 0
								: (frameRef.current[compositionId] ?? 0),
						stack,
						owners,
					};
				});

				let unblocked = false;

				return {
					unblock: () => {
						if (unblocked) {
							return;
						}

						unblocked = true;
						Log.trace(
							{logLevel, tag: '[buffer-state]'},
							'Removing buffer handle',
						);
						unblock();
					},
				};
			},
		}),
		[addBlock, logLevel, sequenceId, registry, composition, frameRef],
	);
};
