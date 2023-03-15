import {BrowserSafeApis} from '@remotion/renderer/client';
import {NumberSetting} from './NumberSetting';

const MIN_QUALITY = 1;
const MAX_QUALITY = 100;

export const JpegQualitySetting: React.FC<{
	quality: number;
	setQuality: (value: React.SetStateAction<number>) => void;
}> = ({quality: scale, setQuality: setScale}) => {
	return (
		<NumberSetting
			min={MIN_QUALITY}
			max={MAX_QUALITY}
			step={1}
			name="JPEG Quality"
			onValueChanged={setScale}
			value={scale}
			hint={BrowserSafeApis.options.jpegQualityOption}
		/>
	);
};
