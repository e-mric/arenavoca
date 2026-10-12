import fs from "node:fs";
const play = JSON.parse(fs.readFileSync("content-source/play.json", "utf8"));
const content = {
  version: play.version,
  duration: play.duration,
  video: "media/match.mp4",
  phrases: [
    {
      id: "pass",
      spanish: "El jugador pasa el balón.",
      english: "The player passes the ball.",
      chunks: ["El jugador", "pasa", "el balón"],
      pronunciation: "audio/pass-es.mp3",
      action: "pass",
      reviewStatus: "pending",
    },
  ],
  events: [
    {
      id: "pass-01",
      phraseId: "pass",
      diagramId: "pass-diagram",
      actionStart: play.pass.start,
      actionEnd: play.pass.end,
      promptStart: play.pass.replayStart,
      promptEnd: 20,
    },
  ],
  diagrams: [
    {
      id: "pass-diagram",
      duration: play.pass.replayEnd - play.pass.replayStart,
      route: [play.pass.from, play.pass.to],
      players: play.players.slice(0, 3),
    },
  ],
  captions: [
    {
      start: 6,
      end: 9.85,
      text: "A lovely pass to his teammate. Blue keep possession.",
      spanish:
        "Un buen pase a su compañero. El equipo azul mantiene la posesión.",
    },
    {
      start: 12,
      end: 15,
      text: "Replay · The pass between the blue teammates.",
      spanish: "Repetición · El pase entre los compañeros del equipo azul.",
    },
  ],
};
fs.writeFileSync(
  "public/content/match.json",
  JSON.stringify(content, null, 2) + "\n",
);
