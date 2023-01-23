import {NumberSetting} from './NumberSetting';

const MIN_SCALE = 0.1;
const MAX_SCALE = 10;

export const ScaleSetting: React.FC<{
	scale: number;
	setScale: (value: React.SetStateAction<number>) => void;
}> = ({scale, setScale}) => {
	return (
		<NumberSetting
			min={MIN_SCALE}
			max={MAX_SCALE}
			step={0.1}
			name="Scale"
			onValueChanged={setScale}
			value={scale}
		/>
	);
};
