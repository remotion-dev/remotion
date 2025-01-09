import {random} from 'remotion';

export type ShowcaseLink = 'tutorial' | 'source_code' | 'website' | 'video';

export type ShowcaseVideo = {
	title: string;
	description: string;
	height: number;
	width: number;
	links: {
		url: string;
		type: ShowcaseLink;
	}[];
	submittedOn: Date;
	type: 'mux_video';
	time?: string | null;
	muxId: string;
	author?: {
		name: string;
		url: string;
	};
};

export const showcaseVideos: ShowcaseVideo[] = [
	{
		title: 'Hackreels - Animate your code',
		type: 'mux_video',
		time: '0',
		muxId: 'IOSwIZiNUsdfcg9ccN3E2vqzen92L99VgoP3Q5p9On8',
		description:
			'Create effortlessly beautiful code animations in seconds. Hackreels detects code changes automatically and makes stunning animations based on those changes. ',
		height: 1080,
		width: 1920,
		submittedOn: new Date('04-22-2024'),
		links: [
			{
				type: 'video',
				url: 'https://twitter.com/dparksdev/status/1715725060324073582',
			},
			{
				type: 'website',
				url: 'https://www.hackreels.com/',
			},
		],
		author: {
			url: 'https://davidparks.dev/',
			name: 'David Parks',
		},
	},
	{
		title: 'MUX - Vizualise video stats',
		type: 'mux_video',
		time: '3',
		muxId: 'DDgXb2KfPk7xdvxEoyPkrl7GcybohNon',
		description:
			'An article on how to showcase your video stats by creating a dynamic animated video using Remotion and the Mux Data API.',
		height: 270,
		width: 480,
		submittedOn: new Date('19-01-2022'),
		links: [
			{
				type: 'source_code',
				url: 'https://github.com/davekiss/mux-remotion-demo/',
			},
			{
				type: 'video',
				url: 'https://twitter.com/MuxHQ/status/1483514610380644357',
			},
			{
				type: 'tutorial',
				url: 'https://mux.com/blog/visualize-mux-data-with-remotion/',
			},
		],
		author: {
			url: 'https://davekiss.com/',
			name: 'Dave Kiss',
		},
	},
	{
		title: 'Next.js - Video tutorial',
		type: 'mux_video',
		time: '10',
		muxId: 'dWxzp02gvlUM42a6GSQ02g006qiW2T43QGeuszqimY0200AE',
		description:
			"Delba Oliveira visually explains Vercel's Next.js and the concept of React.",
		height: 1080,
		width: 1920,
		submittedOn: new Date('10-09-2023'),
		links: [
			{
				type: 'video',
				url: 'https://twitter.com/delba_oliveira/status/1707439537054535867',
			},
			{
				type: 'website',
				url: 'https://www.youtube.com/@Delba',
			},
		],
		author: {
			url: 'https://delba.dev/',
			name: 'Delba Oliveira',
		},
	},
	{
		title: 'GitHub Unwrapped - Campaign',
		type: 'mux_video',
		time: '6',
		muxId: 'OwQFvqomOR00q6yj5SWwaA7DBg01NaCPKcOvczoZqCty00',
		description:
			'A year-in-review video campaign for GitHub, where each user gets a personalized video based on their GitHub activity.',
		height: 1080,
		width: 1080,
		submittedOn: new Date('04-23-2024'),
		links: [
			{
				type: 'website',
				url: 'https://githubunwrapped.com/',
			},
			{
				type: 'source_code',
				url: 'https://github.com/remotion-dev/github-unwrapped',
			},
		],
		author: {
			url: 'https://www.remotion.dev/',
			name: 'Remotion',
		},
	},
	{
		title: 'Revid - Animated social media videos',
		type: 'mux_video',
		time: '13',
		muxId: 'AQJeyQ00njF88JNevZ2Xf00KGOX01zBLBa4Xisvu9M00ynM',
		description:
			'Create stunning social media videos with Revid, an AI-powered tool that transforms text into editable videos in minutes. ',
		height: 1152,
		width: 2048,
		submittedOn: new Date('04-24-2024'),
		links: [
			{
				type: 'website',
				url: 'https://www.revid.ai/',
			},
		],
		author: {
			url: 'https://twitter.com/tibo_maker',
			name: 'Tibo',
		},
	},
	{
		title: 'AnimStats - Animated statistics',
		type: 'mux_video',
		time: '8',
		muxId: 'DudsRLermQWA5JMpF6Z49AwuAjrvO00vxmsgSyS00neo00',
		description:
			'With AnimStats, you can transform your statistics into captivating animated GIFs and Videos within minutes. The user-friendly interface and powerful editing feature make the process quick and effortless.',
		height: 1152,
		width: 2048,
		submittedOn: new Date('04-24-2024'),
		links: [
			{
				type: 'website',
				url: 'https://www.animstats.com/',
			},
		],
		author: {
			url: 'https://twitter.com/audiencon',
			name: 'Audiencon',
		},
	},
	{
		title: 'Banger Show - Music visuals',
		type: 'mux_video',
		time: '0',
		muxId: 'nDU01DSCFdvie6l9Z8u557TwSvJMsnhO3pfTqqXDuPbQ',
		description:
			'High quality music visuals without learning 3D or video editing software.',
		height: 1080,
		width: 1920,
		submittedOn: new Date('04-24-2024'),
		links: [
			{
				type: 'website',
				url: 'https://banger.show/',
			},
		],
	},
	{
		title: 'MotionShot - Video guides',
		type: 'mux_video',
		time: '0',
		muxId: 'q8DK3k322cMIfMwPTSu5GYEnovEvoYA4aprLH8cp5pY',
		description:
			'Make guides & tutorials for your products, internal tools, SOPs, step-by-step processing and export them into MP4, GIF, PDF, or embed into your own webpage.',
		height: 1080,
		width: 1920,
		submittedOn: new Date('04-24-2024'),
		links: [
			{
				type: 'website',
				url: 'https://www.motionshot.app/',
			},
		],
		author: {
			url: 'https://twitter.com/pramodk73',
			name: 'Pramod Kumar',
		},
	},
	{
		title: 'Watercolor Map - Animated Map',
		type: 'mux_video',
		time: '1',
		muxId: 'Wd02W8GdZsjQ3JSKUsOjKtpEGxXBNbXRg8hiwmYx7cTM',
		description:
			'A travel animation showing the journey on a map, with watercolor effects. Perfect for adding b-roll footage to travel vlogs or video projects.',
		height: 1080,
		width: 1080,
		submittedOn: new Date('04-23-2024'),
		links: [
			{
				type: 'source_code',
				url: 'https://www.remotion.pro/watercolor-map',
			},
		],
		author: {
			url: 'https://www.remotion.dev/',
			name: 'Remotion',
		},
	},
	{
		title: 'Clippulse - Animated social media videos',
		type: 'mux_video',
		time: '4.5',
		muxId: 'vQSX6I8lo5SPIEj02jcw6OVKb01V8WcYwB01GUC02PqMHxI',
		description:
			'Clippulse is a dynamic tool to easily produce fully customizable videos for brands, without any prior video editing experience required.',
		height: 1080,
		width: 1920,
		submittedOn: new Date('04-24-2024'),
		links: [
			{
				type: 'website',
				url: 'https://www.clippulse.com/',
			},
		],
		author: {
			url: 'https://twitter.com/andrei_terteci',
			name: 'Andrei Terteci',
		},
	},
	{
		title: 'Submagic - Viral shorts',
		type: 'mux_video',
		time: '0',
		muxId: 'CjBZygWogZoMptDHSOgYFZ9019oQMIkQqliQlgpWpyP4',
		description:
			'Make your short-form videos more captivating with Captions, B-Rolls, Zooms and Sound Effects.',
		height: 1080,
		width: 1920,
		submittedOn: new Date('04-25-2024'),
		links: [
			{
				type: 'video',
				url: 'https://www.youtube.com/watch?v=hNKola6xpqQ',
			},
		],
		author: {
			url: 'https://www.submagic.co/',
			name: 'Submagic',
		},
	},
	{
		title: 'Polygon - Campaign',
		type: 'mux_video',
		time: '10',
		muxId: 'tswSoVoFUjryYX8702phE801Fv00VwtB018cIy3a25fNo01c',
		description:
			'A year-in-review for stock performance provided by Polygon Stock API.',
		height: 1194,
		width: 2048,
		submittedOn: new Date('01-02-2023'),
		links: [],
		author: {
			url: 'https://polygon.io',
			name: 'Polygon',
		},
	},
	{
		title: 'Hello Météo - Weather app',
		type: 'mux_video',
		time: '5',
		muxId: '6ZdkFhso67CenQGpVtjTf300VsYMD01gvag6G6hV6UD00M',
		description:
			'A weather report generator, which gets OpenWeather data and renders a video with the forecast on a daily basis. It also creates a story on social media.',
		height: 1920,
		width: 1080,
		submittedOn: new Date('04-25-2024'),
		links: [
			{
				type: 'website',
				url: 'https://www.instagram.com/hellometeo/',
			},
		],
		author: {
			url: 'https://www.pergoud.com/',
			name: 'Florent Pergoud',
		},
	},
	{
		title: 'Electricity Maps - Data visualization',
		type: 'mux_video',
		time: '2.9',
		muxId: '63euRVDpjG02pCGuf02LDJXKLzLrGW3j400GE3kVZRYDgI',
		description:
			'A visualization of heavy electricity data in Europe. It shows fluctuations in grid emissions on the map, as well as the daily country variations in a chart.',
		height: 1080,
		width: 1920,
		submittedOn: new Date('04-26-2024'),
		links: [
			{
				type: 'video',
				url: 'https://www.youtube.com/watch?v=5m48kkhak-M',
			},
			{
				type: 'website',
				url: 'https://www.electricitymaps.com/electricity-mapped',
			},
		],
		author: {
			url: 'https://www.electricitymaps.com/',
			name: 'Electricity Maps',
		},
	},
	{
		title: 'Remotion Recorder - Screencast videos',
		type: 'mux_video',
		time: '0',
		muxId: 'HCA9phm4tUVjYm9dFWj1GpYTwIGrse00yg01SwaM2PbJU',
		description:
			'Fully featured screen recording software built with Remotion. Record your screen, webcam, and audio. Edit and render the video for multiple platforms quickly in the same tool.',
		height: 1080,
		width: 1920,
		submittedOn: new Date('04-26-2024'),
		links: [
			{
				type: 'website',
				url: 'https://www.remotion.pro/recorder',
			},
		],
		author: {
			url: 'https://www.remotion.dev',
			name: 'Remotion',
		},
	},
	{
		title: 'Fluidmotion - Animated video backgrounds',
		type: 'mux_video',
		time: '0',
		muxId: 'eLyQruncRGvNahd3n9hB44OuziMYqGgS8R1xyhbz02s4',
		description:
			'Create beautiful animated background for apps, videos or presentations.',
		height: 1080,
		width: 1920,
		submittedOn: new Date('05-15-2024'),
		links: [
			{
				type: 'website',
				url: 'https://fluidmotion.app/',
			},
		],
	},
	{
		title: 'MyKaraoke Video - Karaoke Video Maker',
		type: 'mux_video',
		time: '5',
		muxId: 'Fr8PlMVQRTEaoVRC0025r00WY0100JiDgbf1BoNsLYtu88o',
		description:
			'MyKaraoke Video is a browser-based tool that effortlessly creates karaoke and lyric videos with AI-powered vocal removal and automatic lyric syncing, all without downloads or installations.',
		height: 1080,
		width: 1920,
		submittedOn: new Date('09-27-2024'),
		links: [
			{
				type: 'website',
				url: 'https://www.mykaraoke.video/',
			},
		],
		author: {
			url: 'https://www.linkedin.com/in/emiliano-parizzi-18744ba4/',
			name: 'Emiliano Parizzi',
		},
	},
	{
		title: 'Relay.app - Automation tool',
		type: 'mux_video',
		time: '0',
		muxId: '02eNw8AHyNFvm300xvExVndO01oEvUI1kYXK00W02ITkeldM',
		description:
			'Remotion was utilized to create dynamic, programmatically generated instructional videos, ensuring explainer content remained consistent with the brand standards.',
		height: 1080,
		width: 1920,
		submittedOn: new Date('10-11-2024'),
		links: [
			{
				type: 'video',
				url: 'https://youtube.com/playlist?list=PLLIj5N3yKeySGj9Cm3dqNtcVCPAd22yLo&si=cuKFXXpEPMFBF6Gm',
			},
			{
				type: 'website',
				url: 'https://www.relay.app/',
			},
		],
	},

	/*
  {
    title: "Exemplary AI - Viral shorts",
    type: "mux_video",
    time: "0",
    muxId: "tiOY02dEjo4LJpDMUf7qQFjqewupJH3C7jbxDbm9blUQ",
    description:
      "Repurpose your existing video into multiple viral short clips.",
    height: 1080,
    width: 1920,
    submittedOn: new Date("05-06-2024"),
    links: [],
    author: {
      url: "https://exemplary.ai/",
      name: "Exemplary AI",
    },
  },
  {
    title: "Podopi - Convert a blog to podcast",
    type: "mux_video",
    time: "6",
    muxId: "wvTZmoaRnhpGuc93nd39vz4MpSeOkXjnS5XFzOK01Lco",
    description:
      "This promo video is done by using Remotion. It shows you how easily you can extend your blog to a podcast.",
    height: 720,
    width: 1280,
    submittedOn: new Date("09-10-2021"),
    links: [
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=yYbBVCo0BVw",
      },
      {
        type: "website",
        url: "https://www.podopi.com/",
      },
    ],
    author: {
      url: "https://twitter.com/Miickel",
      name: "Mickel Andersson",
    },
  },
  {
    title: "Funeral Collage - Animated memories",
    type: "mux_video",
    time: "42",
    muxId: "3ZOyZm01dqewQjVUNP02MzqWooJlYJ00cVSLX9WjSwuYjs",
    description:
      "Online memorial photo slideshow maker. Create a fitting tribute video for your loved one.",
    height: 1080,
    width: 1920,
    submittedOn: new Date("11-29-2022"),
    links: [
      {
        type: "video",
        url: "https://firebasestorage.googleapis.com/v0/b/funeral-collage.appspot.com/o/demo%2Fjoanna-bloggs-demo.mp4?alt=media&token=ed4dff7d-396d-4b97-9f95-85c58d669277",
      },
      {
        type: "website",
        url: "https://funeralcollage.com/",
      },
    ],
    author: {
      url: "https://funeralcollage.com/",
      name: "Funeral Collage/Slideshow",
    },
  },
  {
    title: "Music Player",
    type: "mux_video",
    time: "4",
    muxId: "7NZ41UEioG00jZygP02NXji01wr7HE02R8m3puh19V8IlZw",
    description:
      "A music player visualization for teasing tracks on Instagram.",
    width: 720,
    height: 720,
    submittedOn: new Date("29-05-2021"),
    links: [
      {
        type: "website",
        url: "https://www.instagram.com/tripmusic.online/",
      },
      {
        type: "video",
        url: "https://twitter.com/kanzitelli/status/1398296728059666432",
      },
    ],
    author: {
      name: "Batyr",
      url: "https://twitter.com/kanzitelli",
    },
  },
  {
    title: "The math behind animations",
    type: "mux_video",
    time: "5",
    muxId: "IDMyruXHia3rmOllIi13uy01hHgN4UxkAZT4BcgwiN00E",
    description:
      "William Candillon explains the fundamentals of how trigonometry is used for user interfaces. Full video available on YouTube.",
    height: 360,
    width: 640,
    submittedOn: new Date("08-03-2021"),
    links: [
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=-lF7sSTelOg&t=8s&pp=sAQA",
      },
      {
        type: "website",
        url: "https://start-react-native.dev/",
      },
    ],
    author: {
      url: "https://twitter.com/wcandillon",
      name: "William Candillon",
    },
  },
  {
    title: "Video Animation - Liquid Swipe",
    type: "mux_video",
    time: "21",
    muxId: "01h4QMewhXr0249p1k8buxKgcN86hmS3VgRDPenY6Yyr4",
    description:
      "This intro warms you up for an awesome React Native tutorial on how to recreate a Liquid Swipe animation.",
    height: 360,
    width: 640,
    submittedOn: new Date("08-03-2021"),
    links: [
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=6jxy5wfNpk0",
      },
      {
        type: "website",
        url: "https://start-react-native.dev/",
      },
    ],
    author: {
      url: "https://twitter.com/wcandillon",
      name: "William Candillon",
    },
  },
  {
    title: "Remotion Web Summit Talk",
    type: "mux_video",
    time: "4",
    muxId: "fWKVFtHn4bIEcPlqhsHcf69t0100SkUE6WXB600NcENQww",
    description:
      "A talk about Remotion given at React Summit 2021, fully written in React",
    height: 720,
    width: 1280,
    submittedOn: new Date("08-05-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/JonnyBurger/react-summit-talk",
      },
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=316oZDqOyEg",
      },
    ],
    author: {
      url: "https://twitter.com/jnybgr",
      name: "Jonny Burger",
    },
  },
  {
    title: "Piano Teacher",
    type: "mux_video",
    time: "10",
    muxId: "uuhPSi5C01DIIxBm3HcxJGs9d8hYmDnNjkmgwTMWJQPg",
    description:
      "A MIDI-to-Remotion converter visualizing how to play a song on the piano.",
    width: 1280,
    height: 720,
    submittedOn: new Date("29-05-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/FlorentPergoud/status/1388430389715292161",
      },
    ],
    author: {
      name: "Florent Pergoud",
      url: "https://twitter.com/FlorentPergoud",
    },
  },
  {
    title: "Redesigning the Scatterplot",
    type: "mux_video",
    time: "10",
    muxId: "mnQCnHc56wrafN4DIPkIdYpFh7Yk202rbMOzxrZaUylE",
    description:
      "In this video you get a visual display of some quantitative information.",
    height: 720,
    width: 1280,
    submittedOn: new Date("07-07-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/BrooksLybrand/status/1371547875109445635",
      },
    ],
    author: {
      url: "https://twitter.com/BrooksLybrand",
      name: "Brooks Lybrand",
    },
  },
  {
    title: "Personalized Welcome Videos",
    type: "mux_video",
    time: "10",
    muxId: "BPP7jS72gdEtARObTEGOc5GHnDv6ODfp48hIFMU9U6E",
    description:
      "A SlackHQ integrated tool to generate personalized welcome videos for new employees.",
    width: 1920,
    height: 1080,
    submittedOn: new Date("27-06-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/BhimteBhaisaab/status/1401195261943115777",
      },
    ],
    author: {
      name: "Utkarsh Bhimte",
      url: "https://twitter.com/BhimteBhaisaab",
    },
  },
  {
    title: "JavaScript Code Execution demo",
    type: "mux_video",
    time: "10",
    muxId: "psJ32DSTQqeLaZYhBC5sa3HH7gkzwt7HinQsHela01OA",
    description:
      "In this video I had explained how Javascript code gets executed. I had made this video completely using Remotion and ReactJS.",
    height: 720,
    width: 1280,
    submittedOn: new Date("12-25-2022"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/AmitNemade/remotion-javascript-demo",
      },
    ],
    author: {
      url: "https://www.linkedin.com/in/amitnemade/?lipi=urn%3Ali%3Apage%3Ad_flagship3_pulse_read%3BLMVZoM6pQPu27qXFUtwi4Q%3D%3D",
      name: "Amit Nemade",
    },
  },
  {
    title: "1000 Stars for Code Hike",
    type: "mux_video",
    time: "10.05",
    muxId: "x7Dzaunb9JbdwyaR00CwBnIC2MkUPzJwmSiUrtNiYYP4",
    description:
      "A celebration video by Code Hike for reaching 1000 stars on GitHub.",
    height: 540,
    width: 960,
    submittedOn: new Date("08-04-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/codehike_/status/1410976982867775489",
      },
      {
        type: "website",
        url: "https://codehike.org/",
      },
      {
        type: "source_code",
        url: "https://github.com/pomber/stargazer",
      },
    ],
    author: {
      url: "https://codehike.org/",
      name: "Code Hike",
    },
  },
  {
    title: "Animated Social Media Preview Card",
    type: "mux_video",
    time: "10",
    muxId: "zSKsGBzfoPowlFVBm47N01aoMK2Er8qkM3CzZgnUDido",
    description:
      "Here you see a promo video of Sam Larsen-Disney's newsletter.",
    height: 628,
    width: 1200,
    submittedOn: new Date("07-07-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/SamLarsenDisney/status/1362029962241466372",
      },
      {
        type: "website",
        url: "https://sld.codes/newsletter",
      },
      {
        type: "tutorial",
        url: "https://sld.codes/articles/Remotion-&-Open-Graph-Video",
      },
    ],
    author: {
      url: "https://sld.codes/",
      name: "Sam Larsen-Disney",
    },
  },
  {
    title: "GIF Logo for ProductHunt",
    type: "mux_video",
    time: "3",
    muxId: "vOGnXmkV01R2WW6SuZRIykksh3uzEfRV900ieznAmc7Is",
    description:
      "An animated Logo used for the ProductHunt launch of snappify.",
    height: 960,
    width: 960,
    submittedOn: new Date("05-04-2022"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/snappify-io/producthunt-gif",
      },
      {
        type: "website",
        url: "https://snappify.io/",
      },
      {
        type: "tutorial",
        url: "https://snappify.io/blog/create-producthunt-gif-with-remotion",
      },
    ],
    author: {
      url: "https://twitter.com/dominiksumer",
      name: "Dominik Sumer",
    },
  },
  {
    title: "Product Hunt Today",
    type: "mux_video",
    time: "18.5",
    muxId: "9vegqVB2n02YrTL3c38HoOyd7Smytz01Hl3qaXI5KCOZM",
    description:
      "Fully automated Twitter bot that tweets trending Product Hunt products every day.",
    height: 720,
    width: 720,
    submittedOn: new Date("03-27-2022"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/Kamigami55/product-hunt-today",
      },
      {
        type: "video",
        url: "https://twitter.com/ProductHunToday/status/1507997707008417792",
      },
      {
        type: "website",
        url: "https://twitter.com/ProductHunToday",
      },
    ],
    author: {
      url: "https://easonchang.com/",
      name: "Eason Chang",
    },
  },
  {
    title: "Crowdfunding Campaign",
    type: "mux_video",
    time: "10",
    muxId: "L7DYDk9o701zxfWUhcFb1Z1mGGzYoIuxddwNVI3tcemQ",
    description:
      "An animation celebrating a successful fundraising campaign. It fetches the amount raised programmatically and generates an animation suitable for posting on Instagram.",
    width: 1080,
    height: 1920,
    submittedOn: new Date("25-03-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/florentpergoud/vfb-crowdfunding-campain",
      },
      {
        type: "video",
        url: "https://twitter.com/FlorentPergoud/status/1371874105281159178?s=20",
      },
    ],
    author: {
      name: "Florent Pergoud",
      url: "https://twitter.com/FlorentPergoud",
    },
  },
  {
    title: "Spotify Wrapped",
    type: "mux_video",
    time: "10",
    muxId: "V5Dpfui9NmUSons5P5VQRbyX5m5011LsRA01f0129CLbHo",
    description:
      "A recreation of Spotify Wrapped where you can override all text and images programmatically.",
    height: 1280,
    width: 720,
    submittedOn: new Date("25-03-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/jonnyburger/remotion-wrapped",
      },
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=I-y_5H9-3gk",
      },
    ],
    author: {
      name: "Jonny Burger",
      url: "https://twitter.com/JNYBGR",
    },
  },
  {
    title: "Olympics Ranking",
    type: "mux_video",
    time: "10",
    muxId: "uggP01wfSNgmwm9KjanfeKvbQdbeVdDK0001qdBfDszCB4",
    description:
      "A medal ranking which shows which country has won the most medals at the Tokyo Olympics so far.",
    height: 1280,
    width: 720,
    submittedOn: new Date("08-12-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/FlorentPergoud/status/1423360349877809154",
      },
    ],
    author: {
      url: "https://twitter.com/FlorentPergoud",
      name: "Florent Pergoud",
    },
  },
  {
    title: "Apple Spring Loaded Logo",
    type: "mux_video",
    time: "10",
    muxId: "wvFXhgp3WA8bvp025y74gkoX56TKTyX7Xx9Qvos1TStc",
    description:
      "A recreation of Apple's Spring Loaded Logo for their Spring 2021 Keynote. Uses Remotions interpolateColors() API.",
    height: 700,
    width: 700,
    submittedOn: new Date("08-03-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/jonnyburger/spring-loaded",
      },
      {
        type: "video",
        url: "https://twitter.com/JNYBGR/status/1384606085173108737",
      },
    ],
    author: {
      url: "https://jonny.io",
      name: "Jonny Burger",
    },
  },
  {
    title: "Coronavirus Cases Visualization",
    type: "mux_video",
    time: "10",
    muxId: "Anx7p2jNQLUsSWBOjnEzdo9xvfC9spsVyL01sk7esrtY",
    description: "Timelapse of the spread of the coronavirus in the world.",
    height: 1080,
    width: 1920,
    submittedOn: new Date("08-04-2021"),
    links: [
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=Mrl229Zf23g",
      },
    ],
    author: {
      url: "https://www.youtube.com/channel/UCEyTSyN3FmW39THCl0kfDUA",
      name: "Envision",
    },
  },
  {
    title: "Instagram Profile as a Story",
    type: "mux_video",
    time: "10",
    muxId: "6hyS0000BS02M4MPbZJxBuUG9SnJJCxCglHrTuWRdbpvOY",
    description:
      "A profile video generator which allows you to share your Instagram profile as a story.",
    height: 1280,
    width: 720,
    submittedOn: new Date("08-04-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/FlorentPergoud/status/1375134968733704217",
      },
    ],
    author: {
      url: "https://twitter.com/FlorentPergoud",
      name: "Florent Pergoud",
    },
  },
   {
    title: "AnySticker In App Assets",
    type: "mux_video",
    time: "10",
    muxId: "HL4G1x01aX8lizSXFGuQG8do6LLKcI1mup6WjIz6OEFE",
    description:
      "This video will welcome users in the newest version of AnySticker.",
    height: 1920,
    width: 1080,
    submittedOn: new Date("25-03-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/JonnyBurger/anysticker-tutorials",
      },
    ],
    author: {
      name: "Jonny Burger",
      url: "https://twitter.com/JNYBGR",
    },
  },
  {
    title: "All Champions League Winners in History",
    type: "mux_video",
    time: "10",
    muxId: "R9SZTw2ZoWuV44i5QVx5yVu01VaGm89JlZ876TdVXAyQ",
    description:
      "This video shows all the UEFA Champions Cup (1956-1992) and Champions League (since 1993) Winners year by year and concludes with the ranking of the countries with the most trophies.",
    height: 1080,
    width: 1920,
    submittedOn: new Date("07-03-2021"),
    links: [
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=6Xn47wG_c5Q",
      },
      {
        type: "website",
        url: "https://www.youtube.com/channel/UCRBZkDc7udWuxrvedrFUbCQ/featured",
      },
    ],
    author: {
      url: "https://twitter.com/mikepombal",
      name: "mikepombal",
    },
  },
  {
    title: "Love, Death & React",
    type: "mux_video",
    time: "10",
    muxId: "pEo7cREHlak5FxdpNOKB8BYlUCa19Klkfn1XtXxjfxc",
    description: "A recreation of Netflix's 'Love, Death & React' intro.",
    width: 1280,
    height: 720,
    submittedOn: new Date("29-05-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/wcandillon/love-death-react",
      },
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=YtcINOj2w5g",
      },
      {
        type: "tutorial",
        url: "https://www.youtube.com/watch?v=YtcINOj2w5g",
      },
    ],
    author: {
      name: "Willian Candillon",
      url: "https://twitter.com/wcandillon",
    },
  },
  {
    title: "Remotion 2.0 trailer",
    type: "mux_video",
    time: "10",
    muxId: "g00CHkGQm1J0101dma3TBPvwufeAKZ8yOZk9p0048soVjW00",
    description: "Trailer for Remotion 2.0 launch",
    height: 1080,
    width: 1920,
    submittedOn: new Date("08-04-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/JonnyBurger/remotion-2-0-trailer",
      },
      {
        type: "video",
        url: "https://youtube.com/watch?v=0r6ho5sNPm4",
      },
      {
        type: "website",
        url: "https://www.remotion.dev/",
      },
    ],
    author: {
      url: "https://twitter.com/JNYBGR",
      name: "Jonny Burger",
    },
  },
  {
    title: "Weather Report",
    type: "mux_video",
    time: "10",
    muxId: "dE02NVflg500LNpSECSUmcwLFpKU100Z9TY362Lifdo0228",
    description:
      "A fully automated weather forecast that appears in your TikTok or Instagram feed.",
    height: 1280,
    width: 720,
    submittedOn: new Date("08-05-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/florentpergoud/remotion-weather",
      },
      {
        type: "video",
        url: "https://twitter.com/JNYBGR/status/1398234353721917440",
      },
      {
        type: "website",
        url: "https://www.instagram.com/hellometeo/",
      },
    ],
    author: {
      url: "https://twitter.com/FlorentPergoud",
      name: "Florent Pergoud",
    },
  },
  {
    title: "AnySticker Trailer",
    type: "mux_video",
    time: "5",
    muxId: "GhK5YXKrtWTa2kEf7HajaE6DG2FtTNsZfW7mfIzQBJ00",
    description:
      "A hyped up announcement trailer for the new AnySticker app, made using React Three Fiber.",
    height: 1080,
    width: 1080,
    submittedOn: new Date("11-15-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/JonnyBurger/anysticker-tutorials/blob/main/src/Announcement/index.tsx",
      },
      {
        type: "video",
        url: "https://twitter.com/JNYBGR/status/1458375456965763075",
      },
      {
        type: "website",
        url: "https://anysticker.com",
      },
    ],
    author: {
      url: "https://twitter.com/JNYBGR",
      name: "JNYBGR",
    },
  },
  {
    title: "Feature overview",
    type: "mux_video",
    time: "10",
    muxId: "d2SvbrhHvyJZb2EmSv441M601UBy1dfEYfToKGqDpV01Y",
    description: "A showcase of features in the new Bottom Sheet library.",
    height: 640,
    width: 1280,
    submittedOn: new Date("10-04-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/Gorhom/status/1432363415272558593",
      },
      {
        type: "website",
        url: "https://gorhom.github.io/react-native-bottom-sheet/blog/bottom-sheet-v4/",
      },
    ],
    author: {
      url: "https://gorhom.dev/",
      name: "Mo Gorhom",
    },
  },
  {
    title: "Remotion Trailer",
    type: "mux_video",
    time: "3",
    muxId: "nJ2JnX2a02JiDvirVoNrz02lJ01q8DuvIZoKKq8q1uPdKA",
    description: "The original trailer which announced Remotion.",
    width: 1920,
    height: 1080,
    submittedOn: new Date("25-03-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/JonnyBurger/remotion-trailer",
      },
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=gwlDorikqgY",
      },
    ],
    author: {
      name: "Jonny Burger",
      url: "https://twitter.com/JNYBGR",
    },
  },
  {
    title: "Data Science Course Ad",
    type: "mux_video",
    time: "10",
    muxId: "MqUUJjKZk01x9KGUJtSD1SLoUHmrab3eaVx9sDPCw9L00",
    description:
      "This is a promo video of a data science course offered by Quantargo.",
    height: 720,
    width: 1280,
    submittedOn: new Date("07-07-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/quantargo/status/1365233907793338369",
      },
      {
        type: "website",
        url: "https://www.quantargo.com/blog/2021-02-26-new-course-advanced-data-transformation/",
      },
    ],
    author: {
      url: "https://www.quantargo.com/",
      name: "Quantargo",
    },
  },
  {
    title: "Product Announcement Video",
    type: "mux_video",
    time: "10",
    muxId: "lSa6eYA01jP5ooFSgTE02P6nfRbjIbF1kcr5LdwS01Zp8o",
    description:
      "Animation showing new features on the newly built website of Verdaccio, a lightweight private Node.js proxy regisry.",
    height: 720,
    width: 1280,
    submittedOn: new Date("08-04-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/verdaccio_npm/status/1420187249145118722",
      },
      {
        type: "website",
        url: "https://verdaccio.org/",
      },
    ],
    author: {
      url: "https://twitter.com/_semoal",
      name: "Sergio Moreno",
    },
  },
  {
    title: "Conference talk",
    type: "mux_video",
    time: "10",
    muxId: "01DRoSacYBQvVpDzoAXl01Wt2r8JWtgTq4t5lFwPjVcDE",
    description:
      "A conference talk production composed in Remotion, including code animations, facecam, subtitles and a browser as an iFrame.",
    height: 270,
    width: 480,
    submittedOn: new Date("08-03-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/pomber/record-talk-with-remotion/",
      },
      {
        type: "video",
        url: "https://twitter.com/pomber/status/1359556846688886789",
      },
      {
        type: "tutorial",
        url: "https://twitter.com/pomber/status/1358837764033241092",
      },
    ],
    author: {
      url: "https://pomb.us/",
      name: "Rodrigo Pombo",
    },
  },
  {
    title: "Cloudfront Explainer",
    type: "mux_video",
    time: "10",
    muxId: "BrKshHsFgC8DNhQPJGeu4fVjjWlzxHFLvMTcPB6EB6E",
    description: "The intro for an online course about Cloudfront.",
    height: 1080,
    width: 1920,
    submittedOn: new Date("08-03-2021"),
    links: [
      {
        type: "video",
        url: "https://www.udemy.com/course/the-cloud-architects-guide-to-cloudfront/",
      },
      {
        type: "website",
        url: "https://www.udemy.com/course/the-cloud-architects-guide-to-cloudfront/",
      },
    ],
    author: {
      name: "Tamàs Sallai",
      url: "https://advancedweb.hu/",
    },
  },
   {
    title: "Tokenviz - Crypto charts",
    type: "mux_video",
    time: "10",
    muxId: "fAhMmqHE5fQg9V7H2CwNj4buFC6JhLDfgaMI9OBpYhw",
    description:
      "Fully automated Twitter bot summarizing movements in the crypto market.",
    width: 720,
    height: 720,
    submittedOn: new Date("29-05-2021"),
    links: [
      {
        type: "website",
        url: "https://twitter.com/tokenviz",
      },
      {
        type: "video",
        url: "https://twitter.com/tokenviz/status/1391798812180508674",
      },
    ],
    author: {
      name: "Tokenviz",
      url: "https://twitter.com/tokenviz",
    },
  },
  {
    title: "Transfer Fee Record Specific to British Football",
    type: "mux_video",
    time: "10",
    muxId: "sBbBlET802IE1C3bHCkNhDB00rpWPXRpIrkUP9YTqruXM",
    description:
      "An infographic showing the progression of the transfer fee record in British Football",
    height: 1152,
    width: 2048,
    submittedOn: new Date("08-03-2021"),
    links: [
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=hMsi04DkoMI&feature=youtu.be",
      },
      {
        type: "website",
        url: "https://twitter.com/mikepombal/status/1422219571206008835",
      },
    ],
    author: {
      url: "https://twitter.com/mikepombal",
      name: "Mickael Marques",
    },
  },
  {
    title: "Name The Movie - Quiz",
    type: "mux_video",
    time: "10",
    muxId: "FFft61dbntN4DEnt00HiXCmfiJhNLnOaI02dT2D802oPIY",
    description:
      "A quiz game that gives you quotes from classic films to guess their title.",
    height: 720,
    width: 1280,
    submittedOn: new Date("08-05-2021"),
    links: [
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=kSqbAdwk5Bc",
      },
      {
        type: "website",
        url: "https://www.youtube.com/channel/UCfwUNx_fEW98olmpByg-V7w",
      },
    ],
    author: {
      url: "https://www.youtube.com/channel/UCfwUNx_fEW98olmpByg-V7w",
      name: "Collou",
    },
  },
  {
    title: "CSS+SVG effects",
    type: "mux_video",
    time: "10",
    muxId: "ujzfb6501KAiNDwKDzLIzCvcWxECz01rfSXh500I3mmifo",
    description: "A generative CSS + SVG animation.",
    width: 500,
    height: 500,
    submittedOn: new Date("27-06-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/calebwright/status/1406412814512803841",
      },
      {
        type: "source_code",
        url: "https://github.com/c0/remotion-playground/blob/main/src/GooBallCSS.jsx",
      },
    ],
    author: {
      name: "calebwright",
      url: "https://twitter.com/calebwright",
    },
  },
  {
    title: "Code Highlighter",
    type: "mux_video",
    time: "10",
    muxId: "1W02pMAx5ZdtRE2PajqW7Ni01qbxADjpe37o4Non9Sonc",
    description:
      "This video animates code and highlights interesting parts of it.",
    height: 720,
    width: 1280,
    submittedOn: new Date("07-07-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/matfrana/status/1372336451246034948",
      },
      {
        type: "website",
        url: "https://reactbricks.com/",
      },
    ],
    author: {
      url: "https://twitter.com/matfrana",
      name: "Matteo Frana",
    },
  },
    {
    title: "Flashy Title Card",
    type: "mux_video",
    time: "10",
    muxId: "J8H3dOuyC01ZurH9NnSvd17oS00FUPKns8HnTO02KyCF02k",
    description: "A nice title design in William Candillons video.",
    height: 720,
    width: 1280,
    submittedOn: new Date("08-05-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/wcandillon/status/1415263264737476608",
      },
      {
        type: "website",
        url: "https://www.youtube.com/wcandillon",
      },
    ],
    author: {
      url: "https://twitter.com/wcandillon",
      name: "William Candillon",
    },
  },
  {
    title: "Code Stack - A Fully Automated News Podcast",
    type: "mux_video",
    time: "10",
    muxId: "w02JWs4nf5GXSQjhHzIF00Ws6e1L1pz5PaZ02AgnE02K6dI",
    description:
      "Get a daily briefing with CodeStack's fully automated news podcast that reads news using text-to-speech.",
    height: 720,
    width: 1280,
    submittedOn: new Date("08-05-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/FelippeChemello/podcast-maker",
      },
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=3VSh3uCVtOE",
      },
      {
        type: "website",
        url: "https://anchor.fm/codestack",
      },
    ],
    author: {
      url: "https://twitter.com/CodeStackMe",
      name: "Felippe Chemello",
    },
  },
    {
    title: "EcoEats",
    type: "mux_video",
    time: "10",
    muxId: "XJpfsCytTHSoAyVwfObPVXbNN64Thj2Z8pLvoqO1Ocs",
    description:
      "A promo video for a zero emission takeaway and grocery delivery service.",
    height: 1080,
    width: 1080,
    submittedOn: new Date("08-28-2021"),
    links: [
      {
        type: "video",
        url: "https://cdn.ecoeats.uk/videos/merchant-features/06c07944-6d13-4188-8356-d42d744ba54e/raw-pressed-market-street.mp4",
      },
    ],
    author: {
      url: "https://ecoeats.uk/",
      name: "EcoEats",
    },
  },
    {
    title: "Master Duel Week",
    type: "mux_video",
    time: "10",
    muxId: "nFm3f8VfvL6ag20093gMUtWfbAJe5F6s4z5LapxrpLcM",
    description:
      "Automated Twitter bot that tweets a trading card game's meta deck weekly",
    height: 720,
    width: 720,
    submittedOn: new Date("05-08-2022"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/KalleChen/master-duel-week",
      },
      {
        type: "video",
        url: "https://twitter.com/masterduelweek/status/1522850783020339200",
      },
      {
        type: "website",
        url: "https://twitter.com/masterduelweek",
      },
    ],
    author: {
      url: "https://kallechen.github.io/",
      name: "Kalle Chen",
    },
  },
  {
    title: "Meet New Books - One of many book recommendation videos",
    type: "mux_video",
    time: "10",
    muxId: "601PVDW5t02VqRWd4XXDUUBM41t66JVBEO5f00VrGCUXE00",
    description:
      "An automated book recommendation video showcasing popular books.",
    height: 1920,
    width: 1080,
    submittedOn: new Date("10-12-2023"),
    links: [
      {
        type: "video",
        url: "https://www.instagram.com/p/Cx8u6pTNqCi/",
      },
    ],
    author: {
      url: "https://www.meetnewbooks.com/",
      name: "MeetNewBooks.com",
    },
  },
   {
    title: "Audio Player",
    type: "mux_video",
    time: "10",
    muxId: "eKnHTDXWCBsQgm00vOl59ZVF300otry3STKzFe025O7M5E",
    description: "A Reusable audio player template created using Remotion.",
    height: 1920,
    width: 1080,
    submittedOn: new Date("03-29-2022"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/varunpbardwaj/remotion-audio-player-template/",
      },
      {
        type: "video",
        url: "https://portfolio-varunpbardwaj.vercel.app/remotion/neenaadena/",
      },
    ],
    author: {
      url: "https://portfolio-varunpbardwaj.vercel.app",
      name: "Varun Bardwaj",
    },
  },
  {
    title: "The Eudaimonia Machine: The Ultimate Productivity Hack?",
    type: "mux_video",
    time: "10",
    muxId: "LEKN01a35v01OK2vyVxE00LJhm13JtRzJSnTrJjVYQeQtw",
    description:
      "This explainer video on the Eudaimonia Machine (featured in Cal Newport's 'Deep Work') was made completely with Remotion.",
    height: 1080,
    width: 1920,
    submittedOn: new Date("01-29-2023"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/brenjamin/eudaimonia-machine-video",
      },
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=IyRB3SbGnaY&list=PLliaWoyhTnjF6oQFYjviMGY4zAJHZHS2M",
      },
    ],
    author: {
      url: "https://www.linkedin.com/in/benjamin-brophy/",
      name: "Ben Brophy",
    },
  },
  {
    title: "Snappy Format File Animation",
    type: "mux_video",
    time: "10",
    muxId: "WopGJTJ4UfzD5zu9yXl4aEZ3ASufllximGBL9AjsjDQ",
    description:
      "In this visual you get to see an animation of various file formats.",
    height: 500,
    width: 500,
    submittedOn: new Date("07-07-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/zackdotcomputer/status/1360682974224744452",
      },
      {
        type: "website",
        url: "https://www.phototamer.app/",
      },
    ],
    author: {
      url: "https://zack.computer/",
      name: "Zack Sheppard",
    },
  },
  {
    title: "Outro Cards",
    type: "mux_video",
    time: "5.5",
    muxId: "Rzmd76Rry7hQAAvTREyaLLT4wSAuc9zouk3ZxOmybq4",
    description:
      "Animated playing cards. Used as a background for an outro thanking subscribers for their support.",
    height: 1080,
    width: 1920,
    submittedOn: new Date("11-24-2021"),
    links: [
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=xPbRsca_l7c",
      },
      {
        type: "website",
        url: "https://start-react-native.dev/",
      },
    ],
    author: {
      url: "https://twitter.com/wcandillon",
      name: "William Candillon",
    },
  },
  {
    title: "The Song of the Fae - Animated Banner",
    type: "mux_video",
    time: "10",
    muxId: "cEmxepEENf6004NhdttN7igT3O8o82ODq02dn01PMgS101I",
    description:
      "An animated banner as an intro sequences for a game called The Song of the Fae.",
    height: 720,
    width: 720,
    submittedOn: new Date("08-12-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/vivavolt/status/1408670642451345410",
      },
    ],
    author: {
      url: "https://bf.wtf/",
      name: "Ben Follington",
    },
  },
  {
    title: "The Quiz Universe - Film Quiz",
    type: "mux_video",
    time: "10",
    muxId: "8ho7TdmkzCVz5cbwU9dg2bZ00sDIAFgDNt8XF01IoDGo00",
    description:
      "This film quiz presents the scenes of movies and highlights the cast and crew.",
    height: 720,
    width: 1280,
    submittedOn: new Date("08-12-2023"),
    links: [
      {
        type: "video",
        url: "https://youtu.be/VIsThQDOEkU",
      },
      {
        type: "website",
        url: "www.TheQuizUniverse.com",
      },
    ],
    author: {
      url: "https://www.instagram.com/saint.reaux/",
      name: "Redando Ford",
    },
  },
    {
    title: "BarGPT TikToks",
    type: "mux_video",
    time: "10",
    muxId: "5uqV22rmxwQSr02ESt9ovQSE02HhAzUdBHUm02W6Mqu3NY",
    description:
      "BarGPT, the AI cocktail generator, uses remotion to generate TikTok videos from its AI generated cocktail recipes.",
    height: 1920,
    width: 1080,
    submittedOn: new Date("09-29-2023"),
    links: [
      {
        type: "website",
        url: "https://www.bargpt.app",
      },
    ],
    author: {
      url: "https://twitter.com/BarGPT",
      name: "BarGPT.app",
    },
  },
  {
    title: "Blast Workout video trailer",
    type: "mux_video",
    time: "30",
    muxId: "txrjnbtkqe1P701kHusZ4EeIY883aHVvVGF8xsAKKX24",
    description:
      "Blast Workout video trailer as it is displayed on the play store",
    height: 1080,
    width: 1920,
    submittedOn: new Date("09-30-2022"),
    links: [
      {
        type: "website",
        url: "https://blastworkout.app",
      },
    ],
    author: {
      url: "https://blastworkout.app",
      name: "Mad Mustache Company",
    },
  },
    {
    title: "Twitter year in review",
    type: "mux_video",
    time: "10",
    muxId: "iRnXEBXAvxCQAtu01TVEJsizIfXaPpxlyqeJfm54K1Vs",
    description:
      "This videos shows the user various metrics of their Twitter account.",
    height: 720,
    width: 720,
    submittedOn: new Date("07-07-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/vjo/status/1367901005027942403",
      },
      {
        type: "website",
        url: "https://twitter.com",
      },
    ],
    author: {
      url: "https://twitter.com/TwitterEng",
      name: "Twitter Engineering",
    },
  },
    {
    title: "Flow Fields",
    type: "mux_video",
    time: "10",
    muxId: "st5ifZHHqs8k9m19FNqYyRdh01CM8pX302ikEzAvnikTA",
    description: "A generative SVG animation using noise.",
    width: 720,
    height: 720,
    submittedOn: new Date("29-05-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/noWukkas_/status/1386174689660203011",
      },
      {
        type: "source_code",
        url: "https://codesandbox.io/s/flow-fields-evqg3",
      },
    ],
    author: {
      name: "No Wukkas",
      url: "https://twitter.com/noWukkas_",
    },
  },
  {
    title: "Top 15 smallest animals in this planet",
    type: "mux_video",
    time: "10",
    muxId: "bQ5bHzbVsYngW5GF4iQxH601HyPnxHZCcXZas1zzQRAU",
    description: "A simple Top List Video",
    height: 1080,
    width: 1920,
    submittedOn: new Date("08-12-2022"),
    links: [
      {
        type: "video",
        url: "https://youtu.be/jDAwyWWWfkM",
      },
      {
        type: "website",
        url: "https://adavii.com/",
      },
    ],
    author: {
      url: "https://twitter.com/yuwan_kumar",
      name: "Yuwan Kumar",
    },
  },
    {
    title: "Vlog editor",
    type: "mux_video",
    time: "10",
    muxId: "pSEhcZX5HBJy9SFK4j7vGs00NhPFCedqwL9X01ykNsIlo",
    description:
      "This daily vlog is automatically cut together using Remotion. Clips are recorded and uploaded to an FTP server, YouTube clips downloaded automatically.",
    width: 1280,
    height: 720,
    submittedOn: new Date("29-05-2021"),
    links: [
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=CcrCz8iRpHY",
      },
      {
        type: "website",
        url: "https://www.youtube.com/channel/UCRylGayptCYAnrZfWTwuV7A",
      },
    ],
    author: {
      name: "Pierre Miniggio",
      url: "https://www.youtube.com/c/PierreMiniggio",
    },
  },
  {
    title: "Old french TV trailer (tribute)",
    type: "mux_video",
    time: "10",
    muxId: "7tmF019NZLRuazoq5I7WFdacYz8bjJb4BTDEQ5cEkFe4",
    description:
      'Video tribute to an old TV jingle called "La trilogie du samedi" broadcasted in the early 2000s in France on the channel M6.',
    height: 1080,
    width: 1920,
    submittedOn: new Date("04-01-2022"),
    links: [],
    author: {
      url: "https://twitter.com/Slashgear_",
      name: "Antoine Caron & Mickaël Alves",
    },
  },
  {
    title: "TVFoodMaps Tik Tok",
    type: "mux_video",
    time: "10",
    muxId: "5ON0000Gg9ov1z01in02jC02k2xjltp01xg3h9CVfymANi01iE",
    description: "Video generated from TVFoodMaps lists",
    height: 1920,
    width: 1080,
    submittedOn: new Date("02-11-2023"),
    links: [
      {
        type: "website",
        url: "https://www.tvfoodmaps.com",
      },
    ],
    author: {
      url: "https://twitter.com/tvfoodmaps",
      name: "TVFoodMaps",
    },
  },
  {
    title: "Cricket Match Feature",
    type: "mux_video",
    time: "10",
    muxId: "zDEoYi6tII8cA017JrZpqyx1hf2ErMaPUklUSSkdkhKk",
    description:
      "An animation showing the two teams competing in todays cricket match.",
    height: 1280,
    width: 720,
    submittedOn: new Date("08-05-2021"),
    links: [
      {
        type: "video",
        url: "https://discord.com/channels/809501355504959528/817306292590215181/820365999697952790",
      },
    ],
    author: {
      url: "https://discord.com/channels/809501355504959528/817306292590215181/820365999697952790",
      name: "Suthar",
    },
  },
  {
    title: "Lotus App",
    type: "mux_video",
    time: "10",
    muxId: "LAtfpU01MnxJc200ccLrLVPanKx7wSv1NNT42027Ptq4VI",
    description:
      "An animated Lotus icon in the Dock on Mac. With Lotus you can manage your GitHub notifications without stress.",
    height: 230,
    width: 378,
    submittedOn: new Date("08-12-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/vadimdemedes/status/1425178353737293829",
      },
      {
        type: "website",
        url: "https://getlotus.app/",
      },
    ],
    author: {
      url: "Vadim Demedes",
      name: "https://vadimdemedes.com/",
    },
  },

  */
];

const dateString = (date: Date) =>
	date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();

const todayHash = dateString(new Date());

export const shuffledShowcaseVideos =
	typeof window === 'undefined'
		? []
		: showcaseVideos.slice(0).sort((a, b) => {
				return random(a.muxId + todayHash) - random(b.muxId + todayHash);
			});
