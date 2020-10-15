type Sticker = {
	packId: string;
	stickerId: string;
};

const coolStickers: Sticker[] = [
	{
		packId: 'teman-papon',
		stickerId: 'sticker-12',
	},
	{
		packId: 'elemento-banana',
		stickerId: 'sticker-2',
	},
	{
		packId: 'characters-of-care',
		stickerId: 'sticker-4',
	},
	{
		packId: 'grateful-food-puns',
		stickerId: 'sticker-2',
	},
	{
		packId: 'psyduck',
		stickerId: 'sticker-1',
	},
	{
		packId: 'zakiyyah',
		stickerId: 'sticker-10',
	},
	{
		packId: 'fonte-do-acai',
		stickerId: 'sticker-2',
	},
	{
		packId: 'realmcraft',
		stickerId: 'sticker-1',
	},
	{
		packId: '123pray',
		stickerId: 'sticker-12',
	},
	{
		packId: '123pray',
		stickerId: 'sticker-16',
	},
	{
		packId: '123pray',
		stickerId: 'sticker-11',
	},
	{
		packId: '123wow',
		stickerId: 'sticker-1',
	},
	{
		packId: '123yesyeah',
		stickerId: 'sticker-2',
	},
	{
		packId: 'singlish',
		stickerId: 'sticker-12',
	},
	{
		packId: 'singlish',
		stickerId: 'sticker-19',
	},
	{
		packId: 'singlish',
		stickerId: 'sticker-28',
	},
	{
		packId: 'stars-and-hearts',
		stickerId: 'sticker-1',
	},
	{
		packId: 'corn',
		stickerId: 'blush',
	},
	{
		packId: 'together-at-a-distance',
		stickerId: 'sticker-5',
	},
	{
		packId: 'good-vibes',
		stickerId: 'sticker-7',
	},
	{
		packId: 'bestande',
		stickerId: 'sticker-4',
	},
	{
		packId: 'uchidoma',
		stickerId: 'sticker-5',
	},
	{
		packId: '123haha',
		stickerId: 'sticker-1',
	},
	{
		packId: 'lol-ghost',
		stickerId: 'sticker-16',
	},
	{
		packId: 'happy',
		stickerId: 'sticker-29',
	},
	{
		packId: 'happy',
		stickerId: 'sticker-30',
	},
	{
		packId: '123yesyeah',
		stickerId: 'sticker-8',
	},
	{
		packId: 'yookidoo',
		stickerId: 'sticker-4',
	},
	{
		packId: 'covid-emoji',
		stickerId: 'sticker-2',
	},
	{
		packId: 'phils-bio-eistee',
		stickerId: 'logo',
	},
	{
		packId: 'eclectic-virgo',
		stickerId: 'sticker-3',
	},
	{
		packId: 'coffeeshopsm',
		stickerId: 'sticker-3',
	},
	{
		packId: 'myhbcartoon',
		stickerId: 'sticker-8',
	},
	{
		packId: 'zack',
		stickerId: 'sticker-1',
	},
	{
		packId: 'international-beer-day',
		stickerId: 'sticker-2',
	},
	{
		packId: 'praypray',
		stickerId: 'sticker-12',
	},
	{
		packId: 'spesasospesa',
		stickerId: 'sticker-3',
	},
	{
		packId: 'tagface',
		stickerId: 'sticker-1',
	},
	{
		packId: 'buddi-characters',
		stickerId: 'sticker-3',
	},
];

Promise.all(
	coolStickers.map(async (c) => {
		const packRes = await fetch(`https://api.anysticker.app/packs/${c.packId}`);
		const json = await packRes.json();
		return json.data.pack.stickers.find((s: any) => s.id === c.stickerId);
	})
)
	.then(console.log)
	.catch((err) => console.log(err));
