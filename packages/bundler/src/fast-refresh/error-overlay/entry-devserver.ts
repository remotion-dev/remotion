// @ts-check
const querystring = require('querystring');
const url = require('url');
const SockJS = require('sockjs-client');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const {reportBuildError, dismissBuildError} = require('react-error-overlay');

let sockOptions = {};
if (typeof __resourceQuery === 'string' && __resourceQuery.length > 1) {
	sockOptions = querystring.parse(__resourceQuery.substr(1));
}

const connection = new SockJS(
	url.format({
		protocol: window.location.protocol,
		hostname: sockOptions.sockHost || window.location.hostname,
		port: sockOptions.sockPort || window.location.port,
		pathname: sockOptions.sockPath || '/sockjs-node',
	})
);

connection.onmessage = function onmessage(e) {
	const {type, data} = JSON.parse(e.data);
	let formatted;
	switch (type) {
		case 'ok':
			dismissBuildError();
			break;
		case 'errors':
			formatted = formatWebpackMessages({
				errors: data,
				warnings: [],
			});
			reportBuildError(formatted.errors[0]);
			break;
		default:
		// Do nothing.
	}
};
