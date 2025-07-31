// import { extractFrames } from "@remotion/webcodecs";
interface FrameRequest {
	port: MessagePort;
	timestamp: string;
	src: string;
}
let connections = [];
let queue: FrameRequest[] = [];
let processor: MessagePort | null = null;
(self as any).onconnect = function (e: any) {
	const port = e.ports[0];

	port.onmessage = function (event: any) {
		let data = event.data;
		if (data.type === 'become-processor') {
			if (!processor) {
				//we now have a processor to extract frames
				console.log('accepted someone as a processor');
				processor = port;
			}
		} else if (data.type === 'request-frame') {
			console.log(`frame requested for timestamp: ${data.timestamp}`);
			let newentry = {
				timestamp: data.timestamp,
				port,
				src: data.src,
			};
			queue.push(newentry);
			processor?.postMessage({
				type: 'requesting-frame',
				timestamp: data.timestamp,
				src: data.src,
			});
		} else if (data.type === 'frame-result') {
			//frame retrieved
			let currentPort = queue.find(
				({timestamp}) => timestamp === data.timestamp,
			)?.port;
			currentPort?.postMessage({
				type: 'extracted-frame',
				frame: data.frame,
			});
		}
	};

	port.start();
};
