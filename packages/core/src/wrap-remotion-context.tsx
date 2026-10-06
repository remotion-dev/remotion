// This is used for when other reconcilers are being used
// such as in React Three Fiber. All the contexts need to be passed again
// for them to be useable

import React, {useCallback, useMemo, useState} from 'react';
import {BufferingContextReact} from './buffering.js';
import {CanUseRemotionHooks} from './CanUseRemotionHooks.js';
import type {TSequence} from './CompositionManager.js';
import {CompositionManager} from './CompositionManagerContext.js';
import {LogLevelContext} from './log-level-context.js';
import {PreloadContext} from './prefetch-state.js';
import {RemotionEnvironmentContext} from './remotion-environment-context.js';
import {RenderAssetManager} from './RenderAssetManager.js';
import {ResolveCompositionContext} from './ResolveCompositionConfig.js';
import {
	COMMIT_REGISTRATION_ERROR_EVENT,
	SequenceManagerOrderMarker,
} from './sequence-order-marker.js';
import {SequenceContext} from './SequenceContext.js';
import {
	SequenceManager,
	SequenceManagerRefContext,
	SequenceRegistryContext,
	SequenceRegistryScopeContext,
	SequenceRegistryProvider,
	SequenceCommitRegistrationContext,
	SequenceRegistrationContext,
	DisableSequenceRegistrationContext,
	VisualModePropStatusesRefContext,
} from './SequenceManager.js';
import {SetTimelineContext, TimelineContext} from './TimelineContext.js';

export function useRemotionContexts() {
	const compositionManagerCtx = React.useContext(CompositionManager);
	const timelineContext = React.useContext(TimelineContext);
	const setTimelineContext = React.useContext(SetTimelineContext);
	const sequenceContext = React.useContext(SequenceContext);
	const canUseRemotionHooksContext = React.useContext(CanUseRemotionHooks);
	const preloadContext = React.useContext(PreloadContext);
	const resolveCompositionContext = React.useContext(ResolveCompositionContext);
	const renderAssetManagerContext = React.useContext(RenderAssetManager);
	const sequenceManagerContext = React.useContext(SequenceManager);
	const sequenceManagerRefContext = React.useContext(SequenceManagerRefContext);
	const sequenceRegistryContext = React.useContext(SequenceRegistryContext);
	const sequenceRegistryScopeContext = React.useContext(
		SequenceRegistryScopeContext,
	);
	const sequenceCommitRegistrationContext = React.useContext(
		SequenceCommitRegistrationContext,
	);
	const sequenceRegistrationContext = React.useContext(
		SequenceRegistrationContext,
	);
	const disableSequenceRegistrationContext = React.useContext(
		DisableSequenceRegistrationContext,
	);
	const remotionEnvironmentContext = React.useContext(
		RemotionEnvironmentContext,
	);
	const visualModePropStatusesRefContext = React.useContext(
		VisualModePropStatusesRefContext,
	);
	const bufferManagerContext = React.useContext(BufferingContextReact);
	const logLevelContext = React.useContext(LogLevelContext);

	return useMemo(
		() => ({
			compositionManagerCtx,
			timelineContext,
			setTimelineContext,
			sequenceContext,
			canUseRemotionHooksContext,
			preloadContext,
			resolveCompositionContext,
			renderAssetManagerContext,
			sequenceManagerContext,
			sequenceManagerRefContext,
			sequenceRegistryContext,
			sequenceRegistryScopeContext,
			sequenceCommitRegistrationContext,
			sequenceRegistrationContext,
			disableSequenceRegistrationContext,
			remotionEnvironmentContext,
			visualModePropStatusesRefContext,
			bufferManagerContext,
			logLevelContext,
		}),
		[
			compositionManagerCtx,
			sequenceContext,
			setTimelineContext,
			timelineContext,
			canUseRemotionHooksContext,
			preloadContext,
			resolveCompositionContext,
			renderAssetManagerContext,
			sequenceManagerContext,
			sequenceManagerRefContext,
			sequenceRegistryContext,
			sequenceRegistryScopeContext,
			sequenceCommitRegistrationContext,
			sequenceRegistrationContext,
			disableSequenceRegistrationContext,
			remotionEnvironmentContext,
			visualModePropStatusesRefContext,
			bufferManagerContext,
			logLevelContext,
		],
	);
}

export interface RemotionContextProviderProps {
	readonly contexts: ReturnType<typeof useRemotionContexts>;
	readonly children: React.ReactNode;
}

