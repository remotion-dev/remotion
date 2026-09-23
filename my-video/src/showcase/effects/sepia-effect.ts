import {createEffect, type InteractivitySchema} from "remotion";

type SepiaEffectParams = {
  readonly amount?: number;
};

const sepiaEffectSchema = {
  amount: {
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 1,
    description: "Amount",
    hiddenFromList: false,
  },
} as const satisfies InteractivitySchema;

const resolve = (params: SepiaEffectParams) => ({
  amount: params.amount ?? 1,
});

// A project-specific custom effect built with core remotion's createEffect(),
// following the effects.md skill guide's 2D-backend pattern. Used on
// <CanvasImage> in CoreMediaScene alongside @remotion/effects' own
// prebuilt filters, to show createEffect() is the same mechanism a library
// effect uses under the hood.
export const sepiaEffect = createEffect<SepiaEffectParams, null>({
  type: "com.example.sepiaEffect",
  label: "sepiaEffect()",
  documentationLink: null,
  backend: "2d",
  calculateKey: (params) => {
    const {amount} = resolve(params);
    return `sepia-effect-${amount}`;
  },
  setup: () => null,
  apply: ({source, target, width, height, params}) => {
    const ctx = target.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get a 2D context for sepiaEffect().");
    }

    const {amount} = resolve(params);

    ctx.clearRect(0, 0, width, height);
    ctx.filter = `sepia(${amount * 100}%)`;
    ctx.drawImage(source, 0, 0, width, height);
    ctx.filter = "none";
  },
  cleanup: () => undefined,
  schema: sepiaEffectSchema,
  validateParams: ({amount = 1}) => {
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0 || amount > 1) {
      throw new TypeError("amount must be a number between 0 and 1");
    }
  },
});
