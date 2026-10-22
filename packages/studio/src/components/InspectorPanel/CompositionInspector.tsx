import React, {
	useContext,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {_InternalTypes} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {isStudioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {CloudDownloadIcon} from '../../icons/cloud-download';
import {FontFileIcon} from '../../icons/font';
import {PicIcon} from '../../icons/frame';
import {SolidIcon} from '../../icons/solid';
import {SparklesIcon} from '../../icons/sparkles';
import {FilmIcon} from '../../icons/video';
import {VisualControlsContext} from '../../visual-controls/VisualControls';
import {DefaultPropsEditor} from '../DefaultPropsEditor';
import {useZodIfPossible, useZodTypesIfPossible} from '../get-zod-if-possible';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {ObserveDefaultPropsContext} from '../ObserveDefaultPropsContext';
import {
	type DataEditorMode,
	useDataEditorWarnings,
	useDataEditorWarningVisibility,
} from '../RenderModal/DataEditor';
import {resolveCompositionSchema} from '../RenderModal/SchemaEditor/infer-zod-schema-from-value';
import {expandDefaultPropsEditorRef} from '../RenderModal/SchemaEditor/scroll-to-default-props-path';
import type {AnyZodSchema} from '../RenderModal/SchemaEditor/zod-schema-type';
import {getZodSchemaType} from '../RenderModal/SchemaEditor/zod-schema-type';
import type {UpdaterFunction} from '../RenderModal/SchemaEditor/ZodSwitch';
import {WarningIndicatorButton} from '../RenderModal/WarningIndicatorButton';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {useDownloadProject} from '../use-download-project';
import {VisualControlsContent} from '../VisualControls/VisualControlsContent';
import {CollapsibleInspectorSection} from './CollapsibleInspectorSection';
import {CollapsibleInspectorSectionHeader} from './CollapsibleInspectorSectionHeader';
import {
	InspectorDefaultPropsWarnings,
	InspectorQuickAction,
	InspectorQuickActionsSection,
	InspectorSectionBody,
	InspectorSectionHeader,
	inspectorActionIconStyle,
	largeInspectorActionIconContainerStyle,
	largeInspectorActionIconStyle,
} from './common';
import {CompositionInspectorHeader} from './CompositionInspectorHeader';
import {CompositionMetadata} from './CompositionMetadata';
import {ElementLibraryButton} from './ElementLibraryButton';
import {
	compositionDefaultPropsSection,
	defaultPropsWarningContainer,
	inspectorOverviewSection,
	scrollableContainer,
	sectionHeaderRow,
} from './styles';
import {useCompositionActions} from './use-composition-actions';
import {useInspectorSectionExpanded} from './use-inspector-section-expanded';

const CompositionActions: React.FC = () => {
	const {
		canInsertAsset,
		canInsertComposition,
		canInsertSolid,
		canInsertText,
		canShowInsertAsset,
		canShowInsertComposition,
		canShowInsertSolid,
		canShowInsertText,
		insertAsset,
		insertComposition,
		insertSolid,
		insertText,
		generateWithAgent,
		canShowGenerateWithAgent,
	} = useCompositionActions();
	const downloadProject = useDownloadProject();

	if (
		!canShowInsertAsset &&
		!canShowInsertComposition &&
		!canShowInsertSolid &&
		!canShowInsertText &&
		!canShowGenerateWithAgent &&
		downloadProject === null
	) {
		return null;
	}

	return (
		<CollapsibleInspectorSection
			bodyPaddingBottom={8}
			collapsible
			label="Actions"
			sectionId="composition-actions"
		>
			<InspectorQuickActionsSection>
				{canShowInsertSolid ? (
					<InspectorQuickAction
						disabled={!canInsertSolid}
						onClick={insertSolid}
						renderIcon={(color) => (
							<SolidIcon color={color} style={inspectorActionIconStyle} />
						)}
					>
						Add Solid
					</InspectorQuickAction>
				) : null}
				{canShowInsertText ? (
					<InspectorQuickAction
						disabled={!canInsertText}
						onClick={insertText}
						renderIcon={(color) => (
							<FontFileIcon color={color} style={inspectorActionIconStyle} />
						)}
					>
						Add text
					</InspectorQuickAction>
				) : null}
				{canShowInsertAsset ? (
					<InspectorQuickAction
						disabled={!canInsertAsset}
						onClick={insertAsset}
						renderIcon={(color) => (
							<PicIcon color={color} style={inspectorActionIconStyle} />
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
							<FilmIcon color={color} style={inspectorActionIconStyle} />
						)}
					>
						Add composition...
					</InspectorQuickAction>
				) : null}
				{canShowGenerateWithAgent ? (
					<InspectorQuickAction
						disabled={false}
						iconContainerStyle={largeInspectorActionIconContainerStyle}
						onClick={generateWithAgent}
						renderIcon={(color) => (
							<SparklesIcon
								color={color}
								style={largeInspectorActionIconStyle}
							/>
						)}
					>
						Generate with agent...
					</InspectorQuickAction>
				) : null}
				{canShowInsertAsset ? <ElementLibraryButton /> : null}
				{downloadProject ? (
					<InspectorQuickAction
						disabled={false}
						onClick={downloadProject}
						renderIcon={(color) => (
							<CloudDownloadIcon
								color={color}
								style={inspectorActionIconStyle}
							/>
						)}
					>
						Download project
					</InspectorQuickAction>
				) : null}
			</InspectorQuickActionsSection>
		</CollapsibleInspectorSection>
	);
};

const CompositionDefaultPropsSection: React.FC<{
	readonly composition: _InternalTypes['AnyComposition'];
	readonly currentDefaultProps: Record<string, unknown>;
	readonly readOnlyStudio: boolean;
	readonly setDefaultProps: UpdaterFunction<Record<string, unknown>>;
}> = ({composition, currentDefaultProps, readOnlyStudio, setDefaultProps}) => {
	const z = useZodIfPossible();
	const zodTypes = useZodTypesIfPossible();
	const canSaveDefaultProps = useContext(ObserveDefaultPropsContext);
	const [defaultPropsMode, setDefaultPropsMode] =
		useState<DataEditorMode>('schema');
	const [expanded, setExpanded] = useInspectorSectionExpanded(
		'composition-default-props',
	);
	const pendingScroll = useRef<(() => void) | null>(null);
	useImperativeHandle(
		expandDefaultPropsEditorRef,
		() => (onExpanded) => {
			if (expanded) {
				onExpanded();
				return;
			}

			pendingScroll.current = onExpanded;
			setExpanded(true);
		},
		[expanded, setExpanded],
	);
	useLayoutEffect(() => {
		if (expanded && pendingScroll.current !== null) {
			const scroll = pendingScroll.current;
			pendingScroll.current = null;
			scroll();
		}
	}, [expanded]);
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

	const schema = useMemo(() => {
		return resolveCompositionSchema({
			explicitSchema: composition.schema,
			defaultProps: composition.defaultProps ?? {},
			z,
			zodTypes,
		});
	}, [composition.defaultProps, composition.schema, z, zodTypes]);
	const canShowDefaultPropsSection = useMemo(() => {
		if (schema === 'no-schema' || schema === 'no-zod') {
			return false;
		}

		return getZodSchemaType(schema as AnyZodSchema) !== 'any';
	}, [schema]);
	const {setShowWarning, showWarning} = useDataEditorWarningVisibility();
	const {warnings: defaultPropsWarnings} = useDataEditorWarnings({
		canSaveDefaultProps: canSaveDefaultProps?.canSaveDefaultProps ?? null,
		defaultProps: currentDefaultProps,
		mode: defaultPropsMode,
		propsEditType: 'default-props',
		showCannotSaveDefaultPropsWarning:
			canShowDefaultPropsSection && !readOnlyStudio,
	});

	if (!canShowDefaultPropsSection) {
		return null;
	}

	return (
		<div style={compositionDefaultPropsSection}>
			<InspectorSectionHeader>
				<CollapsibleInspectorSectionHeader
					action={
						expanded ? (
							<div style={sectionHeaderRow}>
								<SegmentedControl
									items={defaultPropsModeItems}
									needsWrapping={false}
									size="compact"
								/>
								{defaultPropsWarnings.length > 0 ? (
									<WarningIndicatorButton
										setShowWarning={setShowWarning}
										showWarning={showWarning}
										warningCount={defaultPropsWarnings.length}
										size="compact"
									/>
								) : null}
							</div>
						) : null
					}
					expanded={expanded}
					label={readOnlyStudio ? 'Props' : 'Default Props'}
					onToggle={() => setExpanded(!expanded)}
				/>
			</InspectorSectionHeader>
			<InspectorSectionBody expanded={expanded} paddingBottom={8}>
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
			</InspectorSectionBody>
		</div>
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
		<CollapsibleInspectorSection
			bodyPaddingBottom={8}
			collapsible
			label="Visual Controls"
			sectionId="composition-visual-controls"
		>
			<VisualControlsContent />
		</CollapsibleInspectorSection>
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
				<CollapsibleInspectorSection
					bodyPaddingBottom={8}
					collapsible
					label="Metadata"
					sectionId="composition-metadata"
				>
					<CompositionMetadata
						compositionId={composition.id}
						disabled={readOnlyStudio || previewServerState.type !== 'connected'}
						stack={composition.stack}
					/>
				</CollapsibleInspectorSection>
			</div>
			<CompositionDefaultPropsSection
				composition={composition}
				currentDefaultProps={currentDefaultProps}
				readOnlyStudio={readOnlyStudio}
				setDefaultProps={setDefaultProps}
			/>
			<CompositionVisualControlsSection readOnlyStudio={readOnlyStudio} />
			<CompositionActions />
		</div>
	);
};
