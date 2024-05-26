// Import the original mapper
import MDXComponents from "@theme-original/MDXComponents";
import { ExperimentalBadge } from "../../components/Experimental";
import { InlineStep, Step } from "../../components/InlineStep";
import { Installation } from "../../components/Installation";
import { YouTube } from "../../components/YouTube";
import { Demo } from "../../components/demos";
import {
  AvailableFrom,
  MinBunVersion,
  MinNodeVersion,
} from "../components/AvailableFrom";
import { Credits } from "../components/Credits";
import { Options } from "../components/Options";

export default {
  ...MDXComponents,
  InlineStep,
  ExperimentalBadge,
  Step,
  Demo,
  AvailableFrom,
  MinNodeVersion,
  MinBunVersion,
  Options,
  Credits,
  YouTube,
  Installation,
};
