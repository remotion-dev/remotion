// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
import type {URL} from 'node:url';
import NodeWebSocket from 'ws';

export declare class WS {
	constructor(
		_url: URL,
		_anything: unknown[],
		_options: {
			followRedirects: true;
			perMessageDeflate: false;
			maxPayload: number;
			headers: Record<string, string>;
		},
	);

	addEventListener(
		_type: 'open' | 'error' | 'message' | 'close',
		_cb: (evt: {data: string}) => void,
	): void;

	send(msg: string): void;

	close(): void;
}

export const ws = NodeWebSocket as unknown as typeof WS;
