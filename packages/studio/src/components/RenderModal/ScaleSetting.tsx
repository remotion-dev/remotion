import React, {useMemo} from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';
import {NumberSetting} from './NumberSetting';

const MIN_SCALE = 0.1;
const MAX_SCALE = 10;

const outputDimensionsStyle: React.CSSProperties = {
	fontSize: 13,
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	paddingRight: 16,
	textAlign: 'right',
	marginBottom: 14,
	marginTop: -10,
};

export const ScaleSetting: React.FC<{
	readonly scale: number;
	readonly setScale: (value: React.SetStateAction<number>) => void;
	readonly compositionWidth: number;
	readonly compositionHeight: number;
}> = ({scale, setScale, compositionWidth, compositionHeight}) => {
	const outputDimensions = useMemo(() => {
		const outputWidth = Math.round(compositionWidth * scale);
		const outputHeight = Math.round(compositionHeight * scale);
		return `${outputWidth}×${outputHeight}`;
	}, [compositionWidth, compositionHeight, scale]);

	return (
		<>
			<NumberSetting
				min={MIN_SCALE}
				max={MAX_SCALE}
				step={0.1}
				name="Scale"
				formatter={(w) => {
					if (typeof w === 'number') {
						return `${w.toFixed(1)}x`;
					}

					return `${w}x`;
				}}
				onValueChanged={setScale}
				value={scale}
				hint={'scaleOption'}
			/>
			{scale !== 1 && (
				<div style={outputDimensionsStyle}>
					Output resolution: {outputDimensions}
				</div>
			)}
		</>
	);
};
