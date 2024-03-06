import path from 'node:path/win32';
import type {AnyRemotionOption} from './option';

const DEFAULT = null;

let separateAudioTo: string | null = null;

const cliFlag = '--separate-audio-to';

export const separateAudioOption = {
	cliFlag,
	description: () => {
		return (
			<>
				If set, the audio will not be included in the main output but rendered
				as a separate file at the location you pass. The path is relative to the
				current working directory of the Remotion Root, or in the case of using
				the server-side rendering APIs, relative to the current working
				directory. It is recommended to use an absolute path.
			</>
		);
	},
	docLink: 'https://remotion.dev/docs/renderer/render-media',
	getValue: ({commandLine}, remotionRoot: string) => {
		if (commandLine[cliFlag]) {
			return {
				source: 'cli',
				value: path.resolve(commandLine[cliFlag] as string, remotionRoot),
			};
		}

		if (separateAudioTo !== DEFAULT) {
			return {
				source: 'config',
				value: path.resolve(separateAudioTo, remotionRoot),
			};
		}

		return {
			source: 'default',
			value: DEFAULT,
		};
	},
	name: 'Separate audio to',
	setConfig: (value) => {
		separateAudioTo = value;
	},
	ssrName: 'separateAudioTo',
	type: 'string' as string | null,
} satisfies AnyRemotionOption<string | null>;
