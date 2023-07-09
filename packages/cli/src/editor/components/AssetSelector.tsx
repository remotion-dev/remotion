import React from 'react';
import {getStaticFiles} from 'remotion';
import {BACKGROUND} from '../helpers/colors';
import {AssetSelectorItem} from './AssetSelectorItem';
import {useZIndex} from '../state/z-index';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
	overflow: 'hidden',
	backgroundColor: BACKGROUND,
};

const list: React.CSSProperties = {
	overflowY: 'auto',
};

export const AssetSelector: React.FC = () => {
	const {tabIndex} = useZIndex();

	const staticFiles = React.useMemo(() => getStaticFiles(), []);

	return (
		<div style={container}>
			<div className="__remotion-vertical-scrollbar" style={list}>
				{staticFiles.map((file) => {
					return (
						<AssetSelectorItem
							key={`${file.src}`}
							item={file}
							tabIndex={tabIndex}
						/>
					);
				})}
			</div>
		</div>
	);
};
