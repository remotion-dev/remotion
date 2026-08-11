import {emojis} from './emoji-data';

export const getAvailableEmojis = () => {
	return emojis;
};

export type EmojiName = (typeof emojis)[number]['name'];
