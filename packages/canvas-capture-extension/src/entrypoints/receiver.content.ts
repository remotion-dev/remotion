import {defineContentScript} from 'wxt/utils/define-content-script';
import {startReceiver} from '../receiver';

export default defineContentScript({
	matches: [
		'https://remotion.dev/convert*',
		'https://www.remotion.dev/convert*',
		'https://remotion.dev/new*',
		'https://www.remotion.dev/new*',
	],
	runAt: 'document_start',
	main: startReceiver,
});
