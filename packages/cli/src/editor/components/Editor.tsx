import React, {useMemo, useState} from 'react';
import {Internals} from 'remotion';
import styled from 'styled-components';
import {
	CheckerboardContext,
	loadCheckerboardOption,
} from '../state/checkerboard';
import {PreviewSize, PreviewSizeContext} from '../state/preview-size';
import {Timeline} from './Timeline';
import {TopPanel} from './TopPanel';
import {UpdateCheck} from './UpdateCheck';

const Background = styled.div`
	background: #222;
	display: flex;
	width: 100%;
	height: 100%;
	flex-direction: column;
	position: absolute;
`;

const Root = Internals.getRoot();

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
				<Background>
					<Root />
					<UpdateCheck />
					<TopPanel />
					<Timeline />
				</Background>
			</PreviewSizeContext.Provider>
		</CheckerboardContext.Provider>
	);
};
