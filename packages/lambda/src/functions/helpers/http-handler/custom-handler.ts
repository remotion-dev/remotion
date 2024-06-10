import type {HttpHandler, HttpRequest} from '@smithy/protocol-http';
import {HttpResponse} from '@smithy/protocol-http';
import {buildQueryString} from '@smithy/querystring-builder';
import type {
	HttpHandlerOptions,
	NodeHttpHandlerOptions,
	Provider,
} from '@smithy/types';
import {Agent as hAgent, request as hRequest} from 'http';
import type {RequestOptions} from 'https';
import {Agent as hsAgent, request as hsRequest} from 'https';

import {getTransformedHeaders} from './get-transformed-headers';
import {setConnectionTimeout} from './set-connection-timeout';
import {setSocketKeepAlive} from './set-socket-keep-alive';
import {setSocketTimeout} from './set-socket-timeout';
import {writeRequestBody} from './write-request-body';

/**
 * Node.js system error codes that indicate timeout.
 * @deprecated use NODEJS_TIMEOUT_ERROR_CODES from @smithy/service-error-classification/constants
 */
export const NODEJS_TIMEOUT_ERROR_CODES = ['ECONNRESET', 'EPIPE', 'ETIMEDOUT'];
export {NodeHttpHandlerOptions};

interface ResolvedNodeHttpHandlerConfig
	extends Omit<NodeHttpHandlerOptions, 'httpAgent' | 'httpsAgent'> {
	httpAgent: hAgent;
	httpsAgent: hsAgent;
}

export const DEFAULT_REQUEST_TIMEOUT = 0;

export class NodeHttpHandler implements HttpHandler<NodeHttpHandlerOptions> {
	private config?: ResolvedNodeHttpHandlerConfig;
	private configProvider: Promise<ResolvedNodeHttpHandlerConfig>;
	private socketWarningTimestamp = 0;

	// Node http handler is hard-coded to http/1.1: https://github.com/nodejs/node/blob/ff5664b83b89c55e4ab5d5f60068fb457f1f5872/lib/_http_server.js#L286
	public readonly metadata = {handlerProtocol: 'http/1.1'};

	/**
	 * @returns the input if it is an HttpHandler of any class,
	 * or instantiates a new instance of this handler.
	 */
	public static create(
		instanceOrOptions?:
			| HttpHandler<any>
			| NodeHttpHandlerOptions
			| Provider<NodeHttpHandlerOptions | void>,
	) {
		if (typeof (instanceOrOptions as any)?.handle === 'function') {
			// is already an instance of HttpHandler.
			return instanceOrOptions as HttpHandler<any>;
		}

		// input is ctor options or undefined.
		return new NodeHttpHandler(instanceOrOptions as NodeHttpHandlerOptions);
	}

	/**
	 * @internal
	 *
	 * @param agent - http(s) agent in use by the NodeHttpHandler instance.
	 * @returns timestamp of last emitted warning.
	 */
	public static checkSocketUsage(
		agent: hAgent | hsAgent,
		socketWarningTimestamp: number,
	): number {
		// note, maxSockets is per origin.
		const {sockets, requests, maxSockets} = agent;

		if (typeof maxSockets !== 'number' || maxSockets === Infinity) {
			return socketWarningTimestamp;
		}

		const interval = 15_000;
		if (Date.now() - interval < socketWarningTimestamp) {
			return socketWarningTimestamp;
		}

		if (sockets && requests) {
			for (const origin in sockets) {
				const socketsInUse = sockets[origin]?.length ?? 0;
				const requestsEnqueued = requests[origin]?.length ?? 0;

				/**
				 * Running at maximum socket usage can be intentional and normal.
				 * That is why this warning emits at a delay which can be seen
				 * at the call site's setTimeout wrapper. The warning will be cancelled
				 * if the request finishes in a reasonable amount of time regardless
				 * of socket saturation.
				 *
				 * Additionally, when the warning is emitted, there is an interval
				 * lockout.
				 */
				if (socketsInUse >= maxSockets && requestsEnqueued >= 2 * maxSockets) {
					console.warn(
						'@smithy/node-http-handler:WARN',
						`socket usage at capacity=${socketsInUse} and ${requestsEnqueued} additional requests are enqueued.`,
						'See https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-configuring-maxsockets.html',
						'or increase socketAcquisitionWarningTimeout=(millis) in the NodeHttpHandler config.',
					);
					return Date.now();
				}
			}
		}

		return socketWarningTimestamp;
	}

	constructor(
		options?: NodeHttpHandlerOptions | Provider<NodeHttpHandlerOptions | void>,
	) {
		this.configProvider = new Promise((resolve, reject) => {
			if (typeof options === 'function') {
				options()
					.then((_options) => {
						resolve(this.resolveDefaultConfig(_options));
					})
					.catch(reject);
			} else {
				resolve(this.resolveDefaultConfig(options));
			}
		});
	}

