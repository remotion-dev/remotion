import type {ChangeEvent} from 'react';
import React, {useCallback} from 'react';
import {useFileExistence} from '../../helpers/use-file-existence';
import {Checkbox} from '../Checkbox';
import {Spacing} from '../layout';
import {input, label, optionRow, rightRow} from './layout';
import {OptionExplainerBubble} from './OptionExplainerBubble';
import {RenderModalOutputName} from './RenderModalOutputName';

export const SeparateAudioOptionInput: React.FC<{
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
			label={'Separate audio to'}
			// TODO
			validationMessage={'hi there'}
		/>
	);
};

export const SeparateAudioOption: React.FC<{
	setSeparateAudioTo: React.Dispatch<React.SetStateAction<string | null>>;
	separateAudioTo: string | null;
}> = ({separateAudioTo, setSeparateAudioTo}) => {
	const onSeparateAudioChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			if (e.target.checked) {
				setSeparateAudioTo(String(e.target.checked));
			} else {
				setSeparateAudioTo(null);
			}
		},
		[setSeparateAudioTo],
	);
	return (
		<>
			<div style={optionRow}>
				<div style={label}>
					Separate audio
					<Spacing x={0.5} />
					<OptionExplainerBubble id="separateAudioOption" />
				</div>
				<div style={rightRow}>
					<Checkbox
						disabled={false}
						checked={Boolean(separateAudioTo)}
						onChange={onSeparateAudioChange}
						name="separate-audio-to"
					/>
				</div>
			</div>

			{separateAudioTo === null ? null : (
				<SeparateAudioOptionInput
					separateAudioTo={separateAudioTo}
					setSeparateAudioTo={setSeparateAudioTo}
				/>
			)}
		</>
	);
};
