import {
	createBrowserBundleRuntime,
	createBrowserCompositionObserver,
	type BrowserComposition,
} from '@remotion/browser-bundler/runtime';
import {Player} from '@remotion/player';
import React, {useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import type {CreateBrowserBundlerPreview} from './bridge';

const Preview: React.FC<{
	readonly composition: BrowserComposition;
	readonly revision: number;
	readonly onReady: (revision: number) => void;
}> = ({composition: preview, revision, onReady}) => {
	useEffect(() => onReady(revision), [onReady, preview, revision]);

	return (
		<section aria-label="Compiled composition">
			<p>
				{preview.width} x {preview.height} / {preview.fps} fps /{' '}
				{preview.durationInFrames} frames
			</p>
			<Player
				component={preview.component}
				inputProps={preview.props}
				compositionWidth={preview.width}
				compositionHeight={preview.height}
				fps={preview.fps}
				durationInFrames={preview.durationInFrames}
				controls
				alwaysShowControls
				showPlaybackRateControl
				spaceKeyToPlayOrPause={false}
				loop
				acknowledgeRemotionLicense
				errorFallback={({error}) => (
					<p role="alert">Could not play the composition: {error.message}</p>
				)}
				style={{width: '100%'}}
			/>
		</section>
	);
};

export const createBrowserBundlerPreview: CreateBrowserBundlerPreview = ({
	onError,
}) => {
	const container = document.getElementById('browser-bundler-preview');
	if (!container) {
		throw new Error('The Player preview container was not found.');
	}

	const runtime = createBrowserBundleRuntime();
	let disposed = false;
	let revision = 0;
	let pending: {
		revision: number;
		resolve: () => void;
		reject: (error: Error) => void;
		timeout: number;
	} | null = null;

	const reportError = (error: unknown) => {
		if (disposed) {
			return;
		}

		const message = error instanceof Error ? error.message : String(error);
		if (pending) {
			window.clearTimeout(pending.timeout);
			pending.reject(new Error(message));
			pending = null;
		}

		onError(message);
	};
	const onReady = (readyRevision: number) => {
		if (pending?.revision !== readyRevision) {
			return;
		}

		window.clearTimeout(pending.timeout);
		pending.resolve();
		pending = null;
	};
	const root = createRoot(container, {
		onCaughtError: reportError,
		onUncaughtError: reportError,
	});
	const observer = createBrowserCompositionObserver({
		onChange: (composition) => {
			root.render(
				<Preview
					composition={composition}
					revision={revision}
					onReady={onReady}
				/>,
			);
		},
		onError: reportError,
	});

	const dispose = () => {
		if (disposed) {
			return;
		}

		disposed = true;
		window.removeEventListener('pagehide', dispose);
		if (pending) {
			window.clearTimeout(pending.timeout);
			pending.reject(new Error('The Player preview was disposed.'));
			pending = null;
		}

		try {
			root.unmount();
		} finally {
			try {
				observer.dispose();
			} finally {
				runtime.dispose();
			}
		}
	};
	window.addEventListener('pagehide', dispose);

	return {
		applyBundle: async (bundle) => {
			if (disposed) {
				throw new Error('The Player preview was disposed.');
			}

			const RegisteredRoot = await runtime.applyBundle(bundle);
			if (disposed) {
				throw new Error('The Player preview was disposed.');
			}

			revision++;
			await new Promise<void>((resolve, reject) => {
				pending = {
					revision,
					resolve,
					reject,
					timeout: window.setTimeout(
						() =>
							reportError(
								new Error('Timed out while resolving the preview composition.'),
							),
						30_000,
					),
				};
				observer.update({
					root: RegisteredRoot,
					compositionId: 'BrowserDemo',
					inputProps: {},
				});
			});
		},
		dispose,
	};
};
