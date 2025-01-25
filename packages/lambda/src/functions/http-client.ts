import http from 'node:http';
import https from 'node:https';

export const getWebhookClient = (url: string) => {
	if (url.startsWith('https://')) {
		return https.request;
	}

	if (url.startsWith('http://')) {
		return http.request;
	}

	throw new Error('Can only request URLs starting with http:// or https://');
};
