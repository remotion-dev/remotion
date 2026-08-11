import type {Codec} from '@remotion/renderer';
import type {AvailableOptions} from '@remotion/renderer/client';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {useState} from 'react';
import {NumberSetting} from './NumberSetting';

type CrfState = Record<Codec, number | null>;

const getDefaultCrfState = () => {
	return BrowserSafeApis.validCodecs
		.map((c) => {
			return [c, BrowserSafeApis.getDefaultCrfForCodec(c)];
		})
		.reduce((acc, [codec, crf]) => {
			return {
				...acc,
				[codec as Codec]: crf,
			};
		}, {} as CrfState);
};

export const useCrfState = (codec: Codec) => {
	const [state, setState] = useState(() => getDefaultCrfState());
	const range = BrowserSafeApis.getValidCrfRanges(codec);

	const setCrf: React.Dispatch<React.SetStateAction<number>> = (updater) => {
		setState((q) => {
			const val = q[codec];
			if (val === null) {
				throw new TypeError(`Got unexpected codec "${codec}"`);
			}

			return {
				...q,
				[codec]: typeof updater === 'number' ? updater : updater(val),
			};
		});
	};

	return {
		crf: state[codec],
		setCrf,
		minCrf: range[0],
		maxCrf: range[1],
	};
};

export const CrfSetting: React.FC<{
	crf: number;
	setCrf: React.Dispatch<React.SetStateAction<number>>;
	min: number;
	max: number;
	option: AvailableOptions;
}> = ({crf, setCrf, min, max, option}) => {
	return (
		<NumberSetting
			min={min}
			max={max}
			name="CRF"
			onValueChanged={setCrf}
			value={crf}
			step={1}
			hint={option}
		/>
	);
};
