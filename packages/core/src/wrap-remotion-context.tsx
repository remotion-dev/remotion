// This is used for when other reconcilers are being used
// such as in React Three Fiber. All the contexts need to be passed again
// for them to be useable

import React, {useCallback, useMemo, useRef, useState} from 'react';
import {BufferingContextReact} from './buffering.js';
import {CanUseRemotionHooks} from './CanUseRemotionHooks.js';
import {
	COMMIT_REGISTRATION_ERROR_EVENT,
	isCommitRegistrationObserverInstalled,
	withCommittedMetadata,
	type CommittedMetadata,
} from './committed-metadata.js';
import type {TSequence} from './CompositionManager.js';
import {CompositionManager} from './CompositionManagerContext.js';
import {DefaultPremountContext} from './DefaultPremountContext.js';
import {LogLevelContext} from './log-level-context.js';
import {PreloadContext} from './prefetch-state.js';
import {RemotionEnvironmentContext} from './remotion-environment-context.js';
import {RenderAssetManager} from './RenderAssetManager.js';
import {ResolveCompositionContext} from './ResolveCompositionConfig.js';
import {SequenceContext} from './SequenceContext.js';
import {
	DisableSequenceRegistrationContext,
	SequenceCommitRegistrationContext,
	SequenceManagerActionsContext,
	SequenceManagerRefContext,
	SequenceRegistrationContext,
	SequenceRegistryContext,
	SequenceRegistryScopeContext,
	VisualModePropStatusesRefContext,
} from './SequenceManager.js';
import {
	ExperimentalTracksEnabledContext,
	TimelineTrackContext,
} from './timeline-track-context.js';
import {SetTimelineContext, TimelineContext} from './TimelineContext.js';

export function useRemotionContexts() {
	const compositionManagerCtx = React.useContext(CompositionManager);
	const timelineContext = React.useContext(TimelineContext);
	const setTimelineContext = React.useContext(SetTimelineContext);
	const sequenceContext = React.useContext(SequenceContext);
	const defaultPremountInSeconds = React.useContext(DefaultPremountContext);
	const experimentalTracksEnabled = React.useContext(
		ExperimentalTracksEnabledContext,
	);
	const timelineTrackContext = React.useContext(TimelineTrackContext);
	const canUseRemotionHooksContext = React.useContext(CanUseRemotionHooks);
	const preloadContext = React.useContext(PreloadContext);
	const resolveCompositionContext = React.useContext(ResolveCompositionContext);
	const renderAssetManagerContext = React.useContext(RenderAssetManager);
	const sequenceManagerActionsContext = React.useContext(
		SequenceManagerActionsContext,
	);
	const sequenceManagerRefContext = React.useContext(SequenceManagerRefContext);
	const sequenceRegistryContext = React.useContext(SequenceRegistryContext);
	const sequenceRegistryScopeContext = React.useContext(
		SequenceRegistryScopeContext,
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
			defaultPremountInSeconds,
			experimentalTracksEnabled,
			timelineTrackContext,
			canUseRemotionHooksContext,
			preloadContext,
			resolveCompositionContext,
			renderAssetManagerContext,
			sequenceManagerActionsContext,
			sequenceManagerRefContext,
			sequenceRegistryContext,
			sequenceRegistryScopeContext,
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
			defaultPremountInSeconds,
			experimentalTracksEnabled,
			timelineTrackContext,
			setTimelineContext,
			timelineContext,
			canUseRemotionHooksContext,
			preloadContext,
			resolveCompositionContext,
			renderAssetManagerContext,
			sequenceManagerActionsContext,
			sequenceManagerRefContext,
			sequenceRegistryContext,
			sequenceRegistryScopeContext,
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

const SequenceRegistryScopeProvider = withCommittedMetadata(
	SequenceRegistryScopeContext.Provider,
);

const ForwardedSequenceRegistry: React.FC<RemotionContextProviderProps> = ({
	contexts,
	children,
}) => {
	const [scopeId] = useState(() => String(Math.random()));
	const [observerAvailable, setObserverAvailable] = useState(
		isCommitRegistrationObserverInstalled,
	);
	const observedCommitRef = useRef(false);
	const observerFailedRef = useRef(false);
	const unmountedRef = useRef(false);
	const lifetimeRef = useRef(0);
	const registry = contexts.sequenceRegistryContext;
	const scope = contexts.sequenceRegistryScopeContext;
	const activeRegistryRef = useRef(registry);
	const commitRegistrationEnabled =
		scope?.commitRegistrationRequested === true &&
		registry !== null &&
		observerAvailable;
	const onCommitSequences = useCallback(
		(sequences: readonly TSequence[], sequenceIds: readonly string[]) => {
			if (observerFailedRef.current && sequenceIds.length > 0) {
				return;
			}

			observedCommitRef.current = true;
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

		const lifetime = ++lifetimeRef.current;
		unmountedRef.current = false;
		activeRegistryRef.current = registry;
		const onFailure = () => {
			if (observerFailedRef.current) {
				return;
			}

			observerFailedRef.current = true;
			queueMicrotask(() => {
				scope.onCommitSequences(scopeId, [], []);
				// Release this root's committed records before its effects take over.
				queueMicrotask(() => {
					if (!unmountedRef.current) setObserverAvailable(false);
				});
			});
		};

		window.addEventListener(COMMIT_REGISTRATION_ERROR_EVENT, onFailure);
		if (commitRegistrationEnabled) {
			queueMicrotask(() => {
				if (
					lifetimeRef.current === lifetime &&
					!unmountedRef.current &&
					!observedCommitRef.current
				) {
					onFailure();
				}
			});
		}

		return () => {
			unmountedRef.current = true;
			window.removeEventListener(COMMIT_REGISTRATION_ERROR_EVENT, onFailure);
			// Strict Mode and Fast Refresh restart effects without removing the provider.
			queueMicrotask(() => {
				if (
					activeRegistryRef.current !== registry ||
					(lifetimeRef.current === lifetime && unmountedRef.current)
				) {
					scope.onCommitSequences(scopeId, [], []);
				}
			});
		};
	}, [scope, scopeId, registry, commitRegistrationEnabled]);
	const metadata = useMemo<CommittedMetadata>(
		() => ({
			type: 'sequence-manager',
			id: scopeId,
			onCommit: commitRegistrationEnabled ? onCommitSequences : null,
		}),
		[commitRegistrationEnabled, onCommitSequences, scopeId],
	);
	return (
		<SequenceRegistryScopeProvider
			value={scope}
			_remotionCommitMetadata={metadata}
		>
			<SequenceManagerActionsContext.Provider
				value={contexts.sequenceManagerActionsContext}
			>
				<SequenceRegistryContext.Provider value={registry}>
					<SequenceCommitRegistrationContext.Provider
						value={commitRegistrationEnabled}
					>
						{children}
					</SequenceCommitRegistrationContext.Provider>
				</SequenceRegistryContext.Provider>
			</SequenceManagerActionsContext.Provider>
		</SequenceRegistryScopeProvider>
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
																		<ExperimentalTracksEnabledContext.Provider
																			value={contexts.experimentalTracksEnabled}
																		>
																			<TimelineTrackContext.Provider
																				value={contexts.timelineTrackContext}
																			>
																				<DefaultPremountContext.Provider
																					value={
																						contexts.defaultPremountInSeconds
																					}
																				>
																					{children}
																				</DefaultPremountContext.Provider>
																			</TimelineTrackContext.Provider>
																		</ExperimentalTracksEnabledContext.Provider>
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
