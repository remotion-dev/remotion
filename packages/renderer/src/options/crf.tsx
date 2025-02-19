import type {Crf} from '../crf';
import type {AnyRemotionOption} from './option';

let currentCrf: Crf;

export const validateCrf = (newCrf: Crf) => {
	if (typeof newCrf !== 'number' && newCrf !== undefined) {
		throw new TypeError('The CRF must be a number or undefined.');
	}
};

const cliFlag = 'crf' as const;

export const crfOption = {
	name: 'CRF',
	cliFlag,
	description: () => (
		<>
			No matter which codec you end up using, there&apos;s always a tradeoff
			between file size and video quality. You can control it by setting the CRF
			(Constant Rate Factor). The lower the number, the better the quality, the
			higher the number, the smaller the file is – of course at the cost of
			quality.
		</>
	),
	ssrName: 'crf',
	docLink:
		'https://www.remotion.dev/docs/encoding/#controlling-quality-using-the-crf-setting',
	type: 0 as number,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			validateCrf(commandLine[cliFlag] as number);
			return {
				source: 'cli',
				value: commandLine[cliFlag] as Crf,
			};
		}

		if (currentCrf !== null) {
			return {
				source: 'config',
				value: currentCrf,
			};
		}

		return {
			source: 'default',
			value: undefined,
		};
	},
	setConfig: (crf) => {
		validateCrf(crf);
		currentCrf = crf;
	},
} satisfies AnyRemotionOption<Crf>;
