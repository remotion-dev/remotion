import React, {useEffect, useState} from 'react';
import {Spacing} from './layout';
import {OpenEditorButton} from './OpenEditorButton';

const cwd: React.CSSProperties = {
	fontSize: 13,
	opacity: 0.8,
	display: 'flex',
	alignItems: 'center',
};

export const MenuBuildIndicator: React.FC = () => {
	const [isBuilding, setIsBuilding] = useState(false);

	useEffect(() => {
		window.remotion_isBuilding = () => {
			setIsBuilding(true);
		};

		window.remotion_finishedBuilding = () => {
			setIsBuilding(false);
		};

		return () => {
			window.remotion_isBuilding = undefined;
			window.remotion_finishedBuilding = undefined;
		};
	}, []);

	return (
		<div style={cwd} title={window.remotion_cwd}>
			<Spacing x={5} />
			{isBuilding ? 'Building...' : window.remotion_projectName}
			<OpenEditorButton />
		</div>
	);
};
