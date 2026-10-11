import type { Diagram, Point } from "../content/model";
import { routePoint } from "./tracing";
/** Original flat artwork, shared by desktop and the in-world CanvasTexture. */
export function drawDiagram(
  canvas: HTMLCanvasElement,
  diagram: Diagram,
  progress: number,
  armed = false,
) {
  const ctx = canvas.getContext("2d")!;
  const w = canvas.width,
    h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#19432f";
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 ? "#204e36" : "#24553b";
    ctx.fillRect(w * (0.04 + i * 0.115), h * 0.08, w * 0.115, h * 0.84);
  }
  ctx.strokeStyle = "#91bba0";
  ctx.lineWidth = 2;
  ctx.strokeRect(w * 0.04, h * 0.08, w * 0.92, h * 0.84);
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.08);
  ctx.lineTo(w * 0.5, h * 0.92);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.5, w * 0.12, h * 0.18, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeRect(w * 0.04, h * 0.31, w * 0.12, h * 0.38);
  ctx.strokeRect(w * 0.84, h * 0.31, w * 0.12, h * 0.38);
  const toPixels = (p: Point): Point => [
    w * (0.04 + 0.92 * p[0]),
    h * (0.08 + 0.84 * p[1]),
  ];
  ctx.setLineDash([9, 7]);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#eff5eb";
  ctx.beginPath();
  diagram.route.forEach((p, i) => {
    const [x, y] = toPixels(p);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  ctx.stroke();
  ctx.setLineDash([]);
  const [ex, ey] = toPixels(diagram.route[diagram.route.length - 1]),
    [px, py] = toPixels(diagram.route[diagram.route.length - 2]);
  const angle = Math.atan2(ey - py, ex - px);
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - 17 * Math.cos(angle - 0.5), ey - 17 * Math.sin(angle - 0.5));
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - 17 * Math.cos(angle + 0.5), ey - 17 * Math.sin(angle + 0.5));
  ctx.stroke();
  for (const p of diagram.players) {
    const [x, y] = toPixels(p.position);
    ctx.fillStyle = p.team === "blue" ? "#4791f1" : "#e5a642";
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0e251a";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#f5f8ef";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(p.id.slice(1), x, y + 4);
  }
  const [x, y] = toPixels(routePoint(diagram.route, progress));
  if (armed) {
    ctx.strokeStyle = "#9ee7ba";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "#fffcef";
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#173222";
  ctx.lineWidth = 2;
  ctx.stroke();
}
/** Match the inset pitch coordinates to the rendered diagram, including margins. */
export function diagramPoint(x: number, y: number): Point {
  return [(x - 0.04) / 0.92, (y - 0.08) / 0.84];
}
