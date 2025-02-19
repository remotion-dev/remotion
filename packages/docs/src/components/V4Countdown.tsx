import type {SetStateAction} from 'react';
import React, {useEffect, useState} from 'react';

const style: React.CSSProperties = {
	display: 'inline-flex',
	flex: 1,
	justifyContent: 'center',
	alignItems: 'center',
	border: '2px solid var(--ifm-font-color-base)',
	borderRadius: 10,
	padding: 10,
};

const timeWrapper: React.CSSProperties = {
	borderRadius: '15px',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	alignItems: 'center',
	fontVariantNumeric: 'tabular-nums',
	fontFamily: 'GTPlanar',
	width: 80,
};

const timeAmount: React.CSSProperties = {
	fontWeight: 900,
	fontSize: '3em',
	marginBottom: 0,
	lineHeight: 1,
};

const timeLabel: React.CSSProperties = {
	marginBottom: 0,
};

export const V4Countdown: React.FC<{
	readonly setShowCountdown: React.Dispatch<SetStateAction<boolean>>;
}> = ({setShowCountdown}) => {
	const [countdown, setCountdown] = useState<[string, string, string, string]>([
		'00',
		'00',
		'00',
		'00',
	]);

	const targetUnixTimeStamp = 1688403600;

	const getUpdatedCountdown = (): [string, string, string, string] => {
		const currentUnixTime = Math.floor(Date.now() / 1000);

		const timeRemaining = targetUnixTimeStamp - currentUnixTime;
		let remainder = 0;
		const days = Math.floor(timeRemaining / (60 * 60 * 24));
		remainder = timeRemaining % (60 * 60 * 24);
		const hours = Math.floor(remainder / (60 * 60));
		remainder %= 60 * 60;
		const minutes = Math.floor(remainder / 60);
		remainder %= 60;
		const seconds = Math.floor(remainder);

		const strDays = days < 10 ? '0' + days.toString() : days.toString();
		const strHours = hours < 10 ? '0' + hours.toString() : hours.toString();
		const strMinutes =
			minutes < 10 ? '0' + minutes.toString() : minutes.toString();
		const strSeconds =
			seconds < 10 ? '0' + seconds.toString() : seconds.toString();

		return [strDays, strHours, strMinutes, strSeconds];
	};

	useEffect(() => {
		const interval = setInterval(() => {
			const currentCountdown = getUpdatedCountdown();
			setCountdown(currentCountdown);
		}, 1000);

		return () => clearInterval(interval);
	}, [countdown]);

	if (Math.floor(Date.now() / 1000) > targetUnixTimeStamp) {
		setShowCountdown(false);
	}

	return (
		<div style={style}>
			<div style={timeWrapper}>
				<h1 style={timeAmount}>{countdown[0]}</h1>
				<p style={timeLabel}>days</p>
			</div>
			<div style={timeWrapper}>
				<h1 style={timeAmount}>{countdown[1]}</h1>
				<p style={timeLabel}>hours</p>
			</div>
			<div style={timeWrapper}>
				<h1 style={timeAmount}>{countdown[2]}</h1>
				<p style={timeLabel}>min</p>
			</div>
			<div style={timeWrapper}>
				<h1 style={timeAmount}> {countdown[3]}</h1>
				<p style={timeLabel}>sec</p>
			</div>
		</div>
	);
};
