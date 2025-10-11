import React, {useMemo} from 'react';
import {VERTICAL_GUIDE_HEIGHT} from './SchemaSeparationLine';

const flex: React.CSSProperties = {
	flex: 1,
};

export const SchemaVerticalGuide: React.FC<{
	readonly isRoot: boolean;
	readonly children: React.ReactNode;
}> = ({isRoot, children}) => {
	const outer: React.CSSProperties = useMemo(() => {
		return {
			display: 'flex',
			flexDirection: 'row',
			position: 'relative',
			marginLeft: isRoot ? 0 : 4,
		};
	}, [isRoot]);

	const inner: React.CSSProperties = useMemo(() => {
		return isRoot
			? {}
			: {
					height: `calc(100% - ${VERTICAL_GUIDE_HEIGHT / 2}px)`,
					width: 1,
					background: '#363A3E',
					position: 'absolute',
				};
	}, [isRoot]);

	return (
		<div style={outer}>
			<div style={inner} />
			<div style={flex}>{children}</div>
		</div>
	);
};
