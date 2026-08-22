/// <reference types="gsap" />
import {gsap} from 'gsap';
import {type DependencyList, useLayoutEffect, useRef} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {frameToSeconds} from './frame-time';

export type GsapTimelineBuildContext<T extends Element> = {
	/** A package-owned timeline that is already paused at time zero. */
	timeline: gsap.core.Timeline;
	/** The mounted element attached to the returned ref. */
	scope: T;
	/** A GSAP selector restricted to descendants of the scope element. */
	selector: gsap.utils.SelectorFunc;
};

export type GsapTimelineBuilder<T extends Element> = (
	context: GsapTimelineBuildContext<T>,
) => unknown;

export type UseGsapTimelineOptions = {
	/** Rebuild the timeline when one of these values changes. */
	dependencies?: DependencyList;
};

/** A React 18/19-compatible object ref for the scoped HTML or SVG root. */
export type GsapScopeRef<T extends Element> = {
	current: T | null;
};

const EMPTY_DEPENDENCIES: DependencyList = [];
const CALLBACK_KEYS = [
	'onStart',
	'onUpdate',
	'onComplete',
	'onRepeat',
	'onReverseComplete',
	'onInterrupt',
] as const;

const getTimelineAnimations = (
	timeline: gsap.core.Timeline,
): gsap.core.Animation[] => [
	timeline,
	...timeline.getChildren(true, true, true),
];

const animationVars = (
	animation: gsap.core.Animation,
): Record<string, unknown> =>
	(animation as gsap.core.Animation & {vars: Record<string, unknown>}).vars;

// Vars walks must stay inside author-written configuration. GSAP injects
// internals into vars (staggers add a `parent` timeline reference), and from
// there the object graph reaches tween targets — DOM nodes whose React fiber
// properties climb into the entire host application's tree. Recursing only
// into plain objects and arrays keeps the walk on user data: DOM nodes,
// Animation instances, and fibers all carry custom prototypes.
const isWalkable = (value: unknown): value is object => {
	if (typeof value !== 'object' || value === null) return false;
	if (Array.isArray(value)) return true;
	const proto = Object.getPrototypeOf(value) as object | null;
	return proto === Object.prototype || proto === null;
};

const findCallbacksInValue = (
	value: unknown,
	seen = new Set<object>(),
): string[] => {
	if (!isWalkable(value) || seen.has(value)) {
		return [];
	}

	seen.add(value);
	const entries = Array.isArray(value)
		? value.map((entry, index) => [String(index), entry] as const)
		: Object.entries(value);
	const found: string[] = [];

	for (const [key, nestedValue] of entries) {
		if (
			CALLBACK_KEYS.includes(key as (typeof CALLBACK_KEYS)[number]) &&
			typeof nestedValue === 'function'
		) {
			found.push(key);
		}

		found.push(...findCallbacksInValue(nestedValue, seen));
	}

	return [...new Set(found)];
};

const findTimelineCallbacks = (timeline: gsap.core.Timeline): string[] => {
	const animations = getTimelineAnimations(timeline);
	return [
		...new Set(
			animations.flatMap((animation) =>
				findCallbacksInValue(animationVars(animation)),
			),
		),
	];
};

// nodeType instead of instanceof keeps the check correct across realms
// (renderer processes, jsdom, iframes) where Element identity differs.
const isElementTarget = (target: unknown): boolean =>
	typeof target === 'object' &&
	target !== null &&
	(target as {nodeType?: unknown}).nodeType === 1;

const describeTarget = (target: unknown): string => {
	if (target === null) {
		return 'null';
	}

	if (typeof target !== 'object') {
		return typeof target;
	}

	// GSAP stamps internal bookkeeping onto tween targets; hide it so the
	// error names the author's own properties.
	const keys = Object.keys(target as object).filter((key) => key !== '_gsap');
	const preview = keys.slice(0, 3).join(', ');
	return `plain object {${preview}${keys.length > 3 ? ', …' : ''}}`;
};

const findNonElementTargets = (timeline: gsap.core.Timeline): string[] => {
	const found: string[] = [];
	for (const animation of getTimelineAnimations(timeline)) {
		const targets = (animation as {targets?: () => unknown[]}).targets?.();
		if (!targets) {
			continue;
		}

		for (const target of targets) {
			if (!isElementTarget(target)) {
				found.push(describeTarget(target));
			}
		}
	}

	return [...new Set(found)];
};

