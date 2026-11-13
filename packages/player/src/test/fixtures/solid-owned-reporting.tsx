import {mock} from 'bun:test';
import {resolve} from 'node:path';
import type {PlayerRef} from '../../player-methods.js';

const main = async () => {
	const runnerPath = resolve(
		__dirname,
		'../../../../core/dist/cjs/effects/run-effect-chain.js',
	);
	const actualRunner = await import(runnerPath);
	type Pending = {
		resolve: (completed: boolean) => void;
		reject: (error: unknown) => void;
		done: boolean;
	};
	const pending: Pending[] = [];
	mock.module(runnerPath, () => ({
		...actualRunner,
		runEffectChain: () =>
			new Promise<boolean>((resolveRun, rejectRun) => {
				const item: Pending = {
					resolve: (value) => {
						item.done = true;
						resolveRun(value);
					},
					reject: (error) => {
						item.done = true;
						rejectRun(error);
					},
					done: false,
				};
				pending.push(item);
			}),
	}));

	const core = require(
		resolve(__dirname, '../../../../core/dist/cjs/index.js'),
	);
	mock.module('remotion', () => core);
	const {act, cleanup, render} = await import('@testing-library/react');
	const {Solid, useDelayRender} = await import('remotion');
	const {Player} = await import('../../Player.js');
	const React = await import('react');
	const {flushSync} = await import('react-dom');
	const {ErrorBoundary} = await import('../../error-boundary.js');
	const internalHooks = await import(
		resolve(__dirname, '../../../../core/dist/cjs/use-delay-render.js')
	);
	const mode = process.argv[2];
	const originalContext = HTMLCanvasElement.prototype.getContext;
	HTMLCanvasElement.prototype.getContext = function (
		this: HTMLCanvasElement,
		kind: string,
	) {
		if (kind !== '2d') return null;
		return {
			canvas: this,
			clearRect: () => undefined,
			fillRect: () => undefined,
			fillStyle: '',
		};
	} as typeof originalContext;
	const reports: Error[] = [];
	const config = {
		compositionWidth: 32,
		compositionHeight: 32,
		durationInFrames: 30,
		fps: 30,
	};
	const fallback = ({error}: {error: Error}) => (
		<div role="alert">{error.message}</div>
	);
	const failure = new Error('owned Solid failed', {
		cause: new Error('setup cause'),
	});
	let reporter: ((error: unknown) => void) | null = null;
	let controls: ReturnType<typeof useDelayRender> | null = null;
	const Content = ({color}: {readonly color: string | null}) => {
		controls = useDelayRender();
		return <Solid width={32} height={32} color={color ?? 'lime'} />;
	};

	const Capture = () => {
		controls = useDelayRender();
		reporter = internalHooks.useReportRenderError();
		return <div>retained composition</div>;
	};

	const onError = (ref: PlayerRef | null) =>
		ref?.addEventListener('error', (e) => reports.push(e.detail.error));
	const flush = async () => {
		await Promise.resolve();
		await new Promise<void>((resolveTick) => setTimeout(resolveTick, 0));
	};

	let facts: Record<string, unknown> = {mode};
	try {
		if (mode === 'active' || mode === 'stale') {
			const view = render(
				<Player
					{...config}
					ref={onError}
					component={Content}
					inputProps={{color: 'lime'}}
					errorFallback={fallback}
				/>,
			);
			await act(flush);
			if (pending.length === 0)
				throw new Error('Actual Solid did not invoke its effect runner');
			const old = pending[pending.length - 1];
			if (mode === 'stale') {
				view.rerender(
					<Player
						{...config}
						ref={onError}
						component={Content}
						inputProps={{color: 'blue'}}
						errorFallback={fallback}
					/>,
				);
				await act(flush);
				const current = pending[pending.length - 1];
				if (current === old)
					throw new Error('Source change did not launch a new Solid run');
				await act(async () => {
					current.resolve(true);
					await flush();
					old.reject(failure);
					await flush();
				});
				facts = {
					...facts,
					oldRunRetired: current !== old,
					reported: reports.map((e) => e.message),
					healthyCurrentRetained: view.queryByRole('alert') === null,
				};
				if (reports.length || !facts.healthyCurrentRetained)
					throw new Error('Retired Solid run failed its healthy replacement');
			} else {
				await act(async () => {
					old.reject(failure);
					await flush();
				});
				facts = {
					...facts,
					reportedOnce: reports.length === 1,
					originalIdentity: reports[0] === failure,
					causeIdentity: reports[0]?.cause === failure.cause,
					fallback: view.getByRole('alert').textContent,
					rendererUnpoisoned:
						window.remotion_cancelledErrorObject === undefined,
				};
				if (
					!facts.reportedOnce ||
					!facts.originalIdentity ||
					!facts.causeIdentity ||
					facts.fallback !== failure.message ||
					!facts.rendererUnpoisoned
				)
					throw new Error(
						'Owned Solid failure did not reach its existing boundary',
					);
			}
		} else if (mode === 'first-and-public') {
			const view = render(
				<Player
					{...config}
					ref={onError}
					component={Capture}
					errorFallback={fallback}
				/>,
			);
			await act(flush);
			if (!reporter || !controls) throw new Error('Controls did not commit');
			const report = reporter as (error: unknown) => void;
			const cancel = (controls as ReturnType<typeof useDelayRender>)
				.cancelRender;
			const second = new Error('second runtime failure');
			await act(async () => {
				await Promise.reject(failure).catch(report);
				await Promise.reject(second).catch(report);
				await flush();
			});
			let publicRejected: unknown = null;
			try {
				await Promise.reject(second).catch(cancel);
			} catch (error) {
				publicRejected = error;
			}

			facts = {
				...facts,
				firstErrorOnly: reports.length === 1 && reports[0] === failure,
				fallback: view.getByRole('alert').textContent,
				publicRejectedOriginal: publicRejected === second,
			};
			if (
				!facts.firstErrorOnly ||
				facts.fallback !== failure.message ||
				!facts.publicRejectedOriginal
			)
				throw new Error('First-error or public throwing contract changed');
		} else if (mode === 'retired-owner') {
			const ready = () => <Capture />;
			const view = render(
				<Player
					{...config}
					ref={onError}
					component={Capture}
					errorFallback={fallback}
				/>,
			);
			await act(flush);
			const old = reporter;
			if (!old) throw new Error('No original owner');
			view.rerender(
				<Player
					{...config}
					ref={onError}
					component={ready}
					errorFallback={fallback}
				/>,
			);
			await act(flush);
			await Promise.reject(failure).catch(old);
			await act(flush);
			facts = {
				...facts,
				staleOwnerIgnored:
					reports.length === 0 && view.queryByRole('alert') === null,
			};
			if (!facts.staleOwnerIgnored)
				throw new Error('A stale runtime owner notified its replacement');
		} else if (mode.startsWith('lifecycle-')) {
			const firstOwner = {};
			const secondOwner = {};
			const scene = (owner: object, hidden = false) => (
				<React.StrictMode>
					<React.Activity mode={hidden ? 'hidden' : 'visible'}>
						<ErrorBoundary
							renderingOwner={owner}
							onError={(error: Error) => reports.push(error)}
							errorFallback={fallback}
						>
							<Capture />
						</ErrorBoundary>
					</React.Activity>
				</React.StrictMode>
			);
			const view = render(scene(firstOwner));
			await act(flush);
			const report = reporter as unknown as (error: unknown) => void;
			report(failure);
			if (mode === 'lifecycle-reveal-deferred') await Promise.resolve();
			if (mode === 'lifecycle-owner')
				flushSync(() => view.rerender(scene(secondOwner)));
			else if (mode === 'lifecycle-unmount') flushSync(() => view.unmount());
			else if (
				mode === 'lifecycle-hidden' ||
				mode.startsWith('lifecycle-reveal')
			)
				flushSync(() => view.rerender(scene(firstOwner, true)));
			else if (mode !== 'lifecycle-strict')
				throw new Error('Unknown lifecycle mode');
			if (
				mode === 'lifecycle-reveal-same-job' ||
				mode === 'lifecycle-reveal-deferred'
			)
				flushSync(() => view.rerender(scene(firstOwner)));
			await act(flush);
			if (mode === 'lifecycle-reveal-later') {
				flushSync(() => view.rerender(scene(firstOwner)));
				await act(flush);
			}

			facts = {
				...facts,
				events: reports.length,
				originalIdentity: reports[0] === failure,
				fallback: view.queryByRole('alert')?.textContent ?? null,
			};
			if (mode === 'lifecycle-strict') {
				if (reports.length !== 1 || reports[0] !== failure)
					throw new Error('StrictMode first error delivery changed');
			} else if (reports.length !== 0 || facts.fallback !== null)
				throw new Error('A queued notification escaped its retired owner');
			if (mode.startsWith('lifecycle-reveal')) {
				const newFailure = new Error('revealed runtime failure');
				(reporter as unknown as (error: unknown) => void)(newFailure);
				await act(flush);
				if (
					reports.length !== 1 ||
					reports[0] !== newFailure ||
					view.getByRole('alert').textContent !== newFailure.message
				)
					throw new Error(
						'A retired generation swallowed the revealed runtime failure',
					);
				facts = {...facts, revealedOriginalIdentity: reports[0] === newFailure};
			}
		} else if (mode.startsWith('console-')) {
			const messages: string[] = [];
			const consoles = [...new Set([console, window.console])];
			const originals = consoles.map((target) => target.error);
			consoles.forEach((target, index) => {
				target.error = (...args: unknown[]) => {
					messages.push(args.map(String).join(' '));
					originals[index].apply(target, args);
				};
			});
			try {
				const phase = mode.endsWith('layout') ? 'layout' : 'render';
				const initial = mode.includes('initial');
				const replacing = mode.includes('owner');
				const Thrower = ({fail}: {readonly fail: boolean}) => {
					const {cancelRender} = useDelayRender();
					React.useLayoutEffect(() => {
						if (fail && phase === 'layout') cancelRender(failure);
					}, [fail, cancelRender]);
					if (fail && phase === 'render') cancelRender(failure);
					return <div>healthy</div>;
				};

				const firstOwner = {};
				const secondOwner = {};
				const scene = (fail: boolean, owner: object) => (
					<ErrorBoundary
						onError={(error: Error) => reports.push(error)}
						renderingOwner={owner}
						errorFallback={fallback}
					>
						<Thrower fail={fail} />
					</ErrorBoundary>
				);
				const view = render(scene(initial, firstOwner));
				await act(flush);
				if (!initial) {
					view.rerender(scene(true, replacing ? secondOwner : firstOwner));
					await act(flush);
				}

				facts = {
					...facts,
					eventCount: reports.length,
					originalIdentity: reports[0] === failure,
					fallback: view.getByRole('alert').textContent,
					consoleMessages: messages,
					crossComponentUpdateWarnings: messages.filter((message) =>
						/Cannot update a component|while rendering a different component/.test(
							message,
						),
					),
				};
				if (
					reports.length !== 1 ||
					reports[0] !== failure ||
					(facts.crossComponentUpdateWarnings as string[]).length !== 0
				)
					throw new Error(
						'Cancellation changed owner delivery or emitted a render-update warning',
					);
			} finally {
				consoles.forEach((target, index) => {
					target.error = originals[index];
				});
			}
		} else {
			throw new Error('Unknown isolated test mode');
		}

		await act(flush);
		process.stdout.write(JSON.stringify(facts) + '\n');
	} finally {
		for (const item of pending) if (!item.done) item.resolve(false);
		cleanup();
		HTMLCanvasElement.prototype.getContext = originalContext;
		mock.restore();
		delete window.remotion_cancelledError;
		delete window.remotion_cancelledErrorObject;
	}
};

main().catch((error: unknown) => {
	process.stderr.write(String(error) + '\n');
	process.exitCode = 1;
});
