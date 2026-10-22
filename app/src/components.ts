import { defineComponents } from "@iwsdk/core";
import { SpatialWindow } from "./features/spatial-windows/components";
import { CelebrationStatus } from "./features/match-moments/components";
import {
  MatchLabTarget,
  TabletopTarget,
} from "./features/match-lab/components";
export default defineComponents([
  CelebrationStatus,
  MatchLabTarget,
  TabletopTarget,
  SpatialWindow,
]);
