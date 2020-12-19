import React, {useMemo, useState} from 'react';
import {getRoot} from 'remotion';
import {
	CheckerboardContext,
	loadCheckerboardOption,
} from '../state/checkerboard';
import {PreviewSize, PreviewSizeContext} from '../state/preview-size';
import {Timeline} from './Timeline';
import {TopPanel} from './TopPanel';

const background: React.CSSProperties = {
	background: '#222',
	display: 'flex',
	width: '100%',
	height: '100%',
	flexDirection: 'column',
	position: 'absolute',
};

const Root = getRoot();

export const Editor: React.FC = () => {
	const [size, setSize] = useState<PreviewSize>('auto');
	const [checkerboard, setCheckerboard] = useState(loadCheckerboardOption());

	const previewCtx = useMemo(() => {
		return {
			size,
			setSize,
		};
	}, [size]);

	const checkerboardCtx = useMemo(() => {
		return {
			checkerboard,
			setCheckerboard,
		};
	}, [checkerboard]);

	if (!Root) {
		throw new Error('Root has not been registered. ');
	}
	return (
		<CheckerboardContext.Provider value={checkerboardCtx}>
			<PreviewSizeContext.Provider value={previewCtx}>
				<div style={background}>
					<Root />
					<TopPanel />
					<Timeline />
				</div>
			</PreviewSizeContext.Provider>
		</CheckerboardContext.Provider>
	);
};
