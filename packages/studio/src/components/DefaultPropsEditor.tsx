import {useContext} from 'react';
import type {_InternalTypes} from 'remotion';
import {ObserveDefaultPropsContext} from './ObserveDefaultPropsContext';
import type {PropsEditType} from './RenderModal/DataEditor';
import {DataEditor} from './RenderModal/DataEditor';
import type {UpdaterFunction} from './RenderModal/SchemaEditor/ZodSwitch';

export const DefaultPropsEditor = ({
	unresolvedComposition,
	defaultProps,
	setDefaultProps,
	propsEditType,
}: {
	readonly unresolvedComposition: _InternalTypes['AnyComposition'];
	readonly defaultProps: Record<string, unknown>;
	readonly setDefaultProps: UpdaterFunction<Record<string, unknown>>;
	readonly propsEditType: PropsEditType;
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
		/>
	);
};
