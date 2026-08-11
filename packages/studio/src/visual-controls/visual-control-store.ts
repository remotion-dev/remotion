type Listener = () => void;

let version = 0;
const listeners = new Set<Listener>();

export const visualControlStore = {
	subscribe(listener: Listener): () => void {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	},
	getSnapshot(): number {
		return version;
	},
	emitChange(): void {
		version++;
		for (const listener of listeners) {
			listener();
		}
	},
};
