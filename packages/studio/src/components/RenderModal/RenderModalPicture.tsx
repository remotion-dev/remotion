import type {StillImageFormat, VideoImageFormat} from '@remotion/renderer';
import React, {useCallback} from 'react';
import {Checkbox} from '../Checkbox';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {JpegQualitySetting} from './JpegQualitySetting';
import {label, optionRow, rightRow} from './layout';
import type {RenderType} from './RenderModalAdvanced';
import {RenderModalHr} from './RenderModalHr';
import {ScaleSetting} from './ScaleSetting';

const container: React.CSSProperties = {
	flex: 1,
	overflowY: 'auto',
};

export const RenderModalPicture: React.FC<{
	readonly renderMode: RenderType;
	readonly scale: number;
	readonly setScale: React.Dispatch<React.SetStateAction<number>>;
	readonly imageFormatOptions: SegmentedControlItem[];
	readonly videoImageFormat: VideoImageFormat;
	readonly setVideoImageFormat: React.Dispatch<
		React.SetStateAction<VideoImageFormat>
	>;
	readonly usesSharedMemoryCapture: boolean;
	readonly stillImageFormat: StillImageFormat;
	readonly setJpegQuality: React.Dispatch<React.SetStateAction<number>>;
	readonly jpegQuality: number;
	readonly compositionWidth: number;
	readonly compositionHeight: number;
}> = ({
	renderMode,
	scale,
	setScale,
	imageFormatOptions,
	videoImageFormat,
	setVideoImageFormat,
	usesSharedMemoryCapture,
	setJpegQuality,
	jpegQuality,
	stillImageFormat,
	compositionWidth,
	compositionHeight,
}) => {
	const onTransparentBackgroundChanged = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setVideoImageFormat(event.target.checked ? 'png' : 'jpeg');
		},
		[setVideoImageFormat],
	);

	return (
		<div style={container} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			{renderMode === 'video' ? (
				<div style={optionRow}>
					{usesSharedMemoryCapture ? (
						<label style={label} htmlFor="transparent-background">
							Transparent background
						</label>
					) : (
						<div style={label}>Image Format</div>
					)}
					<div style={rightRow}>
						{usesSharedMemoryCapture ? (
							<Checkbox
								checked={videoImageFormat === 'png'}
								onChange={onTransparentBackgroundChanged}
								name="transparent-background"
								inputId="transparent-background"
							/>
						) : (
							<SegmentedControl
								items={imageFormatOptions}
								needsWrapping={false}
							/>
						)}
					</div>
				</div>
			) : null}
			{renderMode === 'video' &&
			!usesSharedMemoryCapture &&
			videoImageFormat === 'jpeg' ? (
				<JpegQualitySetting
					jpegQuality={jpegQuality}
					setJpegQuality={setJpegQuality}
				/>
			) : null}
			{renderMode === 'still' && stillImageFormat === 'jpeg' ? (
				<JpegQualitySetting
					jpegQuality={jpegQuality}
					setJpegQuality={setJpegQuality}
				/>
			) : null}
			{renderMode === 'video' ? <RenderModalHr /> : null}
			<ScaleSetting
				scale={scale}
				setScale={setScale}
				compositionWidth={compositionWidth}
				compositionHeight={compositionHeight}
			/>
		</div>
	);
};
