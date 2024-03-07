import React, {useCallback} from 'react';
import {useFileExistence} from '../../helpers/use-file-existence';
import {input} from './layout';
import {RenderModalOutputName} from './RenderModalOutputName';

export const SeparateAudioOption: React.FC<{
	setSeparateAudioTo: React.Dispatch<React.SetStateAction<string | null>>;
	separateAudioTo: string;
}> = ({separateAudioTo, setSeparateAudioTo}) => {
	const existence = useFileExistence(separateAudioTo);

	const onValueChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setSeparateAudioTo(e.target.value);
		},
		[setSeparateAudioTo],
	);

	return (
		<RenderModalOutputName
			existence={existence}
			inputStyle={input}
			onValueChange={onValueChange}
			outName={separateAudioTo}
			// TODO
			renderType="video"
			// TODO
			validationMessage={'hi there'}
		/>
	);
};
