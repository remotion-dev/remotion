import React, {useEffect} from 'react';
import {getStaticFiles} from 'remotion';
import {subscribeToEvent} from '../../event-source';
import {BACKGROUND} from '../helpers/colors';
import {useZIndex} from '../state/z-index';
import {AssetSelectorItem} from './AssetSelectorItem';

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

	const [staticFiles, setStaticFiles] = React.useState(() => getStaticFiles());

	useEffect(() => {
		const onUpdate = () => {
			setStaticFiles(getStaticFiles());
		};

		const unsub = subscribeToEvent('new-public-folder', onUpdate);
		return () => {
			unsub();
		};
	}, []);

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
