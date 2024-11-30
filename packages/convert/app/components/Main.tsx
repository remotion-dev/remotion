import {useLocation} from '@remix-run/react';
import React, {useEffect, useState} from 'react';
import {Source} from '~/lib/convert-state';
import {FileAvailable} from './FileAvailable';
import {PickFile} from './PickFile';

export const Main: React.FC<{
	readonly headerTitle: string;
	readonly pageTitle: string;
}> = ({headerTitle, pageTitle}) => {
	const location = useLocation();
	const [url] = useState(new URLSearchParams(location.search));

	const [src, setSrc] = useState<Source | null>(
		url.has('url') ? {type: 'url', url: url.get('url') as string} : null,
	);

	useEffect(() => {
		document.title = pageTitle;
	}, [pageTitle]);

	return (
		<div className="font-sans min-h-screen ">
			{src ? (
				<FileAvailable
					key={src.type === 'url' ? src.url : src.file.name}
					src={src}
					setSrc={setSrc}
				/>
			) : (
				<PickFile setSrc={setSrc} title={headerTitle} />
			)}
		</div>
	);
};
