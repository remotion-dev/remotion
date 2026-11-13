import {afterEach, expect, test} from 'bun:test';
import {useLayoutEffect} from 'react';
import {Internals, useDelayRender, type DelayRenderScope} from 'remotion';
import {Player} from '../Player.js';
import {Thumbnail} from '../Thumbnail.js';
import {act, cleanup, render} from './test-utils.js';

type Contexts = ReturnType<typeof Internals.useRemotionContexts>;
type Controls = ReturnType<typeof useDelayRender>;

const CaptureContexts = ({
	ready,
}: {
	readonly ready: (contexts: Contexts) => void;
}) => {
	const contexts = Internals.useRemotionContexts();
	useLayoutEffect(() => ready(contexts), [contexts, ready]);

	return <span>owning composition</span>;
};

const CustomRendererChild = ({
	ready,
}: {
	readonly ready: (controls: Controls, handle: number) => void;
}) => {
	const controls = useDelayRender();
	const {delayRender, continueRender, cancelRender} = controls;
	useLayoutEffect(() => {
		const handle = delayRender('custom renderer work');
		ready({delayRender, continueRender, cancelRender}, handle);
		return () => continueRender(handle);
	}, [cancelRender, continueRender, delayRender, ready]);

	return <span>custom renderer child</span>;
};

const Healthy = () => <span>healthy sibling</span>;
const fallback = ({error}: {error: Error}) => (
	<div role="alert">{error.message}</div>
);
const config = {
	compositionWidth: 100,
	compositionHeight: 100,
	durationInFrames: 30,
	fps: 30,
};

afterEach(() => cleanup());

test.each(['Player', 'Thumbnail'] as const)(
	'%s forwards cancellation ownership and readiness to a separate renderer root',
	async (actor) => {
		const scope: DelayRenderScope = {
			remotion_renderReady: true,
			remotion_delayRenderHandles: [],
			remotion_delayRenderTimeouts: {},
			remotion_puppeteerTimeout: 30000,
			remotion_attempt: 1,
		};
		const previousError = window.remotion_cancelledError;
		const previousErrorObject = window.remotion_cancelledErrorObject;
		const previousReady = window.remotion_renderReady;
		let contexts!: Contexts;
		let controls!: Controls;
		let handle!: number;
		let bridge: ReturnType<typeof render> | null = null;
		const ready = (value: Contexts) => {
			contexts = value;
		};
		const owner =
			actor === 'Player' ? (
				<Player
					{...config}
					component={CaptureContexts}
					inputProps={{ready}}
					errorFallback={fallback}
				/>
			) : (
				<Thumbnail
					{...config}
					frameToDisplay={0}
					component={CaptureContexts}
					inputProps={{ready}}
					errorFallback={fallback}
				/>
			);
		const view = render(
			<Internals.DelayRenderContextType.Provider value={scope}>
				{owner}
				<Player {...config} component={Healthy} errorFallback={fallback} />
			</Internals.DelayRenderContextType.Provider>,
		);
		try {
			expect(contexts).toBeDefined();
			const sibling = view.getByText('healthy sibling');
			// Separate roots model a custom reconciler: ordinary React context cannot
			// cross this boundary without useRemotionContexts and its provider.
			bridge = render(
				<Internals.RemotionContextProvider contexts={contexts}>
					<CustomRendererChild
						ready={(value, allocated) => {
							controls = value;
							handle = allocated;
						}}
					/>
				</Internals.RemotionContextProvider>,
			);
			expect(controls).toBeDefined();
			const error = new Error(`failed ${actor} custom renderer`);
			let rejected: unknown = null;
			await act(async () => {
				try {
					await Promise.reject(error).catch(controls.cancelRender);
				} catch (caught) {
					rejected = caught;
				}
			});
			// The public v4 callback still throws; only its owner receives the failure.
			expect(rejected).toBe(error);
			expect(view.getByRole('alert').textContent).toBe(error.message);
			expect(view.getByText('healthy sibling')).toBe(sibling);
			expect(window.remotion_cancelledError).toBe(previousError);
			expect(window.remotion_cancelledErrorObject).toBe(previousErrorObject);
			expect(scope.remotion_cancelledError).toBeUndefined();
			expect(scope.remotion_cancelledErrorObject).toBeUndefined();
			expect(scope.remotion_delayRenderHandles).toEqual([handle]);
			expect(scope.remotion_renderReady).toBe(false);
			bridge.unmount();
			expect(scope.remotion_delayRenderHandles).toEqual([]);
			expect(scope.remotion_renderReady).toBe(true);
		} finally {
			bridge?.unmount();
			view.unmount();
			if (previousError === undefined) delete window.remotion_cancelledError;
			else window.remotion_cancelledError = previousError;
			if (previousErrorObject === undefined)
				delete window.remotion_cancelledErrorObject;
			else window.remotion_cancelledErrorObject = previousErrorObject;
			window.remotion_renderReady = previousReady;
		}
	},
);
