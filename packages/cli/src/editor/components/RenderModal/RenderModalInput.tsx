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
			return (
				<ValidationMessage align="flex-end" message="Invalid file extension" />
			);
		}

		if (existence) {
			return (
				<ValidationMessage align="flex-end" message="Will be overwritten" />
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
