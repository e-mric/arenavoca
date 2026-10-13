import { createSystem, Pressed } from "@iwsdk/core";
import { MatchLabTarget } from "./components";
export class MatchLabInput extends createSystem({
  pressed: { required: [MatchLabTarget, Pressed] },
}) {
  activate: (index: number) => void = () => {};
  init() {
    this.queries.pressed.subscribe("qualify", (entity) =>
      this.activate(entity.getValue(MatchLabTarget, "index") ?? -2),
    );
  }
}
