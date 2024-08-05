export default async function handler(request: Request) {
	const country = request.headers.get('x-vercel-ip-country');
	const city = request.headers.get('x-vercel-ip-city');
	const latitude = request.headers.get('x-vercel-ip-latitude');
	const longitude = request.headers.get('x-vercel-ip-longitude');

	return new Response(JSON.stringify({country, city, longitude, latitude}), {
		status: 200,
		headers: {
			'access-control-allow-origin': '*',
			'access-control-allow-methods': 'GET',
			'access-control-allow-headers': 'Content-Type',
			'content-type': 'application/json',
		},
	});
}

export const config = {
	runtime: 'edge',
};
