import {afterEach, expect, test} from 'bun:test';
import {Activity, useLayoutEffect} from 'react';
import {Internals, useDelayRender, type DelayRenderScope} from 'remotion';
import {ErrorBoundary} from '../error-boundary.js';
import type {PlayerRef} from '../player-methods.js';
import {Player} from '../Player.js';
import {Thumbnail} from '../Thumbnail.js';
import {act, cleanup, render} from './test-utils.js';

type Controls = ReturnType<typeof useDelayRender>;
const Capture = ({ready}: {readonly ready: (controls: Controls) => void}) => {
	const controls = useDelayRender();
	const {delayRender, continueRender, cancelRender} = controls;
	useLayoutEffect(
		() => ready({delayRender, continueRender, cancelRender}),
		[ready, delayRender, continueRender, cancelRender],
	);
	return <div>composition</div>;
};

const Replacement = (props: {readonly ready: (controls: Controls) => void}) => (
	<Capture {...props} />
);
const config = {
	compositionWidth: 100,
	compositionHeight: 100,
	durationInFrames: 30,
	fps: 30,
};
const fallback = ({error}: {error: Error}) => (
	<div role="alert">{error.message}</div>
);
const reject = (controls: Controls, error: Error) =>
	Promise.reject(error).catch(controls.cancelRender);

afterEach(() => cleanup());

test('an async rendering failure reaches only its owning Player and preserves shared readiness', async () => {
	let failing!: Controls;
	let healthy!: Controls;
	const reported: Error[] = [];
	const subscribe = (ref: PlayerRef | null) =>
		ref?.addEventListener('error', (event) =>
			reported.push(event.detail.error),
		);
	const view = render(
		<>
			<Player
				{...config}
				ref={subscribe}
				component={Capture}
				inputProps={{
					ready: (value) => {
						failing = value;
					},
				}}
				errorFallback={fallback}
			/>
			<Player
				{...config}
				component={Capture}
				inputProps={{
					ready: (value) => {
						healthy = value;
					},
				}}
				errorFallback={fallback}
			/>
		</>,
	);
	const healthyElement = view.getAllByText('composition')[1];
	const firstHandle = failing.delayRender('first player');
	const secondHandle = healthy.delayRender('second player');
	expect(window.remotion_delayRenderHandles).toContain(firstHandle);
	expect(window.remotion_delayRenderHandles).toContain(secondHandle);
	const failure = new Error('async effect failed');
	await act(async () => {
		await expect(reject(failing, failure)).rejects.toBe(failure);
	});
	expect(reported).toEqual([failure]);
	expect(view.getByRole('alert').textContent).toBe('async effect failed');
	expect(view.getByText('composition')).toBe(healthyElement);
	expect(window.remotion_cancelledErrorObject).toBeUndefined();
	healthy.continueRender(secondHandle);
	expect(window.remotion_delayRenderHandles).toContain(firstHandle);
	failing.continueRender(firstHandle);
	expect(window.remotion_renderReady).toBe(true);
});

test('replaced and unmounted compositions cannot report stale async failures', async () => {
	let controls!: Controls;
	const ready = (value: Controls) => {
		controls = value;
	};

	const view = render(
		<Player
			{...config}
			component={Capture}
			inputProps={{ready}}
			errorFallback={fallback}
		/>,
	);
	const old = controls;
	const authored = view.getByText('composition');
	view.rerender(
		<Player
			{...config}
			component={Capture}
			inputProps={{ready}}
			errorFallback={fallback}
			style={{opacity: 0.8}}
		/>,
	);
	expect(view.getByText('composition') === authored).toBe(true);
	expect(controls.cancelRender === old.cancelRender).toBe(true);
	view.rerender(
		<Player
			{...config}
			component={Replacement}
			inputProps={{ready}}
			errorFallback={fallback}
		/>,
	);
	await act(async () => {
		await expect(
			reject(old, new Error('old composition failed')),
		).rejects.toThrow('old composition failed');
	});
	expect(view.queryByRole('alert') === null).toBe(true);
	expect(view.getByText('composition')).toBeTruthy();
	const current = controls;
	await act(async () => {
		await expect(
			reject(current, new Error('replacement failed')),
		).rejects.toThrow('replacement failed');
	});
	expect(view.getByRole('alert').textContent).toBe('replacement failed');
	view.unmount();
	await expect(reject(current, new Error('after unmount'))).rejects.toThrow(
		'after unmount',
	);
});

test('a Thumbnail routes asynchronous cancellation to its existing error fallback', async () => {
	let controls!: Controls;
	const view = render(
		<Thumbnail
			{...config}
			frameToDisplay={0}
			component={Capture}
			inputProps={{
				ready: (value) => {
					controls = value;
				},
			}}
			errorFallback={fallback}
		/>,
	);
	await act(async () => {
		await expect(
			reject(controls, new Error('thumbnail failed')),
		).rejects.toThrow('thumbnail failed');
	});
	expect(view.getByRole('alert').textContent).toBe('thumbnail failed');
});

