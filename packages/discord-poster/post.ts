const latestRelease = await fetch(
  "https://api.github.com/repos/remotion-dev/remotion/releases?per_page=1"
);

const json = await latestRelease.json();

const markdown = [
  `${json[0].tag_name} has been released!`,
  `<:merge:909914451447259177> ${json[0].html_url}`,
  ...json[0].body.split("\n").map((s) => {
    if (s.startsWith("## ")) {
      return s.replace("## ", "**<:love:989990489824559104> ") + "**";
    }
    return s;
  }),
]
  .filter(Boolean)
  .join("\n");

const res = await fetch(
  `https://discord.com/api/channels/994527481598070815/messages`,
  {
    method: "post",
    body: JSON.stringify({
      content: markdown,
      allowed_mentions: {},
      flags: 1 << 2,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
    },
  }
);

if (res.status !== 200) {
  console.log(await res.text());
  process.exit(1);
}

export {};
