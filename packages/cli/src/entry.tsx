import React from "react";
import { render } from "react-dom";
import "./Hey";
import { getVideo } from "@jonny/motion-core";

const Video = getVideo();

render(
  <div>
    hihi <Video />
  </div>,
  document.getElementById("container")
);
