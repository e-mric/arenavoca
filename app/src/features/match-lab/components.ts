import { createComponent, Types } from "@iwsdk/core";
export const MatchLabTarget = createComponent("MatchLabTarget", {
  index: { type: Types.Int8, default: -1 },
});

export const TabletopTarget = createComponent("TabletopTarget", {
  kind: { type: Types.Int8, default: 0 },
});
