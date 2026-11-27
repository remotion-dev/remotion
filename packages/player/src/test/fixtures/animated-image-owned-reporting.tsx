import {mock} from 'bun:test';
import {resolve as resolvePath} from 'node:path';
type ControlledDecoder = {
	close: () => void;
	frameCount: number;
	getFrame: () => Promise<null>;
};
import type {PlayerRef} from '../../player-methods.js';

type Deferred<T> = {
	resolve: (value: T) => void;
	reject: (error: unknown) => void;
	promise: Promise<T>;
	settled: boolean;
};
const deferred = <T,>(): Deferred<T> => {
	let resolve!: (value: T) => void;
	let reject!: (error: unknown) => void;
	const promise = new Promise<T>((a, b) => {
		resolve = a;
		reject = b;
	});
	const item = {
		promise,
		settled: false,
		resolve: (value: T) => {
			item.settled = true;
			resolve(value);
		},
		reject: (error: unknown) => {
			item.settled = true;
			reject(error);
		},
	};
	return item;
};

const main = async () => {
	const [phase, behavior] = process.argv[2].split(':');
	const decoderRuns: Deferred<ControlledDecoder>[] = [];
	const frameRuns: Deferred<null>[] = [];
	const durationRuns: Deferred<number>[] = [];
	const closed: number[] = [];
	const failure = new Error(`${phase} original failure`, {
		cause: new Error('decoder original cause'),
	});
	const authoredFailure = new Error(`${phase} authored callback throw`);
	const makeDecoder = (): ControlledDecoder => {
		const id = closed.length;
		closed.push(0);
		return {
			frameCount: 1,
			close: () => {
				closed[id]++;
			},
			getFrame: () => {
				if (phase !== 'frame') return Promise.resolve(null);
				const item = deferred<null>();
				frameRuns.push(item);
				return item.promise;
			},
		};
	};

	const decoderPath = resolvePath(
		__dirname,
		'../../../../core/dist/cjs/animated-image/decode-image.js',
	);
	const durationPath = resolvePath(
		__dirname,
		'../../../../core/dist/cjs/animated-image/get-duration-in-seconds.js',
	);
	mock.module(decoderPath, () => ({
		decodeImage: () => {
			if (phase !== 'decoder') return Promise.resolve(makeDecoder());
			const item = deferred<ControlledDecoder>();
			decoderRuns.push(item);
			return item.promise;
		},
	}));
	mock.module(durationPath, () => ({
		getAnimatedImageDurationInSeconds: () => {
			const item = deferred<number>();
			durationRuns.push(item);
			return item.promise;
		},
	}));
	const core = require(
		resolvePath(__dirname, '../../../../core/dist/cjs/index.js'),
	);
	mock.module('remotion', () => core);
	const {AnimatedImage} = await import('remotion');
	const {Player} = await import('../../Player.js');
	const {render, act, cleanup} = await import('@testing-library/react');
	const originalContext = HTMLCanvasElement.prototype.getContext;
	HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement) {
		return {
			canvas: this,
			clearRect: () => undefined,
			drawImage: () => undefined,
			fillRect: () => undefined,
		};
	} as unknown as typeof originalContext;
	const errors: Error[] = [];
	const userErrors: Error[] = [];
	const onError = (error: Error) => {
		userErrors.push(error);
		if (behavior === 'user-throw') {
			process.stdout.write(
				JSON.stringify({
					phase,
					behavior,
					originalUserError: error === failure,
				}) + '\n',
			);
			throw authoredFailure;
		}
	};

	const Content = ({src}: {readonly src: string}) => (
		<AnimatedImage
			src={src}
			width={32}
			height={32}
			loop={phase === 'duration'}
			onError={behavior.startsWith('user') ? onError : undefined}
		/>
	);
	const config = {
		compositionWidth: 32,
		compositionHeight: 32,
		durationInFrames: 30,
		fps: 30,
		acknowledgeRemotionLicense: true,
	};
	const listen = (ref: PlayerRef | null) =>
		ref?.addEventListener('error', (event) => errors.push(event.detail.error));
	const fallback = ({error}: {readonly error: Error}) => (
		<div role="alert">{error.message}</div>
	);
	const flush = async () => {
		await Promise.resolve();
		await new Promise<void>((resolveTick) => setTimeout(resolveTick, 0));
	};

	const runs = () =>
		phase === 'decoder'
			? decoderRuns
			: phase === 'frame'
				? frameRuns
				: durationRuns;
	try {
		const view = render(
			<Player
				{...config}
				ref={listen}
				component={Content}
				inputProps={{src: 'data:image/gif;base64,first'}}
				errorFallback={fallback}
			/>,
		);
		await act(flush);
		const old = runs().at(-1);
		if (!old) throw new Error(`Actual AnimatedImage did not reach ${phase}`);
		if (behavior === 'stale') {
			view.rerender(
				<Player
					{...config}
					ref={listen}
					component={Content}
					inputProps={{src: 'data:image/gif;base64,replacement'}}
					errorFallback={fallback}
				/>,
			);
			await act(flush);
			const current = runs().at(-1);
			if (!current || current === old)
				throw new Error('Source update did not start a replacement');
			await act(async () => {
				if (phase === 'decoder')
					(current as Deferred<ControlledDecoder>).resolve(makeDecoder());
				else if (phase === 'frame') (current as Deferred<null>).resolve(null);
				else (current as Deferred<number>).resolve(1);
				await flush();
				old.reject(failure);
				await flush();
			});
			if (
				errors.length ||
				userErrors.length ||
				view.queryByRole('alert') ||
				!view.container.querySelector('canvas')
			)
				throw new Error('Retired failure changed its healthy replacement');
		} else {
			await act(async () => {
				old.reject(failure);
				await flush();
			});
			if (behavior === 'active') {
				if (
					errors.length !== 1 ||
					errors[0] !== failure ||
					errors[0].cause !== failure.cause ||
					view.getByRole('alert').textContent !== failure.message
				)
					throw new Error(
						'Original owned failure did not reach its fallback once',
					);
			} else if (behavior === 'user') {
				if (
					errors.length ||
					userErrors.length !== 1 ||
					userErrors[0] !== failure ||
					view.queryByRole('alert')
				)
					throw new Error('Authored onError policy changed');
			} else if (behavior !== 'user-throw') throw new Error('Unknown behavior');
		}

		const facts = {
			phase,
			behavior,
			ownedErrors: errors.length,
			userErrors: userErrors.length,
			rendererUnpoisoned: window.remotion_cancelledErrorObject === undefined,
			closedBeforeUnmount: [...closed],
		};
		if (!facts.rendererUnpoisoned)
			throw new Error('Owned callback poisoned renderer state');
		view.unmount();
		if ((window.remotion_delayRenderHandles ?? []).length !== 0)
			throw new Error('Unount left image readiness handles live');
		if (closed.some((count) => count !== 1))
			throw new Error('Live decoded resource was not closed exactly once');
		process.stdout.write(
			JSON.stringify({...facts, closedAfterUnmount: closed}) + '\n',
		);
	} finally {
		for (const item of decoderRuns)
			if (!item.settled) item.resolve(makeDecoder());
		for (const item of frameRuns) if (!item.settled) item.resolve(null);
		for (const item of durationRuns) if (!item.settled) item.resolve(1);
		cleanup();
		HTMLCanvasElement.prototype.getContext = originalContext;
		mock.restore();
	}
};

main().catch((error: unknown) => {
	process.stderr.write(String(error) + '\n');
	process.exitCode = 1;
});
