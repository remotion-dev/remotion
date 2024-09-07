import React from 'react';

export const SourceLabel: React.FC<{
	readonly src: string | File;
}> = ({src}) => {
	if (src instanceof File) {
		return <div>From file</div>;
	}

	const url = new URL(src as string);

	const origin = url.origin
		.replace(/^https?:\/\//, '')
		.replace(/^http:\/\//, '');

	return (
		<div>
			From{' '}
			<a
				href={src}
				title={src}
				target="_blank"
				className="font-semibold hover:underline"
			>
				{origin}
			</a>
		</div>
	);
};
