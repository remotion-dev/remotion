import type {ApiRoutes, BrowserStudioOperations} from '@remotion/studio-shared';
import {enqueueStudioSourceMutation} from './enqueue-studio-source-mutation';
import {sourceMutationEndpoints} from './source-mutation-endpoints';

const queuedOperations = new WeakMap<object, object>();

const withMutationQueue = <T extends object>(operations: T): T => {
	const existing = queuedOperations.get(operations);
	if (existing) {
		return existing as T;
	}

	const methods = new Map<string, {original: unknown; queued: unknown}>();
	const wrapped = new Proxy(operations, {
		get(target, property, receiver) {
			const value = Reflect.get(target, property, receiver);
			if (property === 'effects' || property === 'keyframes') {
				return value ? withMutationQueue(value) : value;
			}

			if (typeof property !== 'string' || typeof value !== 'function') {
				return value;
			}

			const cached = methods.get(property);
			if (cached?.original === value) {
				return cached.queued;
			}

			const name =
				property === 'deleteEffects'
					? 'deleteEffect'
					: property === 'duplicateEffects'
						? 'duplicateEffect'
						: property;
			const endpoint =
				`/api/${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}` as keyof ApiRoutes;
			const queued = sourceMutationEndpoints.has(endpoint)
				? (...args: unknown[]) =>
						enqueueStudioSourceMutation(endpoint, args[0], () =>
							value.apply(target, args),
						)
				: value.bind(target);
			methods.set(property, {original: value, queued});
			return queued;
		},
	});
	queuedOperations.set(operations, wrapped);
	return wrapped;
};

// Browser Studio may be hosted by a different studio-shared version, so this
// handshake intentionally has no shared runtime import.
export const BROWSER_STUDIO_OPERATIONS_READY_EVENT =
	'remotion-browser-studio-operations-ready';

export const getBrowserStudioOperations =
	(): BrowserStudioOperations | null => {
		if (typeof window === 'undefined') {
			return null;
		}

		return window.remotion_browserStudio
			? withMutationQueue(window.remotion_browserStudio)
			: null;
	};

export const getBrowserStudioKeyframeOperations = () =>
	getBrowserStudioOperations()?.keyframes ?? null;

export const getBrowserStudioEffectOperations = () =>
	getBrowserStudioOperations()?.effects ?? null;

export const canUseKeyframeOperations = () =>
	!window.remotion_isReadOnlyStudio ||
	getBrowserStudioKeyframeOperations() !== null;

export const canUseEffectOperations = () =>
	!window.remotion_isReadOnlyStudio ||
	getBrowserStudioEffectOperations() !== null;

export const canInstallPackages = () => {
	const browserStudioOperations = getBrowserStudioOperations();
	if (browserStudioOperations !== null) {
		return true;
	}

	return !window.remotion_isReadOnlyStudio;
};
