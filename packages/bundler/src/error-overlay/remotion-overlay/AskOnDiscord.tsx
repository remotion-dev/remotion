const DISCORD_LINK = 'https://discord.gg/6VzzNDwUwV';

import React, {useCallback} from 'react';
import {Button} from './Button';

export const AskOnDiscord: React.FC = () => {
	const openInBrowser = useCallback(() => {
		window.open(DISCORD_LINK, '_blank');
	}, []);
	return <Button onClick={openInBrowser}>Ask on Discord</Button>;
};
