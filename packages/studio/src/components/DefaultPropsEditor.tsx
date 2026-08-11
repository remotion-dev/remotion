import {useContext} from 'react';
import type {_InternalTypes} from 'remotion';
import {ObserveDefaultPropsContext} from './ObserveDefaultPropsContext';
import type {
	DataEditorLayout,
	DataEditorMode,
	PropsEditType,
	RenderModalWarning,
} from './RenderModal/DataEditor';
import {DataEditor} from './RenderModal/DataEditor';
import type {SchemaErrorMode} from './RenderModal/SchemaEditor/SchemaErrorMessages';
import type {UpdaterFunction} from './RenderModal/SchemaEditor/ZodSwitch';

export const DefaultPropsEditor = ({
	unresolvedComposition,
	defaultProps,
	setDefaultProps,
	propsEditType,
	schemaErrorMode,
	layout,
	mode,
	onModeChange,
	hideModeControls,
	warnings,
	showWarning,
	setShowWarning,
	hideWarningButton,
}: {
	readonly unresolvedComposition: _InternalTypes['AnyComposition'];
	readonly defaultProps: Record<string, unknown>;
	readonly setDefaultProps: UpdaterFunction<Record<string, unknown>>;
	readonly propsEditType: PropsEditType;
	readonly schemaErrorMode?: SchemaErrorMode;
	readonly layout?: DataEditorLayout;
	readonly mode?: DataEditorMode;
	readonly onModeChange?: (mode: DataEditorMode) => void;
	readonly hideModeControls?: boolean;
	readonly warnings?: RenderModalWarning[];
	readonly showWarning?: boolean;
	readonly setShowWarning?: React.Dispatch<React.SetStateAction<boolean>>;
	readonly hideWarningButton?: boolean;
}) => {
	const canSaveDefaultProps = useContext(ObserveDefaultPropsContext);
	if (canSaveDefaultProps === null) {
		throw new Error('ObserveDefaultPropsContext is not set');
	}

	return (
		<DataEditor
			unresolvedComposition={unresolvedComposition}
			defaultProps={defaultProps}
			setDefaultProps={setDefaultProps}
			propsEditType={propsEditType}
			canSaveDefaultProps={canSaveDefaultProps.canSaveDefaultProps}
			schemaErrorMode={schemaErrorMode}
			layout={layout}
			mode={mode}
			onModeChange={onModeChange}
			hideModeControls={hideModeControls}
			warnings={warnings}
			showWarning={showWarning}
			setShowWarning={setShowWarning}
			hideWarningButton={hideWarningButton}
		/>
	);
};
