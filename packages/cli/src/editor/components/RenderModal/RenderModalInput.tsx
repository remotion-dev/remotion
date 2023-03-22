import type {AudioCodec, Codec, StillImageFormat} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import React, {useMemo} from 'react';
import {RemotionInput} from '../NewComposition/RemInput';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import {label, optionRow, rightRow} from './layout';
import type {RenderType} from './RenderModalAdvanced';

type Props<T extends Codec> = {
	existence: boolean;
	inputStyle: React.CSSProperties;
	outName: string;
	codec: T;
	audioCodec: AudioCodec;
	onValueChange: React.ChangeEventHandler<HTMLInputElement>;
	renderDisabled: boolean;
	renderMode: RenderType;
	stillImageFormat: StillImageFormat;
};

// eslint-disable-next-line react/function-component-definition
export function RenderModalInput<T extends Codec>({
	existence,
	inputStyle,
	outName,
	onValueChange,
	codec,
	audioCodec,
	renderDisabled,
	renderMode,
	stillImageFormat,
}: Props<T>) {
	const checkOutputName = useMemo(() => {
		const extension = outName.substring(outName.lastIndexOf('.') + 1);
		const prefix = outName.substring(0, outName.lastIndexOf('.'));
		const invalidChars = ['?', '*', '+', '%'];

		const map = BrowserSafeApis.defaultFileExtensionMap[codec];

		const hasInvalidChar = () => {
			return prefix.split('').some((char) => invalidChars.includes(char));
		};

		if (renderMode === 'video') {
			if (!(audioCodec in map.forAudioCodec)) {
				throw new Error(
					`Audio codec ${audioCodec} is not supported for codec ${codec}`
				);
			}

			const acceptableExtensions =
				map.forAudioCodec[audioCodec as keyof typeof map.forAudioCodec]
					.possible;

			try {
				BrowserSafeApis.validateOutputFilename({
					codec,
					audioCodec: audioCodec ?? null,
					extension,
					preferLossless: false,
				});
			} catch (e) {
				const errorMessage =
					'Invalid file extension. Valid extensions are: ' +
					acceptableExtensions;
				return (
					<ValidationMessage
						align="flex-end"
						message={errorMessage}
						type={'error'}
					/>
				);
			}
		}

		if (renderMode === 'audio') {
			if (audioCodec === 'pcm-16') {
				if (extension !== 'wav' && extension !== 'wave')
					return (
						<ValidationMessage
							align="flex-end"
							message={'Extension has to be .wav or .wave'}
							type={'error'}
						/>
					);
			} else if (extension !== audioCodec) {
				return (
					<ValidationMessage
						align="flex-end"
						message={'Extension has to be .' + audioCodec}
						type={'error'}
					/>
				);
			}
		}

		if (renderMode === 'still') {
			if (stillImageFormat === 'jpeg') {
				if (extension !== 'jpeg' && extension !== 'jpg') {
					return (
						<ValidationMessage
							align="flex-end"
							message={'Extension has to be .jpeg or .jpg'}
							type={'error'}
						/>
					);
				}
			} else if (extension !== stillImageFormat) {
				return (
					<ValidationMessage
						align="flex-end"
						message={'Extension has to be .' + stillImageFormat}
						type={'error'}
					/>
				);
			}
		}

		if (existence) {
			return (
				<ValidationMessage
					align="flex-end"
					message="Will be overwritten"
					type={'warning'}
				/>
			);
		}

		if (prefix.length < 1) {
			return (
				<ValidationMessage
					align="flex-end"
					message="Filename can't be empty"
					type={'error'}
				/>
			);
		}

		if (prefix[0] === '.') {
			return (
				<ValidationMessage
					align="flex-end"
					message="Filename can't start with '.'"
					type={'error'}
				/>
			);
		}

		if (hasInvalidChar()) {
			return (
				<ValidationMessage
					align="flex-end"
					message="Filename can't contain the following characters:  ?, *, +, %"
					type={'error'}
				/>
			);
		}
	}, [audioCodec, codec, existence, outName, renderMode, stillImageFormat]);

	return (
		<div style={optionRow}>
			<div style={label}>Output name</div>
			<div style={rightRow}>
				<div>
					<RemotionInput
						// TODO: Validate and reject folders or weird file names
						warning={existence}
						disabled={renderDisabled}
						style={inputStyle}
						type="text"
						value={outName}
						onChange={onValueChange}
					/>
					{checkOutputName}
				</div>
			</div>
		</div>
	);
}
