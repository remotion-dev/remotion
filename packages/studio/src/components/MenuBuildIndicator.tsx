import React, {useEffect, useMemo, useState} from 'react';
import {WHITE_ALPHA_80} from '../helpers/colors';
import {InspectorOpenInEditor} from './InspectorOpenInEditor';
import {Spacing} from './layout';
import {MenuCompositionName} from './MenuCompositionName';
import {Spinner} from './Spinner';

const cwd: React.CSSProperties = {
	fontSize: 13,
	opacity: 0.8,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	userSelect: 'none',
	whiteSpace: 'nowrap',
};

const spinnerSize = 14;

const spinner: React.CSSProperties = {
	position: 'relative',
	width: spinnerSize,
};

const noSpinner: React.CSSProperties = {
	position: 'relative',
	width: spinnerSize,
};

export const MenuBuildIndicator: React.FC<{
	readonly mobileLayout: boolean;
}> = ({mobileLayout}) => {
	const [isBuilding, setIsBuilding] = useState(false);
	const folderLocation = useMemo(() => {
		return {
			source: window.remotion_cwd,
			line: 1,
			column: 1,
		};
	}, []);

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
			<Spacing x={mobileLayout ? 0.5 : 2} />
			{window.remotion_projectName}
			<MenuCompositionName />
			<InspectorOpenInEditor location={folderLocation} />
			{mobileLayout ? null : <Spacing x={0.5} />}
			{mobileLayout ? (
				isBuilding ? (
					<>
						<Spacing x={0.5} />
						<div style={spinner}>
							<Spinner
								duration={0.5}
								size={spinnerSize}
								color={WHITE_ALPHA_80}
							/>
						</div>
					</>
				) : null
			) : isBuilding ? (
				<div style={spinner}>
					<Spinner duration={0.5} size={spinnerSize} color={WHITE_ALPHA_80} />
				</div>
			) : (
				<div style={noSpinner} />
			)}
		</div>
	);
};
