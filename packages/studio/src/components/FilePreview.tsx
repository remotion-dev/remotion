import {formatBytes} from '@remotion/studio-shared';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {LIGHT_TEXT, WHITE} from '../helpers/colors';
import type {AssetMetadata} from '../helpers/get-asset-metadata';
import type {AssetFileType} from '../helpers/get-preview-file-type';
import {
	registerRenderOutputPlayback,
	type RenderOutputPlaybackContent,
} from '../helpers/render-output-playback';
import {JSONViewer} from './JSONViewer';
import {Spacing} from './layout';
import {LutPreview} from './LutPreview';
import {RenderOutputKeyboardShortcuts} from './RenderOutputKeyboardShortcuts';
import {TextViewer} from './TextViewer';

const msgStyle: React.CSSProperties = {
	fontSize: 13,
	color: WHITE,
	fontFamily: 'sans-serif',
	display: 'flex',
	justifyContent: 'center',
};

const fontPreviewContainerStyle: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	justifyContent: 'center',
	overflow: 'hidden',
	padding: 40,
	textAlign: 'center',
};

const fontPreviewLargeTextStyle: React.CSSProperties = {
	color: WHITE,
	fontSize: 'clamp(80px, 18vh, 180px)',
	lineHeight: 1,
};

const fontPreviewTextStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 'clamp(18px, 4vh, 40px)',
	lineHeight: 1.35,
	marginTop: 32,
	wordBreak: 'break-word',
};

let fontPreviewId = 0;

const FontPreview: React.FC<{
	readonly src: string;
}> = ({src}) => {
	const [fontFamily] = useState(() => {
		fontPreviewId++;
		return `RemotionStudioFontPreview${fontPreviewId}`;
	});
	const [fontLoaded, setFontLoaded] = useState(false);
	const [fontLoadFailed, setFontLoadFailed] = useState(false);

	useEffect(() => {
		let cancelled = false;
		const fontFace = new FontFace(fontFamily, `url(${JSON.stringify(src)})`);
		setFontLoaded(false);
		setFontLoadFailed(false);

		fontFace
			.load()
			.then((loadedFontFace) => {
				if (cancelled) {
					return;
				}

				document.fonts.add(loadedFontFace);
				setFontLoaded(true);
			})
			.catch(() => {
				if (!cancelled) {
					setFontLoadFailed(true);
				}
			});

		return () => {
			cancelled = true;
			document.fonts.delete(fontFace);
		};
	}, [fontFamily, src]);

	if (fontLoadFailed) {
		return <div style={msgStyle}>Could not preview font</div>;
	}

	if (!fontLoaded) {
		return <div style={msgStyle}>Loading font preview...</div>;
	}

	return (
		<div style={{...fontPreviewContainerStyle, fontFamily}}>
			<div style={fontPreviewLargeTextStyle}>Aa</div>
			<div style={fontPreviewTextStyle}>
				ABCDEFGHIJKLMNOPQRSTUVWXYZ
				<br />
				abcdefghijklmnopqrstuvwxyz
				<br />
				0123456789
			</div>
		</div>
	);
};

type OutputPlayback = {
	content: RenderOutputPlaybackContent;
	fps: number | null;
};

const NativeMediaPreview: React.FC<{
	readonly src: string;
	readonly fileType: 'audio' | 'video';
	readonly outputPlayback: OutputPlayback | null;
}> = ({src, fileType, outputPlayback}) => {
	const ref = useRef<HTMLMediaElement | null>(null);
	const fpsRef = useRef(outputPlayback?.fps ?? null);
	fpsRef.current = outputPlayback?.fps ?? null;
	const content = outputPlayback?.content ?? null;
	useLayoutEffect(() => {
		if (content === null || ref.current === null) return;
		return registerRenderOutputPlayback({
			content,
			element: ref.current,
			getFps: () => fpsRef.current,
		});
	}, [content, fileType, src]);
	return (
		<>
			{content === null ? null : <RenderOutputKeyboardShortcuts />}
			{fileType === 'audio' ? (
				<audio
					ref={ref as React.RefObject<HTMLAudioElement>}
					src={src}
					controls
				/>
			) : (
				<video
					ref={ref as React.RefObject<HTMLVideoElement>}
					src={src}
					controls
				/>
			)}
		</>
	);
};

export const FilePreview: React.FC<{
	readonly src: string;
	readonly fileType: AssetFileType;
	readonly currentAsset: string;
	readonly assetMetadata: AssetMetadata | null;
	readonly outputPlayback: OutputPlayback | null;
}> = ({fileType, src, currentAsset, assetMetadata, outputPlayback}) => {
	if (!assetMetadata) {
		throw new Error('expected to have assetMetadata');
	}

	if (assetMetadata.type === 'not-found') {
		throw new Error('expected to have assetMetadata, got "not-found"');
	}

	if (assetMetadata.type === 'metadata-error') {
		throw new Error('unexpected metadata-error in FilePreview');
	}

	if (fileType === 'audio' || fileType === 'video') {
		return (
			<NativeMediaPreview
				key={src}
				src={src}
				fileType={fileType}
				outputPlayback={outputPlayback}
			/>
		);
	}

	if (fileType === 'image') {
		return <img src={src} />;
	}

	if (fileType === 'font') {
		return <FontPreview src={src} />;
	}

	if (fileType === 'lut') {
		return <LutPreview key={src} src={src} />;
	}

	if (fileType === 'json') {
		return <JSONViewer src={src} />;
	}

	if (fileType === 'txt') {
		return <TextViewer src={src} />;
	}

	return (
		<>
			<div style={msgStyle}>{currentAsset}</div>
			<Spacing y={0.5} />
			<div style={msgStyle}>Size: {formatBytes(assetMetadata.size)} </div>
		</>
	);
};
