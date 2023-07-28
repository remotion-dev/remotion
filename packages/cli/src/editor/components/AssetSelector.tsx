import React, {useEffect} from 'react';
import {getStaticFiles} from 'remotion';
import {subscribeToEvent} from '../../event-source';
import {BACKGROUND, LIGHT_TEXT} from '../helpers/colors';
import {useZIndex} from '../state/z-index';
import {AssetSelectorItem} from './AssetSelectorItem';
import {inlineCodeSnippet} from './Menu/styles';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
	overflow: 'hidden',
	backgroundColor: BACKGROUND,
};

// Some redundancy with packages/cli/src/editor/components/RenderModal/SchemaEditor/SchemaErrorMessages.tsx
const emptyState: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	justifyContent: 'center',
	alignItems: 'center',
	textAlign: 'center',
	padding: '0 12px',
};

const label: React.CSSProperties = {
	color: LIGHT_TEXT,
	lineHeight: 1.5,
	fontSize: 14,
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
			{staticFiles.length === 0 ? (
				<div style={emptyState}>
					<div style={label}>
						To add assets, create a folder called{' '}
						<code style={inlineCodeSnippet}>public</code> in the root of your
						project and place a file in it.
					</div>
				</div>
			) : (
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
			)}
		</div>
	);
};
