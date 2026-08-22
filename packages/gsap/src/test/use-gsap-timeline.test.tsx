import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	mock,
	spyOn,
} from 'bun:test';
import {gsap} from 'gsap';
import React, {Component, StrictMode, act, type ReactNode} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {useGsapTimeline} from '../use-gsap-timeline';

const remotionClock = {frame: 0, fps: 30};

// Bun patches already-imported ESM modules through live bindings, so this
// takes effect even though the hook was imported statically above.
mock.module('remotion', () => ({
	useCurrentFrame: () => remotionClock.frame,
	useVideoConfig: () => ({fps: remotionClock.fps}),
}));

(
	globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean}
).IS_REACT_ACT_ENVIRONMENT = true;

const opacity = (element: Element) =>
	Number.parseFloat((element as HTMLElement).style.opacity);

class ErrorBoundary extends Component<
	{children: ReactNode},
	{failed: boolean}
> {
	state = {failed: false};

	static getDerivedStateFromError() {
		return {failed: true};
	}

	render() {
		return this.state.failed ? (
			<div data-error-boundary />
		) : (
			this.props.children
		);
	}
}

const Harness = ({distance}: {readonly distance: number}) => {
	const scope = useGsapTimeline<HTMLDivElement>(
		({timeline, selector}) => {
			timeline.fromTo(
				selector('[data-box]'),
				{opacity: 0},
				{opacity: distance, duration: 1, ease: 'none'},
			);
		},
		{dependencies: [distance]},
	);

	return (
		<div ref={scope}>
			<div data-box style={{opacity: 0.25}} />
		</div>
	);
};

