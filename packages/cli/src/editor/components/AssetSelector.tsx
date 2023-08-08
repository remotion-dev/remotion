import React, {useEffect} from 'react';
import type {StaticFile} from 'remotion';
import {getStaticFiles} from 'remotion';
import {subscribeToEvent} from '../../event-source';
import {BACKGROUND, LIGHT_TEXT} from '../helpers/colors';
import type {AssetFolder} from '../helpers/create-folder-tree';
import {buildAssetFolderStructure} from '../helpers/create-folder-tree';
import {useZIndex} from '../state/z-index';
import {AssetFolderItem} from './AssetSelectorItem';
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
	height: 'calc(100%)',
	overflowY: 'auto',
};

type State = {
	staticFiles: StaticFile[];
	publicFolderExists: string | null;
};

export const AssetSelector: React.FC = () => {
	const {tabIndex} = useZIndex();

	const [{publicFolderExists, staticFiles}, setState] = React.useState<State>(
		() => {
			return {
				staticFiles: getStaticFiles(),
				publicFolderExists: window.remotion_publicFolderExists,
			};
		}
	);
	const assetTree = buildAssetFolderStructure(staticFiles);
	console.log(assetTree);
	const publicFolder: AssetFolder = {
		name: 'public',
		items: assetTree,
	};
	useEffect(() => {
		const onUpdate = () => {
			setState({
				staticFiles: getStaticFiles(),
				publicFolderExists: window.remotion_publicFolderExists,
			});
		};

		const unsub = subscribeToEvent('new-public-folder', onUpdate);
		return () => {
			unsub();
		};
	}, []);

	return (
		<div style={container}>
			{staticFiles.length === 0 ? (
				publicFolderExists ? (
					<div style={emptyState}>
						<div style={label}>
							To add assets, place a file in the{' '}
							<code style={inlineCodeSnippet}>public</code> folder of your
							project.
						</div>
					</div>
				) : (
					<div style={emptyState}>
						<div style={label}>
							To add assets, create a folder called{' '}
							<code style={inlineCodeSnippet}>public</code> in the root of your
							project and place a file in it.
						</div>
					</div>
				)
			) : (
				<div className="__remotion-vertical-scrollbar" style={list}>
					<AssetFolderItem item={publicFolder} tabIndex={tabIndex} level={0} />
				</div>
			)}
		</div>
	);
};