	private resolveDefaultConfig(
		options?: NodeHttpHandlerOptions | void,
	): ResolvedNodeHttpHandlerConfig {
		const {
			requestTimeout,
			connectionTimeout,
			socketTimeout,
			httpAgent,
			httpsAgent,
		} = options || {};
		const keepAlive = true;
		const maxSockets = 50;

		return {
			connectionTimeout,
			requestTimeout: requestTimeout ?? socketTimeout,
			httpAgent: (() => {
				if (
					httpAgent instanceof hAgent ||
					typeof (httpAgent as hAgent)?.destroy === 'function'
				) {
					return httpAgent as hAgent;
				}

				return new hAgent({keepAlive, maxSockets, ...httpAgent});
			})(),
			httpsAgent: (() => {
				if (
					httpsAgent instanceof hsAgent ||
					typeof (httpsAgent as hsAgent)?.destroy === 'function'
				) {
					return httpsAgent as hsAgent;
				}

				return new hsAgent({keepAlive, maxSockets, ...httpsAgent});
			})(),
		};
	}

	destroy(): void {
		this.config?.httpAgent?.destroy();
		this.config?.httpsAgent?.destroy();
	}

	async handle(
		request: HttpRequest,
		{abortSignal}: HttpHandlerOptions = {},
	): Promise<{response: HttpResponse}> {
		if (!this.config) {
			this.config = await this.configProvider;
		}

		let socketCheckTimeoutId: Timer;

		return new Promise((_resolve, _reject) => {
			let writeRequestBodyPromise: Promise<void> | undefined;
			const resolve = async (arg: {response: HttpResponse}) => {
				await writeRequestBodyPromise;
				// if requests are still resolving, cancel the socket usage check.
				clearTimeout(socketCheckTimeoutId);
				_resolve(arg);
			};

			const reject = async (arg: unknown) => {
				await writeRequestBodyPromise;
				_reject(arg);
			};

			if (!this.config) {
				throw new Error('Node HTTP request handler config is not resolved');
			}

			// if the request was already aborted, prevent doing extra work
			if (abortSignal?.aborted) {
				const abortError = new Error('Request aborted');
				abortError.name = 'AbortError';
				reject(abortError);
				return;
			}

			// determine which http(s) client to use
			const isSSL = request.protocol === 'https:';
			const agent = isSSL ? this.config.httpsAgent : this.config.httpAgent;

			// If the request is taking a long time, check socket usage and potentially warn.
			// This warning will be cancelled if the request resolves.
			socketCheckTimeoutId = setTimeout(
				() => {
					this.socketWarningTimestamp = NodeHttpHandler.checkSocketUsage(
						agent,
						this.socketWarningTimestamp,
					);
				},
				this.config.socketAcquisitionWarningTimeout ??
					(this.config.requestTimeout ?? 2000) +
						(this.config.connectionTimeout ?? 1000),
			);

			const queryString = buildQueryString(request.query || {});
			let auth;
			if (request.username != null || request.password != null) {
				const username = request.username ?? '';
				const password = request.password ?? '';
				auth = `${username}:${password}`;
			}

			let {path} = request;
			if (queryString) {
				path += `?${queryString}`;
			}

			if (request.fragment) {
				path += `#${request.fragment}`;
			}

			const nodeHttpsOptions: RequestOptions = {
				headers: request.headers,
				host: request.hostname,
				method: request.method,
				path,
				port: request.port,
				agent,
				auth,
			};

			// create the http request
			const requestFunc = isSSL ? hsRequest : hRequest;

			const req = requestFunc(nodeHttpsOptions, (res) => {
				const httpResponse = new HttpResponse({
					statusCode: res.statusCode || -1,
					reason: res.statusMessage,
					headers: getTransformedHeaders(res.headers),
					body: res,
				});
				resolve({response: httpResponse});
			});

			req.on('error', (err: Error) => {
				if (NODEJS_TIMEOUT_ERROR_CODES.includes((err as any).code)) {
					reject(Object.assign(err, {name: 'TimeoutError'}));
				} else {
					reject(err);
				}
			});

			// wire-up any timeout logic
			setConnectionTimeout(req, reject, this.config.connectionTimeout);
			setSocketTimeout(req, reject, this.config.requestTimeout);

			// wire-up abort logic
			if (abortSignal) {
				abortSignal.onabort = () => {
					// ensure request is destroyed
					req.abort();
					const abortError = new Error('Request aborted');
					abortError.name = 'AbortError';
					reject(abortError);
				};
			}

			// Workaround for bug report in Node.js https://github.com/nodejs/node/issues/47137
			const httpAgent = nodeHttpsOptions.agent;
			if (typeof httpAgent === 'object' && 'keepAlive' in httpAgent) {
				setSocketKeepAlive(req, {
					// @ts-expect-error keepAlive is not public on httpAgent.
					keepAlive: (httpAgent as hAgent).keepAlive,
					// @ts-expect-error keepAliveMsecs is not public on httpAgent.
					keepAliveMsecs: (httpAgent as hAgent).keepAliveMsecs,
				});
			}

			writeRequestBodyPromise = writeRequestBody(
				req,
				request,
				this.config.requestTimeout,
			).catch(_reject);
		});
	}

	updateHttpClientConfig(
		key: keyof NodeHttpHandlerOptions,
		value: NodeHttpHandlerOptions[typeof key],
	): void {
		this.config = undefined;
		this.configProvider = this.configProvider.then((config) => {
			return {
				...config,
				[key]: value,
			};
		});
	}

	httpHandlerConfigs(): NodeHttpHandlerOptions {
		return this.config ?? {};
	}
}