test('a revealed Activity activates cancellation before descendant layout effects', () => {
	let failOnReveal = false;
	const Content = () => {
		const {cancelRender} = useDelayRender();
		useLayoutEffect(() => {
			if (failOnReveal) cancelRender(new Error('reveal failed'));
		}, [cancelRender]);
		return <div>active composition</div>;
	};

	const player = (
		<Player {...config} component={Content} errorFallback={fallback} />
	);
	const view = render(<Activity mode="visible">{player}</Activity>);
	view.rerender(<Activity mode="hidden">{player}</Activity>);
	failOnReveal = true;
	view.rerender(<Activity mode="visible">{player}</Activity>);
	expect(view.getByRole('alert').textContent).toBe('reveal failed');
});

// PR #12934: replacing the scope owner must expire callbacks without remounting
// a child whose React component identity is unchanged (including Fast Refresh).
test('owner replacement preserves mounted content while expiring old cancellation callbacks', async () => {
	let controls!: Controls;
	let mounts = 0;
	let unmounts = 0;
	const Content = () => {
		controls = useDelayRender();
		useLayoutEffect(() => {
			mounts++;
			return () => {
				unmounts++;
			};
		}, []);
		return <div>retained composition</div>;
	};

	const reported: Error[] = [];
	const onError = (error: Error) => reported.push(error);
	const view = render(
		<ErrorBoundary
			isReplacingComponent={false}
			renderingOwner={{}}
			onError={onError}
			errorFallback={fallback}
		>
			<Content />
		</ErrorBoundary>,
	);
	const old = controls;
	const element = view.getByText('retained composition');
	view.rerender(
		<ErrorBoundary
			isReplacingComponent={false}
			renderingOwner={{}}
			onError={onError}
			errorFallback={fallback}
		>
			<Content />
		</ErrorBoundary>,
	);
	expect(mounts).toBe(1);
	expect(unmounts).toBe(0);
	expect(view.getByText('retained composition')).toBe(element);
	expect(controls.cancelRender).not.toBe(old.cancelRender);
	await act(async () => {
		await expect(reject(old, new Error('stale owner'))).rejects.toThrow(
			'stale owner',
		);
	});
	expect(reported).toEqual([]);
	const failure = new Error('current owner');

	await act(async () => {
		await expect(reject(controls, failure)).rejects.toBe(failure);
	});
	expect(reported).toEqual([failure]);
	expect(unmounts).toBe(1);
});

test('multiple cancellations reject individually while the owner reports its first error', async () => {
	let controls!: Controls;
	const reported: Error[] = [];
	const first = new Error('first failure', {
		cause: new Error('original cause'),
	});
	const second = new Error('second failure');
	const view = render(
		<ErrorBoundary
			isReplacingComponent={false}
			renderingOwner={null}
			onError={(error) => reported.push(error)}
			errorFallback={fallback}
		>
			<Capture
				ready={(value) => {
					controls = value;
				}}
			/>
		</ErrorBoundary>,
	);
	await act(async () => {
		await expect(reject(controls, first)).rejects.toBe(first);
		await expect(reject(controls, second)).rejects.toBe(second);
	});
	expect(reported).toEqual([first]);
	expect(reported[0].cause).toBe(first.cause);
	expect(view.getByRole('alert').textContent).toBe('first failure');
});

test('owned cancellation leaves inherited readiness state and its provider untouched', async () => {
	const scope: DelayRenderScope = {
		remotion_renderReady: true,
		remotion_delayRenderHandles: [],
		remotion_delayRenderTimeouts: {},
		remotion_puppeteerTimeout: 30000,
		remotion_attempt: 1,
	};
	let controls!: Controls;
	const view = render(
		<Internals.DelayRenderContextType.Provider value={scope}>
			<Player
				{...config}
				component={Capture}
				inputProps={{
					ready: (value) => {
						controls = value;
					},
				}}
				errorFallback={fallback}
			/>
		</Internals.DelayRenderContextType.Provider>,
	);
	const handle = controls.delayRender('inherited scope');
	expect(scope.remotion_renderReady).toBe(false);
	expect(scope.remotion_delayRenderHandles).toEqual([handle]);
	const failure = new Error('owned inherited failure');
	await act(async () => {
		await expect(reject(controls, failure)).rejects.toBe(failure);
	});
	expect(view.getByRole('alert').textContent).toBe(failure.message);
	expect(scope.remotion_cancelledErrorObject).toBeUndefined();
	expect(scope.remotion_delayRenderHandles).toEqual([handle]);
	controls.continueRender(handle);
	expect(scope.remotion_renderReady).toBe(true);
});

test('hidden Activity ignores async notification while cancellation still rejects', async () => {
	let controls!: Controls;
	const player = (
		<Player
			{...config}
			component={Capture}
			inputProps={{
				ready: (value) => {
					controls = value;
				},
			}}
			errorFallback={fallback}
		/>
	);
	const view = render(<Activity mode="visible">{player}</Activity>);
	view.rerender(<Activity mode="hidden">{player}</Activity>);
	const hiddenFailure = new Error('hidden failure');
	await act(async () => {
		await expect(reject(controls, hiddenFailure)).rejects.toBe(hiddenFailure);
	});
	view.rerender(<Activity mode="visible">{player}</Activity>);
	expect(view.queryByRole('alert')).toBeNull();
	expect(view.getByText('composition')).toBeTruthy();
	const visibleFailure = new Error('visible failure');
	await act(async () => {
		await expect(reject(controls, visibleFailure)).rejects.toBe(visibleFailure);
	});
	expect(view.getByRole('alert').textContent).toBe(visibleFailure.message);
});
