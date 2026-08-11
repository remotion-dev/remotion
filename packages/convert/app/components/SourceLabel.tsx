import React from 'react';
import type {Source} from '~/lib/convert-state';

export const SourceLabel: React.FC<{
	readonly src: Source;
}> = ({src}) => {
	if (src.type === 'file') {
		return <span>From file input</span>;
	}

	const url = new URL(src.url);

	const origin = url.origin
		.replace(/^https?:\/\//, '')
		.replace(/^http:\/\//, '');

	return (
		<span className="font-brand white ">
			From{' '}
			<a
				href={src.url}
				title={src.url}
				target="_blank"
				className="font-semibold hover:underline "
			>
				{origin}
			</a>
		</span>
	);
};
