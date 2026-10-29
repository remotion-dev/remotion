import Content from '../portable-overrides/content.mdx';
import message from '../portable-overrides/message.custom';
import '../portable-overrides/style.css';
import styles from './module.module.scss';
import './global.scss';
import './tailwind.css';

class BabelExperiment {
	field = 'BABEL_LOADER_SENTINEL';
}

(
	globalThis as typeof globalThis & {__portableHelpers: unknown}
).__portableHelpers = (
	<div className={`text-red-500 ${styles.moduleClass}`}>
		<Content />
		{message}
		{new BabelExperiment().field}
	</div>
);
