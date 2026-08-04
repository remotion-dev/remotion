import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<Grid>
			<TOCItem link="/docs/studio-protocol/create-element-payload">
				<strong>createElementPayload()</strong>
				<div>Create a versioned Element payload</div>
			</TOCItem>
			<TOCItem link="/docs/studio-protocol/set-studio-drag-data">
				<strong>setStudioDragData()</strong>
				<div>Put an Element payload on a drag event</div>
			</TOCItem>
			<TOCItem link="/docs/studio-protocol/install-in-studio">
				<strong>installInStudio()</strong>
				<div>Request installation into the active Studio</div>
			</TOCItem>
			<TOCItem link="/docs/studio-protocol/security">
				<strong>Security</strong>
				<div>Confirmation and origin policy</div>
			</TOCItem>
		</Grid>
	);
};
