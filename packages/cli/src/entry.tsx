import React from "react";
import { render } from "react-dom";
import "./Hey";
import { getVideo } from "@jonny/motion-core";
import { Editor } from "./editor/components/Editor";
import { RecoilRoot } from "recoil";

const Video = getVideo();

render(
  <RecoilRoot>
    <Editor />
  </RecoilRoot>,
  document.getElementById("container")
);
