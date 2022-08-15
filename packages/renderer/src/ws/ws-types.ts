/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-expect-error
import NodeWebSocket from 'ws';

export declare class WS {
	// eslint-disable-next-line no-useless-constructor
	constructor(
		_url: URL,
		_anything: unknown[],
		_options: {
			followRedirects: true;
			perMessageDeflate: false;
			maxPayload: number;
			headers: Record<string, string>;
		}
	);

	addEventListener(
		_type: 'open' | 'error' | 'message' | 'close',
		_cb: (evt: {data: string}) => void
	): void;

	send(msg: string): void;

	close(): void;
}

export const ws = NodeWebSocket as unknown as typeof WS;
