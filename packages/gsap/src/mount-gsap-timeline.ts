import {flushSync} from 'react-dom';

type GsapTimeline = {
	targetsChanged: (domChanged: boolean) => boolean;
	renderAt: (seconds: number) => void;
	revert: () => void;
};

export type MountedGsapTimeline = {
	scope: Element;
	update: (dependenciesChanged: boolean) => void;
	dispose: () => void;
};

type ActiveTimeline = {
	scope: Element;
	styles: Map<Element, string | null>;
	dirty: boolean;
	targets: Set<Element>;
	externalTargets: Set<Element>;
	needsBuild: (checkBrowserState: boolean) => boolean;
	requestUpdate: () => void;
	build: () => void;
	revert: () => void;
};

type ObservedTimelines = {
	active: Set<ActiveTimeline>;
	collectPending: () => void;
	scheduleUpdate: () => void;
	animate: (callback: () => void, scopesChanged: boolean) => void;
};

const documents = new WeakMap<Document, ObservedTimelines>();

const observation = {
	subtree: true,
	childList: true,
	attributes: true,
	attributeOldValue: true,
	characterData: true,
};

// Apply only the properties changed by an external writer. The live style
// can also contain interpolated values written by GSAP.
const applyStyleChange = (
	doc: Document,
	baseline: string | null,
	previous: string | null,
	current: string | null,
): string | null => {
	if (current === null || baseline === previous) {
		return current;
	}

	if (previous === current) {
		return baseline;
	}

	const before = doc.createElement('div').style;
	const after = doc.createElement('div').style;
	const result = doc.createElement('div').style;
	before.cssText = previous ?? '';
	after.cssText = current;
	result.cssText = baseline ?? '';
	for (const prop of new Set([...Array.from(before), ...Array.from(after)])) {
		const value = after.getPropertyValue(prop);
		const priority = after.getPropertyPriority(prop);
		if (
			value !== before.getPropertyValue(prop) ||
			priority !== before.getPropertyPriority(prop)
		) {
			result.setProperty(prop, value, priority);
		}
	}

	return result.cssText;
};

const observeTimelines = (doc: Document): ObservedTimelines => {
	const existing = documents.get(doc);
	if (existing) {
		return existing;
	}

	const active = new Set<ActiveTimeline>();
	// One common ancestor per DOM tree keeps observer setup independent of
	// the number of timelines seeking on the same frame.
	const roots = new Map<Node, Node>();
	const observeRoots = (observer: MutationObserver, scopesChanged: boolean) => {
		if (scopesChanged) {
			roots.clear();
			for (const entry of active) {
				for (const node of [entry.scope, ...entry.externalTargets]) {
					const tree = node.getRootNode();
					let root: Node | null = roots.get(tree) ?? node;
					while (root && !root.contains(node)) {
						root = root.parentNode;
					}

					roots.set(tree, root ?? node);
				}
			}
		}

		for (const root of roots.values()) {
			observer.observe(root, observation);
		}
	};

	let scheduled = false;
	const scheduleUpdate = () => {
		if (scheduled) {
			return;
		}

		scheduled = true;
		queueMicrotask(() => {
			scheduled = false;
			const pending = [...active].filter((entry) => entry.needsBuild(false));
			if (pending.length) {
				flushSync(() => pending.forEach((entry) => entry.requestUpdate()));
			}
		});
	};

	const collect = (mutations: MutationRecord[], observer: MutationObserver) => {
		if (mutations.length === 0) {
			return;
		}

		const styles = new Map<Element, string | null>();
		for (const mutation of mutations) {
			for (const entry of active) {
				if (entry.scope.contains(mutation.target)) {
					entry.dirty = true;
				}
			}

			if (mutation.attributeName === 'style') {
				const element = mutation.target as Element;
				if (!styles.has(element)) {
					styles.set(element, mutation.oldValue);
				}
			}
		}

		for (const [element, previous] of styles) {
			const current = element.getAttribute('style');
			for (const entry of active) {
				const baseline = entry.styles.get(element);
				if (baseline !== undefined) {
					entry.styles.set(
						element,
						applyStyleChange(doc, baseline, previous, current),
					);
				}
			}
		}

		if (mutations.some((mutation) => mutation.removedNodes.length > 0)) {
			observer.disconnect();
			observeRoots(observer, true);
		}

		if ([...active].some((entry) => entry.dirty)) {
			scheduleUpdate();
		}
	};

	const domObserver = new MutationObserver(collect);
	const collectPending = () => collect(domObserver.takeRecords(), domObserver);
	// Disconnect while GSAP writes so its interpolated styles cannot become
	// starting styles for the next build.
	const animate = (callback: () => void, scopesChanged: boolean) => {
		collectPending();
		domObserver.disconnect();
		try {
			callback();
		} finally {
			observeRoots(domObserver, scopesChanged);
		}
	};

	const group = {collectPending, active, scheduleUpdate, animate};
	documents.set(doc, group);
	return group;
};

