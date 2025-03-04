import {webReader} from './readers/web';
import {messageHandler} from './worker-server';

addEventListener('message', (message) => {
	messageHandler(message, webReader);
});
