import {DEFAULT_TIMEOUT} from '../browser/TimeoutSettings';
import type {AnyRemotionOption} from './option';

let currentTimeout: number = DEFAULT_TIMEOUT;

const validate = (value: unknown) => {
	if (typeof value !== 'number') {
		throw new Error(
			'--timeout flag / setDelayRenderTimeoutInMilliseconds() must be a number, but got ' +
				JSON.stringify(value),
		);
	}
};

const cliFlag = 'timeout' as const;

export const delayRenderTimeoutInMillisecondsOption = {
	name: 'delayRender() timeout',
	cliFlag,
	description: () => (
		<>
			A number describing how long the render may take to resolve all{' '}
			<a href="https://remotion.dev/docs/delay-render">
				<code>delayRender()</code>
			</a>{' '}
			calls <a href="https://remotion.dev/docs/timeout">before it times out</a>.
			Default: <code>30000</code>
		</>
	),
	ssrName: 'timeoutInMilliseconds' as const,
	docLink: 'https://www.remotion.dev/docs/timeout',
	type: 0 as number,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as number,
			};
		}

		if (currentTimeout !== null) {
			validate(currentTimeout);
			return {
				source: 'config',
				value: currentTimeout,
			};
		}

		return {
			source: 'default',
			value: DEFAULT_TIMEOUT,
		};
	},
	setConfig: (value: number) => {
		validate(value);
		currentTimeout = value;
	},
} satisfies AnyRemotionOption<number>;
