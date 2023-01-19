import type {Codec} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {useCallback, useState} from 'react';
import {InputDragger} from '../NewComposition/InputDragger';
import {label, optionRow, rightRow} from './layout';

type CrfState = Record<Codec, number>;

const getDefaultCrfState = () => {
	return BrowserSafeApis.validCodecs
		.map((c) => {
			return [c, BrowserSafeApis.getDefaultCrfForCodec(c)];
		})
		.reduce((acc, [codec, crf]) => {
			return {
				...acc,
				[codec]: crf,
			};
		}, {} as CrfState);
};

export const useCrfState = (codec: Codec) => {
	const [state, setState] = useState(() => getDefaultCrfState());
	const range = BrowserSafeApis.getValidCrfRanges(codec);

	return {
		crf: state[codec],
		setCrf: (updater: (prev: number) => number) => {
			setState((q) => {
				return {
					...q,
					[codec]: updater(q[codec]),
				};
			});
		},
		minCrf: range[0],
		maxCrf: range[1],
		shouldDisplayOption: range[0] !== range[1],
	};
};

export const CrfSetting: React.FC<{
	crf: number;
	setCrf: (value: (prevVal: number) => number) => void;
	min: number;
	max: number;
}> = ({crf, setCrf, min, max}) => {
	const onCrfSetDirectly = useCallback(
		(newCrf: number) => {
			setCrf(() => newCrf);
		},
		[setCrf]
	);

	const onCrfChanged = useCallback(
		(e: string) => {
			setCrf((q) => {
				const newCrf = parseFloat(e);
				if (Number.isNaN(newCrf)) {
					return q;
				}

				return Math.min(max, Math.max(newCrf, min));
			});
		},
		[max, min, setCrf]
	);

	return (
		<div style={optionRow}>
			<div style={label}>CRF</div>
			<div style={rightRow}>
				<InputDragger
					value={crf}
					onTextChange={onCrfChanged}
					placeholder={`${min}-${max}`}
					onValueChange={onCrfSetDirectly}
					name="crf"
					step={1}
					min={min}
					max={max}
				/>
			</div>
		</div>
	);
};
