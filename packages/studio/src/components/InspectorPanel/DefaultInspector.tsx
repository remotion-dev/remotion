import React, {useContext, useEffect, useMemo, useState} from 'react';
import type {_InternalTypes} from 'remotion';
import {Internals} from 'remotion';
import {CurrentAsset} from '../CurrentAsset';
import {CurrentComposition} from '../CurrentComposition';
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
import {InspectorDefaultPropsWarnings, InspectorSectionHeader} from './common';
import {
	compositionSection,
	container,
	defaultPropsSection,
	defaultPropsWarningContainer,
	inspectorSectionDivider,
	scrollableContainer,
	sectionHeaderEnd,
	sectionHeaderRow,
	sectionHeaderStart,
	sectionHeaderTitle,
	visualControlsSection,
} from './styles';

export const DefaultInspector: React.FC<{
	readonly composition: _InternalTypes['AnyComposition'] | null;
	readonly currentDefaultProps: Record<string, unknown>;
	readonly setDefaultProps: UpdaterFunction<Record<string, unknown>>;
}> = ({composition, currentDefaultProps, setDefaultProps}) => {
	const {canvasContent} = useContext(Internals.CompositionManager);
	const hasSelectedAsset = canvasContent?.type === 'asset';
	const z = useZodIfPossible();
	const canSaveDefaultProps = useContext(ObserveDefaultPropsContext);
	const [defaultPropsMode, setDefaultPropsMode] =
		useState<DataEditorMode>('schema');
	const compositionId = composition?.id ?? null;

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

	const canShowDefaultPropsMode = useMemo(() => {
		if (!z || !composition?.schema || !composition.defaultProps) {
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
	}, [composition?.defaultProps, composition?.schema, z]);
	const {setShowWarning, showWarning} = useDataEditorWarningVisibility();
	const {warnings: defaultPropsWarnings} = useDataEditorWarnings({
		canSaveDefaultProps: canSaveDefaultProps?.canSaveDefaultProps ?? null,
		defaultProps: currentDefaultProps,
		mode: defaultPropsMode,
		propsEditType: 'default-props',
		showCannotSaveDefaultPropsWarning: canShowDefaultPropsMode,
	});

	if (hasSelectedAsset) {
		return (
			<div style={scrollableContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
				<div style={compositionSection}>
					<CurrentAsset />
				</div>
			</div>
		);
	}

	if (composition === null) {
		return <div style={container} />;
	}

	return (
		<div style={scrollableContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<div style={compositionSection}>
				<CurrentComposition />
			</div>
			<div style={inspectorSectionDivider} />
			<div style={defaultPropsSection}>
				<InspectorSectionHeader>
					<div style={sectionHeaderRow}>
						<div style={sectionHeaderStart}>
							<span style={sectionHeaderTitle}>Default Props</span>
							{canShowDefaultPropsMode ? (
								<SegmentedControl
									items={defaultPropsModeItems}
									needsWrapping={false}
									size="compact"
								/>
							) : null}
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
					hideModeControls={canShowDefaultPropsMode}
					warnings={defaultPropsWarnings}
					showWarning={false}
					setShowWarning={setShowWarning}
					hideWarningButton
				/>
			</div>
			<div style={inspectorSectionDivider} />
			<div style={visualControlsSection}>
				<InspectorSectionHeader>Visual Controls</InspectorSectionHeader>
				<VisualControlsContent />
			</div>
		</div>
	);
};
