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
import {ReactIcon} from '../icons/react';
import {StillIcon} from '../icons/still';
import {FilmIcon} from '../icons/video';
import {InlineCompositionName} from './InlineCompositionName';
import {
	InspectorInfoHeader,
	InspectorInfoSubtitle,
} from './InspectorInfoHeader';
import {InspectorLocationCopy} from './InspectorLocationCopy';
import {InspectorSourceLocation} from './InspectorSourceLocation';
import {showNotification} from './Notifications/NotificationCenter';
import {useResolvedStack} from './Timeline/use-resolved-stack';

export const CURRENT_COMPOSITION_HEIGHT = 66;

const sourceLocationIconStyle: CSSProperties = {
	flexShrink: 0,
	height: 13,
	width: 13,
};

const renderReactIcon = (color: string) => {
	return <ReactIcon color={color} style={sourceLocationIconStyle} />;
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
		<InspectorInfoHeader minHeight={CURRENT_COMPOSITION_HEIGHT}>
			{video ? (
				<>
					<InspectorLocationCopy location={validatedLocation} name={video.id}>
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
							renderIcon={renderReactIcon}
						/>
					</InspectorLocationCopy>
					{isCompositionStill(video) ? (
						<InspectorInfoSubtitle>Still</InspectorInfoSubtitle>
					) : null}
				</>
			) : null}
		</InspectorInfoHeader>
	);
};
