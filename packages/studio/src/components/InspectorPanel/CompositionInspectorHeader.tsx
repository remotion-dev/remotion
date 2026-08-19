import {
	type CSSProperties,
	useCallback,
	useContext,
	useEffect,
	useMemo,
} from 'react';
import {Internals} from 'remotion';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {isCompositionStill} from '../../helpers/is-composition-still';
import {
	openOriginalPositionInEditor,
	preloadCompositionComponentInfo,
	useCachedCompositionComponentInfo,
} from '../../helpers/open-in-editor';
import {ReactIcon} from '../../icons/react';
import {StillIcon} from '../../icons/still';
import {FilmIcon} from '../../icons/video';
import {InlineCompositionName} from '../InlineCompositionName';
import {InspectorInfoHeader} from '../InspectorInfoHeader';
import {InspectorLocationCopy} from '../InspectorLocationCopy';
import {InspectorSourceLocation} from '../InspectorSourceLocation';
import {COMPACT_INLINE_ROW_HEIGHT} from '../layout';
import {showNotification} from '../Notifications/NotificationCenter';
import {useResolvedStack} from '../Timeline/use-resolved-stack';
import {useEditorOpening} from '../use-default-editor-info';

const COMPOSITION_INSPECTOR_HEADER_HEIGHT = 66;

const sourceLocationIconStyle: CSSProperties = {
	flexShrink: 0,
	height: 18,
	width: 18,
};

const componentLocationPlaceholder: CSSProperties = {
	flexShrink: 0,
	height: COMPACT_INLINE_ROW_HEIGHT,
};

const renderReactIcon = (color: string) => {
	return <ReactIcon color={color} style={sourceLocationIconStyle} />;
};

export const CompositionInspectorHeader = () => {
	const video = Internals.useVideo();
	const {compositions} = useContext(Internals.CompositionManager);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {canOpenInEditor, defaultEditorId} = useEditorOpening(
		previewServerState.type === 'connected',
	);

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
		if (!validatedLocation || !defaultEditorId || !canOpenInEditor) {
			return;
		}

		openOriginalPositionInEditor(validatedLocation, defaultEditorId).catch(
			(err) => {
				showNotification((err as Error).message, 2000);
			},
		);
	}, [canOpenInEditor, defaultEditorId, validatedLocation]);
	const openComponentLocation = useCallback(() => {
		if (!componentLocation || !defaultEditorId || !canOpenInEditor) {
			return;
		}

		openOriginalPositionInEditor(componentLocation, defaultEditorId).catch(
			(err) => {
				showNotification((err as Error).message, 2000);
			},
		);
	}, [canOpenInEditor, componentLocation, defaultEditorId]);
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
		<InspectorInfoHeader
			minHeight={COMPOSITION_INSPECTOR_HEADER_HEIGHT}
			padding="4px 0"
		>
			{video ? (
				<InspectorLocationCopy
					location={validatedLocation}
					name={video.id}
					openInEditorLocation={componentLocation}
				>
					<InlineCompositionName
						key={video.id}
						compositionId={video.id}
						stack={currentComposition?.stack ?? null}
						compositions={compositions}
					/>
					<InspectorSourceLocation
						location={validatedLocation}
						canOpen={validatedLocation !== null && canOpenInEditor}
						onOpen={openFileLocation}
						renderIcon={renderCompositionIcon}
						size="inline-action"
					/>
					{compositionComponentInfo === null &&
					compositionFile !== null &&
					compositionId !== null ? (
						<div aria-hidden style={componentLocationPlaceholder} />
					) : (
						<InspectorSourceLocation
							location={componentLocation}
							canOpen={componentLocation !== null && canOpenInEditor}
							onOpen={openComponentLocation}
							renderIcon={renderReactIcon}
							size="inline-action"
						/>
					)}
				</InspectorLocationCopy>
			) : null}
		</InspectorInfoHeader>
	);
};
