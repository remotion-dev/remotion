import type {AnyRemotionOption} from './option';

let studioCanvasCaptureEnabled = false;

const cliFlag = 'studio-canvas-capture' as const;

export const studioCanvasCaptureOption = {
	name: 'Studio canvas capture',
	cliFlag,
	description: () => (
		<>
			Wrap the Remotion Studio in an experimental HTML-in-canvas surface. Press{' '}
			<code>Cmd/Ctrl + P</code> in the Studio to start or stop a 6x WebM
			recording. A sidecar JSON file containing mouse movements and cursor
			styles is downloaded with the video. The browser&apos;s HTML-in-canvas API
			must already be available.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/config#setstudiocanvascaptureenabled',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== null) {
			return {
				value: commandLine[cliFlag] as boolean,
				source: 'cli',
			};
		}

		return {
			value: studioCanvasCaptureEnabled,
			source: 'config',
		};
	},
	setConfig(value) {
		studioCanvasCaptureEnabled = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
