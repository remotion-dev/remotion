import {OffthreadVideo, Sequence} from 'remotion';
export default () => {
	return (
		<>
			<Sequence durationInFrames={60}>
				<OffthreadVideo src="https://mdn.alipayobjects.com/wealth_community_transfer/afts/file/LRxrRISozEgAAAAAAAAAAAAAK5gwAQBr" />
			</Sequence>
			<Sequence from={60} durationInFrames={60}>
				<OffthreadVideo src="https://mdn.alipayobjects.com/wealth_community_transfer/afts/file/8NU2RoAFknYAAAAAAAAAAAAAK5gwAQBr" />
			</Sequence>
			<Sequence from={120} durationInFrames={60}>
				<OffthreadVideo src="https://mdn.alipayobjects.com/wealth_community_transfer/afts/file/KjsmSYP8egYAAAAAAAAAAAAAK5gwAQBr" />
			</Sequence>
			<Sequence from={180} durationInFrames={60}>
				<OffthreadVideo src="https://mdn.alipayobjects.com/wealth_community_transfer/afts/file/Z6VTRL_2HIAAAAAAAAAAAAAAK5gwAQBr" />
			</Sequence>
			<Sequence from={240} durationInFrames={60}>
				<OffthreadVideo src="https://mdn.alipayobjects.com/wealth_community_transfer/afts/file/gqnqQ5rlWesAAAAAAAAAAAAAK5gwAQBr" />
			</Sequence>
		</>
	);
};
