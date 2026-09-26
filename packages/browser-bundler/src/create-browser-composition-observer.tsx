import React, {Suspense, useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import type {AnyComposition} from 'remotion';
import {Internals} from 'remotion';
import type {BrowserComposition} from './get-browser-composition';

export type BrowserCompositionSelection = {
	readonly root: React.FC;
	readonly compositionId: string;
	readonly inputProps: Record<string, unknown>;
};

export type BrowserCompositionObserver = {
	update: (selection: BrowserCompositionSelection) => void;
	dispose: () => void;
};

const environment: React.ContextType<
	typeof Internals.RemotionEnvironmentContext
> = {
	isClientSideRendering: false,
	isPlayer: false,
	isReadOnlyStudio: false,
	isRendering: false,
	isStudio: false,
};

type RegistrationProps = {
	readonly children: React.ReactNode;
	readonly revision: number;
	readonly onError: (error: unknown, revision: number) => void;
};

class RegistrationErrorBoundary extends React.Component<
	RegistrationProps,
	{failed: boolean; revision: number}
> {
	state = {failed: false, revision: this.props.revision};

	static getDerivedStateFromProps(
		props: RegistrationProps,
		state: {failed: boolean; revision: number},
	) {
		return props.revision === state.revision
			? null
			: {failed: false, revision: props.revision};
	}

	static getDerivedStateFromError() {
		return {failed: true};
	}

	componentDidCatch(error: Error) {
		this.props.onError(error, this.props.revision);
	}

	render() {
		return this.state.failed ? null : this.props.children;
	}
}

const RegistrationCommitted: React.FC<{
	readonly revision: number;
	readonly onCommit: (revision: number) => void;
}> = ({revision, onCommit}) => {
	useEffect(() => onCommit(revision), [onCommit, revision]);
	return null;
};

const ObserveMetadata: React.FC<{
	readonly composition: AnyComposition | null;
	readonly compositionId: string;
	readonly inputProps: Record<string, unknown>;
	readonly revision: number;
	readonly registeredRevision: number | null;
	readonly onChange: (
		composition: BrowserComposition,
		revision: number,
	) => void;
	readonly onError: (error: unknown, revision: number) => void;
}> = ({
	composition,
	compositionId,
	inputProps,
	revision,
	registeredRevision,
	onChange,
	onError,
}) => {
	useEffect(() => {
		if (registeredRevision !== revision) {
			return;
		}

		if (!composition) {
			onError(
				new Error(`No composition with ID "${compositionId}" is registered.`),
				revision,
			);
			return;
		}

		const controller = new AbortController();
		const defaultProps = composition.defaultProps ?? {};
		try {
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
			Promise.resolve(config).then(
				(videoConfig) => {
					if (!controller.signal.aborted) {
						onChange(
							{...videoConfig, component: composition.component},
							revision,
						);
					}
				},
				(error: unknown) => {
					if (!controller.signal.aborted) {
						onError(error, revision);
					}
				},
			);
		} catch (error) {
			onError(error, revision);
		}

		return () => controller.abort();
	}, [
		composition,
		compositionId,
		inputProps,
		onChange,
		onError,
		registeredRevision,
		revision,
	]);

	return null;
};

const ObserveComposition: React.FC<
	BrowserCompositionSelection & {
		readonly revision: number;
		readonly onChange: (
			composition: BrowserComposition,
			revision: number,
		) => void;
		readonly onError: (error: unknown, revision: number) => void;
	}
> = ({
	root: RegisteredRoot,
	compositionId,
	inputProps,
	revision,
	onChange,
	onError,
}) => {
	const [registeredRevision, setRegisteredRevision] = useState<number | null>(
		null,
	);
	const [compositions, setCompositions] = useState<AnyComposition[]>([]);
	const setters = useMemo<
		React.ContextType<typeof Internals.CompositionSetters>
	>(
		() => ({
			registerComposition: (composition) => {
				setCompositions((current) => {
					if (current.some(({id}) => id === composition.id)) {
						throw new Error(
							`A composition with ID "${composition.id}" was registered more than once.`,
						);
					}

					return [...current, composition as AnyComposition];
				});
			},
			unregisterComposition: (id) => {
				setCompositions((current) =>
					current.filter((composition) => composition.id !== id),
				);
			},
			registerFolder: () => undefined,
			unregisterFolder: () => undefined,
			setCanvasContent: () => undefined,
			setCurrentAssetMetadata: () => undefined,
			onlyRenderComposition: null,
		}),
		[],
	);
	// Registry changes must not rerender Root and trigger another registration.
	const registration = useMemo(
		() => (
			<Suspense fallback={null}>
				<RegisteredRoot />
				<RegistrationCommitted
					revision={revision}
					onCommit={setRegisteredRevision}
				/>
			</Suspense>
		),
		[RegisteredRoot, revision],
	);

	return (
		<Internals.RemotionEnvironmentContext.Provider value={environment}>
			<Internals.CompositionSetters.Provider value={setters}>
				{registration}
				<ObserveMetadata
					composition={
						compositions.find(({id}) => id === compositionId) ?? null
					}
					compositionId={compositionId}
					inputProps={inputProps}
					revision={revision}
					registeredRevision={registeredRevision}
					onChange={onChange}
					onError={onError}
				/>
			</Internals.CompositionSetters.Provider>
		</Internals.RemotionEnvironmentContext.Provider>
	);
};

export const createBrowserCompositionObserver = ({
	onChange,
	onError,
}: {
	onChange: (composition: BrowserComposition) => void;
	onError: (error: Error) => void;
}): BrowserCompositionObserver => {
	if (typeof document === 'undefined' || !document.body) {
		throw new Error('Composition observation requires a browser document.');
	}

	const container = document.createElement('div');
	container.hidden = true;
	document.body.appendChild(container);
	let disposed = false;
	let revision = 0;
	let lastError: {error: unknown; revision: number} | null = null;
	const reportError = (error: unknown, errorRevision: number) => {
		if (!disposed && errorRevision === revision) {
			if (
				lastError !== null &&
				lastError.error === error &&
				lastError.revision === errorRevision
			) {
				return;
			}

			lastError = {error, revision: errorRevision};
			onError(error instanceof Error ? error : new Error(String(error)));
		}
	};

	const onComposition = (
		composition: BrowserComposition,
		resolvedRevision: number,
	) => {
		if (disposed || resolvedRevision !== revision) {
			return;
		}

		try {
			onChange(composition);
		} catch (error) {
			reportError(error, resolvedRevision);
		}
	};

	const root = createRoot(container, {
		onCaughtError: (error) => reportError(error, revision),
		onUncaughtError: (error) => reportError(error, revision),
	});

	return {
		update: (selection) => {
			if (disposed) {
				throw new Error('The composition observer was disposed.');
			}

			revision++;
			// Composition owns the stable wrapper used by the Player. Unmounting
			// registration between updates would also reset the video's state.
			root.render(
				<RegistrationErrorBoundary revision={revision} onError={reportError}>
					<ObserveComposition
						{...selection}
						revision={revision}
						onChange={onComposition}
						onError={reportError}
					/>
				</RegistrationErrorBoundary>,
			);
		},
		dispose: () => {
			if (disposed) {
				return;
			}

			disposed = true;
			try {
				root.unmount();
			} finally {
				container.remove();
			}
		},
	};
};
