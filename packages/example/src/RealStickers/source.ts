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
		packId: 'emotions-sticker-pack',
		stickerId: 'sticker-2',
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
];

Promise.all(
	coolStickers.map(async (c) => {
		const packRes = await fetch(`https://api.anysticker.app/packs/${c.packId}`);
		const json = await packRes.json();
		return json.data.pack.stickers.find((s) => s.id === c.stickerId);
	})
).then(console.log);
