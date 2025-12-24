import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/editor-starter/demo">
					<strong>Demo</strong>
					<div>A demo of the Editor Starter</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/before-you-buy">
					<strong>Before you buy</strong>
					<div>What to consider before buying</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/buy">
					<strong>Buy</strong>
					<div>How to buy the Editor Starter</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/setup">
					<strong>Setup</strong>
					<div>Installation and configuration guide</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/dependencies">
					<strong>Dependencies</strong>
					<div>Required dependencies for Editor Starter</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/features">
					<strong>Features</strong>
					<div>Features included in the Editor Starter</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/state-management">
					<strong>State Management</strong>
					<div>How state is managed in the Editor Starter</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/tracks-items-assets">
					<strong>Tracks, Items &amp; Assets</strong>
					<div>Managing tracks, items, and assets</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/undo-redo">
					<strong>Undo and Redo</strong>
					<div>Undo and Redo functionality in the Editor Starter</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/copy-paste">
					<strong>Copy and Paste</strong>
					<div>How it is implemented in the Editor Starter</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/cropping">
					<strong>Cropping</strong>
					<div>Mechanics, UI, state management</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/fonts">
					<strong>Fonts</strong>
					<div>How fonts work and which ones are included</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/asset-uploads">
					<strong>Asset Uploads</strong>
					<div>Asset upload functionality in the Editor Starter</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/asset-cleanup">
					<strong>Asset Cleanup</strong>
					<div>How to cleanup assets that are no longer needed</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/persistance">
					<strong>Persistance</strong>
					<div>How data is persisted in the Editor Starter</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/captioning">
					<strong>Captioning</strong>
					<div>How to setup captions and how they work</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/rendering">
					<strong>Rendering</strong>
					<div>How to setup exports and how they work</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/backend-routes">
					<strong>Backend Routes</strong>
					<div>Backend routes used by the Editor Starter</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/features-not-included">
					<strong>Features not included</strong>
					<div>Features not included in the Editor Starter</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/faq">
					<strong>FAQ</strong>
					<div>Frequently asked questions</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
