// This is used for when other reconcilers are being used
// such as in React Three Fiber. All the contexts need to be passed again
// for them to be useable

import React, {useMemo} from 'react';
import {CompositionManager} from './CompositionManager';
import {NonceContext} from './nonce';
import {SequenceContext} from './sequencing';
import {SetTimelineContext, TimelineContext} from './timeline-position-state';

export function useRemotionContexts() {
	const compositionManagerCtx = React.useContext(CompositionManager);
	const timelineContext = React.useContext(TimelineContext);
	const setTimelineContext = React.useContext(SetTimelineContext);
	const sequenceContext = React.useContext(SequenceContext);
	const nonceContext = React.useContext(NonceContext);
	return useMemo(
		() => ({
			compositionManagerCtx,
			timelineContext,
			setTimelineContext,
			sequenceContext,
			nonceContext,
		}),
		[
			compositionManagerCtx,
			nonceContext,
			sequenceContext,
			setTimelineContext,
			timelineContext,
		]
	);
}

export interface RemotionContextProviderProps {
	contexts: ReturnType<typeof useRemotionContexts>;
	children: React.ReactNode;
}

export const RemotionContextProvider = (
	props: RemotionContextProviderProps
) => {
	const {children, contexts} = props;
	return (
		<NonceContext.Provider value={contexts.nonceContext}>
			<CompositionManager.Provider value={contexts.compositionManagerCtx}>
				<TimelineContext.Provider value={contexts.timelineContext}>
					<SetTimelineContext.Provider value={contexts.setTimelineContext}>
						<SequenceContext.Provider value={contexts.sequenceContext}>
							{children}
						</SequenceContext.Provider>
					</SetTimelineContext.Provider>
				</TimelineContext.Provider>
			</CompositionManager.Provider>
		</NonceContext.Provider>
	);
};
