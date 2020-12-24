import React from 'react';
import {render} from 'react-dom';
import {RemotionRoot} from 'remotion';
import {Editor} from './editor/components/Editor';

render(
	<RemotionRoot>
		<Editor />
	</RemotionRoot>,
	document.getElementById('container')
);
