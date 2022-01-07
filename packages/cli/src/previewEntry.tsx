import {render} from 'react-dom';
import {Internals} from 'remotion';
import '../styles/styles.css';
import {Editor} from './editor/components/Editor';

Internals.CSSUtils.injectCSS(
	Internals.CSSUtils.makeDefaultCSS(null, '#1f2428')
);

render(
	<Internals.RemotionRoot>
		<Editor />
	</Internals.RemotionRoot>,
	document.getElementById('container')
);
