import {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {formatContextForAgents} from '../../helpers/format-file-location';
import {isCompositionStill} from '../../helpers/is-composition-still';
import {
	preloadCompositionComponentInfo,
	useCachedCompositionComponentInfo,
} from '../../helpers/open-in-editor';
import {ReactIcon} from '../../icons/react';
import {StillIcon} from '../../icons/still';
import {FilmIcon} from '../../icons/video';
import {InlineCompositionName} from '../InlineCompositionName';
import {InspectorInfoHeader} from '../InspectorInfoHeader';
import {
	InspectorHeaderActionSlot,
	InspectorLocationCopy,
	inspectorHeaderIconStyle,
} from '../InspectorLocationCopy';
import {InspectorOpenInEditor} from '../InspectorOpenInEditor';
import {useResolvedStack} from '../Timeline/use-resolved-stack';

const renderReactIcon = (color: string) => (
	<ReactIcon color={color} style={{...inspectorHeaderIconStyle, width: 20}} />
);

export const CompositionInspectorHeader = () => {
	const [isEditing, setIsEditing] = useState(false);
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

	const contextForAgents = useMemo(
		() =>
			formatContextForAgents({
				location: validatedLocation,
				name: compositionId,
				root: window.remotion_cwd,
			}),
		[compositionId, validatedLocation],
	);
	const renderCompositionIcon = useCallback(
		(color: string) => {
			if (!video) {
				return null;
			}

			return isCompositionStill(video) ? (
				<StillIcon color={color} style={inspectorHeaderIconStyle} />
			) : (
				<FilmIcon color={color} style={inspectorHeaderIconStyle} />
			);
		},
		[video],
	);

	return (
		<InspectorInfoHeader contentSized padding="4px 0 0">
			{video ? (
				<InspectorLocationCopy
					contextForAgents={contextForAgents}
					isEditing={isEditing}
					leadingActions={
						<InspectorHeaderActionSlot>
							{validatedLocation ? (
								<InspectorOpenInEditor
									menuTrigger={{
										label: 'Composition',
										renderIcon: renderCompositionIcon,
									}}
									annotationName={video.id}
									contextForAgents={contextForAgents}
									location={validatedLocation}
									locationType={null}
									showTooltips
								/>
							) : null}
						</InspectorHeaderActionSlot>
					}
					actions={
						<InspectorHeaderActionSlot>
							{componentLocation ? (
								<InspectorOpenInEditor
									menuTrigger={{
										label: 'Component',
										renderIcon: renderReactIcon,
									}}
									annotationName={video.id}
									contextForAgents={contextForAgents}
									location={componentLocation}
									locationType={null}
									showTooltips
								/>
							) : null}
						</InspectorHeaderActionSlot>
					}
				>
					<InlineCompositionName
						key={video.id}
						compositionId={video.id}
						stack={currentComposition?.stack ?? null}
						compositions={compositions}
						onEditingChange={setIsEditing}
					/>
				</InspectorLocationCopy>
			) : null}
		</InspectorInfoHeader>
	);
};
