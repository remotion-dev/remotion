import type {Codec, ProResProfile} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import React, {useCallback, useMemo} from 'react';
import type {TCompMetadata} from 'remotion';
import type {AnyZodObject} from 'zod';
import {labelProResProfile} from '../../helpers/prores-labels';
import {useFileExistence} from '../../helpers/use-file-existence';
import {Checkmark} from '../../icons/Checkmark';
import {Spacing} from '../layout';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {InputDragger} from '../NewComposition/InputDragger';
import {RightAlignInput} from '../NewComposition/RemInput';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {FrameRangeSetting} from './FrameRangeSetting';
import {humanReadableCodec} from './human-readable-codec';
import {InfoBubble} from './InfoBubble';
import {input, label, optionRow, rightRow} from './layout';
import {OptionExplainer} from './OptionExplainer';
import type {RenderType} from './RenderModalAdvanced';
import {RenderModalInput} from './RenderModalInput';

const container: React.CSSProperties = {
	flex: 1,
};

export const RenderModalBasic: React.FC<{
	renderMode: RenderType;
	imageFormatOptions: SegmentedControlItem[];
	codec: Codec;
	setVideoCodec: (newCodec: Codec) => void;
	outName: string;
	proResProfile: ProResProfile | null;
	setProResProfile: React.Dispatch<React.SetStateAction<ProResProfile>>;
	frame: number;
	setFrame: React.Dispatch<React.SetStateAction<number>>;
	resolvedComposition: TCompMetadata<
		AnyZodObject,
		Record<string, unknown> | undefined
	>;
	setOutName: (value: React.SetStateAction<string>) => void;
	setEndFrame: React.Dispatch<React.SetStateAction<number | null>>;
	startFrame: number;
	endFrame: number;
	setStartFrame: React.Dispatch<React.SetStateAction<number | null>>;
	validationMessage: string | null;
}> = ({
	renderMode,
	imageFormatOptions,
	outName,
	codec,
	setVideoCodec: setCodec,
	proResProfile,
	setProResProfile,
	frame,
	setFrame,
	resolvedComposition,
	setOutName,
	setEndFrame,
	endFrame,
	setStartFrame,
	startFrame,
	validationMessage,
}) => {
	const existence = useFileExistence(outName);
	const videoCodecOptions = useMemo((): ComboboxValue[] => {
		return BrowserSafeApis.validCodecs
			.filter((c) => {
				return BrowserSafeApis.isAudioCodec(c) === (renderMode === 'audio');
			})
			.map((codecOption) => {
				return {
					label: humanReadableCodec(codecOption),
					onClick: () => setCodec(codecOption),
					key: codecOption,
					leftItem: codec === codecOption ? <Checkmark /> : null,
					id: codecOption,
					keyHint: null,
					quickSwitcherLabel: null,
					subMenu: null,
					type: 'item',
					value: codecOption,
				};
			});
	}, [renderMode, setCodec, codec]);

	const proResProfileOptions = useMemo((): ComboboxValue[] => {
		return BrowserSafeApis.proResProfileOptions.map((option) => {
			return {
				label: labelProResProfile(option),
				onClick: () => setProResProfile(option),
				key: option,
				selected: proResProfile === option,
				type: 'item',
				id: option,
				keyHint: null,
				leftItem: null,
				quickSwitcherLabel: null,
				subMenu: null,
				value: option,
			};
		});
	}, [proResProfile, setProResProfile]);

	const onFrameSetDirectly = useCallback(
		(newFrame: number) => {
			setFrame(newFrame);
		},
		[setFrame]
	);

	const onFrameChanged = useCallback(
		(e: string) => {
			setFrame((q) => {
				const newFrame = parseFloat(e);
				if (Number.isNaN(newFrame)) {
					return q;
				}

				return newFrame;
			});
		},
		[setFrame]
	);

	const onValueChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setOutName(e.target.value);
		},
		[setOutName]
	);

	return (
		<div style={container}>
			{renderMode === 'still' ? (
				<div style={optionRow}>
					<div style={label}>Format</div>
					<div style={rightRow}>
						<SegmentedControl items={imageFormatOptions} needsWrapping />
					</div>
				</div>
			) : (
				<div style={optionRow}>
					<div style={label}>
						Codec
						<Spacing x={0.5} />
						<InfoBubble title="Learn more about this option">
							<OptionExplainer
								option={BrowserSafeApis.options.videoCodecOption}
							/>
						</InfoBubble>
					</div>

					<div style={rightRow}>
						<Combobox
							values={videoCodecOptions}
							selectedId={codec}
							title="Codec"
						/>
					</div>
				</div>
			)}
			{renderMode === 'still' && resolvedComposition.durationInFrames > 1 ? (
				<div style={optionRow}>
					<div style={label}>Frame</div>
					<div style={rightRow}>
						<RightAlignInput>
							<InputDragger
								value={frame}
								onTextChange={onFrameChanged}
								placeholder={`0-${resolvedComposition.durationInFrames - 1}`}
								onValueChange={onFrameSetDirectly}
								name="frame"
								step={1}
								min={0}
								status="ok"
								max={resolvedComposition.durationInFrames - 1}
								rightAlign
							/>
						</RightAlignInput>
					</div>
				</div>
			) : null}
			{renderMode === 'video' && codec === 'prores' ? (
				<div style={optionRow}>
					<div style={label}>ProRes profile</div>
					<div style={rightRow}>
						<Combobox
							title={proResProfile as string}
							selectedId={proResProfile as string}
							values={proResProfileOptions}
						/>
					</div>
				</div>
			) : null}
			{renderMode === 'still' ? null : (
				<FrameRangeSetting
					durationInFrames={resolvedComposition.durationInFrames}
					endFrame={endFrame}
					setEndFrame={setEndFrame}
					setStartFrame={setStartFrame}
					startFrame={startFrame}
				/>
			)}
			<RenderModalInput
				existence={existence}
				inputStyle={input}
				outName={outName}
				onValueChange={onValueChange}
				validationMessage={validationMessage}
			/>
		</div>
	);
};
