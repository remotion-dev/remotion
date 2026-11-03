import {afterEach, expect, test} from 'bun:test';
import {Activity, useLayoutEffect} from 'react';
import {useDelayRender} from 'remotion';
import type {PlayerRef} from '../player-methods.js';
import {Player} from '../Player.js';
import {Thumbnail} from '../Thumbnail.js';
import {act, cleanup, render} from './test-utils.js';

type Controls = ReturnType<typeof useDelayRender>;
const Capture = ({ready}: {ready: (controls: Controls) => void}) => {
	const controls = useDelayRender();
	useLayoutEffect(() => ready(controls), [ready, controls.cancelRender]);
	return <div>composition</div>;
};
const Replacement = (props: {ready: (controls: Controls) => void}) => (
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
				component={Capture}
				inputProps={{
					ready: (value) => {
						failing = value;
					},
				}}
				errorFallback={fallback}
				ref={subscribe}
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
		await expect(reject(failing, failure)).resolves.toBeUndefined();
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
		).resolves.toBeUndefined();
	});
	expect(view.queryByRole('alert') === null).toBe(true);
	expect(view.getByText('composition')).toBeTruthy();
	const current = controls;
	await act(async () => {
		await expect(
			reject(current, new Error('replacement failed')),
		).resolves.toBeUndefined();
	});
	expect(view.getByRole('alert').textContent).toBe('replacement failed');
	view.unmount();
	await expect(
		reject(current, new Error('after unmount')),
	).resolves.toBeUndefined();
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
		).resolves.toBeUndefined();
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
