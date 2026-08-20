import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import type {_InternalTypes} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {CURRENT_COLOR} from '../../helpers/colors';
import {isStudioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {BrowseElementsIcon} from '../../icons/browse-elements';
import {PicIcon} from '../../icons/frame';
import {SolidIcon} from '../../icons/solid';
import {FilmIcon} from '../../icons/video';
import {VisualControlsContext} from '../../visual-controls/VisualControls';
import {DefaultPropsEditor} from '../DefaultPropsEditor';
import {useZodIfPossible} from '../get-zod-if-possible';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {ObserveDefaultPropsContext} from '../ObserveDefaultPropsContext';
import {
	type DataEditorMode,
	useDataEditorWarnings,
	useDataEditorWarningVisibility,
} from '../RenderModal/DataEditor';
import type {AnyZodSchema} from '../RenderModal/SchemaEditor/zod-schema-type';
import {getZodSchemaType} from '../RenderModal/SchemaEditor/zod-schema-type';
import type {UpdaterFunction} from '../RenderModal/SchemaEditor/ZodSwitch';
import {WarningIndicatorButton} from '../RenderModal/WarningIndicatorButton';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {VisualControlsContent} from '../VisualControls/VisualControlsContent';
import {
	InspectorQuickActionsSection,
	InspectorDefaultPropsWarnings,
	InspectorQuickAction,
	InspectorSectionDivider,
	InspectorSectionHeader,
} from './common';
import {CompositionInspectorHeader} from './CompositionInspectorHeader';
import {CompositionMetadata} from './CompositionMetadata';
import {
	compositionDefaultPropsSection,
	compositionVisualControlsSection,
	defaultPropsWarningContainer,
	inspectorOverviewSection,
	scrollableContainer,
	sectionHeaderEnd,
	sectionHeaderRow,
	sectionHeaderStart,
	sectionHeaderTitle,
} from './styles';
import {useCompositionActions} from './use-composition-actions';

const actionIconStyle: React.CSSProperties = {
	height: 18,
	width: 18,
};

const browseElementsIconStyle: React.CSSProperties = {
	height: 22,
	width: 22,
};

const browseElementsIconContainerStyle: React.CSSProperties = {
	height: 22,
	marginLeft: -2,
	marginRight: -2,
	width: 22,
};

const browseElementsArrowStyle: React.CSSProperties = {
	display: 'inline-block',
	height: 12,
	marginLeft: 4,
	verticalAlign: -2,
	width: 12,
};

const CompositionActions: React.FC<{
	readonly readOnlyStudio: boolean;
}> = ({readOnlyStudio}) => {
	const {
		canInsertAsset,
		canInsertComposition,
		canInsertSolid,
		canShowInsertAsset,
		canShowInsertComposition,
		canShowInsertSolid,
		insertAsset,
		insertComposition,
		insertSolid,
	} = useCompositionActions();

	const openElementsLibrary = useCallback(() => {
		window.open(
			'https://www.remotion.dev/elements',
			'_blank',
			'noopener,noreferrer',
		);
	}, []);

	if (
		(readOnlyStudio && !canShowInsertSolid) ||
		(!canShowInsertAsset && !canShowInsertComposition && !canShowInsertSolid)
	) {
		return null;
	}

	return (
		<InspectorQuickActionsSection>
			{canShowInsertSolid ? (
				<InspectorQuickAction
					disabled={!canInsertSolid}
					onClick={insertSolid}
					renderIcon={(color) => (
						<SolidIcon color={color} style={actionIconStyle} />
					)}
				>
					Add Solid
				</InspectorQuickAction>
			) : null}
			{canShowInsertAsset ? (
				<InspectorQuickAction
					disabled={!canInsertAsset}
					onClick={insertAsset}
					renderIcon={(color) => (
						<PicIcon color={color} style={actionIconStyle} />
					)}
				>
					Add asset...
				</InspectorQuickAction>
			) : null}
			{canShowInsertComposition ? (
				<InspectorQuickAction
					disabled={!canInsertComposition}
					onClick={insertComposition}
					renderIcon={(color) => (
						<FilmIcon color={color} style={actionIconStyle} />
					)}
				>
					Add composition...
				</InspectorQuickAction>
			) : null}
			{canShowInsertAsset ? (
				<InspectorQuickAction
					disabled={false}
					iconContainerStyle={browseElementsIconContainerStyle}
					onClick={openElementsLibrary}
					renderIcon={(color) => (
						<BrowseElementsIcon color={color} style={browseElementsIconStyle} />
					)}
					title="Open the Remotion Elements library in a new tab. Install an Element there to send it to this composition."
				>
					Browse Elements
					<svg
						aria-hidden="true"
						viewBox="0 0 16 16"
						style={browseElementsArrowStyle}
					>
						<path
							d="M4 12 12 4M6 4h6v6"
							fill="none"
							stroke={CURRENT_COLOR}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="1.5"
						/>
					</svg>
				</InspectorQuickAction>
			) : null}
		</InspectorQuickActionsSection>
	);
};

const CompositionDefaultPropsSection: React.FC<{
	readonly composition: _InternalTypes['AnyComposition'];
	readonly currentDefaultProps: Record<string, unknown>;
	readonly readOnlyStudio: boolean;
	readonly setDefaultProps: UpdaterFunction<Record<string, unknown>>;
}> = ({composition, currentDefaultProps, readOnlyStudio, setDefaultProps}) => {
	const z = useZodIfPossible();
	const canSaveDefaultProps = useContext(ObserveDefaultPropsContext);
	const [defaultPropsMode, setDefaultPropsMode] =
		useState<DataEditorMode>('schema');
	const compositionId = composition.id;

	useEffect(() => {
		setDefaultPropsMode('schema');
	}, [compositionId]);

	const defaultPropsModeItems = useMemo((): SegmentedControlItem[] => {
		return [
			{
				key: 'schema',
				label: 'Schema',
				onClick: () => {
					setDefaultPropsMode('schema');
				},
				selected: defaultPropsMode === 'schema',
			},
			{
				key: 'json',
				label: 'JSON',
				onClick: () => {
					setDefaultPropsMode('json');
				},
				selected: defaultPropsMode === 'json',
			},
		];
	}, [defaultPropsMode]);

	const canShowDefaultPropsSection = useMemo(() => {
		if (!z || !composition.schema || !composition.defaultProps) {
			return false;
		}

		if (
			!(
				typeof (composition.schema as {safeParse?: unknown}).safeParse ===
				'function'
			)
		) {
			return false;
		}

		return getZodSchemaType(composition.schema as AnyZodSchema) !== 'any';
	}, [composition.defaultProps, composition.schema, z]);
	const {setShowWarning, showWarning} = useDataEditorWarningVisibility();
	const {warnings: defaultPropsWarnings} = useDataEditorWarnings({
		canSaveDefaultProps: canSaveDefaultProps?.canSaveDefaultProps ?? null,
		defaultProps: currentDefaultProps,
		mode: defaultPropsMode,
		propsEditType: 'default-props',
		showCannotSaveDefaultPropsWarning: canShowDefaultPropsSection,
	});

	if (readOnlyStudio || !canShowDefaultPropsSection) {
		return null;
	}

	return (
		<>
			<InspectorSectionDivider />
			<div style={compositionDefaultPropsSection}>
				<InspectorSectionHeader>
					<div style={sectionHeaderRow}>
						<div style={sectionHeaderStart}>
							<span style={sectionHeaderTitle}>Default Props</span>
							<SegmentedControl
								items={defaultPropsModeItems}
								needsWrapping={false}
								size="compact"
							/>
						</div>
						<div style={sectionHeaderEnd}>
							{defaultPropsWarnings.length > 0 ? (
								<WarningIndicatorButton
									setShowWarning={setShowWarning}
									showWarning={showWarning}
									warningCount={defaultPropsWarnings.length}
									size="compact"
								/>
							) : null}
						</div>
					</div>
				</InspectorSectionHeader>
				{defaultPropsWarnings.length > 0 && showWarning ? (
					<div style={defaultPropsWarningContainer}>
						<InspectorDefaultPropsWarnings warnings={defaultPropsWarnings} />
					</div>
				) : null}
				<DefaultPropsEditor
					key={composition.id}
					unresolvedComposition={composition}
					defaultProps={currentDefaultProps}
					setDefaultProps={setDefaultProps}
					propsEditType="default-props"
					schemaErrorMode="compact"
					layout="inspector"
					mode={defaultPropsMode}
					onModeChange={setDefaultPropsMode}
					hideModeControls={canShowDefaultPropsSection}
					warnings={defaultPropsWarnings}
					showWarning={false}
					setShowWarning={setShowWarning}
					hideWarningButton
				/>
			</div>
		</>
	);
};

const CompositionVisualControlsSection: React.FC<{
	readonly readOnlyStudio: boolean;
}> = ({readOnlyStudio}) => {
	const {handles: visualControlHandles} = useContext(VisualControlsContext);
	const hasVisualControls =
		!readOnlyStudio &&
		isStudioInteractivityEnabled() &&
		Object.keys(visualControlHandles).length > 0;

	if (!hasVisualControls) {
		return null;
	}

	return (
		<>
			<InspectorSectionDivider />
			<div style={compositionVisualControlsSection}>
				<InspectorSectionHeader>Visual Controls</InspectorSectionHeader>
				<VisualControlsContent />
			</div>
		</>
	);
};

export const CompositionInspector: React.FC<{
	readonly composition: _InternalTypes['AnyComposition'];
	readonly currentDefaultProps: Record<string, unknown>;
	readonly readOnlyStudio: boolean;
	readonly setDefaultProps: UpdaterFunction<Record<string, unknown>>;
}> = ({composition, currentDefaultProps, readOnlyStudio, setDefaultProps}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);

	return (
		<div style={scrollableContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<div style={inspectorOverviewSection}>
				<CompositionInspectorHeader />
				<InspectorSectionDivider />
				<CompositionMetadata
					compositionId={composition.id}
					disabled={readOnlyStudio || previewServerState.type !== 'connected'}
					stack={composition.stack}
				/>
			</div>
			<CompositionDefaultPropsSection
				composition={composition}
				currentDefaultProps={currentDefaultProps}
				readOnlyStudio={readOnlyStudio}
				setDefaultProps={setDefaultProps}
			/>
			<CompositionVisualControlsSection readOnlyStudio={readOnlyStudio} />
			<CompositionActions readOnlyStudio={readOnlyStudio} />
		</div>
	);
};
