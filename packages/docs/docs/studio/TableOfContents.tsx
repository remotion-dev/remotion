import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/studio/get-static-files">
					<strong>{'getStaticFiles()'}</strong>
					<div>
						Get a list of files in the <code>public</code> folder
					</div>
				</TOCItem>
				<TOCItem link="/docs/studio/watch-public-folder">
					<strong>{'watchPublicFolder()'}</strong>
					<div>Listen to changes in the public folder</div>
				</TOCItem>
				<TOCItem link="/docs/studio/watch-static-file">
					<strong>{'watchStaticFile()'}</strong>
					<div>Listen to changes of a static file</div>
				</TOCItem>
				<TOCItem link="/docs/studio/write-static-file">
					<strong>{'writeStaticFile()'}</strong>
					<div>Save content to a file in the public directory</div>
				</TOCItem>
				<TOCItem link="/docs/studio/save-default-props">
					<strong>{'saveDefaultProps()'}</strong>
					<div>Save default props to the root file</div>
				</TOCItem>
				<TOCItem link="/docs/studio/update-default-props">
					<strong>{'updateDefaultProps()'}</strong>
					<div>Update default props in the Props editor</div>
				</TOCItem>
				<TOCItem link="/docs/studio/delete-static-file">
					<strong>{'deleteStaticFile()'}</strong>
					<div>Delete a file from the public directory</div>
				</TOCItem>
				<TOCItem link="/docs/studio/restart-studio">
					<strong>{'restartStudio()'}</strong>
					<div>Restart the Studio Server.</div>
				</TOCItem>
				<TOCItem link="/docs/studio/seek">
					<strong>{'seek()'}</strong>
					<div>Jump to a position in the timeline</div>
				</TOCItem>
				<TOCItem link="/docs/studio/focus-default-props-path">
					<strong>{'focusDefaultPropsPath()'}</strong>
					<div>Scrolls to a specific field in the default props editor</div>
				</TOCItem>
				<TOCItem link="/docs/studio/reevaluate-composition">
					<strong>{'reevaluateComposition()'}</strong>
					<div>Re-runs calculateMetadata() on the current composition</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
