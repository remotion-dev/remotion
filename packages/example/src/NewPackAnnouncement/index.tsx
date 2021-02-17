import React, {useCallback, useEffect, useState} from 'react';
import {continueRender, delayRender, Img, useCurrentFrame} from 'remotion';
import styled from 'styled-components';

const Title = styled.div`
	font-size: 80px;
	font-family: 'Roboto';
	color: white;
	font-weight: bold;
`;

const Subtitle = styled.div`
	font-family: 'Roboto';
	font-size: 50px;
	color: white;
	margin-top: 20px;
	margin-bottom: 80px;
`;

const Link = styled.div`
	color: white;
	font-size: 45px;
	font-family: 'Roboto';
`;

const getStickerScale = (frame: number, index: number): number => {
	const duration = 10;
	const start = index * 10;
	if (frame < start) {
		return 0;
	}
	if (frame > start + duration) {
		return 1;
	}
	return (frame - start) / duration;
};

const Rating: React.FC = () => {
	const [handle] = useState(() => delayRender());
	const [data, setData] = useState<null | {
		data: {
			pack: {
				name: string;
				id: string;
				publisher: string;
				stickers: {
					id: string;
					source: string;
				}[];
			};
		};
	}>(null);

	const fetchData = useCallback(async () => {
		const resource = await fetch('http://localhost:8000/packs/xoloi');
		const json = await resource.json();
		setData(json);
	}, []);

	useEffect(() => {
		continueRender(handle);
	}, [data, handle]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);
	const frame = useCurrentFrame();

	if (!data) {
		return null;
	}

	return (
		<div
			style={{
				flex: 1,
				padding: 80,
				flexDirection: 'column',
				display: 'flex',
				background: 'linear-gradient(to bottom left, #5851db, #405de6)',
			}}
		>
			<div>
				<Title>New Pack available</Title>
				{data ? (
					<Subtitle>
						{data.data.pack.name} by {data.data.pack.publisher}
					</Subtitle>
				) : null}
				{data
					? data?.data.pack.stickers.slice(0, 12).map((d, i) => (
							// eslint-disable-next-line
							<Img
								key={d.id}
								src={`https://anysticker.imgix.net/${d.source}`}
								style={{
									height: 306,
									width: 306,
									transform: `scale(${getStickerScale(frame, i)})`,
								}}
							/>
					  ))
					: null}
			</div>
			<div style={{flex: 1}} />
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					opacity: frame < 140 ? 0 : frame > 160 ? 1 : (frame - 140) / 20,
				}}
			>
				<Img
					src="https://www.anysticker.app/logo-transparent.png"
					style={{height: 200, width: 200, marginRight: 40}}
				/>
				<div style={{flex: 1}} />
				<Link>anysticker.app/{data.data.pack.id}</Link>
			</div>
		</div>
	);
};

export default Rating;
