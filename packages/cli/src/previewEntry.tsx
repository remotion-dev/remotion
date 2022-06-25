import type {render} from 'react-dom';
import ReactDOM from 'react-dom/client';
import {Internals} from 'remotion';
import {TimelineRoot} from 'remotion/src/TimelineRoot';
import '../styles/styles.css';
import {Editor} from './editor/components/Editor';

Internals.CSSUtils.injectCSS(
	Internals.CSSUtils.makeDefaultCSS(null, '#1f2428')
);

const content = (
	<TimelineRoot>
		<Internals.RemotionRoot>
			<Editor />
		</Internals.RemotionRoot>
	</TimelineRoot>
);

if (ReactDOM.createRoot) {
	ReactDOM.createRoot(Internals.getPreviewDomElement() as HTMLElement).render(
		content
	);
} else {
	(ReactDOM as unknown as {render: typeof render}).render(
		content,
		Internals.getPreviewDomElement()
	);
}
