import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/browser-bundler/create-browser-bundler">
					<strong>createBrowserBundler()</strong>
					<div>Compile virtual Remotion projects in the browser</div>
				</TOCItem>
				<TOCItem link="/docs/browser-bundler/load-browser-bundle">
					<strong>loadBrowserBundle()</strong>
					<div>Execute a trusted bundle and capture its registered root</div>
				</TOCItem>
				<TOCItem link="/docs/browser-bundler/create-browser-bundle-runtime">
					<strong>createBrowserBundleRuntime()</strong>
					<div>Apply live edits with Rspack and React Fast Refresh</div>
				</TOCItem>
				<TOCItem link="/docs/browser-bundler/get-browser-composition">
					<strong>getBrowserComposition()</strong>
					<div>Resolve a registered composition for playback</div>
				</TOCItem>
				<TOCItem link="/docs/browser-bundler/create-browser-composition-observer">
					<strong>createBrowserCompositionObserver()</strong>
					<div>Keep composition registration mounted across live edits</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
