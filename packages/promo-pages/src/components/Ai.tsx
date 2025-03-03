import React, {useCallback} from 'react';

export const AskAi: React.FC = () => {
	const click = useCallback(() => {
		// @ts-expect-error
		window.crawlchatEmbed.show();
	}, []);

	return (
		<button
			type="button"
			onClick={click}
			style={{
				backgroundColor: '#282A36',
				cursor: 'pointer',
			}}
			className="rounded-full text-white fixed z-10 bottom-8 right-8 fontbrand appearance-none border-none px-4 py-2 font-medium text-sm"
		>
			Ask AI
		</button>
	);
};
