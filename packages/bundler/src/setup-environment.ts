import {Internals} from 'remotion';

window.remotion_acceptStyleSheet = (el) => {
	console.log({el, target: document.getElementById('IFrameWrapper')});
};

Internals.setupEnvVariables();
Internals.setupInitialFrame();
