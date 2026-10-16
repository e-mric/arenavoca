import { defineComponents } from "@iwsdk/core";
import { SpatialWindow } from "./features/spatial-windows/components";
import {
  MatchLabTarget,
  TabletopTarget,
} from "./features/match-lab/components";
export default defineComponents([
  MatchLabTarget,
  TabletopTarget,
  SpatialWindow,
]);
