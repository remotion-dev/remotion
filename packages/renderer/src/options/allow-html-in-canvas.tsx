import type {AnyRemotionOption} from './option';

let allowHtmlInCanvasEnabled = false;

const cliFlag = 'allow-html-in-canvas' as const;

export const allowHtmlInCanvasOption = {
	name: 'Allow HTML-in-canvas for client-side rendering',
	cliFlag,
	description: () => (
		<>
			When client-side rendering is enabled in the Studio, allow the
			experimental Chromium HTML-in-canvas API to be used for capturing frames.
			See{' '}
			<a href="/docs/client-side-rendering/html-in-canvas">
				HTML-in-canvas docs
			</a>
			.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/client-side-rendering/html-in-canvas',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== null) {
			return {
				value: commandLine[cliFlag] as boolean,
				source: 'cli',
			};
		}

		return {
			value: allowHtmlInCanvasEnabled,
			source: 'config',
		};
	},
	setConfig(value) {
		allowHtmlInCanvasEnabled = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
