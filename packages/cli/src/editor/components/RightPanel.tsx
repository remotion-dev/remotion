import React, {useCallback, useContext, useMemo} from 'react';
import type {AnyComposition} from 'remotion';
import {Internals} from 'remotion';
import {RenderModalData} from './RenderModal/RenderModalData';

const container: React.CSSProperties = {
	height: '100%',
	width: '100%',
	position: 'absolute',
	overflow: 'auto',
};

const PropsEditor: React.FC<{
	composition: AnyComposition;
}> = ({composition}) => {
	const {props, updateProps} = useContext(Internals.EditorPropsContext);

	// TODO: Warn if inputProps were specified to the CLI, then
	// they take priority over defaultProps

	const setInputProps = useCallback(
		(newProps: unknown | ((oldProps: unknown) => unknown)) => {
			updateProps({
				id: composition.id,
				defaultProps: composition.defaultProps as object,
				newProps: newProps as object,
			});
		},
		[composition.defaultProps, composition.id, updateProps]
	);

	return (
		<div>
			<RenderModalData
				composition={composition}
				inputProps={props[composition.id] ?? composition.defaultProps}
				setInputProps={setInputProps}
				compact
				updateButton
				showSaveButton
			/>
		</div>
	);
};

export const RightPanel: React.FC<{}> = () => {
	const {compositions, currentComposition} = useContext(
		Internals.CompositionManager
	);

	const composition = useMemo((): AnyComposition | null => {
		for (const comp of compositions) {
			if (comp.id === currentComposition) {
				return comp;
			}
		}

		return null;
	}, [compositions, currentComposition]);

	if (composition === null) {
		return null;
	}

	return (
		<div style={container}>
			<PropsEditor composition={composition} />
		</div>
	);
};
