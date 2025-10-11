import React from 'react';
import {TitleTeamCards} from './team/TitleTeamCards';

export const AboutUsHeader: React.FC = () => {
	return (
		<div className="flex flex-row items-center md:flex-col pt-10">
			<div className="flex-1">
				<h1 className="text-3xl font-bold font-['GTPlanar'] leading-tight max-w-[1000px] md:text-5xl">
					<svg
						className="h-6 md:h-8 mr-3 md:mr-6"
						viewBox="0 0 105 107"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M24.0635 0.00717926C21.8217 0.12886 20.0152 0.48455 18.1946 1.17721C17.2867 1.51886 15.7984 2.26301 14.9794 2.77782C11.5535 4.926 8.94203 8.15529 7.58011 11.9134C7.30866 12.6576 6.57388 15.0304 6.10119 16.6638C2.95146 27.5825 1.16365 39.5215 0.779884 52.1579C0.719043 54.1703 0.719043 58.9628 0.779884 60.9425C1.03729 69.3199 1.83759 76.883 3.28843 84.5958C3.87813 87.7175 4.82352 91.9109 5.37109 93.8157C6.48964 97.6861 8.77354 100.981 12.0216 103.396C14.1978 105.015 16.6689 106.101 19.4068 106.635C20.7266 106.892 22.4676 107.009 23.75 106.925C25.5237 106.808 29.0432 106.335 31.9027 105.825C44.7918 103.527 56.6981 99.4131 67.4951 93.5255C74.3328 89.7954 80.1783 85.7565 85.8178 80.8564C91.4386 75.9797 96.2311 70.7333 100.448 64.8457C101.426 63.4838 101.917 62.6881 102.409 61.6866C103.673 59.1032 104.267 56.5338 104.262 53.6602C104.262 50.9831 103.757 48.6056 102.666 46.172C102.142 44.9973 101.641 44.1548 100.518 42.5542C96.3809 36.662 91.7897 31.5278 86.1922 26.5388C77.5153 18.8073 67.2096 12.4657 55.7012 7.77151C53.2067 6.75593 50.7496 5.86202 47.7918 4.89323C41.5298 2.84802 33.7795 1.07425 27.2226 0.189705C26.193 0.0493011 24.7936 -0.0302582 24.0635 0.00717926Z"
							fill="#0B84F3"
						/>
					</svg>
					The programmatic video dream{' '}
				</h1>
				<p className="leading-relaxed text-balance font-brand">
					Started as a side project in 2021, we are now a company in Zurich,
					Switzerland and are pushing to combine the powers of video editing and
					programming!
				</p>
			</div>
		</div>
	);
};

const container: React.CSSProperties = {
	maxWidth: 1000,
	margin: 'auto',
	paddingLeft: 16,
	paddingRight: 16,
};

export const TeamPage = () => {
	return (
		<div className="bg-[var(--background)]">
			<div style={container}>
				<br />
				<AboutUsHeader />
				<br />
				<TitleTeamCards />
				<br />
			</div>
		</div>
	);
};
