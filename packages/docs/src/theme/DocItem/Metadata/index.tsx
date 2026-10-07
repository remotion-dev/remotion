import {useDoc} from '@docusaurus/plugin-content-docs/client';
import {PageMetadata} from '@docusaurus/theme-common';
import DocItemMetadata from '@theme-original/DocItem/Metadata';
import React, {type ReactNode} from 'react';

export default function DocItemMetadataWrapper(): ReactNode {
	const {metadata, frontMatter} = useDoc();
	const component = metadata.title.match(/^<([\w.]+)\s*\/?>$/);

	if (component === null) {
		return <DocItemMetadata />;
	}

	const packageName =
		typeof frontMatter.crumb === 'string'
			? (frontMatter.crumb.match(/@remotion\/[\w-]+/)?.[0] ?? null)
			: null;
	const title = `${component[1]} component${packageName === null ? '' : ` (${packageName})`}`;

	return (
		<>
			<DocItemMetadata />
			<PageMetadata title={title} />
		</>
	);
}
