import React from 'react';

export const LinkedInLogo: React.FC = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 1000 1000"
			className="w-[30px]"
		>
			<path
				fill="currentcolor"
				d="M195.877 0C88.16 0 0 88.158 0 195.877V803.718C0 911.435 88.158 999.563 195.877 999.563H803.718C911.436 999.563 999.563 911.436 999.563 803.718V195.877C999.563 88.16 911.436 0 803.718 0H195.877ZM245.143 164.948C296.791 164.948 328.604 198.854 329.586 243.423C329.586 287.008 296.789 321.867 244.144 321.867H243.175C192.51 321.867 159.763 287.01 159.763 243.423C159.763 198.855 193.501 164.948 245.142 164.948H245.143ZM690.223 373.258C789.552 373.258 864.013 438.18 864.013 577.694V838.143H713.06V595.156C713.06 534.096 691.213 492.438 636.584 492.438C594.88 492.438 570.022 520.516 559.108 547.64C555.121 557.344 554.141 570.897 554.141 584.472V838.143H403.188C403.188 838.143 405.169 426.53 403.188 383.91H554.172V448.234C574.232 417.284 610.114 373.257 690.223 373.257V373.258ZM168.667 383.943H319.62V838.145H168.667V383.943V383.943Z"
			/>
		</svg>
	);
};

export const TwitterLogo: React.FC = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 530 570"
			className="w-[32px]"
		>
			<path
				fill="currentcolor"
				d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
			/>
		</svg>
	);
};

export const GitHubLogo: React.FC = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 1084 1084"
			className="w-[30px]"
		>
			<path
				fill="currentcolor"
				d="M542 0C242.545 0 0 242.545 0 542C0 781.835 155.147 984.408 370.592 1056.22C397.692 1060.97 407.855 1044.71 407.855 1030.48C407.855 1017.61 407.178 974.923 407.178 929.53C271 954.598 235.77 896.332 224.93 865.845C218.832 850.262 192.41 802.16 169.375 789.287C150.405 779.125 123.305 754.057 168.698 753.38C211.38 752.702 241.868 792.675 252.03 808.935C300.81 890.912 378.723 867.878 409.888 853.65C414.63 818.42 428.857 794.707 444.44 781.157C323.845 767.607 197.83 720.86 197.83 513.545C197.83 454.602 218.833 405.822 253.385 367.882C247.965 354.332 228.995 298.777 258.805 224.252C258.805 224.252 304.198 210.025 407.855 279.808C451.215 267.613 497.285 261.515 543.355 261.515C589.425 261.515 635.495 267.613 678.855 279.808C782.513 209.348 827.905 224.252 827.905 224.252C857.715 298.777 838.745 354.332 833.325 367.882C867.878 405.822 888.88 453.925 888.88 513.545C888.88 721.537 762.188 767.607 641.593 781.157C661.24 798.095 678.178 830.615 678.178 881.428C678.178 953.92 677.5 1012.19 677.5 1030.48C677.5 1044.71 687.663 1061.64 714.763 1056.22C822.365 1019.91 915.868 950.759 982.106 858.512C1048.34 766.264 1083.98 655.565 1084 542C1084 242.545 841.455 0 542 0Z"
			/>
		</svg>
	);
};

export const EmailLogo: React.FC = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 1299 1299"
			className="w-[30px]"
		>
			<path
				fill="currentcolor"
				d="M1177.22 202.969H121.781C99.3278 202.969 81.1875 221.109 81.1875 243.562V1055.44C81.1875 1077.89 99.3278 1096.03 121.781 1096.03H1177.22C1199.67 1096.03 1217.81 1077.89 1217.81 1055.44V243.562C1217.81 221.109 1199.67 202.969 1177.22 202.969ZM1126.48 343.525V1004.7H172.523V343.525L137.511 316.251L187.366 252.189L241.66 294.432H1057.47L1111.76 252.189L1161.62 316.251L1126.48 343.525V343.525ZM1057.47 294.305L649.5 611.443L241.533 294.305L187.239 252.062L137.384 316.124L172.397 343.398L605.735 680.326C618.197 690.008 633.529 695.263 649.31 695.263C665.091 695.263 680.422 690.008 692.885 680.326L1126.48 343.525L1161.49 316.251L1111.63 252.189L1057.47 294.305Z"
			/>
		</svg>
	);
};

type TeamMemberProps = {
	readonly name: string;
	readonly title: string;
	readonly description: string;
	readonly image: string;
	readonly twitter: string;
	readonly linkedin: string;
	readonly github: string;
	readonly email: string;
};

const TeamMemberCard: React.FC<TeamMemberProps> = ({
	name,
	title,
	description,
	image,
	twitter,
	linkedin,
	github,
	email,
}) => {
	return (
		<div className="flex-1 rounded-[15px] flex flex-col md:flex-row gap-2 md:gap-4">
			<img
				src={image}
				className="w-[250px] h-[250px] rounded-xl border-effect"
			/>
			<div className="flex flex-col border-effect px-4 py-3 bg-pane">
				<h2 className="ext-[1.6em] mb-1 mt-3 text-[var(--ifm-color-primary)] font-brand">
					{name}
				</h2>
				<strong className="font-brand">{title}</strong>
				<div className="mt-5 mb-5 leading-normal font-brand">{description}</div>
				<div className="flex-1" />
				<div className="gap-3 flex flex-row">
					<a
						className="no-underline text-inherit"
						target="_blank"
						href={twitter}
					>
						<TwitterLogo />
					</a>
					<a
						className="no-underline text-inherit"
						target="_blank"
						href={linkedin}
					>
						<LinkedInLogo />
					</a>
					<a
						className="no-underline text-inherit"
						target="_blank"
						href={github}
					>
						<GitHubLogo />
					</a>
					<a
						className="no-underline text-inherit"
						target="_blank"
						href={`mailto:${email}`}
					>
						<EmailLogo />
					</a>
				</div>
			</div>
		</div>
	);
};

export const TeamCardsLayout: React.FC = () => {
	return (
		<div className="flex flex-col gap-12 md:gap-4">
			<TeamMemberCard
				name="Jonny Burger"
				title="Chief Hacker"
				description="Making cool software for myself and others and getting to know all kinds of different people - that's what makes Remotion my dream job!"
				image="/img/team/jonny.png"
				twitter="https://twitter.com/JNYBGR"
				linkedin="https://ch.linkedin.com/in/jonny-burger-4115109b"
				github="https://github.com/JonnyBurger"
				email="jonny@remotion.dev"
			/>
			<TeamMemberCard
				name="Mehmet Ademi"
				title="Business Manager"
				description="Transitioning from traditional business, Remotion allowed me to merge my passion for technology and business in a distinctive way."
				image="/img/team/mehmet.png"
				twitter="https://twitter.com/mehmetademi"
				linkedin="https://www.linkedin.com/in/mehmetademi"
				github="https://github.com/MehmetAdemi"
				email="mehmet@remotion.dev"
			/>
			<TeamMemberCard
				name="Igor Samokhovets"
				title="Product Engineer"
				description="With a background in music industry and a passion for coding, I've been building tools to help musicians create. Remotion is the perfect place to blend my tech skills and creativity."
				image="/img/team/igor.jpg"
				twitter="https://x.com/tequilafunks"
				linkedin="https://www.linkedin.com/in/samohovets/"
				github="https://github.com/samohovets"
				email="igor@remotion.dev"
			/>
		</div>
	);
};
