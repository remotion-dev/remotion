import type {AnyRemotionOption} from './option';

let disableSharedMemoryCapture = false;

const cliFlag = 'disable-shared-memory-capture' as const;

export const disableSharedMemoryCaptureOption = {
	name: 'Disable shared-memory capture',
	addedIn: '4.0.534',
	cliFlag,
	description: () => (
		<>
			Disables shared-memory capture and uses regular JPEG or PNG screenshots
			instead. Parallel encoding remains enabled. Default <code>false</code>.
		</>
	),
	ssrName: 'disableSharedMemoryCapture',
	docLink:
		'https://www.remotion.dev/docs/options/disable-shared-memory-capture',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined && commandLine[cliFlag] !== null) {
			return {value: commandLine[cliFlag] as boolean, source: 'cli'};
		}

		if (disableSharedMemoryCapture !== false) {
			return {value: disableSharedMemoryCapture, source: 'config'};
		}

		return {value: false, source: 'default'};
	},
	setConfig(value) {
		disableSharedMemoryCapture = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
