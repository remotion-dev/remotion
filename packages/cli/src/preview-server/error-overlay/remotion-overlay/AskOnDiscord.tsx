const DISCORD_LINK = 'https://remotion.dev/discord';

import React, {useCallback} from 'react';
import {Button} from './Button';

export const AskOnDiscord: React.FC = () => {
	const openInBrowser = useCallback(() => {
		window.open(DISCORD_LINK, '_blank');
	}, []);
	return <Button onClick={openInBrowser}>Ask on Discord</Button>;
};
