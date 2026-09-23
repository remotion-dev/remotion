import {Server as IOServer} from 'socket.io';
import {getIoServer} from '../io/get-io-server';

/**
 * Broadcast a mutation to all connected Studio clients.
 *
 * @param mutationName - The name of the mutation (e.g. 'sequence-node-paths-remapped')
 * @param payload - Arbitrary payload that the client will receive.
 */
export function broadcastMutation(
	mutationName: string,
	payload: Record<string, unknown>
) {
	const io = getIoServer() as IOServer | undefined;
	if (!io) {
		// In non‑Studio environments (e.g. unit tests) the IO server may be absent.
		return;
	}
	io.emit('mutation', {
		type: mutationName,
		payload,
	});
}
