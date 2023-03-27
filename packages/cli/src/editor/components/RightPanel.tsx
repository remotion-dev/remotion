import React, {useContext, useMemo, useState} from 'react';
import type {AnyComposition} from 'remotion';
import {Internals} from 'remotion';
import {RenderModalData} from './RenderModal/RenderModalData';

const PropsEditor: React.FC<{
	composition: AnyComposition;
}> = ({composition}) => {
	const [inputProps, setInputProps] = useState(() => composition.defaultProps);

	return (
		<div style={{}}>
			<RenderModalData
				composition={composition}
				inputProps={inputProps}
				setInputProps={setInputProps}
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
		<div
			style={{
				height: '100%',
				width: '100%',
				position: 'absolute',
				overflow: 'auto',
			}}
		>
			<PropsEditor composition={composition} />
		</div>
	);
};
