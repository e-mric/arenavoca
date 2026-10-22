import {
  activatePlayback,
  playbackLabel,
} from "../tabletop-reveal/playback-control";
import { bindSessionPage } from "../launcher/session-page";
import {
  Color,
  Grabbed,
  InputComponent,
  Group,
  Mesh,
  MeshBasicMaterial,
  SRGBColorSpace,
  UIKitMLAsset,
  Vector3,
  VideoTexture,
  VisibilityState,
  type World,
} from "@iwsdk/core";
import type { Experience } from "../session/experience";
import type { ViewingSpace } from "../xr/viewing-space";
import { SpatialWindows } from "../spatial-windows/windows";
import { attachHandheldCard } from "../match-lab/handheld";
import { MomentDelivery } from "./delivery";
import { attachMomentActions } from "./card-actions";
import { GestureMenu } from "./gesture-menu";
import { MomentNotice } from "./notice";
import { PalmReader } from "./palm";
import { WindowTargets } from "../spatial-windows/windows";
import { attachGoalCelebration } from "./celebration-xr";

/** One match screen and source-timed, physically flippable cards. */
export function attachMinimalXR(
  world: World,
  e: Experience,
  fonts: unknown,
  space: ViewingSpace,
) {
  const root = world.requireSceneObject<Group>("viewing-space");
  for (const child of root.children) child.visible = false;
  for (const id of [
    "house-ambient",
    "house-left",
    "house-right",
    "screen-glow",
  ])
    world.requireSceneObject<Group>(id).visible = true;
  const windows = new SpatialWindows(world);
  const delivery = new MomentDelivery(e);
  const renderCard = attachHandheldCard(world, e, windows, true);
  const renderActions = attachMomentActions(world, e, fonts);
  const menu = new GestureMenu();
  const celebration = attachGoalCelebration(world, e, fonts);
  menu.visible = true;
  const notice = new MomentNotice();
  const invitation = world.requireSceneObject<UIKitMLAsset>("moment-notice");
  invitation.document.setTargetDimensions(0.23, 0.058);
  invitation.document.rootElement.setProperties({
    fontFamilies: fonts as never,
  });
  const noticeButton = invitation.requireElementById("notice-open");
  const noticeLabel = invitation.requireElementById("notice-label");
  const noticeY = invitation.position.y;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let noticeRevision = -1,
    glowing = false;
  const openNotice = () => {
    delivery.open(delivery.noticeTarget);
    notice.dismiss();
  };
  noticeButton.addEventListener("click", openNotice);
  world.addCleanup(() => noticeButton.removeEventListener("click", openNotice));
  world.addCleanup(
    world.onXRFrame((_frame, delta) =>
      notice.update(delivery.noticeRevision, delta),
    ),
  );
  if (import.meta.env.DEV) {
    const marker = new Group();
    marker.name = "moment-notice-target";
    world.createTransformEntity(marker);
    world.addCleanup(
      world.onXRFrame(() => noticeButton.getWorldPosition(marker.position)),
    );
  }
  const palm = new PalmReader();
  const screen = world.requireSceneObject<Mesh>("minimal-screen");
  const dock = world.requireSceneObject<UIKitMLAsset>("minimal-dock");
  const texture = new VideoTexture(e.player.video);
  texture.colorSpace = SRGBColorSpace;
  const material = new MeshBasicMaterial({ map: texture });
  screen.traverse((o) => {
    if (o instanceof Mesh) o.material = material;
  });
  const screenAnchor = windows.bind("minimal-screen", screen, 4.4, 2.475);
  const dockAnchor = windows.bind("minimal-dock", dock, 0.36, 0.13);
  dock.document.setTargetDimensions(0.36, 0.13);
  dock.document.rootElement.setProperties({ fontFamilies: fonts as never });
  const head = new Vector3(),
    direction = new Vector3();
  const background = new Color("#fffaf2");
  let lastHeight = 0;
  const cache = new Map<string, string | boolean>();
  const text = (id: string, value: string) => {
    if (cache.get(id) === value) return;
    dock.requireElementById(id).setProperties({ text: value });
    cache.set(id, value);
  };
  const show = (id: string, value: boolean) => {
    if (cache.get(id) === value) return;
    dock
      .requireElementById(id)
      .setProperties({ display: value ? "flex" : "none" });
    cache.set(id, value);
  };
  const actions: Record<string, () => unknown> = {
    "minimal-celebration": () =>
      celebration.state.setEnabled(!celebration.state.enabled),
    "minimal-celebration-demo": () => {
      celebration.state.tryDemo();
      if (celebration.state.enabled) menu.hide();
    },
    "minimal-play": () => activatePlayback(e.session),
    "minimal-open": () => {
      if (delivery.arrivals.available.length) delivery.open();
      else delivery.pregame();
    },
    "minimal-mute": () =>
      e.session.setPreference("muted", !e.session.snapshot.preferences.muted),
    "minimal-room": () =>
      space.select(
        "passthrough",
        world.renderer.xr.getSession()?.environmentBlendMode,
      ),
    "minimal-quiet": () =>
      space.select(
        "theater",
        world.renderer.xr.getSession()?.environmentBlendMode,
      ),
    "minimal-more": () => {
      menu.more = !menu.more;
    },
    "minimal-hide": () => {
      menu.hide();
    },
    "minimal-pregame": () => delivery.pregame(),
    "minimal-close": () => e.closeLab(),
    "minimal-jump": () => {
      const start = delivery.nextStart;
      if (start !== undefined) void e.session.seekTo(Math.max(0, start - 2));
    },
    "minimal-recenter": () => {
      world.player.head.getWorldPosition(head);
      world.player.head.getWorldDirection(direction);
      const yaw = Math.atan2(direction.x, direction.z);
      screenAnchor.position.set(
        head.x - Math.sin(yaw) * 2.6,
        head.y + 0.4,
        head.z - Math.cos(yaw) * 2.6,
      );
      screenAnchor.rotation.set(0, yaw, 0);
      dockAnchor.position.set(
        head.x - Math.sin(yaw) * 1.55,
        head.y - 0.4,
        head.z - Math.cos(yaw) * 1.55,
      );
      dockAnchor.rotation.set(0, yaw, 0);
    },
    "minimal-flip": () => e.changeLabCard("flip"),
    "minimal-story": () => {
      if (delivery.storyAvailable) e.changeLabCard("story");
    },
    "minimal-next": () => delivery.move(1),
    "minimal-previous": () => delivery.move(-1),
  };
  // The menu is placed once when revealed, so the other hand can select it.
  // It is not head-locked and does not jitter with the palm while reading.
  function placeMenu(atPalm: boolean) {
    world.player.head.getWorldPosition(head);
    world.player.head.getWorldDirection(direction);
    if (atPalm) palm.placeMenu(dockAnchor.position);
    else
      dockAnchor.position.set(
        head.x - direction.x * 0.65,
        head.y - 0.3,
        head.z - direction.z * 0.65,
      );
    dockAnchor.lookAt(head);
    dockAnchor.scale.setScalar(1);
  }
  world.addCleanup(
    world.onXRFrame((frame, delta) => {
      const space = world.renderer.xr.getReferenceSpace();
      if (!space) return;
      const before = menu.visible;
      let hands = false,
        pressed = false,
        controllers = false;
      let held = false;
      for (const entity of world.getSystem(WindowTargets)!.queries.handles
        .entities)
        if (entity.hasComponent(Grabbed)) held = true;
      celebration.frame(frame, delta, held);
      for (const source of frame.session.inputSources) {
        if (source.hand) hands = true;
        else if (source.gamepad) controllers = true;
      }
      pressed = !!(
        world.input.xr.gamepads.right?.getButtonDown(InputComponent.A_Button) ||
        world.input.xr.gamepads.left?.getButtonDown(InputComponent.X_Button)
      );
      if (hands) {
        palm.read(frame, space);
        if (celebration.state.phase === "idle" && (!held || !menu.visible))
          menu.observe(palm.up && !held, palm.tracked, delta);
      } else if (pressed) menu.toggle();
      else if (!controllers) menu.observe(false, false, delta);

      if (!before && menu.visible) placeMenu(hands);
      if (!menu.visible) menu.more = false;
    }),
  );
  const dockHandles = [0, 1, 2, 4].map((kind) =>
    world.requireSceneObject<Group>(`minimal-dock-handle-${kind}`),
  );
  const probes = new Map<string, Group>();
  if (import.meta.env.DEV)
    for (const id of Object.keys(actions)) {
      const marker = new Group();
      marker.name = `minimal-target/${id}`;
      world.createTransformEntity(marker);
      probes.set(id, marker);
    }
  for (const [id, action] of Object.entries(actions)) {
    const node = dock.requireElementById(id);
    const listener = () => {
      action();
      render();
    };
    node.addEventListener("click", listener);
    world.addCleanup(() => node.removeEventListener("click", listener));
  }
  world.addCleanup(
    world.visibilityState.subscribe((value) => {
      if (
        value === VisibilityState.Hidden ||
        value === VisibilityState.VisibleBlurred
      ) {
        celebration.state.cancel();
        menu.hide();
        e.session.suspend();
      }
    }),
  );
  const unbind = bindSessionPage(
    world.renderer.xr,
    document.body.classList,
    () => e.session.suspend(),
  );
  world.addCleanup(() => {
    texture.dispose();
    material.dispose();
    unbind();
  });
  function render() {
    if (world.renderer.xr.isPresenting) delivery.update();
    world.scene.background = space.mode === "passthrough" ? null : background;
    world.renderer.setClearAlpha(space.mode === "passthrough" ? 0 : 1);
    screen.visible = true;
    dock.visible = menu.visible;
    invitation.visible = e.session.matchActive && notice.visible;
    if (invitation.visible) {
      invitation.scale.setScalar(Math.max(0.01, notice.scale(reduced.matches)));
      invitation.position.y = noticeY + notice.rise(reduced.matches);
    }
    if (noticeRevision !== delivery.noticeRevision) {
      noticeLabel.setProperties({
        text: delivery.noticeTarget?.startsWith("pregame-")
          ? "Before kick-off"
          : "New moment",
      });
      noticeRevision = delivery.noticeRevision;
    }
    const glow = notice.visible && !reduced.matches && notice.age < 0.7;
    if (glow !== glowing) {
      noticeButton.setProperties({
        backgroundColor: glow ? "#ddd8ff" : "#fffaf2",
      });
      glowing = glow;
    }
    renderCard();
    renderActions();
    windows.update();
    for (const handle of dockHandles)
      handle.visible = handle.visible && menu.visible && menu.more;
    for (const [id, marker] of probes)
      dock.requireElementById(id).getWorldPosition(marker.position);
    const active = e.session.matchActive,
      open = active && e.lab.open;
    const pending = delivery.arrivals.pending.length;
    show("minimal-open", active && e.labAvailable);
    show("minimal-options", menu.more);
    show("celebration-options", e.labAvailable);
    text(
      "minimal-celebration-label",
      `Celebrations: ${celebration.state.enabled ? "On" : "Off"}`,
    );
    dock
      .requireElementById("minimal-celebration-demo")
      .setProperties({ disabled: !celebration.state.enabled });
    celebration.render();
    const roomAvailable = space.canShowRoom(
      world.renderer.xr.getSession()?.environmentBlendMode,
    );
    const spaceKey = `${space.mode}/${roomAvailable}`;
    if (cache.get("space-selection") !== spaceKey) {
      dock.requireElementById("minimal-room").setProperties({
        disabled: !roomAvailable,
        backgroundColor: space.mode === "passthrough" ? "#ddd8ff" : "#ece8fc",
      });
      dock.requireElementById("minimal-quiet").setProperties({
        backgroundColor: space.mode === "theater" ? "#ddd8ff" : "#ece8fc",
      });
      text(
        "minimal-room-label",
        roomAvailable
          ? space.mode === "passthrough"
            ? "My room (on)"
            : "My room"
          : "Room unavailable",
      );
      text(
        "minimal-quiet-label",
        space.mode === "theater" ? "Quiet space (on)" : "Quiet space",
      );
      cache.set("space-selection", spaceKey);
    }
    show("menu-play-icon", !active || e.player.video.paused);
    show("menu-pause-icon", active && !e.player.video.paused);
    show("minimal-pregame", active && e.labAvailable);
    show("minimal-close", open);
    show(
      "minimal-jump",
      active && e.labAvailable && !open && delivery.nextStart !== undefined,
    );
    show("minimal-flip", open);
    show("minimal-next", open);
    show("minimal-previous", open);
    show("minimal-story", open && delivery.storyAvailable);
    text(
      "minimal-play-label",
      e.session.matchActive
        ? playbackLabel(e.session, e.player.video.paused)
        : "Play",
    );
    text("minimal-open-label", "Moments");
    show("moment-badge", pending > 0);
    show("minimal-status", menu.more);
    text(
      "minimal-mute-label",
      e.session.snapshot.preferences.muted ? "Unmute match" : "Mute match",
    );
    text("minimal-story-label", e.lab.cards.storyMode ? "Card" : "Story");
    text(
      "minimal-status",
      !active
        ? "Start, then palm up / controller A or X"
        : pending
          ? `${pending} new moment${pending === 1 ? "" : "s"}`
          : "Close to hide / palm up to reopen",
    );
    // Compact by default; the optional tools expand only on demand.
    const height = menu.more ? (e.labAvailable ? 0.5 : 0.45) : 0.13;
    if (height !== lastHeight) {
      dock.document.setTargetDimensions(0.36, height);
      windows.size("minimal-dock", 0.36, height);
      lastHeight = height;
    }
  }
  render();
  return render;
}
