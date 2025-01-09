import {useLocation} from '@remix-run/react';
import React, {useState} from 'react';
import type {Source} from '~/lib/convert-state';
import {TitleProvider} from '~/lib/title-context';
import type { RouteAction} from '~/seo';
import {getHeaderTitle} from '~/seo';
import {FileAvailable} from './FileAvailable';
import {PickFile} from './PickFile';

export const Main: React.FC<{
	readonly routeAction: RouteAction;
}> = ({routeAction}) => {
	const location = useLocation();
	const [url] = useState(new URLSearchParams(location.search));

	const [src, setSrc] = useState<Source | null>(() => {
		return url.has('url') ? {type: 'url', url: url.get('url') as string} : null;
	});

	return (
		<TitleProvider routeAction={routeAction}>
			<div className="font-sans min-h-screen">
				{src ? (
					<FileAvailable
						key={src.type === 'url' ? src.url : src.file.name}
						routeAction={routeAction}
						src={src}
						setSrc={setSrc}
					/>
				) : (
					<PickFile setSrc={setSrc} title={getHeaderTitle(routeAction)} />
				)}
			</div>
		</TitleProvider>
	);
};
