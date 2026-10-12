import type { Sport } from "../theme/team-theme";
import type { Point } from "../content/model";
import { routePoint } from "../learning/tracing";
export interface StreamLesson {
  id: string;
  sport: Sport;
  name: string;
  spanish: string;
  english: string;
  chunks: string[];
  audio: string;
  route: Point[];
}
export const streamLessons: Record<Sport, StreamLesson> = {
  football: {
    id: "pass",
    sport: "football",
    name: "A pass",
    spanish: "El jugador pasa el balón.",
    english: "The player passes the ball.",
    chunks: ["El jugador", "pasa", "el balón"],
    audio: "audio/pass-es.mp3",
    route: [
      [0.25, 0.75],
      [0.73, 0.28],
    ],
  },
  f1: {
    id: "overtake",
    sport: "f1",
    name: "An overtake",
    spanish: "El piloto adelanta.",
    english: "The driver overtakes.",
    chunks: ["El piloto", "adelanta"],
    audio: "audio/overtake-es.mp3",
    route: [
      [0.25, 0.75],
      [0.73, 0.28],
    ],
  },
};
export function drawStreamLesson(
  canvas: HTMLCanvasElement,
  lesson: StreamLesson,
  progress: number,
) {
  const c = canvas.getContext("2d")!;
  const w = canvas.width,
    h = canvas.height;
  c.clearRect(0, 0, w, h);
  c.fillStyle = lesson.sport === "football" ? "#244c35" : "#26313a";
  c.fillRect(0, 0, w, h);
  c.strokeStyle = "#97b29d";
  c.lineWidth = 2;
  if (lesson.sport === "football") {
    c.strokeRect(w * 0.06, h * 0.08, w * 0.88, h * 0.84);
    c.beginPath();
    c.moveTo(w * 0.5, h * 0.08);
    c.lineTo(w * 0.5, h * 0.92);
    c.stroke();
    c.beginPath();
    c.arc(w * 0.5, h * 0.5, h * 0.17, 0, Math.PI * 2);
    c.stroke();
  } else {
    c.lineWidth = h * 0.5;
    c.strokeStyle = "#667782";
    c.beginPath();
    c.moveTo(w * 0.12, h);
    c.bezierCurveTo(w * 0.4, h * 0.7, w * 0.3, h * 0.1, w * 0.96, h * 0.18);
    c.stroke();
    c.lineWidth = h * 0.42;
    c.strokeStyle = "#34434d";
    c.stroke();
    c.lineWidth = 2;
    c.strokeStyle = "#9fb1bb";
    c.setLineDash([10, 12]);
    c.stroke();
    c.setLineDash([]);
  }
  const a = lesson.route[0],
    b = lesson.route[lesson.route.length - 1];
  c.strokeStyle = "#f3ead3";
  c.lineWidth = 4;
  c.setLineDash([12, 10]);
  c.beginPath();
  c.moveTo(a[0] * w, a[1] * h);
  c.lineTo(b[0] * w, b[1] * h);
  c.stroke();
  c.setLineDash([]);
  const marker = (x: number, y: number, color: string, label: string) => {
    c.fillStyle = color;
    c.strokeStyle = "#142028";
    c.lineWidth = 3;
    if (lesson.sport === "f1") {
      c.fillRect(x * w - 22, y * h - 12, 44, 24);
      c.strokeRect(x * w - 22, y * h - 12, 44, 24);
    } else {
      c.beginPath();
      c.arc(x * w, y * h, 17, 0, Math.PI * 2);
      c.fill();
      c.stroke();
    }
    c.fillStyle = "#eef2f4";
    c.font = "20px sans-serif";
    c.fillText(label, x * w - 6, y * h - 25);
  };
  const p = routePoint(lesson.route, progress);
  if (lesson.sport === "f1") {
    const other = routePoint(lesson.route, 0.38 + progress * 0.25);
    marker(other[0] + 0.035, other[1] + 0.05, "#e6b55f", "B");
    marker(p[0], p[1], "#66a7ef", "A");
  } else {
    marker(b[0], b[1], "#66a7ef", "B");
    marker(0.6, 0.62, "#e6b55f", "C");
    marker(a[0], a[1], "#66a7ef", "A");
    c.beginPath();
    c.arc(p[0] * w, p[1] * h, 8, 0, Math.PI * 2);
    c.fillStyle = "#fff6dd";
    c.fill();
  }
}
