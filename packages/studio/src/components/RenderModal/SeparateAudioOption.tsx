import type {AudioCodec} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {ChangeEvent} from 'react';
import React, {useCallback, useMemo} from 'react';
import {useFileExistence} from '../../helpers/use-file-existence';
import {Checkbox} from '../Checkbox';
import {Spacing} from '../layout';
import {OptionExplainerBubble} from './OptionExplainerBubble';
import {RenderModalOutputName} from './RenderModalOutputName';
import {getStringBeforeSuffix} from './get-string-before-suffix';
import {input, label, optionRow, rightRow} from './layout';

export const SeparateAudioOptionInput: React.FC<{
	readonly setSeparateAudioTo: React.Dispatch<
		React.SetStateAction<string | null>
	>;
	readonly separateAudioTo: string;
	readonly audioCodec: AudioCodec;
}> = ({separateAudioTo, setSeparateAudioTo, audioCodec}) => {
	const existence = useFileExistence(separateAudioTo);

	const onValueChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setSeparateAudioTo(e.target.value);
		},
		[setSeparateAudioTo],
	);

	const validationMessage = useMemo(() => {
		const expectedExtension =
			BrowserSafeApis.getExtensionFromAudioCodec(audioCodec);
		const actualExtension = separateAudioTo.split('.').pop();
		if (actualExtension !== expectedExtension) {
			return `Expected extension: .${expectedExtension}`;
		}

		return null;
	}, [audioCodec, separateAudioTo]);

	return (
		<RenderModalOutputName
			existence={existence}
			inputStyle={input}
			onValueChange={onValueChange}
			outName={separateAudioTo}
			label={'Separate audio to'}
			validationMessage={validationMessage}
		/>
	);
};

export const SeparateAudioOption: React.FC<{
	readonly setSeparateAudioTo: React.Dispatch<
		React.SetStateAction<string | null>
	>;
	readonly separateAudioTo: string | null;
	readonly audioCodec: AudioCodec;
	readonly outName: string;
}> = ({separateAudioTo, setSeparateAudioTo, audioCodec, outName}) => {
	const onSeparateAudioChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			if (e.target.checked) {
				const extension =
					BrowserSafeApis.getExtensionFromAudioCodec(audioCodec);
				setSeparateAudioTo(`${getStringBeforeSuffix(outName)}.${extension}`);
			} else {
				setSeparateAudioTo(null);
			}
		},
		[audioCodec, outName, setSeparateAudioTo],
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
					audioCodec={audioCodec}
				/>
			)}
		</>
	);
};
