import React from "react";
import { render } from "react-dom";
import "./Hey";
import { getVideo } from "@jonny/motion-core";
import { Editor } from "./editor/Editor";

const Video = getVideo();

render(
  <div>
    <Editor />
  </div>,
  document.getElementById("container")
);
