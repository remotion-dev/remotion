import {useCallback} from 'react';
import {InputDragger} from '../NewComposition/InputDragger';
import {RightAlignInput} from '../NewComposition/RemInput';
import {label, optionRow, rightRow} from './layout';

const MIN_SCALE = 0.1;
const MAX_SCALE = 10;

export const ScaleSetting: React.FC<{
	scale: number;
	setScale: (value: React.SetStateAction<number>) => void;
}> = ({scale, setScale}) => {
	const onScaleSetDirectly = useCallback(
		(newScale: number) => {
			setScale(newScale);
		},
		[setScale]
	);

	const onScaleChanged = useCallback(
		(e: string) => {
			setScale((q) => {
				const newScale = parseFloat(e);
				if (Number.isNaN(newScale)) {
					return q;
				}

				const newScaleClamped = Math.min(
					MAX_SCALE,
					Math.max(newScale, MIN_SCALE)
				);
				return newScaleClamped;
			});
		},
		[setScale]
	);

	return (
		<div style={optionRow}>
			<div style={label}>Scale</div>
			<div style={rightRow}>
				<RightAlignInput>
					<InputDragger
						value={scale}
						onTextChange={onScaleChanged}
						placeholder={`${MIN_SCALE}-${MAX_SCALE}`}
						onValueChange={onScaleSetDirectly}
						name="scale"
						step={0.1}
						min={MIN_SCALE}
						max={MAX_SCALE}
					/>
				</RightAlignInput>
			</div>
		</div>
	);
};
