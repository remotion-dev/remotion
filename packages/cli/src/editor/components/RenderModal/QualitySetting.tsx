import React, {useCallback} from 'react';
import {InputDragger} from '../NewComposition/InputDragger';
import {label, optionRow, rightRow} from './layout';

const MIN_QUALITY = 1;
const MAX_QUALITY = 100;

export const QualitySetting: React.FC<{
	quality: number;
	setQuality: React.Dispatch<React.SetStateAction<number>>;
}> = ({quality, setQuality}) => {
	const onQualityChangedDirectly = useCallback(
		(newQuality: number) => {
			setQuality(newQuality);
		},
		[setQuality]
	);

	const onQualityChanged = useCallback(
		(e: string) => {
			setQuality((q) => {
				const newQuality = parseInt(e, 10);
				if (Number.isNaN(newQuality)) {
					return q;
				}

				const newQualityClamped = Math.min(
					MAX_QUALITY,
					Math.max(newQuality, MIN_QUALITY)
				);
				return newQualityClamped;
			});
		},
		[setQuality]
	);

	return (
		<div style={optionRow}>
			<div style={label}>JPEG Quality</div>
			<div style={rightRow}>
				<InputDragger
					value={quality}
					onTextChange={onQualityChanged}
					placeholder={`${MIN_QUALITY}-${MAX_QUALITY}`}
					onValueChange={onQualityChangedDirectly}
					name="quality"
					step={1}
					min={MIN_QUALITY}
					max={MAX_QUALITY}
				/>
			</div>
		</div>
	);
};
