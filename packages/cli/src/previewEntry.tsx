import React from 'react';
import {render} from 'react-dom';
import {RecoilRoot} from 'recoil';
import {RemotionRoot} from 'remotion';
import {Editor} from './editor/components/Editor';

render(
	<RemotionRoot>
		<RecoilRoot>
			<Editor />
		</RecoilRoot>
	</RemotionRoot>,
	document.getElementById('container')
);