const ForwardedSequenceRegistry: React.FC<RemotionContextProviderProps> = ({
	contexts,
	children,
}) => {
	const [scopeId] = useState(() => String(Math.random()));
	const [observerFailed, setObserverFailed] = useState(false);
	const registry = contexts.sequenceRegistryContext;
	const scope = contexts.sequenceRegistryScopeContext;
	const commitRegistrationEnabled =
		contexts.sequenceCommitRegistrationContext && !observerFailed;
	const {registerSequence, unregisterSequence, updateSequence} =
		contexts.sequenceManagerContext;
	const actions = useMemo(
		() => ({registerSequence, unregisterSequence, updateSequence}),
		[registerSequence, unregisterSequence, updateSequence],
	);
	const onCommitSequences = useCallback(
		(sequences: readonly TSequence[], sequenceIds: readonly string[]) => {
			scope?.onCommitSequences(scopeId, sequences, sequenceIds);
		},
		[scope, scopeId],
	);
	const useIsomorphicLayoutEffect =
		typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;
	useIsomorphicLayoutEffect(() => {
		if (scope === null || typeof window === 'undefined') {
			return;
		}

		let unmounted = false;
		const onFailure = () =>
			queueMicrotask(() => {
				if (!unmounted) setObserverFailed(true);
			});
		window.addEventListener(COMMIT_REGISTRATION_ERROR_EVENT, onFailure);
		return () => {
			unmounted = true;
			window.removeEventListener(COMMIT_REGISTRATION_ERROR_EVENT, onFailure);
			scope.onCommitSequences(scopeId, [], []);
		};
	}, [scope, scopeId]);
	if (registry === null || scope === null) {
		return (
			<SequenceManager.Provider value={contexts.sequenceManagerContext}>
				{children}
			</SequenceManager.Provider>
		);
	}

	return (
		<SequenceManagerOrderMarker
			managerId={scopeId}
			onCommitSequences={commitRegistrationEnabled ? onCommitSequences : null}
		>
			<SequenceRegistryScopeContext.Provider value={scope}>
				<SequenceRegistryProvider registry={registry} actions={actions}>
					<SequenceCommitRegistrationContext.Provider
						value={commitRegistrationEnabled}
					>
						{children}
					</SequenceCommitRegistrationContext.Provider>
				</SequenceRegistryProvider>
			</SequenceRegistryScopeContext.Provider>
		</SequenceManagerOrderMarker>
	);
};

export const RemotionContextProvider = (
	props: RemotionContextProviderProps,
) => {
	const {children, contexts} = props;
	return (
		<LogLevelContext.Provider value={contexts.logLevelContext}>
			<CanUseRemotionHooks.Provider value={contexts.canUseRemotionHooksContext}>
				<PreloadContext.Provider value={contexts.preloadContext}>
					<CompositionManager.Provider value={contexts.compositionManagerCtx}>
						<SequenceManagerRefContext.Provider
							value={contexts.sequenceManagerRefContext}
						>
							<RemotionEnvironmentContext.Provider
								value={contexts.remotionEnvironmentContext}
							>
								<SequenceRegistrationContext.Provider
									value={contexts.sequenceRegistrationContext}
								>
									<DisableSequenceRegistrationContext.Provider
										value={contexts.disableSequenceRegistrationContext}
									>
										<ForwardedSequenceRegistry contexts={contexts}>
											<VisualModePropStatusesRefContext.Provider
												value={contexts.visualModePropStatusesRefContext}
											>
												<RenderAssetManager.Provider
													value={contexts.renderAssetManagerContext}
												>
													<ResolveCompositionContext.Provider
														value={contexts.resolveCompositionContext}
													>
														<TimelineContext.Provider
															value={contexts.timelineContext}
														>
															<SetTimelineContext.Provider
																value={contexts.setTimelineContext}
															>
																<SequenceContext.Provider
																	value={contexts.sequenceContext}
																>
																	<BufferingContextReact.Provider
																		value={contexts.bufferManagerContext}
																	>
																		{children}
																	</BufferingContextReact.Provider>
																</SequenceContext.Provider>
															</SetTimelineContext.Provider>
														</TimelineContext.Provider>
													</ResolveCompositionContext.Provider>
												</RenderAssetManager.Provider>
											</VisualModePropStatusesRefContext.Provider>
										</ForwardedSequenceRegistry>
									</DisableSequenceRegistrationContext.Provider>
								</SequenceRegistrationContext.Provider>
							</RemotionEnvironmentContext.Provider>
						</SequenceManagerRefContext.Provider>
					</CompositionManager.Provider>
				</PreloadContext.Provider>
			</CanUseRemotionHooks.Provider>
		</LogLevelContext.Provider>
	);
};
