export default async function handler() {
  return new Response(
    `<h1>Remotion Bugs</h1><p>Add a version to query bugs, e.g <a href="https://bugs.remotion.dev/v4.0.36">https://bugs.remotion.dev/v4.0.36</a></p>`,
    {
      status: 200,
      headers: {
        "content-type": "text/html",
      },
    }
  );
}

export const config = {
  runtime: "edge",
};
