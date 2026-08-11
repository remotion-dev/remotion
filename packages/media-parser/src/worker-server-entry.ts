import {universalReader} from './universal';
import {messageHandler} from './worker-server';

addEventListener('message', (message) => {
	messageHandler(message, universalReader);
});
