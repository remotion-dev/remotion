import React, {useContext, useEffect, useState} from 'react';
import {PreviewServerConnectionCtx} from '../helpers/client-id';
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
	const ctx = useContext(PreviewServerConnectionCtx);

	const showButton = window.remotion_editorName && ctx.type === 'connected';
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
			{showButton ? <Spacing x={5} /> : null}
			{isBuilding ? 'Building...' : window.remotion_projectName}
			{showButton ? <OpenEditorButton /> : null}
		</div>
	);
};