// A shared element may connect several timelines through different scopes.
const overlappingTimelines = (
	entry: ActiveTimeline,
	active: Set<ActiveTimeline>,
) => {
	const group = new Set([entry]);
	for (const member of group) {
		for (const other of active) {
			if (group.has(other)) {
				continue;
			}

			for (const element of member.targets) {
				if (other.targets.has(element)) {
					group.add(other);
					break;
				}
			}
		}
	}

	return [...active].filter((item) => group.has(item));
};

export const mountGsapTimeline = (
	scope: Element,
	build: (
		seconds: number,
		trackTarget: (element: Element) => void,
	) => GsapTimeline,
	getSeconds: () => number,
	requestUpdate: () => void,
): MountedGsapTimeline => {
	const doc = scope.ownerDocument;
	const {collectPending, active, scheduleUpdate, animate} =
		observeTimelines(doc);

	const styles = new Map<Element, string | null>();
	let timeline: GsapTimeline | null = null;
	let time: number | null = null;
	let invalidated = false;
	const targets = new Set<Element>();
	const externalTargets = new Set<Element>();
	const trackTarget = (element: Element) => {
		if (targets.has(element)) {
			return;
		}

		targets.add(element);
		if (!timeline) {
			styles.set(element, element.getAttribute('style'));
		}

		if (!scope.contains(element)) {
			externalTargets.add(element);
		}
	};

	const entry: ActiveTimeline = {
		scope,
		styles,
		dirty: false,
		targets,
		externalTargets,
		requestUpdate,
		needsBuild: (checkBrowserState) => {
			if (!timeline || invalidated) {
				return true;
			}

			if (entry.dirty || checkBrowserState) {
				invalidated = timeline.targetsChanged(entry.dirty);
				entry.dirty = false;
			}

			return invalidated;
		},
		build: () => {
			time = getSeconds();
			targets.clear();
			externalTargets.clear();
			timeline = build(time, trackTarget);

			entry.dirty = false;
			invalidated = false;
		},
		revert: () => {
			timeline?.revert();
			timeline = null;
			for (const [element, style] of styles) {
				if (element.getAttribute('style') === style) {
					continue;
				}

				if (style === null) {
					element.removeAttribute('style');
				} else {
					element.setAttribute('style', style);
				}
			}

			styles.clear();
		},
	};

	const dispose = () => {
		const overlapping = overlappingTimelines(entry, active);
		animate(() => {
			for (const item of overlapping.reverse()) {
				item.revert();
			}

			active.delete(entry);
		}, true);

		if (overlapping.length > 1) {
			scheduleUpdate();
		}

		if (active.size === 0) {
			documents.delete(doc);
		}
	};

	active.add(entry);
	try {
		animate(entry.build, true);
	} catch (error) {
		dispose();
		throw error;
	}

	return {
		scope,
		dispose,
		update: (dependenciesChanged) => {
			collectPending();
			if (!timeline || dependenciesChanged || entry.needsBuild(true)) {
				// GSAP reverts the entire CSS transform even if a tween only sets x.
				// Unwind shared targets in reverse, then build in layout-effect order.
				const overlapping = overlappingTimelines(entry, active);
				animate(() => {
					for (const item of [...overlapping].reverse()) {
						item.revert();
					}

					try {
						for (const item of overlapping) {
							item.build();
						}
					} catch (error) {
						for (const item of overlapping.reverse()) {
							item.revert();
						}

						throw error;
					}
				}, true);

				return;
			}

			entry.dirty = false;
			const seconds = getSeconds();
			if (time !== seconds) {
				time = seconds;
				const current = timeline;
				animate(() => current.renderAt(seconds), false);
			}
		},
	};
};
