import {NumberSetting} from './NumberSetting';

const MIN_JPEG_QUALITY = 1;
const MAX_JPEG_QUALITY = 100;

export const JpegQualitySetting: React.FC<{
	jpegQuality: number;
	setJpegQuality: (value: React.SetStateAction<number>) => void;
}> = ({jpegQuality, setJpegQuality}) => {
	return (
		<NumberSetting
			min={MIN_JPEG_QUALITY}
			max={MAX_JPEG_QUALITY}
			step={1}
			name="JPEG Quality"
			onValueChanged={setJpegQuality}
			value={jpegQuality}
			hint={'jpegQualityOption'}
		/>
	);
};
