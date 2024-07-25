export default async function handler(request: Request) {
	const country = request.headers.get('x-vercel-ip-country');
	const city = request.headers.get('x-vercel-ip-city');

	return new Response(JSON.stringify({country, city}), {
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
