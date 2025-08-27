import React, {useEffect, useRef} from 'react';

export default () => {
	const ref = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		const onMessage = (event: MessageEvent) => {
			try {
				const json =
					typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

				if (json.type === 'keydown') {
					// CrawlChat sends Cmd+shift+k event
					if (
						(json.data.key === 'i' && json.data.metaKey) ||
						json.data.key === 'Escape'
					) {
						window.parent.postMessage(
							{
								type: 'cmd-i',
							},
							'*',
						);
					}
				}

				if (json.type === 'focus') {
					setTimeout(() => {
						ref.current?.contentWindow?.postMessage('focus', '*');
						ref.current?.contentWindow?.postMessage('dark-mode', '*');
					}, 100);
				}
			} catch {}
		};

		window.addEventListener('message', onMessage);

		return () => {
			window.removeEventListener('message', onMessage);
		};
	}, []);

	return (
		<iframe
			ref={ref}
			src="https://crawlchat.app/w/67c0a28c5b075f0bb35e5366"
			style={{
				width: '100%',
				height: '100%',
				position: 'absolute',
			}}
			allow="clipboard-read; clipboard-write"
		/>
	);
};