// GSAP resolves "random(...)" strings with unseeded Math.random at tween
// initialization, so every mount — and every Lambda render chunk — rolls
// different values. Same for random-order staggers. repeatRefresh re-rolls
// on every repeat cycle, which also re-records lazily on frame revisits.
// Matches GSAP's random value tokens — "random(-100, 100)", "+=random(1,5)",
// "random([a, b, c])" — and not the word "random()" inside prose a
// composition might legitimately carry.
const GSAP_RANDOM_TOKEN = /random\(\s*(-?[\d.]|\[)/;

const findNondeterministicVars = (
	value: unknown,
	seen = new Set<object>(),
): string[] => {
	if (typeof value === 'string') {
		return GSAP_RANDOM_TOKEN.test(value) ? [`"${value.slice(0, 120)}"`] : [];
	}

	if (!isWalkable(value) || seen.has(value)) {
		return [];
	}

	seen.add(value);
	const found: string[] = [];
	const record = value as Record<string, unknown>;
	if (!Array.isArray(value)) {
		if (record.repeatRefresh === true) {
			found.push('repeatRefresh: true');
		}

		const {stagger} = record;
		if (
			typeof stagger === 'object' &&
			stagger !== null &&
			(stagger as {from?: unknown}).from === 'random'
		) {
			found.push("stagger: {from: 'random'}");
		}
	}

	for (const nested of Array.isArray(value) ? value : Object.values(record)) {
		found.push(...findNondeterministicVars(nested, seen));
	}

	return [...new Set(found)];
};

const findTimelineNondeterminism = (timeline: gsap.core.Timeline): string[] => {
	const animations = getTimelineAnimations(timeline);
	return [
		...new Set(
			animations.flatMap((animation) =>
				findNondeterministicVars(animationVars(animation)),
			),
		),
	];
};

// Animations created inside the builder but never parented under the package
// timeline live on gsap.globalTimeline and advance on the wall clock — a
// second, nondeterministic frame source the timeline walk cannot see. Static
// zero-duration, callback-free, delay-free tweens (the gsap.set pattern) are
// deterministic at build time and stay allowed.
const findStrayAnimations = (
	timeline: gsap.core.Timeline,
	preexisting: Set<gsap.core.Animation>,
): string[] => {
	const owned = new Set(getTimelineAnimations(timeline));
	const problems: string[] = [];
	for (const animation of gsap.globalTimeline.getChildren(true, true, true)) {
		if (owned.has(animation) || preexisting.has(animation)) {
			continue;
		}

		const vars = animationVars(animation);
		const callbacks = findCallbacksInValue(vars);
		const delay = typeof vars.delay === 'number' ? vars.delay : 0;
		if (callbacks.length > 0) {
			problems.push(
				`a wall-clock animation with callbacks (${callbacks.join(', ')})`,
			);
		} else if (animation.totalDuration() > 0 || delay > 0) {
			problems.push(
				'a wall-clock animation that is not attached to the provided timeline',
			);
		}
	}

	return problems;
};

const assertNoCallbacks = (value: unknown) => {
	const callbacks = findCallbacksInValue(value);
	if (callbacks.length > 0) {
		throw new Error(
			`useGsapTimeline does not allow timeline callbacks (${callbacks.join(', ')}). Derive visual state from the timeline instead of side effects.`,
		);
	}
};

type TimelineControls = {
	isPaused: () => boolean;
	pause: () => void;
	renderAt: (seconds: number) => void;
	restoreForContextRevert: () => void;
	kill: () => void;
};

const guardTimelineMethods = (
	timeline: gsap.core.Timeline,
): TimelineControls => {
	// Bind the package-owned controls before replacing the public methods the
	// builder receives. Internal frame seeking and cleanup must remain possible
	// without giving user code a second clock.
	const originalPaused = timeline.paused.bind(timeline);
	const originalTotalTime = timeline.totalTime.bind(timeline);
	const originalKill = timeline.kill.bind(timeline);

	const playbackError = () => {
		throw new Error(
			'useGsapTimeline builders must not start playback. Remove play(), resume(), restart(), reverse(), or paused(false).',
		);
	};

	timeline.play = playbackError as typeof timeline.play;
	timeline.resume = playbackError as typeof timeline.resume;
	timeline.restart = playbackError as typeof timeline.restart;
	timeline.reverse = playbackError as typeof timeline.reverse;
	timeline.pause = (() => {
		throw new Error(
			'useGsapTimeline owns timeline pause state. Do not call timeline.pause() inside the builder.',
		);
	}) as typeof timeline.pause;

	timeline.paused = ((value?: boolean) => {
		if (value === false) {
			return playbackError();
		}

		if (value !== undefined) {
			throw new Error(
				'useGsapTimeline owns timeline pause state. Read timeline.paused() if needed, but do not set it.',
			);
		}

		return originalPaused();
	}) as typeof timeline.paused;

	const seekingError = () => {
		throw new Error(
			'useGsapTimeline owns timeline seeking. Remove seek(), time(), totalTime(), progress(), totalProgress(), tweenTo(), or tweenFromTo() from the builder.',
		);
	};

	// timeScale(value), duration(value) and totalDuration(value) dispatch
	// through the public totalTime() internally, so without explicit guards
	// they would trip the seeking error with a misleading message. They also
	// cannot be honored: the hook seeks in unscaled local time, so a changed
	// time scale would silently desynchronize the video from GSAP's own
	// playback. Reject the setters with an accurate message; the zero-argument
	// getters stay available (the hook itself reads duration()).
	for (const method of ['timeScale', 'duration', 'totalDuration'] as const) {
		const original = (timeline[method] as (...args: unknown[]) => unknown).bind(
			timeline,
		);
		(timeline as unknown as Record<string, unknown>)[method] = (
			...args: unknown[]
		) => {
			if (args.length > 0) {
				throw new Error(
					`useGsapTimeline does not support timeline.${method}(value). The Remotion frame drives the timeline at a fixed 1:1 time scale; author tween durations directly.`,
				);
			}

			return original();
		};
	}

	timeline.seek = seekingError as typeof timeline.seek;
	timeline.time = seekingError as typeof timeline.time;
	timeline.totalTime = seekingError as typeof timeline.totalTime;
	timeline.progress = seekingError as typeof timeline.progress;
	timeline.totalProgress = seekingError as typeof timeline.totalProgress;
	timeline.tweenTo = seekingError as typeof timeline.tweenTo;
	timeline.tweenFromTo = seekingError as typeof timeline.tweenFromTo;
	timeline.kill = (() => {
		throw new Error(
			'useGsapTimeline owns timeline cleanup. Do not call timeline.kill() inside the builder.',
		);
	}) as typeof timeline.kill;

	const originalEventCallback = timeline.eventCallback.bind(timeline) as (
		...args: unknown[]
	) => unknown;
	timeline.eventCallback = ((...args: unknown[]) => {
		if (args.length > 1 && typeof args[1] === 'function') {
			throw new Error(
				'useGsapTimeline does not allow timeline.eventCallback().',
			);
		}

		return originalEventCallback(...args);
	}) as typeof timeline.eventCallback;

	timeline.then = (() => {
		throw new Error(
			'useGsapTimeline does not allow timeline.then() callbacks.',
		);
	}) as typeof timeline.then;

	const originalTo = timeline.to.bind(timeline);
	timeline.to = ((...args: Parameters<typeof timeline.to>) => {
		assertNoCallbacks(args[1]);
		return originalTo(...args);
	}) as typeof timeline.to;

	const originalFrom = timeline.from.bind(timeline);
	timeline.from = ((...args: Parameters<typeof timeline.from>) => {
		assertNoCallbacks(args[1]);
		return originalFrom(...args);
	}) as typeof timeline.from;

	const originalFromTo = timeline.fromTo.bind(timeline);
	timeline.fromTo = ((...args: Parameters<typeof timeline.fromTo>) => {
		assertNoCallbacks(args[1]);
		assertNoCallbacks(args[2]);
		return originalFromTo(...args);
	}) as typeof timeline.fromTo;

	const originalSet = timeline.set.bind(timeline);
	timeline.set = ((...args: Parameters<typeof timeline.set>) => {
		assertNoCallbacks(args[1]);
		return originalSet(...args);
	}) as typeof timeline.set;

	const originalAdd = timeline.add.bind(timeline);
	timeline.add = ((...args: Parameters<typeof timeline.add>) => {
		if (typeof args[0] === 'function') {
			throw new Error(
				'useGsapTimeline does not allow callback functions in timeline.add().',
			);
		}

		return originalAdd(...args);
	}) as typeof timeline.add;

	timeline.call = (() => {
		throw new Error('useGsapTimeline does not allow timeline.call().');
	}) as typeof timeline.call;

	return {
		isPaused: () => originalPaused(),
		pause: () => {
			originalPaused(true);
		},
		renderAt: (seconds) => {
			// Always render forward from zero. GSAP renders timeline children in
			// reverse order on backward passes, so overlapping same-property
			// tweens resolve differently when a frame is approached from above
			// vs below. Two forward passes make every visit — direct still,
			// sequential chunk, backward scrub — identical to forward playback.
			originalTotalTime(0, true);
			originalTotalTime(seconds, true);
		},
		restoreForContextRevert: () => {
			// gsap.context().revert() calls animation.kill(), which in turn reaches
			// public progress/time methods. Remove every instance-level guard only
			// after builder execution is permanently over so GSAP teardown can use
			// its untouched prototype implementation.
			for (const method of [
				'play',
				'resume',
				'restart',
				'reverse',
				'pause',
				'paused',
				'seek',
				'time',
				'totalTime',
				'timeScale',
				'duration',
				'totalDuration',
				'progress',
				'totalProgress',
				'tweenTo',
				'tweenFromTo',
				'kill',
				'eventCallback',
				'then',
				'to',
				'from',
				'fromTo',
				'set',
				'add',
				'call',
			]) {
				delete (timeline as unknown as Record<string, unknown>)[method];
			}
		},
		kill: () => {
			originalKill();
		},
	};
};

/**
 * Builds one scoped, paused GSAP timeline and seeks it from Remotion's frame.
 * The hook never plays the timeline on GSAP's ticker.
 */
export const useGsapTimeline = <T extends Element>(
	build: GsapTimelineBuilder<T>,
	{dependencies = EMPTY_DEPENDENCIES}: UseGsapTimelineOptions = {},
): GsapScopeRef<T> => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const scopeRef = useRef<T>(null);
	const controlsRef = useRef<TimelineControls | null>(null);
	const buildRef = useRef(build);
	const frameRef = useRef(frame);
	const fpsRef = useRef(fps);

	buildRef.current = build;
	frameRef.current = frame;
	fpsRef.current = fps;

	useLayoutEffect(() => {
		const scope = scopeRef.current;
		if (!scope) {
			return;
		}

		const state: {
			timeline: gsap.core.Timeline | null;
			controls: TimelineControls | null;
		} = {timeline: null, controls: null};
		const context = gsap.context(() => undefined, scope);

		try {
			context.add(() => {
				state.timeline = gsap.timeline({paused: true});
				state.controls = guardTimelineMethods(state.timeline);
				const selector = gsap.utils.selector(scope);

				const preexisting = new Set<gsap.core.Animation>(
					gsap.globalTimeline.getChildren(true, true, true),
				);
				const originalTickerAdd = gsap.ticker.add.bind(gsap.ticker);
				gsap.ticker.add = (() => {
					throw new Error(
						'useGsapTimeline builders must not register gsap.ticker callbacks. The Remotion frame is the only clock.',
					);
				}) as typeof gsap.ticker.add;

				let result: unknown;
				try {
					result = buildRef.current({
						timeline: state.timeline,
						scope,
						selector,
					});
				} finally {
					gsap.ticker.add = originalTickerAdd;
				}

				if (!state.controls.isPaused()) {
					throw new Error(
						'useGsapTimeline builders must not start playback. Remove play(), resume(), restart(), or reverse().',
					);
				}

				// Only reject genuine Promises. GSAP animations are thenable, so a
				// duck-typed check would reject concise builders that return a
				// tween, like `({selector}) => gsap.set(selector('[data-x]'), ...)`.
				if (result instanceof Promise) {
					throw new TypeError(
						'useGsapTimeline builders must be synchronous. Load data before building the timeline.',
					);
				}

				const callbacks = findTimelineCallbacks(state.timeline);
				if (callbacks.length > 0) {
					throw new Error(
						`useGsapTimeline does not allow timeline callbacks (${callbacks.join(', ')}). Derive visual state from the timeline instead of side effects.`,
					);
				}

				const nonElementTargets = findNonElementTargets(state.timeline);
				if (nonElementTargets.length > 0) {
					throw new Error(
						`useGsapTimeline tweens must target DOM or SVG elements, but found: ${nonElementTargets.join(
							'; ',
						)}. Tweening plain objects animates in the Player but freezes in stills and renders, because nothing re-reads the object after a frame seek. Animate elements through the scoped selector or refs, or derive numeric values with Remotion's useCurrentFrame() and interpolate().`,
					);
				}

				const nondeterminism = findTimelineNondeterminism(state.timeline);
				if (nondeterminism.length > 0) {
					throw new Error(
						`useGsapTimeline rejects nondeterministic tween configuration (${nondeterminism.join(
							'; ',
						)}). GSAP resolves these with unseeded Math.random, so every mount and every render process disagrees. Derive stable values from data or Remotion's seeded random().`,
					);
				}

				const strays = findStrayAnimations(state.timeline, preexisting);
				if (strays.length > 0) {
					throw new Error(
						`useGsapTimeline builders created ${strays.join(
							'; ',
						)}. Animations that are not children of the provided timeline advance on the wall clock instead of the Remotion frame. Attach them to the timeline, or use a plain zero-duration gsap.set() for static state.`,
					);
				}

				// Builders only describe motion. Reassert package ownership of playback.
				state.controls.pause();

				// A freshly built timeline is not yet path-independent: zero-duration
				// tweens exactly at the playhead do not render until passed, and
				// overlapping same-property tweens lazily record their start values
				// at whatever frame happens to be visited first — so a direct still
				// could differ from the same frame reached sequentially (concurrent
				// render chunks make both orders happen in one video). Prime the
				// timeline by sweeping the playhead through every child's start time
				// in playback order, flushing GSAP's lazy value-recording after each
				// step, so initialization happens exactly as sequential playback
				// would do it. Runs synchronously inside this layout effect, so no
				// intermediate state paints. Infinite repeats keep start times
				// finite, so the sweep stays finite too.
				// startTime() is relative to the child's immediate parent; walk up
				// to express it on the owned timeline's clock (a nested timeline's
				// timeScale stretches its children's local time).
				const ownedTimeline = state.timeline;
				const startTimeOnOwnedClock = (child: gsap.core.Animation): number => {
					let time = child.startTime();
					let parent = child.parent as gsap.core.Timeline | null;
					while (parent && parent !== ownedTimeline) {
						time = parent.startTime() + time / (parent.timeScale() || 1);
						parent = parent.parent as gsap.core.Timeline | null;
					}

					return time;
				};

				const startTimes = [
					...new Set(
						state.timeline
							.getChildren(true, true, true)
							.map((child) => startTimeOnOwnedClock(child))
							.filter((startTime) => Number.isFinite(startTime))
							.sort((a, b) => a - b),
					),
				];
				const totalDuration = state.timeline.totalDuration();
				const cycleDuration = state.timeline.duration();
				const primeEnd = Number.isFinite(totalDuration)
					? totalDuration
					: Number.isFinite(cycleDuration)
						? cycleDuration
						: 3600;
				for (const startTime of [...startTimes, primeEnd]) {
					state.controls.renderAt(startTime);
					gsap.ticker.tick();
				}

				state.controls.renderAt(
					frameToSeconds(frameRef.current, fpsRef.current),
				);
				gsap.ticker.tick();
			});

			controlsRef.current = state.controls;
		} catch (error) {
			state.controls?.restoreForContextRevert();
			context.revert();
			state.controls?.kill();
			throw error;
		}

		return () => {
			controlsRef.current = null;
			state.controls?.restoreForContextRevert();
			context.revert();
			state.controls?.kill();
		};
		// The explicit dependency list is the same contract as useEffect dependencies.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, dependencies);

	useLayoutEffect(() => {
		const controls = controlsRef.current;
		if (controls) {
			controls.renderAt(frameToSeconds(frame, fps));
		}
	}, [fps, frame]);

	return scopeRef;
};
