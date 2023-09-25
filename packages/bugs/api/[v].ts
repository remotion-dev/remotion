export default async function handler(request: Request) {
  const urlParams = new URL(request.url).searchParams;
  const query = Object.fromEntries(urlParams);
  const cookies = request.headers.get("cookie");
  let body;
  try {
    body = await request.json();
  } catch (e) {
    body = null;
  }

  return new Response(
    JSON.stringify({
      body,
      query,
      cookies,
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    }
  );
}

export const config = {
  runtime: "edge",
};
