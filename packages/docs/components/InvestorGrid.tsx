import React from "react";

const container: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const row: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  marginBottom: 30,
};

const item: React.CSSProperties = {
  flex: 1,
};

const image: React.CSSProperties = {
  width: "100%",
};

const title: React.CSSProperties = {
  color: "var(--ifm-color-primary)",
  marginBottom: 0,
  fontSize: 18,
};

const subtitle: React.CSSProperties = {
  color: "var(--light-text-color)",
  fontSize: 15,
  lineHeight: 1.25,
};

const spacer: React.CSSProperties = {
  width: 10,
};

export const InvestorGrid: React.FC = () => {
  return (
    <div style={container}>
      <div style={row}>
        <div style={item}>
          <img style={image} src="/img/investors/foronered.png" />
          <h3 style={title}>For One Red</h3>
          <div style={subtitle}>Design Studio</div>
        </div>
        <div style={spacer} />
        <div style={item}>
          <img style={image} src="/img/investors/heiko.jpeg" />
          <h3 style={title}>Heiko Hubertz</h3>
          <div style={subtitle}>Founder & CEO, Oxolo</div>
        </div>
        <div style={spacer} />
        <div style={item}>
          <img style={image} src="/img/investors/simon.jpeg" />
          <h3 style={title}>Simon Schmid</h3>
          <div style={subtitle}>Product, iubenda</div>
        </div>
      </div>
      <div style={row}>
        <div style={item}>
          <div style={item}>
            <img style={image} src="/img/investors/william.jpeg" />
            <h3 style={title}>William Candillon</h3>
            <div style={subtitle}>{"Can it be done in React Native?"}</div>
          </div>
        </div>{" "}
        <div style={spacer} />
        <div style={item}>
          <img style={image} src="/img/investors/sebastien.jpeg" />
          <h3 style={title}>Sébastien Lorber</h3>
          <div style={subtitle}>This Week in React, Docusaurus</div>
        </div>
        <div style={spacer} />
        <div style={item}>
          <img style={image} src="/img/investors/nick.jpeg" />
          <h3 style={title}>Nick Dima</h3>
          <div style={subtitle}>Senior Engineering Manager, Musixmatch</div>
        </div>
      </div>
      <div style={row}>
        <div style={item}>
          <img style={image} src="/img/investors/steven.jpeg" />
          <h3 style={title}>Stephen Sullivan</h3>
          <div style={subtitle}>Founder, Middy.com</div>
        </div>
        <div style={spacer} />
        <div style={item}>
          <img style={image} src="/img/investors/dominic.jpeg" />
          <h3 style={title}>Dominic Monn</h3>
          <div style={subtitle}>Founder, MentorCruise</div>
        </div>
        <div style={spacer} />
        <div style={item}>
          <img style={image} src="/img/investors/jeremy.jpeg" />
          <h3 style={title}>Jeremy Toeman</h3>
          <div style={subtitle}>Founder, augxlabs.com</div>
        </div>
      </div>
      <div style={row}>
        <div style={item}>
          <img style={image} src="/img/investors/robbie.jpeg" />
          <h3 style={title}>Robbie Zhang-Smitheran</h3>
          <div style={subtitle}>Cameo.com</div>
        </div>{" "}
        <div style={spacer} />
        <div style={item}>
          <img style={image} src="/img/investors/ilya.jpeg" />
          <h3 style={title}>Ilya Lyamkin</h3>
          <div style={subtitle}>Senior Software Engineer, Spotify</div>
        </div>
        <div style={spacer} />
        <div style={item}>
          <img style={image} src="/img/investors/lucas.jpeg" />
          <h3 style={title}>Lucas Pelloni</h3>
          <div style={subtitle}>Co-Founder, Axelra</div>
        </div>
      </div>
      <div style={row}>
        <div style={item}>
          <img style={image} src="/img/investors/michiel.jpeg" />
          <h3 style={title}>Michiel Westerbeek</h3>
          <div style={subtitle}>Co-Founder, Tella</div>
        </div>
        <div style={spacer} />
        <div style={item}>
          <img style={image} src="/img/investors/david.jpeg" />
          <h3 style={title}>David Salib</h3>
          <div style={subtitle}>Co-Founder, Momento</div>
        </div>{" "}
        <div style={spacer} />
        <div style={item} />
      </div>
    </div>
  );
};
