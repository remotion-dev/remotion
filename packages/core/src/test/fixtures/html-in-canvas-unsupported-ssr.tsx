import {GlobalRegistrator} from '@happy-dom/global-registrator';
import {renderToString} from 'react-dom/server';
import type {DelayRenderScope} from '../../delay-render.js';
import {HtmlInCanvas} from '../../HtmlInCanvas.js';
import {Internals} from '../../internals.js';
import {WrapSequenceContext} from '../wrap-sequence-context.js';

GlobalRegistrator.register({url: 'http://localhost:3000'});
Object.defineProperty(globalThis, 'document', {
	configurable: true,
	value: undefined,
});

const hasOwner = process.argv[2] === 'owner';
const scope: DelayRenderScope = {
	remotion_renderReady: true,
	remotion_delayRenderHandles: [],
	remotion_delayRenderTimeouts: {},
	remotion_puppeteerTimeout: 30000,
	remotion_attempt: 1,
};
const reported: Error[] = [];
let caught: unknown = null;
try {
	renderToString(
		<Internals.DelayRenderContextType.Provider value={scope}>
			<Internals.CancelRenderContext.Provider
				value={hasOwner ? (error) => reported.push(error) : null}
			>
				<WrapSequenceContext>
					<HtmlInCanvas width={50} height={50}>
						<div>unsupported</div>
					</HtmlInCanvas>
				</WrapSequenceContext>
			</Internals.CancelRenderContext.Provider>
		</Internals.DelayRenderContextType.Provider>,
	);
} catch (error) {
	caught = error;
}

const failure = caught as Error | null;
process.stdout.write(
	JSON.stringify({
		isError: caught instanceof Error,
		message: failure?.message ?? null,
		reportedMatches: hasOwner
			? reported.length === 1 && reported[0] === caught
			: reported.length === 0,
		scopeErrorMatches: hasOwner
			? scope.remotion_cancelledErrorObject === undefined
			: scope.remotion_cancelledErrorObject === caught,
		scopeStackMatches: hasOwner
			? scope.remotion_cancelledError === undefined
			: scope.remotion_cancelledError?.includes(failure?.message ?? '') ===
				true,
		handles: scope.remotion_delayRenderHandles,
	}),
);
