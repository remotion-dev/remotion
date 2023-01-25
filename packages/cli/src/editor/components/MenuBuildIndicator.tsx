import React, {useEffect, useState} from 'react';

const cwd: React.CSSProperties = {
	fontSize: 13,
	opacity: 0.8,
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
			{isBuilding ? 'Building...' : window.remotion_projectName}
		</div>
	);
};
