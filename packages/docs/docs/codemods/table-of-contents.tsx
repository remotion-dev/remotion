import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<Grid>
			<TOCItem link="/docs/codemods/add-canvas-capture-composition">
				<strong>addCanvasCaptureComposition()</strong>
				<div>
					Creates and registers an interactive Canvas Capture component.
				</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/add-composition">
				<strong>addComposition()</strong>
				<div>
					Adds a &lt;Composition&gt; registration referencing an existing named
					component export.
				</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/add-effect">
				<strong>addEffect()</strong>
				<div>
					Appends an effect to a node&apos;s inline effects array and adds its
					import.
				</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/add-element">
				<strong>addElement()</strong>
				<div>
					Inserts an element into a composition or relative to an existing node,
					including its imports.
				</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/add-folder">
				<strong>addFolder()</strong>
				<div>Adds an empty &lt;Folder&gt; to the registration tree.</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/apply-codemod-changes">
				<strong>applyCodemodChanges()</strong>
				<div>Applies file changes to an in-memory project.</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/create-element">
				<strong>createElement()</strong>
				<div>
					Describes an element with props and children to insert into source
					code.
				</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/delete-composition">
				<strong>deleteComposition()</strong>
				<div>Removes a composition or still registration.</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/delete-effects">
				<strong>deleteEffects()</strong>
				<div>Deletes selected effects from one or more nodes.</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/delete-nodes">
				<strong>deleteNodes()</strong>
				<div>Deletes nodes across project files.</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/detach-audio">
				<strong>detachAudio()</strong>
				<div>
					Mutes a video element and inserts a corresponding audio element beside
					it.
				</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/duplicate-composition">
				<strong>duplicateComposition()</strong>
				<div>Copies a composition or still registration with a new ID.</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/duplicate-effects">
				<strong>duplicateEffects()</strong>
				<div>Copies selected effects immediately after their originals.</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/duplicate-nodes">
				<strong>duplicateNodes()</strong>
				<div>Duplicates one or more nodes beside their originals.</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/get-node-props">
				<strong>getNodeProps()</strong>
				<div>
					Inspects props and inline effects without executing the project.
				</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/get-nodes">
				<strong>getNodes()</strong>
				<div>Lists the nodes in a project file in source order.</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/move-composition">
				<strong>moveComposition()</strong>
				<div>
					Moves a composition into a folder, to the root, or beside another
					registration.
				</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/move-folder">
				<strong>moveFolder()</strong>
				<div>Moves a folder and its contents within a registration file.</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/rename-composition">
				<strong>renameComposition()</strong>
				<div>Changes a composition registration&apos;s ID.</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/rename-folder">
				<strong>renameFolder()</strong>
				<div>Renames a folder while keeping its contents.</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/reorder-effect">
				<strong>reorderEffect()</strong>
				<div>Moves an effect to another index in the same effects array.</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/reorder-node">
				<strong>reorderNode()</strong>
				<div>Moves a node before or after a sibling.</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/resolve-composition-component">
				<strong>resolveCompositionComponent()</strong>
				<div>
					Locates the component used by a composition, following supported
					project imports and re-exports.
				</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/set-composition-default-props">
				<strong>setCompositionDefaultProps()</strong>
				<div>
					Replaces a composition&apos;s statically readable default props or
					adds them when missing.
				</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/split-sequences">
				<strong>splitSequences()</strong>
				<div>Splits supported timing elements into two adjacent nodes.</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/static-file-value">
				<strong>staticFileValue()</strong>
				<div>Creates a prop value that is written as a staticFile() call.</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/unwrap-folder">
				<strong>unwrapFolder()</strong>
				<div>
					Removes a &lt;Folder&gt; wrapper while keeping its contents in the
					same position.
				</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/update-composition-metadata">
				<strong>updateCompositionMetadata()</strong>
				<div>
					Updates width, height, FPS, or duration on a composition registration.
				</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/update-effect-keyframes">
				<strong>updateEffectKeyframes()</strong>
				<div>
					Adds, removes, moves, or configures keyframes on an effect property.
				</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/update-effect-props">
				<strong>updateEffectProps()</strong>
				<div>
					Updates explicit properties in an inline effect configuration.
				</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/update-multiple-node-props">
				<strong>updateMultipleNodeProps()</strong>
				<div>Updates props on multiple nodes in one operation.</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/update-node-keyframes">
				<strong>updateNodeKeyframes()</strong>
				<div>Adds, removes, moves, or configures keyframes on a node prop.</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/update-node-props">
				<strong>updateNodeProps()</strong>
				<div>
					Updates node props, nested object properties, and supported text
					children.
				</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/update-visual-controls">
				<strong>updateVisualControls()</strong>
				<div>
					Updates visual control defaults while preserving surrounding source.
				</div>
			</TOCItem>
			<TOCItem link="/docs/codemods/wrap-node">
				<strong>wrapNode()</strong>
				<div>Wraps an existing node in a new element.</div>
			</TOCItem>
		</Grid>
	);
};
