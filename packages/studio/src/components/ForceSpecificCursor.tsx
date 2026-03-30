import React, {useMemo} from 'react';

const ref = React.createRef<HTMLDivElement>();

export const forceSpecificCursor = (cursor: string): void => {
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

const Z_INDEX_FORCE_SPECIFIC_CURSOR = 100;

export const ForceSpecificCursor = () => {
	const style: React.CSSProperties = useMemo(() => {
		return {
			position: 'fixed',
			inset: 0,
			zIndex: Z_INDEX_FORCE_SPECIFIC_CURSOR,
			pointerEvents: 'none' as const,
		};
	}, []);

	return <div ref={ref} style={style} />;
};
