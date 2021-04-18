// This is used for when other reconcilers are being used
// such as in React Three Fiber. All the contexts need to be passed again
// for them to be useable

import React from 'react';
import {CompositionManager} from './CompositionManager';
import {NonceContext} from './nonce';
import {SequenceContext} from './sequencing';
import {SetTimelineContext, TimelineContext} from './timeline-position-state';

export function useRemotionContexts() {
	return {
		compositionManagerCtx: React.useContext(CompositionManager),
		timelineContext: React.useContext(TimelineContext),
		setTimelineContext: React.useContext(SetTimelineContext),
		sequenceContext: React.useContext(SequenceContext),
		nonceContext: React.useContext(NonceContext),
	};
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
