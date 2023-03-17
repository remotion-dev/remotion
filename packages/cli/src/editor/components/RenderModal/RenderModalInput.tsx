import type {AudioCodec, Codec} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import React, {useMemo} from 'react';
import {RemotionInput} from '../NewComposition/RemInput';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import {label, optionRow, rightRow} from './layout';

export const RenderModalInput: React.FC<{
	existence: boolean;
	inputStyle: React.CSSProperties;
	outName: string;
	codec: Codec;
	audioCodec: AudioCodec;
	onValueChange: React.ChangeEventHandler<HTMLInputElement>;
}> = ({existence, inputStyle, outName, onValueChange, codec, audioCodec}) => {
	const checkInpuName = useMemo(() => {
		const extension = outName.substring(outName.lastIndexOf('.') + 1);
		const prefix = outName.substring(0, outName.lastIndexOf('.'));
		const invalidChars = ['?', '*', '+', '%'];

		const hasInvalidChar = () => {
			return prefix.split('').some((char) => invalidChars.includes(char));
		};

		console.log('extension: ' + extension);
		try {
			BrowserSafeApis.validateOutputFilename({
				codec,
				audioCodec: audioCodec ?? null,
				extension,
				preferLossless: false,
			});
		} catch (e) {
			console.log(e);
			const errorMessage = 'Invalid file extension';
			return <ValidationMessage align="flex-end" message={errorMessage} />;
		}

		if (existence) {
			return (
				<ValidationMessage align="flex-end" message="Will be overwritten" />
			);
		}

		if (prefix.length < 1) {
			return <ValidationMessage align="flex-end" message="Empty file name" />;
		}

		if (prefix[0] === '.') {
			return (
				<ValidationMessage
					align="flex-end"
					message="Filename starts with '.'"
				/>
			);
		}

		if (hasInvalidChar()) {
			return (
				<ValidationMessage
					align="flex-end"
					message="Filename can't contain the following characters:  ?, *, +, %"
				/>
			);
		}
	}, [audioCodec, codec, existence, outName]);

	return (
		<div style={optionRow}>
			<div style={label}>Output name</div>
			<div style={rightRow}>
				<div>
					<RemotionInput
						// TODO: Validate and reject folders or weird file names
						warning={existence}
						style={inputStyle}
						type="text"
						value={outName}
						onChange={onValueChange}
					/>
					{checkInpuName}
				</div>
			</div>
		</div>
	);
};
