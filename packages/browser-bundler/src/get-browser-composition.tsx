import React, {Suspense, useEffect} from 'react';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import type {AnyComposition, VideoConfig} from 'remotion';
import {Internals} from 'remotion';

export type BrowserComposition = VideoConfig & {
	component: AnyComposition['component'];
};

class RegistrationErrorBoundary extends React.Component<
	{
		readonly children: React.ReactNode;
		readonly onError: (error: unknown) => void;
	},
	{failed: boolean}
> {
	state = {failed: false};

	static getDerivedStateFromError() {
		return {failed: true};
	}

	componentDidCatch(error: Error) {
		this.props.onError(error);
	}

	render() {
		return this.state.failed ? null : this.props.children;
	}
}

const RegistrationComplete: React.FC<{
	readonly onComplete: () => void;
}> = ({onComplete}) => {
	useEffect(onComplete, [onComplete]);
	return null;
};

/**
 * Mounts a registered Root to select a Composition and resolve its metadata.
 * Input props override default props. Root providers are used for registration
 * only; they are not included around the component returned for the Player.
 * Pass an AbortSignal to cancel pending lazy roots or calculateMetadata().
 */
export const getBrowserComposition = async ({
	root: RegisteredRoot,
	compositionId,
	inputProps,
	signal,
}: {
	root: React.FC;
	compositionId: string;
	inputProps: Record<string, unknown>;
	signal?: AbortSignal;
}): Promise<BrowserComposition> => {
	if (signal?.aborted) {
		throw signal.reason;
	}

	if (typeof document === 'undefined' || !document.body) {
		throw new Error('getBrowserComposition() must be called in a browser.');
	}

	const container = document.createElement('div');
	container.hidden = true;
	document.body.appendChild(container);

	const controller = new AbortController();
	const abort = () => controller.abort(signal?.reason);
	signal?.addEventListener('abort', abort, {once: true});

	const compositions = new Map<string, AnyComposition>();
	let reactRoot: Root | null = null;
	let finished = false;
	let resolving = false;

	try {
		return await new Promise<BrowserComposition>((resolve, reject) => {
			const onError = (error: unknown) => {
				if (finished) {
					return;
				}

				finished = true;
				reject(error instanceof Error ? error : new Error(String(error)));
			};

			controller.signal.addEventListener(
				'abort',
				() => {
					if (finished) {
						return;
					}

					finished = true;
					reject(controller.signal.reason);
				},
				{once: true},
			);

			const onComplete = () => {
				// Wait until all passive effects (including Strict Mode remounts
				// and registration errors) have finished before taking the snapshot.
				queueMicrotask(() => {
					if (finished || resolving) {
						return;
					}

					resolving = true;
					try {
						const composition = compositions.get(compositionId);
						if (!composition) {
							throw new Error(
								`No composition with ID "${compositionId}" was registered. Available IDs: ${
									[...compositions.keys()].join(', ') || '(none)'
								}.`,
							);
						}

						const defaultProps = composition.defaultProps ?? {};
						const config = Internals.resolveVideoConfig({
							compositionId,
							compositionWidth: composition.width ?? null,
							compositionHeight: composition.height ?? null,
							compositionFps: composition.fps ?? null,
							compositionDurationInFrames: composition.durationInFrames ?? null,
							calculateMetadata: composition.calculateMetadata,
							defaultProps,
							inputProps: {...defaultProps, ...inputProps},
							signal: controller.signal,
						});

						Promise.resolve(config).then((videoConfig) => {
							if (finished) {
								return;
							}

							finished = true;
							resolve({...videoConfig, component: composition.component});
						}, onError);
					} catch (error) {
						onError(error);
					}
				});
			};

			const setters: React.ContextType<typeof Internals.CompositionSetters> = {
				registerComposition: (composition) => {
					if (compositions.has(composition.id)) {
						throw new Error(
							`A composition with ID "${composition.id}" was registered more than once.`,
						);
					}

					compositions.set(composition.id, composition as AnyComposition);
				},
				unregisterComposition: (id) => {
					compositions.delete(id);
				},
				registerFolder: () => undefined,
				unregisterFolder: () => undefined,
				setCanvasContent: () => undefined,
				setCurrentAssetMetadata: () => undefined,
				onlyRenderComposition: null,
			};

			reactRoot = createRoot(container, {
				onCaughtError: onError,
				onUncaughtError: onError,
			});
			reactRoot.render(
				<RegistrationErrorBoundary onError={onError}>
					<Internals.RemotionEnvironmentContext.Provider
						value={{
							isClientSideRendering: false,
							isPlayer: false,
							isReadOnlyStudio: false,
							isRendering: false,
							isStudio: false,
						}}
					>
						<Internals.CompositionSetters.Provider value={setters}>
							<Suspense fallback={null}>
								<RegisteredRoot />
								<RegistrationComplete onComplete={onComplete} />
							</Suspense>
						</Internals.CompositionSetters.Provider>
					</Internals.RemotionEnvironmentContext.Provider>
				</RegistrationErrorBoundary>,
			);
		});
	} finally {
		finished = true;
		signal?.removeEventListener('abort', abort);
		controller.abort();
		try {
			// Promise continuations run outside React's commit, so unmounting
			// here also works when registration finishes in an effect.
			(reactRoot as Root | null)?.unmount();
		} finally {
			compositions.clear();
			container.remove();
		}
	}
};
