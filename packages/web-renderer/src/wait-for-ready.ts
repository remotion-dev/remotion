/* eslint-disable @typescript-eslint/no-use-before-define */
import {Internals, type DelayRenderScope} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import type {BackgroundKeepalive} from './background-keepalive';
import {parseFontFamilies} from './drawing/parse-font-families';
import {
	fontFamilyAliases,
	certainNativeFontFamily,
} from './font-family-matching';
import {getFontReadinessSamples} from './font-readiness';
import {getPendingFontFacesForSamples} from './get-pending-font-faces-for-samples';
import type {InternalState} from './internal-state';
import {pendingFontMayAffectSample} from './pending-font-selection';
import {observePendingFont, type PendingFontWake} from './pending-font-wake';
import {withResolvers} from './with-resolvers';

// Native font promises cannot be unsubscribed. Clear this token at completion so
// an unfinished load cannot retain the capture through its callback.
const wakeFontWait = (token: {check: (() => void) | null}) => token.check?.();

const wakeScheduledFontWait = (
	token: {check: (() => void) | null; generation: number},
	generation: number,
) => {
	if (token.generation === generation) token.check?.();
};

export const waitForReady = (
	{
		timeoutInMilliseconds,
		scope,
		signal,
		apiName,
		internalState,
		keepalive,
	}: {
		timeoutInMilliseconds: number;
		scope: DelayRenderScope;
		signal: AbortSignal | null;
		apiName: 'renderMediaOnWeb' | 'renderStillOnWeb' | 'renderFramesOnWeb';
		internalState: InternalState | null;
		keepalive: BackgroundKeepalive | null;
	},
	captureRoot: HTMLElement | SVGElement | null,
) => {
	const start = performance.now();
	const suspensionStart = Internals.getDelayRenderSuspendedTime(scope);
	const {promise, resolve, reject} = withResolvers<void>();
	const fontWake: PendingFontWake & {generation: number} = {
		check: null,
		failure: null,
		generation: 0,
	};
	const observed = new Set<Promise<unknown>>();
	let finished = false;
	let frame: number | null = null;
	let deadline: ReturnType<typeof setTimeout> | null = null;
	let waitingForFonts = false;

	const elapsed = () =>
		performance.now() -
		start -
		(Internals.getDelayRenderSuspendedTime(scope) - suspensionStart);
	const cleanup = () => {
		finished = true;
		fontWake.check = null;
		fontWake.failure = null;
		observed.clear();
		fontWake.generation++;
		if (frame !== null) cancelAnimationFrame(frame);
		if (deadline !== null) clearTimeout(deadline);
		signal?.removeEventListener('abort', check);
		internalState?.addWaitForReadyTime(performance.now() - start);
	};

	const observe = (pending: Promise<unknown>) => {
		if (observed.has(pending)) return;
		observed.add(pending);
		const wake = wakeFontWait.bind(null, fontWake);
		pending.then(wake, wake);
	};

	const fontsReady = () => {
		if (!captureRoot) return true;
		const owner = captureRoot.ownerDocument;
		if (!owner.defaultView) return true;
		const hasPendingSdkFont = NoReactInternals.getPendingFontFaces().some(
			(font) => font.ownerDocument === owner,
		);
		if (owner.fonts.status === 'loaded' && !hasPendingSdkFont) return true;
		const samples = getFontReadinessSamples(captureRoot);
		if (!samples.length) return true;
		const sdkFonts = getPendingFontFacesForSamples(owner, samples);
		for (const font of sdkFonts) {
			if (observed.has(font.completion)) continue;
			observed.add(font.completion);
			observePendingFont(font.completion, fontWake);
		}

		if (sdkFonts.length) return false;
		if (owner.fonts.status === 'loaded') return true;
		const loading = Array.from(owner.fonts).filter(
			(face) => face.status === 'loading',
		);
		// Any loading face can wake a check; only native matched queries are barriers.
		for (const face of loading) observe(face.loaded);
		if (loading.length)
			return samples.every((sample) => {
				try {
					return owner.fonts.check(sample.font, sample.text);
				} catch (error) {
					if (
						!(error instanceof owner.defaultView!.DOMException) ||
						error.name !== 'SyntaxError'
					)
						throw error;
					// Valid computed CSS (for example 110% width) can have no
					// FontFaceSet shorthand representation. Keep its full descriptors.
					const families = parseFontFamilies(sample.style.fontFamily);
					const loaded = Array.from(owner.fonts).filter(
						(face) => face.status === 'loaded',
					);
					return !loading.some((face) => {
						return fontFamilyAliases(face.family).some(
							(family) =>
								families.includes(family) &&
								pendingFontMayAffectSample(
									face,
									loaded.filter(
										(current) => certainNativeFontFamily(current) === family,
									),
									sample.style,
									sample.text,
								),
						);
					});
				}
			});
		// A native face can be loaded before FontFaceSet finishes its round.
		// Keep that final round within the same deadline and cancellation scope.
		observe(owner.fonts.ready);
		return captureRoot.ownerDocument.fonts.status === 'loaded';
	};

	const check = () => {
		if (finished) return;
		fontWake.generation++;
		if (frame !== null) {
			cancelAnimationFrame(frame);
			frame = null;
		}

		if (deadline !== null) {
			clearTimeout(deadline);
			deadline = null;
		}

		if (signal?.aborted) {
			cleanup();
			reject(new Error(`${apiName}() was cancelled`));
			return;
		}

		if (scope.remotion_cancelledError !== undefined) {
			cleanup();
			if (scope.remotion_cancelledErrorObject) {
				reject(scope.remotion_cancelledErrorObject);
				return;
			}

			const stack = scope.remotion_cancelledError;
			const error = new Error(stack.split('\n')[0].replace(/^Error: /, ''));
			error.stack = stack;
			reject(error);
			return;
		}

		if (fontWake.failure !== null) {
			const {error} = fontWake.failure;
			cleanup();
			reject(error);
			return;
		}

		try {
			if (scope.remotion_renderReady === true) {
				waitingForFonts = !fontsReady();
				if (!waitingForFonts) {
					cleanup();
					resolve();
					return;
				}
			} else {
				waitingForFonts = false;
			}
		} catch (error) {
			cleanup();
			reject(error);
			return;
		}

		if (elapsed() > timeoutInMilliseconds + 3000) {
			cleanup();
			const labels = Object.values(scope.remotion_delayRenderTimeouts)
				.map((entry) => entry.label)
				.join(', ');
			reject(
				new Error(
					labels ||
						(waitingForFonts
							? 'Waiting for capture fonts to become ready'
							: ''),
				),
			);
			return;
		}

		const wake = wakeScheduledFontWait.bind(
			null,
			fontWake,
			fontWake.generation,
		);

		frame = requestAnimationFrame(wake);
		keepalive?.waitForTick().then(wake);
		// Same original budget, including suspension accounting. This watchdog
		// remains live if a font wait occurs while RAF/worker ticks are stopped.
		deadline = setTimeout(
			check,
			Math.max(1, timeoutInMilliseconds + 3000 - elapsed()),
		);
	};

	fontWake.check = check;
	signal?.addEventListener('abort', check, {once: true});
	check();
	return promise;
};
