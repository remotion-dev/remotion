import React, {useContext, useEffect, useMemo, useState} from 'react';
import type {_InternalTypes} from 'remotion';
import {studioInteractivityEnabled} from '../../helpers/interactivity-enabled';
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
	InspectorDefaultPropsWarnings,
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

const CompositionDefaultPropsSection: React.FC<{
	readonly composition: _InternalTypes['AnyComposition'];
	readonly currentDefaultProps: Record<string, unknown>;
	readonly setDefaultProps: UpdaterFunction<Record<string, unknown>>;
}> = ({composition, currentDefaultProps, setDefaultProps}) => {
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

	if (!canShowDefaultPropsSection) {
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

const CompositionVisualControlsSection: React.FC = () => {
	const {handles: visualControlHandles} = useContext(VisualControlsContext);
	const hasVisualControls =
		studioInteractivityEnabled && Object.keys(visualControlHandles).length > 0;

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
	return (
		<div style={scrollableContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<div style={inspectorOverviewSection}>
				<CompositionInspectorHeader />
				<InspectorSectionDivider />
				<CompositionMetadata
					compositionId={composition.id}
					disabled={readOnlyStudio}
					stack={composition.stack}
				/>
			</div>
			<CompositionDefaultPropsSection
				composition={composition}
				currentDefaultProps={currentDefaultProps}
				setDefaultProps={setDefaultProps}
			/>
			<CompositionVisualControlsSection />
		</div>
	);
};
