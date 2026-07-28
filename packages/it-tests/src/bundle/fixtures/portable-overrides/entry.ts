import Content from './content.mdx';
import message from './message.custom';
import './style.css';

(
	globalThis as typeof globalThis & {__portableOverrides: unknown}
).__portableOverrides = {
	Content,
	message,
};
