import React, {useContext, useEffect, useState} from 'react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {Spacing} from './layout';
import {OpenEditorButton} from './OpenEditorButton';
import {Spinner} from './Spinner';

const cwd: React.CSSProperties = {
	fontSize: 13,
	opacity: 0.8,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
};

const spinnerSize = 14;

const spinner: React.CSSProperties = {
	position: 'relative',
	width: spinnerSize,
	marginTop: 4,
};

const noSpinner: React.CSSProperties = {
	position: 'relative',
	width: spinnerSize,
};

export const MenuBuildIndicator: React.FC = () => {
	const [isBuilding, setIsBuilding] = useState(false);
	const ctx = useContext(StudioServerConnectionCtx);

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
			{showButton ? <Spacing x={2} /> : null}
			{isBuilding ? (
				<div style={spinner}>
					<Spinner duration={0.5} size={spinnerSize} />
				</div>
			) : (
				<div style={noSpinner} />
			)}
			{showButton ? <Spacing x={0.5} /> : null}
			{window.remotion_projectName}
			{showButton ? <Spacing x={0.5} /> : null}
			{showButton ? <OpenEditorButton /> : null}
		</div>
	);
};
