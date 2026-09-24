import { Img, useVideoConfig } from "remotion";
import { Stargazer } from "./cache";
import { RepoHeader } from "./repo-header";

const W = 1280 / 2.5;
const H = 720 / 2.5;

export function Content({
  stargazers,
  repoOrg,
  repoName,
  progress,
}: {
  readonly stargazers: Stargazer[];
  readonly repoOrg: string;
  readonly repoName: string;
  readonly progress: number;
}) {
  const gap = 102;
  const startY = 76 - gap;
  const dy = progress * gap;
  const { width } = useVideoConfig();

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#f6f8fa",
        position: "relative",
        maxWidth: W,
        maxHeight: H,
        minHeight: H,
        transformOrigin: "top left",
        transform: `scale(${width / W})`,
      }}
    >
      {stargazers.map((stargazer, index) => {
        const isHidden = Math.abs(index - progress) > 3;
        const grow = 0;
        const opacity = Math.min(0.1 + progress - index, 1);
        return isHidden ? null : (
          <StarBox
            key={stargazer.login}
            avatarUrl={stargazer.avatarUrl}
            name={stargazer.name}
            date={stargazer.date}
            repoName={repoName}
            y={startY - gap * index + dy}
            grow={grow}
            opacity={opacity}
            starNumber={index + 1}
          />
        );
      })}

      <RepoHeader stars={Math.round(progress)} org={repoOrg} name={repoName} />
    </div>
  );
}

function StarBox({
  avatarUrl,
  name,
  date,
  repoName,
  y,
  starNumber,
  grow,
  opacity,
}: {
  readonly avatarUrl: string;
  readonly name: string;
  readonly date: string;
  readonly repoName: string;
  readonly y: number;
  readonly starNumber: number;
  readonly grow: number;
  readonly opacity: number;
}) {
  const d = new Date(date);
  const dateString = d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e1e4e8",
        borderRadius: 6,
        padding: 12,
        display: "flex",
        position: "absolute",
        opacity,
        top: 0,
        right: 24,
        left: 24,
        height: 88,
        minHeight: 88,
        maxHeight: 88,
        transform: `translateY(${y}px) scale(${1 + grow * 0.07})`,
      }}
    >
      <Img
        width="64"
        height="64"
        src={avatarUrl}
        style={{ borderRadius: "50%" }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginLeft: "12px",
          flex: 1,
          maxWidth: 560,
          minWidth: 0,
        }}
      >
        <h3
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 360,
            fontWeight: 400,
          }}
        >
          {name}
        </h3>
        <div
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          starred <b>{repoName}</b>{" "}
          <span style={{ color: "#586069" }}>on {dateString}</span>
        </div>
      </div>
      <div
        style={{
          width: 64,
          height: 64,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "0.8em", color: "#586069" }}>Star</span>
        <div style={{ fontSize: "1.2em" }}>
          <span style={{ fontSize: "1em", color: "#586069" }}>#</span>
          {starNumber}
        </div>
      </div>
    </div>
  );
}
