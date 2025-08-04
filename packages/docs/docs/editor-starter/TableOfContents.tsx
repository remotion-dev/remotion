import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/editor-starter/setup">
					<strong>Setup</strong>
					<div>Installation and configuration guide.</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/features">
					<strong>Features</strong>
					<div>Features included in the Editor Starter.</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/fonts">
					<strong>Fonts</strong>
					<div>Fonts included in the Editor Starter.</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/captioning">
					<strong>Captioning</strong>
					<div>How to setup captions and how they work.</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/asset-uploads">
					<strong>Asset Uploads</strong>
					<div>Asset upload functionality in the Editor Starter.</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/undo-and-redo">
					<strong>Undo and Redo</strong>
					<div>Undo and Redo functionality in the Editor Starter.</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/features-not-included">
					<strong>Features not included</strong>
					<div>Features not included in the Editor Starter.</div>
				</TOCItem>
				<TOCItem link="/docs/editor-starter/faq">
					<strong>FAQ</strong>
					<div>Frequently asked questions</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
