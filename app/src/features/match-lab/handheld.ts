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
) {
  ctx.font = `${size}px Atkinson, sans-serif`;
  let line = "";
  for (const word of text.split(" ")) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > 668 && line) {
      ctx.fillText(line, 50, y);
      y += size * 1.3;
      line = word;
    } else line = candidate;
  }
  ctx.fillText(line, 50, y);
}
/** Two real surfaces: wrist rotation exposes English; no camera-facing billboard. */
export function attachHandheldCard(
  world: World,
  e: Experience,
  windows: SpatialWindows,
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
      e.lab.open && e.lab.view === "cards" && e.session.matchActive;
    if (!card.visible) return;
    const key = `${cards.index}/${cards.storyMode}`;
    if (key !== contentKey) {
      // Content navigation must not fight a hand that is already holding the card.
      cards.flipped = knownFlip;
      for (let i = 0; i < 2; i++) {
        const f = faces[i],
          ctx = f.context;
        ctx.fillStyle = i === 0 ? "#fff4ed" : "#17453e";
        ctx.fillRect(0, 0, 768, 1076);
        ctx.fillStyle = i === 0 ? "#341e2c" : "#fff4ed";
        ctx.font = "bold 30px sans-serif";
        ctx.fillText(
          i === 0 ? "ARENAVOCA / ESPAÑOL" : "ARENAVOCA / ENGLISH",
          50,
          62,
        );
        ctx.font = "24px sans-serif";
        ctx.fillText(`MATCH MOMENT ${cards.index + 1} / 6`, 50, 108);
        paragraph(
          ctx,
          i === 0 ? cards.spanish : cards.english,
          i === 0 ? 605 : 255,
          cards.storyMode ? 38 : 46,
        );
        ctx.font = "25px sans-serif";
        ctx.fillText(
          i === 0
            ? "Turn me over for the translation"
            : "Turn back and say it in Spanish",
          50,
          991,
        );
        ctx.font = "22px sans-serif";
        ctx.fillText(`Match clock ${cards.card.evidence.matchClock}`, 50, 1032);
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
      : AssetManager.getTexture(`lab-art-${cards.card.id}`);
    const material = art.material as MeshBasicMaterial;
    if (material.map !== map) {
      material.map = map;
      material.needsUpdate = true;
    }
  };
}
