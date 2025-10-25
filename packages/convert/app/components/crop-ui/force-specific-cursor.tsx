import React, {useMemo} from 'react';

const ref = React.createRef<HTMLDivElement>();

export const forceSpecificCursor = (
	cursor: Exclude<React.CSSProperties['cursor'], undefined>,
) => {
	if (!ref.current) {
		throw new Error('ForceSpecificCursor is not mounted');
	}

	ref.current.style.cursor = cursor;
	ref.current.style.pointerEvents = 'auto';
};

export const stopForcingSpecificCursor = () => {
	if (!ref.current) {
		throw new Error('ForceSpecificCursor is not mounted');
	}

	ref.current.style.cursor = '';
	ref.current.style.pointerEvents = 'none';
};

export const ForceSpecificCursor = () => {
	const style: React.CSSProperties = useMemo(() => {
		return {
			zIndex: 10,
		};
	}, []);

	return (
		<div
			ref={ref}
			className="pointer-events-none absolute inset-0"
			style={style}
		/>
	);
};
