import type { Content } from "../content/model";
import { drawDiagram, diagramPoint } from "./diagram";
import { revealedChunks } from "./tracing";
import { drawStreamLesson, streamLessons } from "../sports/practice";
export function drawContentDiagram(
  canvas: HTMLCanvasElement,
  content: Content,
  progress: number,
  armed = false,
) {
  if (content.phrases[0].action === "overtake")
    drawStreamLesson(
      canvas,
      { ...streamLessons.f1, route: content.diagrams[0].route },
      progress,
    );
  else drawDiagram(canvas, content.diagrams[0], progress, armed);
}
export function contentDiagramPoint(content: Content, x: number, y: number) {
  return content.phrases[0].action === "overtake"
    ? ([x, y] as const)
    : diagramPoint(x, y);
}
export function contentChunkCount(content: Content, progress: number) {
  if (content.phrases[0].chunks.length === 3) return revealedChunks(progress);
  if (progress >= 0.97) return content.phrases[0].chunks.length;
  return progress > 0
    ? Math.min(
        content.phrases[0].chunks.length - 1,
        Math.ceil(progress * content.phrases[0].chunks.length),
      )
    : 0;
}
