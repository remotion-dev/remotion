// This is used for when other reconcilers are being used
// such as in React Three Fiber. All the contexts need to be passed again
// for them to be useable

import React, {useMemo} from 'react';
import {AssetManager} from './AssetManager.js';
import {CanUseRemotionHooks} from './CanUseRemotionHooks.js';
import {CompositionManager} from './CompositionManagerContext.js';
import {NativeLayersContext} from './NativeLayers.js';
import {NonceContext} from './nonce.js';
import {PreloadContext} from './prefetch-state.js';
import {ResolveCompositionContext} from './ResolveCompositionConfig.js';
import {SequenceContext} from './SequenceContext.js';
import {SequenceManager} from './SequenceManager.js';
import {
	SetTimelineContext,
	TimelineContext,
} from './timeline-position-state.js';

export function useRemotionContexts() {
	const compositionManagerCtx = React.useContext(CompositionManager);
	const timelineContext = React.useContext(TimelineContext);
	const setTimelineContext = React.useContext(SetTimelineContext);
	const sequenceContext = React.useContext(SequenceContext);
	const nonceContext = React.useContext(NonceContext);
	const canUseRemotionHooksContext = React.useContext(CanUseRemotionHooks);
	const nativeLayersContext = React.useContext(NativeLayersContext);
	const preloadContext = React.useContext(PreloadContext);
	const resolveCompositionContext = React.useContext(ResolveCompositionContext);
	const assetManagerContext = React.useContext(AssetManager);
	const sequenceManagerContext = React.useContext(SequenceManager);

	return useMemo(
		() => ({
			compositionManagerCtx,
			timelineContext,
			setTimelineContext,
			sequenceContext,
			nonceContext,
			canUseRemotionHooksContext,
			nativeLayersContext,
			preloadContext,
			resolveCompositionContext,
			assetManagerContext,
			sequenceManagerContext,
		}),
		[
			compositionManagerCtx,
			nonceContext,
			sequenceContext,
			setTimelineContext,
			timelineContext,
			canUseRemotionHooksContext,
			nativeLayersContext,
			preloadContext,
			resolveCompositionContext,
			assetManagerContext,
			sequenceManagerContext,
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
		<CanUseRemotionHooks.Provider value={contexts.canUseRemotionHooksContext}>
			<NonceContext.Provider value={contexts.nonceContext}>
				<NativeLayersContext.Provider value={contexts.nativeLayersContext}>
					<PreloadContext.Provider value={contexts.preloadContext}>
						<CompositionManager.Provider value={contexts.compositionManagerCtx}>
							<SequenceManager.Provider value={contexts.sequenceManagerContext}>
								<AssetManager.Provider value={contexts.assetManagerContext}>
									<ResolveCompositionContext.Provider
										value={contexts.resolveCompositionContext}
									>
										<TimelineContext.Provider value={contexts.timelineContext}>
											<SetTimelineContext.Provider
												value={contexts.setTimelineContext}
											>
												<SequenceContext.Provider
													value={contexts.sequenceContext}
												>
													{children}
												</SequenceContext.Provider>
											</SetTimelineContext.Provider>
										</TimelineContext.Provider>
									</ResolveCompositionContext.Provider>
								</AssetManager.Provider>
							</SequenceManager.Provider>
						</CompositionManager.Provider>
					</PreloadContext.Provider>
				</NativeLayersContext.Provider>
			</NonceContext.Provider>
		</CanUseRemotionHooks.Provider>
	);
};
