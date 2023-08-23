// Import the original mapper
import MDXComponents from "@theme-original/MDXComponents";
import { Demo } from "../../components/demos";
import { ExperimentalBadge } from "../../components/Experimental";
import { InlineStep, Step } from "../../components/InlineStep";
import { AvailableFrom } from "../components/AvailableFrom";
import { Options } from "../components/Options";

export default {
  ...MDXComponents,
  InlineStep,
  ExperimentalBadge,
  Step,
  Demo,
  AvailableFrom,
  Options,
};
