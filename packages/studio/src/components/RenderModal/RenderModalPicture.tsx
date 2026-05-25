import type {StillImageFormat, VideoImageFormat} from '@remotion/renderer';
import React from 'react';
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
	setJpegQuality,
	jpegQuality,
	stillImageFormat,
	compositionWidth,
	compositionHeight,
}) => {
	return (
		<div style={container} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			{renderMode === 'video' ? (
				<div style={optionRow}>
					<div style={label}>Image Format</div>
					<div style={rightRow}>
						<SegmentedControl
							items={imageFormatOptions}
							needsWrapping={false}
						/>
					</div>
				</div>
			) : null}
			{renderMode === 'video' && videoImageFormat === 'jpeg' ? (
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
