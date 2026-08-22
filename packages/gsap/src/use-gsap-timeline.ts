/// <reference types="gsap" />
import {gsap} from 'gsap';
import {type DependencyList, useLayoutEffect, useRef, useState} from 'react';
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

// Recurse only into plain objects and arrays: GSAP injects internals into
// vars (stagger adds `parent`), whose graph reaches DOM targets and, through
// their React fibers, the entire host app tree.
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

// nodeType, not instanceof: Element identity differs across realms.
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

	// Hide GSAP's `_gsap` bookkeeping so the error names the author's properties.
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

// GSAP resolves random value tokens ("random(-100, 100)", "random([a, b])")
// with unseeded Math.random, so every render chunk rolls different values.
// Anchored so prose merely containing "random()" does not match.
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

// Builder-created animations that never join the timeline advance on the
// wall clock. Zero-duration, callback-free, delay-free tweens (gsap.set)
// are deterministic at build time and stay allowed.
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
	// Bind originals first: the hook must keep seeking and cleaning up after
	// the guards replace the public methods.
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

	// These setters dispatch through totalTime() internally and cannot be
	// honored anyway (the hook seeks unscaled local time), so reject them
	// with an accurate message. The zero-argument getters stay available.
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
			// Render forward from zero: GSAP renders children in reverse order on
			// backward passes, so overlapping same-property tweens resolve
			// differently unless every visit replays forward playback.
			originalTotalTime(0, true);
			originalTotalTime(seconds, true);
		},
		restoreForContextRevert: () => {
			// context.revert() reaches public progress/time methods via kill();
			// restore the prototypes once builder execution is permanently over.
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
	// Element the current timeline was built for. A conditionally unmounted
	// scope runs no cleanup, leaving a stale timeline on the detached element.
	const builtForRef = useRef<Element | null>(null);
	const buildRef = useRef(build);
	const frameRef = useRef(frame);
	const fpsRef = useRef(fps);
	// Bumped to re-run the build effect when the scope element changes.
	const [remountNonce, setRemountNonce] = useState(0);

	buildRef.current = build;
	frameRef.current = frame;
	fpsRef.current = fps;

	useLayoutEffect(() => {
		const scope = scopeRef.current;
		builtForRef.current = scope;
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

				// GSAP animations are thenable; only a genuine Promise means async.
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

				// A fresh timeline is not path-independent: zero-duration tweens at
				// the playhead render only once passed, and overlapping tweens
				// record start values lazily at the first visited frame. Sweep the
				// playhead through every child start time in playback order so
				// initialization matches sequential playback. startTime() is
				// parent-relative, so map it onto this timeline's clock.
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
				}

				state.controls.renderAt(
					frameToSeconds(frameRef.current, fpsRef.current),
				);
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
	}, [...dependencies, remountNonce]);

	useLayoutEffect(() => {
		const controls = controlsRef.current;
		if (controls) {
			controls.renderAt(frameToSeconds(frame, fps));
		}
	}, [fps, frame]);

	// Runs every commit: re-arm the build effect if the scope element is not
	// the one the timeline was built for. Identities match after the rebuild,
	// so the update chain is finite.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useLayoutEffect(() => {
		if (scopeRef.current !== builtForRef.current) {
			setRemountNonce((nonce) => nonce + 1);
		}
	});

	return scopeRef;
};
