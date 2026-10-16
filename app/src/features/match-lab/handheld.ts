import {
  AssetManager,
  CanvasTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  SRGBColorSpace,
  Vector3,
  VideoTexture,
  type World,
} from "@iwsdk/core";
import type { Experience } from "../session/experience";
import type { SpatialWindows } from "../spatial-windows/windows";
import { cardBackFacing } from "../spatial-windows/math";
function faceCanvas() {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 1076;
  const texture = new CanvasTexture(c);
  texture.colorSpace = SRGBColorSpace;
  return { canvas: c, context: c.getContext("2d")!, texture };
}
function paragraph(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  size: number,
  serif = false,
  bottom = Infinity,
) {
  let lines: string[] = [];
  const width = serif ? 620 : 668;
  do {
    ctx.font = serif ? `700 ${size}px ArenaCard, Georgia, serif` : `${size}px Atkinson, sans-serif`;
    lines = [];
    let line = "";
    for (const word of text.split(" ")) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width > width && line) { lines.push(line); line = word; }
      else line = candidate;
    }
    lines.push(line);
    if (y + (lines.length - 1) * size * 1.25 <= bottom || size <= 28) break;
    size -= 2;
  } while (true);
  for (const line of lines) { ctx.fillText(line, 50, y); y += size * 1.25; }

}
/** Two real surfaces: wrist rotation exposes English; no camera-facing billboard. */
export function attachHandheldCard(
  world: World,
  e: Experience,
  windows: SpatialWindows,
  minimal = false,
) {
  const card = world.requireSceneObject<Group>("window-moment-card");
  const front = card.getObjectByName("Spanish face") as Mesh;
  const back = card.getObjectByName("English face") as Mesh;
  const art = card.getObjectByName("Moment illustration or replay") as Mesh;
  const faces = [faceCanvas(), faceCanvas()];
  front.material = new MeshBasicMaterial({ map: faces[0].texture });
  back.material = new MeshBasicMaterial({ map: faces[1].texture });
  art.material = (art.material as MeshBasicMaterial).clone();
  const visibility = new Group();
  visibility.visible = false;
  windows.bind("moment-card", visibility, 0.52, 0.72, true);
  const head = new Vector3(),
    center = new Vector3(),
    normal = new Vector3(),
    q = new Quaternion();
  let contentKey = "",
    knownFlip = false,
    video: VideoTexture | undefined;
  const turn = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI);
  const materials = [
    front.material,
    back.material,
    art.material,
  ] as MeshBasicMaterial[];
  world.addCleanup(() => {
    faces.forEach((f) => f.texture.dispose());
    materials.forEach((m) => m.dispose());
    video?.dispose();
  });
  return () => {
    const cards = e.lab.cards;
    visibility.visible = card.visible =
      world.renderer.xr.isPresenting &&
      e.lab.open &&
      !e.lab.tabletop.active &&
      e.lab.view === "cards" &&
      e.session.matchActive;
    if (!card.visible) return;
    const key = `${cards.index}/${cards.storyMode}`;
    if (key !== contentKey) {
      // Content navigation must not fight a hand that is already holding the card.
      cards.flipped = knownFlip;
      for (let i = 0; i < 2; i++) {
        const f = faces[i],
          ctx = f.context;
        ctx.fillStyle = minimal
          ? "#fffaf2"
          : i === 0
            ? "#fff4ed"
            : "#17453e";
        ctx.fillRect(0, 0, 768, 1076);
        ctx.fillStyle = minimal ? "#142352" : i === 0 ? "#341e2c" : "#fff4ed";
        const clock = (time: number) =>
          `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, "0")}`;
        ctx.font = "bold 26px Atkinson, sans-serif";
        ctx.fillStyle = minimal ? "#596487" : ctx.fillStyle;
        ctx.fillText(
          cards.card.draft ? "AI DRAFT · REVIEW NEEDED" :
          cards.card.context ? "BEFORE KICK-OFF · 28 OCT 2018" :
          i === 0 ? `MATCH MOMENT · ${clock(cards.card.evidence.endSeconds)}` : "ENGLISH · TRANSLATION",
          50, i === 0 ? 550 : 110,
        );
        ctx.fillStyle = minimal ? "#142352" : ctx.fillStyle;
        paragraph(ctx, i === 0 ? cards.spanish : cards.english,
          i === 0 ? 630 : 220, cards.storyMode ? 38 : minimal ? 56 : 42,
          minimal, i === 0 ? 770 : 440);
        if (i === 1) paragraph(ctx, cards.card.hint, 520, 30, false, 700);
        // Source details are on the reverse; the front stays focused on the sentence.
        if (i === 1) {
          ctx.font = "22px Atkinson, sans-serif";
          ctx.fillText(cards.card.context?.source ??
            `Recording ${clock(cards.card.evidence.startSeconds)}–${clock(cards.card.evidence.endSeconds)}`,
            50, 1025);
        }
        f.texture.needsUpdate = true;
      }
      contentKey = key;
    }
    // Flip button remains an accessible fallback to physically rotating the card.
    if (cards.flipped !== knownFlip) {
      card.quaternion.multiply(turn);
      knownFlip = cards.flipped;
    }
    card.getWorldPosition(center);
    world.player.head.getWorldPosition(head);
    card.getWorldQuaternion(q);
    normal.set(0, 0, 1).applyQuaternion(q);
    knownFlip = cardBackFacing(
      normal.dot(head.sub(center).normalize()),
      knownFlip,
    );
    cards.flipped = knownFlip;
    if (e.labReplay && !video) {
      video = new VideoTexture(e.labReplay.video);
      video.colorSpace = SRGBColorSpace;
    }
    const map = e.labReplay?.visible
      ? video!
      : AssetManager.getTexture(`lab-art-${cards.artworkId}`);
    const material = art.material as MeshBasicMaterial;
    if (material.map !== map) {
      material.map = map;
      material.needsUpdate = true;
    }
  };
}
