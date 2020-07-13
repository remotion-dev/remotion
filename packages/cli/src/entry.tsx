import React from 'react';
import {render} from 'react-dom';
import './Hey';
import {Editor} from './editor/components/Editor';
import {RecoilRoot} from 'recoil';

render(
	<RecoilRoot>
		<Editor />
	</RecoilRoot>,
	document.getElementById('container')
);
