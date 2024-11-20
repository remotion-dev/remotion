import type {MetaFunction} from '@remix-run/node';
import {useState} from 'react';
import {FileAvailable} from '~/components/FileAvailable';
import {PickFile} from '~/components/PickFile';
import {SAMPLE_FILE, TEST_FAST} from '~/lib/config';
import {Source} from '~/lib/convert-state';

export const meta: MetaFunction = () => {
	return [
		{title: 'Remotion Convert'},
		{name: 'description', content: 'Fast video conersion in the browser.'},
	];
};

const Index = () => {
	const [src, setSrc] = useState<Source | null>(
		TEST_FAST ? {type: 'url', url: SAMPLE_FILE} : null,
	);

	return (
		<div className="font-sans min-h-screen bg-slate-50">
			{src ? (
				<FileAvailable
					key={src.type === 'url' ? src.url : src.file.name}
					src={src}
					setSrc={setSrc}
				/>
			) : (
				<PickFile setSrc={setSrc} />
			)}
		</div>
	);
};

export default Index;
