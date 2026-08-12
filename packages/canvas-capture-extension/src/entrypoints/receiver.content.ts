import {defineContentScript} from 'wxt/utils/define-content-script';
import {startReceiver} from '../receiver';

export default defineContentScript({
	matches: [
		'https://remotion.dev/convert*',
		'https://www.remotion.dev/convert*',
	],
	runAt: 'document_start',
	main: startReceiver,
});
