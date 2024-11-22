import React, {useEffect, useState} from 'react';
import {SAMPLE_FILE, TEST_FAST} from '~/lib/config';
import {Source} from '~/lib/convert-state';
import {FileAvailable} from './FileAvailable';
import {PickFile} from './PickFile';

export const Main: React.FC<{
	readonly headerTitle: string;
	readonly pageTitle: string;
}> = ({headerTitle, pageTitle}) => {
	const [src, setSrc] = useState<Source | null>(
		TEST_FAST ? {type: 'url', url: SAMPLE_FILE} : null,
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
