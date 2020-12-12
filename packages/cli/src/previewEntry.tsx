import {RemotionRoot} from '@remotion/core';
import React from 'react';
import {render} from 'react-dom';
import {RecoilRoot} from 'recoil';
import {Editor} from './editor/components/Editor';

render(
	<RemotionRoot>
		<RecoilRoot>
			<Editor />
		</RecoilRoot>
	</RemotionRoot>,
	document.getElementById('container')
);
