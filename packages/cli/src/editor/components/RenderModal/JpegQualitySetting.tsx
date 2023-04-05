import {BrowserSafeApis} from '@remotion/renderer/client';
import {NumberSetting} from './NumberSetting';

const MIN_JPEG_QUALITY = 1;
const MAX_JPEG_QUALITY = 100;

export const JpegQualitySetting: React.FC<{
	quality: number;
	setQuality: (value: React.SetStateAction<number>) => void;
}> = ({quality: scale, setQuality: setScale}) => {
	return (
		<NumberSetting
			min={MIN_JPEG_QUALITY}
			max={MAX_JPEG_QUALITY}
			step={1}
			name="JPEG Quality"
			onValueChanged={setScale}
			value={scale}
			hint={BrowserSafeApis.options.jpegQualityOption}
		/>
	);
};
