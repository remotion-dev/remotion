import React, {useCallback, useContext, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import type {OriginalPosition} from '../error-overlay/react-overlay/utils/get-source-map';
import {BACKGROUND, LIGHT_COLOR, LIGHT_TEXT} from '../helpers/colors';
import {formatFileLocation} from '../helpers/format-file-location';
import {isCompositionStill} from '../helpers/is-composition-still';
import {openOriginalPositionInEditor} from '../helpers/open-in-editor';
import {renderFrame} from '../state/render-frame';
import {showNotification} from './Notifications/NotificationCenter';
import {getOriginalSourceAttribution} from './Timeline/TimelineStack/source-attribution';
import {useResolvedStack} from './Timeline/use-resolved-stack';

export const CURRENT_COMPOSITION_HEIGHT = 84;

const container: React.CSSProperties = {
	display: 'block',
	minHeight: CURRENT_COMPOSITION_HEIGHT,
	padding: '6px 12px',
	color: 'white',
	backgroundColor: BACKGROUND,
};

const title: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontWeight: 'bold',
	fontSize: 12,
	whiteSpace: 'nowrap',
	lineHeight: '18px',
	backgroundColor: BACKGROUND,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
};

const subtitle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 12,
	whiteSpace: 'nowrap',
	lineHeight: '18px',
	backgroundColor: BACKGROUND,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
};

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	lineHeight: '18px',
	backgroundColor: BACKGROUND,
	minWidth: 0,
};

const content: React.CSSProperties = {
	minWidth: 0,
	width: '100%',
};

export const CurrentComposition = () => {
	const video = Internals.useVideo();
	const {compositions} = useContext(Internals.CompositionManager);
	const [fileLocationHovered, setFileLocationHovered] = useState(false);

	const currentComposition = useMemo(() => {
		if (!video) {
			return null;
		}

		return (
			compositions.find((composition) => composition.id === video.id) ?? null
		);
	}, [compositions, video]);
	const resolvedCompositionLocation = useResolvedStack(
		currentComposition?.stack ?? null,
	);
	const validatedLocation: OriginalPosition | null = useMemo(() => {
		if (
			!resolvedCompositionLocation?.source ||
			resolvedCompositionLocation.line === null
		) {
			return null;
		}

		return {
			column: resolvedCompositionLocation.column,
			line: resolvedCompositionLocation.line,
			source: resolvedCompositionLocation.source,
		};
	}, [resolvedCompositionLocation]);
	const fileLocation = useMemo(() => {
		if (!validatedLocation) {
			return null;
		}

		return formatFileLocation({
			location: validatedLocation,
			root: window.remotion_cwd,
		});
	}, [validatedLocation]);
	const fileLocationLabel = useMemo(() => {
		if (!validatedLocation) {
			return null;
		}

		return getOriginalSourceAttribution(validatedLocation);
	}, [validatedLocation]);
	const fileLocationStyle: React.CSSProperties = useMemo(() => {
		return {
			backgroundColor: BACKGROUND,
			border: 'none',
			color: fileLocationHovered ? LIGHT_COLOR : LIGHT_TEXT,
			cursor: validatedLocation ? 'pointer' : 'default',
			display: 'block',
			fontFamily: 'sans-serif',
			fontSize: 12,
			lineHeight: '18px',
			margin: 0,
			maxWidth: '100%',
			overflow: 'hidden',
			padding: 0,
			textAlign: 'left',
			textDecoration: fileLocationHovered ? 'underline' : 'none',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap',
		};
	}, [fileLocationHovered, validatedLocation]);
	const openFileLocation = useCallback(() => {
		if (!validatedLocation) {
			return;
		}

		openOriginalPositionInEditor(validatedLocation).catch((err) => {
			showNotification((err as Error).message, 2000);
		});
	}, [validatedLocation]);

	return (
		<div style={container}>
			{video ? (
				<div style={row}>
					<div style={content}>
						<div style={title}>{video.id}</div>
						{fileLocationLabel ? (
							<button
								type="button"
								style={fileLocationStyle}
								title={fileLocation ?? undefined}
								onClick={openFileLocation}
								onPointerEnter={() => setFileLocationHovered(true)}
								onPointerLeave={() => setFileLocationHovered(false)}
							>
								{fileLocationLabel}
							</button>
						) : null}
						<div style={subtitle}>
							{video.width}x{video.height}
							{isCompositionStill(video) ? null : `, ${video.fps} FPS`}
						</div>
						{isCompositionStill(video) ? (
							<div style={subtitle}>Still</div>
						) : (
							<div style={subtitle}>
								Duration {renderFrame(video.durationInFrames, video.fps)}
							</div>
						)}
					</div>
				</div>
			) : null}
		</div>
	);
};