describe('useGsapTimeline', () => {
	let container: HTMLDivElement;
	let root: Root;

	const render = async (node: ReactNode) => {
		await act(async () => root.render(node));
	};

	const setFrame = async (frame: number, node: ReactNode) => {
		remotionClock.frame = frame;
		await render(node);
	};

	beforeEach(() => {
		remotionClock.frame = 0;
		remotionClock.fps = 30;
		container = document.createElement('div');
		document.body.append(container);
		root = createRoot(container);
	});

	afterEach(async () => {
		await act(async () => root.unmount());
		container.remove();
	});

	it('seeks directly from Remotion frame to GSAP time', async () => {
		await setFrame(15, <Harness distance={1} />);
		expect(opacity(container.querySelector('[data-box]')!)).toBeCloseTo(0.5, 4);
	});

	it('is deterministic while seeking backward and revisiting frames', async () => {
		await setFrame(30, <Harness distance={1} />);
		expect(opacity(container.querySelector('[data-box]')!)).toBeCloseTo(1, 4);

		await setFrame(9, <Harness distance={1} />);
		const firstVisit = opacity(container.querySelector('[data-box]')!);
		expect(firstVisit).toBeCloseTo(0.3, 4);

		await setFrame(24, <Harness distance={1} />);
		await setFrame(9, <Harness distance={1} />);
		expect(opacity(container.querySelector('[data-box]')!)).toBeCloseTo(
			firstVisit,
			6,
		);
	});

	it('rejects callbacks instead of allowing render-time side effects', async () => {
		const onUpdate = mock(() => undefined);
		const CallbackHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
				timeline.to(selector('[data-callback]'), {opacity: 1, onUpdate});
			});

			return (
				<div ref={scope}>
					<div data-callback />
				</div>
			);
		};

		await expect(setFrame(30, <CallbackHarness />)).rejects.toThrow(
			'does not allow timeline callbacks (onUpdate)',
		);
		expect(onUpdate).not.toHaveBeenCalled();
	});

	it('rebuilds from explicit dependencies and seeks the replacement timeline', async () => {
		await setFrame(15, <Harness distance={1} />);
		expect(opacity(container.querySelector('[data-box]')!)).toBeCloseTo(0.5, 4);

		await setFrame(15, <Harness distance={0.6} />);
		expect(opacity(container.querySelector('[data-box]')!)).toBeCloseTo(0.3, 4);
	});

	it('scopes matching selectors to each hook instance', async () => {
		await setFrame(
			15,
			<>
				<Harness distance={1} />
				<Harness distance={0.4} />
			</>,
		);

		const boxes = container.querySelectorAll('[data-box]');
		expect(opacity(boxes[0]!)).toBeCloseTo(0.5, 4);
		expect(opacity(boxes[1]!)).toBeCloseTo(0.2, 4);
	});

	it('survives Strict Mode setup-cleanup-setup without duplicate playback', async () => {
		await setFrame(
			18,
			<StrictMode>
				<Harness distance={1} />
			</StrictMode>,
		);

		expect(opacity(container.querySelector('[data-box]')!)).toBeCloseTo(0.6, 4);
	});

	it('clamps premount frames to the start state', async () => {
		await setFrame(-20, <Harness distance={1} />);
		expect(opacity(container.querySelector('[data-box]')!)).toBeCloseTo(0, 4);
	});

	it('uses the latest fps without rebuilding the timeline', async () => {
		await setFrame(15, <Harness distance={1} />);
		expect(opacity(container.querySelector('[data-box]')!)).toBeCloseTo(0.5, 4);

		remotionClock.fps = 60;
		await setFrame(15, <Harness distance={1} />);
		expect(opacity(container.querySelector('[data-box]')!)).toBeCloseTo(
			0.25,
			4,
		);
	});

	it('holds the final state after the timeline duration', async () => {
		await setFrame(300, <Harness distance={0.8} />);
		expect(opacity(container.querySelector('[data-box]')!)).toBeCloseTo(0.8, 4);
	});

	it('applies zero-duration set operations at frame zero', async () => {
		const SetHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
				timeline.set(selector('[data-set]'), {opacity: 1});
			});

			return (
				<div ref={scope}>
					<div data-set style={{opacity: 0.25}} />
				</div>
			);
		};

		await setFrame(0, <SetHarness />);
		expect(opacity(container.querySelector('[data-set]')!)).toBe(1);
	});

	it('rejects builders that start wall-clock playback', async () => {
		const UnsafeHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline}) =>
				timeline.play(),
			);
			return <div ref={scope} />;
		};

		await expect(setFrame(0, <UnsafeHarness />)).rejects.toThrow(
			'builders must not start playback',
		);
	});

	it('rejects playback before play-then-pause can evade the final state check', async () => {
		const UnsafeHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline}) => {
				timeline.play().pause();
			});
			return <div ref={scope} />;
		};

		await expect(setFrame(0, <UnsafeHarness />)).rejects.toThrow(
			'builders must not start playback',
		);

		const UnpausedHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline}) => {
				timeline.paused(false);
			});
			return <div ref={scope} />;
		};

		await expect(setFrame(0, <UnpausedHarness />)).rejects.toThrow(
			'builders must not start playback',
		);
	});

	it.each([
		['seek', (clock: gsap.core.Timeline) => clock.seek(1)],
		['totalTime', (clock: gsap.core.Timeline) => clock.totalTime(1)],
		['progress', (clock: gsap.core.Timeline) => clock.progress(0.5)],
		['tweenTo', (clock: gsap.core.Timeline) => clock.tweenTo(1)],
		['pause', (clock: gsap.core.Timeline) => clock.pause()],
		['kill', (clock: gsap.core.Timeline) => clock.kill()],
	] as const)(
		'rejects manual %s even when the timeline is aliased',
		async (_method, invoke) => {
			const UnsafeHarness = () => {
				const scope = useGsapTimeline<HTMLDivElement>(({timeline: clock}) => {
					invoke(clock);
				});
				return <div ref={scope} />;
			};

			await expect(setFrame(0, <UnsafeHarness />)).rejects.toThrow(
				/useGsapTimeline owns timeline/,
			);
		},
	);

	it('rejects timeline-shaping setters with an accurate message', async () => {
		// timeScale(value) and duration(value) dispatch through totalTime()
		// internally; without dedicated guards they threw a misleading
		// "seeking" error. They also cannot be honored, because the hook
		// seeks in unscaled local time.
		const DurationHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
				timeline.fromTo(
					selector('[data-shaped]'),
					{opacity: 0},
					{opacity: 1, duration: 2, ease: 'none'},
				);
				timeline.duration(1);
			});

			return (
				<div ref={scope}>
					<div data-shaped />
				</div>
			);
		};

		await expect(setFrame(15, <DurationHarness />)).rejects.toThrow(
			'does not support timeline.duration(value)',
		);

		const TimeScaleHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline}) => {
				timeline.timeScale(2);
			});

			return <div ref={scope} />;
		};

		await expect(setFrame(0, <TimeScaleHarness />)).rejects.toThrow(
			'does not support timeline.timeScale(value)',
		);
	});

	it('allows concise builders that return a stray gsap.set tween', async () => {
		// GSAP animations are thenable; the async-builder guard must not
		// mistake them for Promises.
		const ConciseSetHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({selector}) =>
				gsap.set(selector('[data-concise]'), {opacity: 0.75}),
			);

			return (
				<div ref={scope}>
					<div data-concise />
				</div>
			);
		};

		await setFrame(0, <ConciseSetHarness />);
		expect(opacity(container.querySelector('[data-concise]')!)).toBe(0.75);
	});

	it('primes nested-timeline sets at their root-time position', async () => {
		// startTime() is parent-relative; a fresh mount landing exactly on a
		// set nested inside an offset child timeline must still render it.
		const NestedSetHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
				timeline.to(selector('[data-nested-set]'), {
					opacity: 0.5,
					duration: 3,
					ease: 'none',
				});
				const nested = gsap.timeline();
				nested.set(
					selector('[data-nested-set]'),
					{backgroundColor: 'rgb(9, 8, 7)'},
					0.5,
				);
				timeline.add(nested, 1.5);
			});

			return (
				<div ref={scope}>
					<div data-nested-set style={{opacity: 1}} />
				</div>
			);
		};

		// Frame 60 at 30fps = 2s = exactly the nested set's root time (1.5 + 0.5).
		await setFrame(60, <NestedSetHarness />);
		const element = container.querySelector('[data-nested-set]') as HTMLElement;
		expect(element.style.backgroundColor).toBe('rgb(9, 8, 7)');
	});

	it('rejects asynchronous builders', async () => {
		const AsyncHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(async () => undefined);
			return <div ref={scope} />;
		};

		await expect(setFrame(0, <AsyncHarness />)).rejects.toThrow(
			'builders must be synchronous',
		);
	});

	it('rejects callback methods before they can execute', async () => {
		const callback = mock(() => undefined);
		const CallHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline}) =>
				timeline.call(callback),
			);
			return <div ref={scope} />;
		};

		await expect(setFrame(0, <CallHarness />)).rejects.toThrow(
			'does not allow timeline.call()',
		);
		expect(callback).not.toHaveBeenCalled();
	});

	it('rejects eventCallback and then callbacks at registration time', async () => {
		const callback = mock(() => undefined);
		const EventCallbackHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline}) => {
				timeline.eventCallback('onComplete', callback);
			});
			return <div ref={scope} />;
		};

		await expect(setFrame(0, <EventCallbackHarness />)).rejects.toThrow(
			'does not allow timeline.eventCallback()',
		);
		expect(callback).not.toHaveBeenCalled();

		const ThenHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline}) => {
				timeline.then(callback);
			});
			return <div ref={scope} />;
		};

		await expect(setFrame(0, <ThenHarness />)).rejects.toThrow(
			'does not allow timeline.then()',
		);
		expect(callback).not.toHaveBeenCalled();
	});

	it('allows concise builders that return the chained timeline', async () => {
		const ChainedHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) =>
				timeline.fromTo(
					selector('[data-chain]'),
					{opacity: 0},
					{opacity: 1, duration: 1, ease: 'none'},
				),
			);

			return (
				<div ref={scope}>
					<div data-chain />
				</div>
			);
		};

		await setFrame(15, <ChainedHarness />);
		expect(opacity(container.querySelector('[data-chain]')!)).toBeCloseTo(
			0.5,
			4,
		);
	});

	it('reverts the previous context before rebuilding from dependencies', async () => {
		const RebuildHarness = ({transform}: {readonly transform: boolean}) => {
			const scope = useGsapTimeline<HTMLDivElement>(
				({timeline, selector}) => {
					if (transform) {
						timeline.set(selector('[data-rebuild]'), {'--offset': '100px'});
					} else {
						timeline.set(selector('[data-rebuild]'), {opacity: 0.5});
					}
				},
				{dependencies: [transform]},
			);

			return (
				<div ref={scope}>
					<div data-rebuild style={{opacity: 0.25}} />
				</div>
			);
		};

		await setFrame(0, <RebuildHarness transform />);
		expect(
			(
				container.querySelector('[data-rebuild]') as HTMLElement
			).style.getPropertyValue('--offset'),
		).toBe('100px');

		await setFrame(0, <RebuildHarness transform={false} />);
		const rebuilt = container.querySelector('[data-rebuild]') as HTMLElement;
		expect(rebuilt.style.getPropertyValue('--offset')).toBe('');
		expect(opacity(rebuilt)).toBe(0.5);
	});

	it('reverts GSAP mutations when a builder throws', async () => {
		let retainedElement: HTMLDivElement | null = null;
		const consoleError = spyOn(console, 'error').mockImplementation(
			() => undefined,
		);

		const ThrowingHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({selector}) => {
				gsap.set(selector('[data-throw]'), {opacity: 0});
				throw new Error('intentional builder failure');
			});

			return (
				<div ref={scope}>
					<div
						ref={(element) => {
							if (element) {
								retainedElement = element;
							}
						}}
						data-throw
						style={{opacity: 0.25}}
					/>
				</div>
			);
		};

		await setFrame(
			0,
			<ErrorBoundary>
				<ThrowingHarness />
			</ErrorBoundary>,
		);

		expect(retainedElement).not.toBeNull();
		expect((retainedElement as HTMLDivElement | null)?.style.opacity).toBe(
			'0.25',
		);
		expect(container.querySelector('[data-error-boundary]')).not.toBeNull();
		consoleError.mockRestore();
	});

	it('rejects plain-object tween targets that would freeze in stills', async () => {
		const PojoHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline}) => {
				const state = {dist: 0, glow: 0.2};
				timeline.to(state, {dist: 100, duration: 1, ease: 'none'});
			});

			return <div ref={scope} />;
		};

		await expect(setFrame(0, <PojoHarness />)).rejects.toThrow(
			'must target DOM or SVG elements',
		);
		await expect(setFrame(0, <PojoHarness />)).rejects.toThrow(
			'plain object {dist, glow}',
		);
	});

	it('rejects plain-object targets hidden inside nested timelines', async () => {
		const NestedPojoHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
				timeline.to(selector('[data-real]'), {opacity: 1, duration: 0.5});
				const nested = gsap.timeline();
				nested.to({progress: 0}, {progress: 1, duration: 1});
				timeline.add(nested, 0.25);
			});

			return (
				<div ref={scope}>
					<div data-real />
				</div>
			);
		};

		await expect(setFrame(0, <NestedPojoHarness />)).rejects.toThrow(
			'must target DOM or SVG elements',
		);
	});

	it('renders a zero-duration set at time 0 on a fresh mount at frame 0', async () => {
		const SetHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
				timeline.set(selector('[data-set]'), {backgroundColor: 'rgb(1, 2, 3)'});
				timeline.fromTo(
					selector('[data-set]'),
					{opacity: 0},
					{opacity: 1, duration: 1, ease: 'none'},
				);
			});

			return (
				<div ref={scope}>
					<div data-set />
				</div>
			);
		};

		await setFrame(0, <SetHarness />);
		const element = container.querySelector('[data-set]') as HTMLElement;
		expect(element.style.backgroundColor).toBe('rgb(1, 2, 3)');
		expect(opacity(element)).toBe(0);
	});

	it('renders a mid-timeline set when a fresh mount lands exactly on it', async () => {
		const MidSetHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
				timeline.to(selector('[data-mid]'), {
					opacity: 0.5,
					duration: 1,
					ease: 'none',
				});
				timeline.set(
					selector('[data-mid]'),
					{backgroundColor: 'rgb(4, 5, 6)'},
					1,
				);
			});

			return (
				<div ref={scope}>
					<div data-mid style={{opacity: 1}} />
				</div>
			);
		};

		await setFrame(30, <MidSetHarness />);
		const element = container.querySelector('[data-mid]') as HTMLElement;
		expect(element.style.backgroundColor).toBe('rgb(4, 5, 6)');
	});

	it('primes safely when the timeline contains infinite repeats', async () => {
		const InfiniteHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
				timeline.set(selector('[data-inf]'), {
					backgroundColor: 'rgb(7, 8, 9)',
				});
				timeline.to(
					selector('[data-inf]'),
					{rotation: 360, duration: 2, ease: 'none', repeat: -1},
					0,
				);
			});

			return (
				<div ref={scope}>
					<div data-inf />
				</div>
			);
		};

		await setFrame(15, <InfiniteHarness />);
		const element = container.querySelector('[data-inf]') as HTMLElement;
		expect(element.style.backgroundColor).toBe('rgb(7, 8, 9)');
		expect(element.style.transform).toContain('rotate(90deg)');
	});

	it('rejects freestanding gsap.to animations that never join the timeline', async () => {
		const StrayHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({selector, timeline}) => {
				timeline.to(selector('[data-stray]'), {opacity: 1, duration: 0.5});
				gsap.to(selector('[data-stray]'), {x: 500, duration: 1});
			});

			return (
				<div ref={scope}>
					<div data-stray />
				</div>
			);
		};

		await expect(setFrame(0, <StrayHarness />)).rejects.toThrow(
			'not attached to the provided timeline',
		);
	});

	it('rejects gsap.delayedCall scheduled from a builder', async () => {
		const spy = mock(() => undefined);
		const DelayedHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
				timeline.to(selector('[data-delayed]'), {opacity: 1, duration: 0.5});
				gsap.delayedCall(0.05, spy);
			});

			return (
				<div ref={scope}>
					<div data-delayed />
				</div>
			);
		};

		await expect(setFrame(0, <DelayedHarness />)).rejects.toThrow(
			'wall-clock animation with callbacks',
		);
		expect(spy).not.toHaveBeenCalled();
	});

	it('rejects gsap.ticker callbacks registered from a builder', async () => {
		const TickerHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
				timeline.to(selector('[data-tick]'), {opacity: 1, duration: 0.5});
				gsap.ticker.add(() => undefined);
			});

			return (
				<div ref={scope}>
					<div data-tick />
				</div>
			);
		};

		await expect(setFrame(0, <TickerHarness />)).rejects.toThrow(
			'must not register gsap.ticker callbacks',
		);
	});

	it('allows raw zero-duration gsap.set for static state', async () => {
		const StaticHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
				gsap.set(selector('[data-static]'), {
					backgroundColor: 'rgb(9, 9, 9)',
				});
				timeline.fromTo(
					selector('[data-static]'),
					{opacity: 0},
					{opacity: 1, duration: 1, ease: 'none'},
				);
			});

			return (
				<div ref={scope}>
					<div data-static />
				</div>
			);
		};

		await setFrame(15, <StaticHarness />);
		const element = container.querySelector('[data-static]') as HTMLElement;
		expect(element.style.backgroundColor).toBe('rgb(9, 9, 9)');
		expect(opacity(element)).toBeCloseTo(0.5, 4);
	});

	it('rejects unseeded random() string values', async () => {
		const RandomHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
				timeline.to(selector('[data-random]'), {
					x: 'random(0, 1000)',
					duration: 1,
				});
			});

			return (
				<div ref={scope}>
					<div data-random />
				</div>
			);
		};

		await expect(setFrame(0, <RandomHarness />)).rejects.toThrow(
			'nondeterministic tween configuration',
		);
	});

	it('rejects random-order staggers and repeatRefresh', async () => {
		const StaggerHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
				timeline.to(selector('[data-item]'), {
					opacity: 1,
					duration: 0.5,
					stagger: {each: 0.1, from: 'random'},
				});
			});

			return (
				<div ref={scope}>
					<div data-item />
					<div data-item />
				</div>
			);
		};

		const RefreshHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
				timeline.to(selector('[data-refresh]'), {
					x: 100,
					duration: 0.5,
					repeat: 2,
					repeatRefresh: true,
				});
			});

			return (
				<div ref={scope}>
					<div data-refresh />
				</div>
			);
		};

		await expect(setFrame(0, <StaggerHarness />)).rejects.toThrow(
			"stagger: {from: 'random'}",
		);
		await expect(setFrame(0, <RefreshHarness />)).rejects.toThrow(
			'repeatRefresh: true',
		);
	});

	it('renders overlapping same-property tweens identically for any frame-visit path', async () => {
		const OverlapHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
				timeline.to(
					selector('[data-overlap]'),
					{x: 200, duration: 1, ease: 'none'},
					0,
				);
				timeline.to(
					selector('[data-overlap]'),
					{x: 0, duration: 1, ease: 'none'},
					0.5,
				);
			});

			return (
				<div ref={scope}>
					<div data-overlap />
				</div>
			);
		};

		const readX = () =>
			(container.querySelector('[data-overlap]') as HTMLElement).style
				.transform;

		await setFrame(23, <OverlapHarness />);
		const direct = readX();

		await act(async () => root.unmount());
		root = createRoot(container);
		remotionClock.frame = 0;
		await render(<OverlapHarness />);
		for (let frame = 1; frame <= 23; frame += 1) {
			await setFrame(frame, <OverlapHarness />);
		}

		const sequential = readX();

		expect(direct).toBe(sequential);
	});

	it('keeps guard walks out of GSAP internals and the host React tree', async () => {
		// Staggers inject vars.parent, whose graph reaches tween targets and,
		// through React fiber properties on DOM nodes, the entire host app tree.
		// The surrounding component state deliberately contains prose that the
		// nondeterminism matcher must never see, mirroring the studio preview
		// where chat state holds skill documents mentioning random().
		const StaggerHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
				timeline.fromTo(
					selector('[data-w]'),
					{opacity: 0, y: 44},
					{opacity: 1, y: 0, duration: 0.38, ease: 'power3.out', stagger: 0.06},
					0.05,
				);
			});
			return (
				<div ref={scope}>
					<span data-w>a</span>
					<span data-w>b</span>
					<span data-w>c</span>
				</div>
			);
		};

		const HostApp = () => {
			const [doc] = React.useState(
				'## Skill: remotion-core — never use unseeded randomness; use seeded random() instead.',
			);
			return (
				<div data-doc={doc.length}>
					<StaggerHarness />
				</div>
			);
		};

		await setFrame(30, <HostApp />);
		const words = [...container.querySelectorAll('[data-w]')];
		expect(words).toHaveLength(3);
		expect(opacity(words[0] as HTMLElement)).toBe(1);
	});

	it('does not flag prose that merely mentions random()', async () => {
		const ProseHarness = () => {
			const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
				timeline.set(selector('[data-prose]'), {
					'--note': 'we use seeded random() here',
				});
				timeline.to(selector('[data-prose]'), {opacity: 0.5, duration: 1});
			});
			return (
				<div ref={scope}>
					<div data-prose />
				</div>
			);
		};

		await setFrame(15, <ProseHarness />);
		expect(
			(
				container.querySelector('[data-prose]') as HTMLElement
			).style.getPropertyValue('--note'),
		).toBe('we use seeded random() here');
	});

	it('allows SVG element targets through the plain-object guard', async () => {
		const SvgHarness = () => {
			const scope = useGsapTimeline<SVGSVGElement>(({timeline, selector}) => {
				timeline.fromTo(
					selector('[data-dot]'),
					{attr: {r: 0}},
					{attr: {r: 10}, duration: 1, ease: 'none'},
				);
			});

			return (
				<svg ref={scope}>
					<circle data-dot r={0} />
				</svg>
			);
		};

		await setFrame(15, <SvgHarness />);
		expect(container.querySelector('[data-dot]')!.getAttribute('r')).toBe('5');
	});
});
