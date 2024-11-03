import "./gh-styles.css";

export function RepoHeader({
  stars,
  org,
  name,
}: {
  readonly stars: number;
  readonly org: string;
  readonly name: string;
}) {
  return (
    <div
      className="d-flex mb-3 px-3 px-md-4 px-lg-5"
      style={{
        padding: "16px 24px",
        boxShadow: "inset 0 -1px 0 var(--color-border-secondary)",
        backgroundColor: "white",
        position: "absolute",
        top: 0,
        right: 0,
        left: 0,
        height: 70,
        minHeight: 70,
        maxHeight: 70,
      }}
    >
      <div className="flex-auto min-width-0 width-fit mr-3">
        <h1
          className="d-flex flex-items-center break-word f3 text-normal"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            alignItems: "center",
          }}
        >
          <svg
            className="octicon octicon-repo color-text-secondary mrx"
            viewBox="0 0 16 16"
            width="16"
            height="16"
            style={{
              marginTop: 5,
            }}
          >
            <path
              fillRule="evenodd"
              d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"
            />
          </svg>
          <span className="author flex-self-stretch url fn" itemProp="author">
            <a className="" rel="author">
              {org}
            </a>
          </span>
          <span className="mx-1 flex-self-stretch color-text-secondary">/</span>
          <a
            itemProp="name"
            className="mr-2 flex-self-stretch"
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
              fontWeight: 500,
            }}
          >
            {name}
          </a>
        </h1>
      </div>
      <ul
        className="pagehead-actions flex-shrink-0 d-none d-md-inline"
        style={{ padding: "2px 0" }}
      >
        <li>
          <div className="d-block js-toggler-container js-social-container starring-container ">
            <div className="unstarred">
              <div className="btn btn-sm btn-with-count">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  version="1.1"
                  data-view-component="true"
                  height="16"
                  width="16"
                  className="octicon octicon-star mr-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"
                  />
                </svg>
                <span data-view-component="true">Star</span>
              </div>{" "}
              <a
                className="social-count"
                style={{ minWidth: 52, textAlign: "center" }}
              >
                {stars}
              </a>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}
