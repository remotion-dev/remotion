import React, {useMemo, useState} from 'react';
import {getRoot} from 'remotion';
import styled from 'styled-components';
import {PreviewSize, PreviewSizeContext} from '../state/preview-size';
import {Timeline} from './Timeline';
import {TopPanel} from './TopPanel';

const Background = styled.div`
	background: #222;
	display: flex;
	width: 100%;
	height: 100%;
	flex-direction: column;
	position: absolute;
`;

const Root = getRoot();

export const Editor: React.FC = () => {
	const [size, setSize] = useState<PreviewSize>('auto');

	const previewCtx = useMemo(() => {
		return {
			size,
			setSize,
		};
	}, [size]);

	if (!Root) {
		throw new Error('Root has not been registered. ');
	}
	return (
		<PreviewSizeContext.Provider value={previewCtx}>
			<Background>
				<Root />
				<TopPanel />
				<Timeline />
			</Background>
		</PreviewSizeContext.Provider>
	);
};
