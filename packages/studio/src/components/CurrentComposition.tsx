import {
	type CSSProperties,
	useCallback,
	useContext,
	useEffect,
	useMemo,
} from 'react';
import {Internals} from 'remotion';
import type {OriginalPosition} from '../error-overlay/react-overlay/utils/get-source-map';
import {isCompositionStill} from '../helpers/is-composition-still';
import {
	openOriginalPositionInEditor,
	preloadCompositionComponentInfo,
	useCachedCompositionComponentInfo,
} from '../helpers/open-in-editor';
import {StillIcon} from '../icons/still';
import {FilmIcon} from '../icons/video';
import {renderFrame} from '../state/render-frame';
import {InlineCompositionName} from './InlineCompositionName';
import {
	INSPECTOR_INFO_HEADER_MIN_HEIGHT,
	InspectorInfoHeader,
	InspectorInfoSubtitle,
} from './InspectorInfoHeader';
import {InspectorSourceLocation} from './InspectorSourceLocation';
import {showNotification} from './Notifications/NotificationCenter';
import {useResolvedStack} from './Timeline/use-resolved-stack';

export const CURRENT_COMPOSITION_HEIGHT = INSPECTOR_INFO_HEADER_MIN_HEIGHT;

const sourceLocationIconStyle: CSSProperties = {
	flexShrink: 0,
	height: 13,
	width: 13,
};

export const CurrentComposition = () => {
	const video = Internals.useVideo();
	const {compositions} = useContext(Internals.CompositionManager);

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
	const compositionFile = validatedLocation?.source ?? null;
	const compositionId = currentComposition?.id ?? null;
	const compositionComponentInfo = useCachedCompositionComponentInfo({
		compositionFile,
		compositionId,
	});
	const componentLocation: OriginalPosition | null =
		compositionComponentInfo?.location ?? null;

	useEffect(() => {
		if (compositionFile === null || compositionId === null) {
			return;
		}

		preloadCompositionComponentInfo({
			compositionFile,
			compositionId,
		});
	}, [compositionFile, compositionId]);

	const openFileLocation = useCallback(() => {
		if (!validatedLocation) {
			return;
		}

		openOriginalPositionInEditor(validatedLocation).catch((err) => {
			showNotification((err as Error).message, 2000);
		});
	}, [validatedLocation]);
	const openComponentLocation = useCallback(() => {
		if (!componentLocation) {
			return;
		}

		openOriginalPositionInEditor(componentLocation).catch((err) => {
			showNotification((err as Error).message, 2000);
		});
	}, [componentLocation]);
	const renderCompositionIcon = useCallback(
		(color: string) => {
			if (!video) {
				return null;
			}

			return isCompositionStill(video) ? (
				<StillIcon color={color} style={sourceLocationIconStyle} />
			) : (
				<FilmIcon color={color} style={sourceLocationIconStyle} />
			);
		},
		[video],
	);

	return (
		<InspectorInfoHeader>
			{video ? (
				<>
					<InlineCompositionName
						key={video.id}
						compositionId={video.id}
						stack={currentComposition?.stack ?? null}
						compositions={compositions}
					/>
					<InspectorSourceLocation
						location={validatedLocation}
						canOpen={validatedLocation !== null}
						onOpen={openFileLocation}
						renderIcon={renderCompositionIcon}
					/>
					<InspectorSourceLocation
						location={componentLocation}
						canOpen={componentLocation !== null}
						onOpen={openComponentLocation}
					/>
					<InspectorInfoSubtitle>
						{video.width}x{video.height}
						{isCompositionStill(video) ? null : `, ${video.fps} FPS`}
					</InspectorInfoSubtitle>
					{isCompositionStill(video) ? (
						<InspectorInfoSubtitle>Still</InspectorInfoSubtitle>
					) : (
						<InspectorInfoSubtitle>
							Duration {renderFrame(video.durationInFrames, video.fps)}
						</InspectorInfoSubtitle>
					)}
				</>
			) : null}
		</InspectorInfoHeader>
	);
};
