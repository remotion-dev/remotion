import {Solid} from 'remotion';

export const Issue8216 = () => {
	return (
		<>
			<Solid
				name="Foreground"
				width={200}
				height={200}
				color="#0b84ff"
				style={{
					position: 'absolute',
					translate: '172.4px 83.1px',
				}}
			/>
			<Solid
				name="Background"
				width={1280}
				height={720}
				color="#ffffff"
				style={{
					position: 'absolute',
					translate: '0.2px 0px',
				}}
			/>
		</>
	);
};
