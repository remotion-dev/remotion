import React from 'react';
import {Internals} from 'remotion';
import {BACKGROUND} from '../helpers/colors';
import {Canvas} from './Canvas';
import {Spinner} from './Spinner';

const container: React.CSSProperties = {
	color: 'white',
	flex: 1,
	justifyContent: 'center',
	alignItems: 'center',
	display: 'flex',
	backgroundColor: BACKGROUND,
};

export const CanvasOrLoading: React.FC = () => {
	const resolved = Internals.useResolvedVideoConfig(null);

	if (!resolved) {
		return (
			<div style={container} className="css-reset">
				<Spinner size={30} duration={1} />
			</div>
		);
	}

	return <Canvas />;
};
