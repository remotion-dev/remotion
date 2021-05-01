import React from 'react';
import {render} from 'react-dom';
import {Internals} from 'remotion';
import '../styles/styles.css';
import {Editor} from './editor/components/Editor';

render(
	<Internals.RemotionRoot>
		<Editor />
	</Internals.RemotionRoot>,
	document.getElementById('container')
);
