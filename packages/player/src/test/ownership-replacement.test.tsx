import {afterEach, expect, test} from 'bun:test';
import {useLayoutEffect, useState} from 'react';
import {useDelayRender} from 'remotion';
import {ErrorBoundary} from '../error-boundary.js';
import {Player} from '../Player.js';
import {Thumbnail} from '../Thumbnail.js';
import {act, cleanup, render} from './test-utils.js';

type Controls = ReturnType<typeof useDelayRender>;
const config = {
	compositionWidth: 100,
	compositionHeight: 100,
	durationInFrames: 30,
	fps: 30,
};
const fallback = ({error}: {error: Error}) => (
	<div role="alert">{error.message}</div>
);
afterEach(() => cleanup());

test('a queued failure cannot prevent a batched owner replacement', async () => {
	let controls!: Controls;
	let replace!: () => void;
	let mounts = 0;
	const errors: Error[] = [];
	const Content = () => {
		controls = useDelayRender();
		useLayoutEffect(() => {
			mounts++;
		}, []);
		return <span>retained content</span>;
	};
	const Parent = () => {
		const [owner, setOwner] = useState<object>({});
		replace = () => setOwner({});
		return (
			<ErrorBoundary
				isReplacingComponent={false}
				renderingOwner={owner}
				onError={(error) => errors.push(error)}
				errorFallback={fallback}
			>
				<Content />
			</ErrorBoundary>
		);
	};
	const view = render(<Parent />);
	const original = view.getByText('retained content');
	const old = controls;
	const stale = new Error('retired owner');
	await act(async () => {
		expect(() => old.cancelRender(stale)).toThrow(stale);
		await Promise.resolve();
		replace();
	});
	expect(view.queryByRole('alert')).toBeNull();
	expect(view.getByText('retained content')).toBe(original);
	expect(mounts).toBe(1);
	expect(errors).toEqual([]);
	expect(controls.cancelRender).not.toBe(old.cancelRender);
	const current = new Error('current owner');
	await act(async () => {
		expect(() => controls.cancelRender(current)).toThrow(current);
	});
	expect(view.getByRole('alert').textContent).toBe(current.message);
	expect(errors).toEqual([current]);
});

for (const actor of ['Player', 'Thumbnail'] as const) {
	for (const noSuspense of [false, true]) {
		test(`${actor} retires every old-component callback across replacement (noSuspense=${noSuspense})`, async () => {
			const retired: Controls[] = [];
			let current!: Controls;
			const A = () => {
				const controls = useDelayRender();
				useLayoutEffect(() => {
					retired.push(controls);
				}, [controls.cancelRender]);
				return <span>old composition</span>;
			};
			const B = () => {
				current = useDelayRender();
				return <span>healthy replacement</span>;
			};
			const element = (component: typeof A) =>
				actor === 'Player' ? (
					<Player
						{...config}
						component={component}
						noSuspense={noSuspense}
						errorFallback={fallback}
					/>
				) : (
					<Thumbnail
						{...config}
						component={component}
						frameToDisplay={0}
						noSuspense={noSuspense}
						errorFallback={fallback}
					/>
				);
			const view = render(element(A));
			view.rerender(element(B));
			const replacement = view.getByText('healthy replacement');
			expect(retired.length).toBeGreaterThan(0);
			await act(async () => {
				for (const controls of retired) {
					const error = new Error('retired composition work');
					expect(() => controls.cancelRender(error)).toThrow(error);
				}
			});
			expect(view.queryByRole('alert')).toBeNull();
			expect(view.getByText('healthy replacement')).toBe(replacement);
			const error = new Error('active replacement failure');
			await act(async () => {
				expect(() => current.cancelRender(error)).toThrow(error);
			});
			expect(view.getByRole('alert').textContent).toBe(error.message);
		});
	}
}

for (const actor of ['Player', 'Thumbnail'] as const) {
	test(`${actor} commits a replacement when the old error notification is already queued`, async () => {
		let old!: Controls;
		let replace!: () => void;
		const A = () => {
			old = useDelayRender();
			return <span>retiring composition</span>;
		};
		const B = () => <span>batched replacement</span>;
		const Parent = () => {
			const [replacement, setReplacement] = useState(false);
			replace = () => setReplacement(true);
			const component = replacement ? B : A;
			return actor === 'Player' ? (
				<Player {...config} component={component} errorFallback={fallback} />
			) : (
				<Thumbnail
					{...config}
					component={component}
					frameToDisplay={0}
					errorFallback={fallback}
				/>
			);
		};
		const view = render(<Parent />);
		await act(async () => {
			const error = new Error('queued retired failure');
			expect(() => old.cancelRender(error)).toThrow(error);
			await Promise.resolve();
			replace();
		});
		expect(view.queryByRole('alert')).toBeNull();
		expect(view.getByText('batched replacement')).toBeTruthy();
	});
}
