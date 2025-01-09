import http from 'node:http';
import https from 'node:https';

export const mockableHttpClients = {
	http: http.request,
	https: https.request,
};

export const getWebhookClient = (url: string) => {
	if (url.startsWith('https://')) {
		return mockableHttpClients.https;
	}

	if (url.startsWith('http://')) {
		return mockableHttpClients.http;
	}

	throw new Error('Can only request URLs starting with http:// or https://');
};
