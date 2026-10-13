import SwiftUI
import AVKit
import ArenaVocaShared

struct MatchReplayView: View {
    let evidence: MatchEvidence
    let artwork: String
    @Binding var active: String?
    private var replay: MatchReplay { MatchReplay.companion.from(evidence: evidence) }
    private var url: URL? { Bundle.main.url(forResource: replay.fileName, withExtension: "mp4") }
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if active == replay.fileName, let url {
                LocalReplayPlayer(url: url).id(replay.fileName)
            } else {
                SportArtwork(name: artwork)
            }
            Text("Actual match · \(replay.durationSeconds)s · Recording \(replay.recordingRange)").font(.caption.bold())
            if url == nil {
                Text("Replay isn't included in this build. You can still learn with the illustration.").font(.caption)
            } else {
                Button(active == replay.fileName ? "Show illustration" : "Watch match moment") {
                    active = active == replay.fileName ? nil : replay.fileName
                }.frame(minHeight: 44).accessibilityIdentifier("watch-\(replay.fileName)")
            }
        }
    }
}

private final class ReplayPlayback: ObservableObject {
    let player: AVPlayer
    @Published var playing = false
    @Published var failed = false
    @Published var ended = false
    private var rateObserver: NSKeyValueObservation?
    private var errorObserver: NSKeyValueObservation?
    init(url: URL) {
        player = AVPlayer(url: url)
        rateObserver = player.observe(\.rate, options: [.new]) { [weak self] player, _ in
            DispatchQueue.main.async { self?.playing = player.rate > 0 }
        }
        errorObserver = player.currentItem?.observe(\.status, options: [.new]) { [weak self] item, _ in
            DispatchQueue.main.async { self?.failed = item.status == .failed }
        }
    }
    func play() {
        if ended { player.seek(to: .zero); ended = false }
        player.play()
    }
    deinit { player.pause() }
}

private struct LocalReplayPlayer: View {
    @Environment(\.scenePhase) private var scenePhase
    @StateObject private var playback: ReplayPlayback
    init(url: URL) { _playback = StateObject(wrappedValue: ReplayPlayback(url: url)) }
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            VideoPlayer(player: playback.player).aspectRatio(16 / 9, contentMode: .fit)
                .accessibilityIdentifier("match-replay-video")
            if playback.failed {
                Text("Replay couldn't play. Show the illustration and try again.").font(.caption)
            } else {
                Text(playback.ended ? "Replay finished" : playback.playing ? "Playing match moment" : "Replay paused").font(.caption)
                    .accessibilityIdentifier("replay-status")
                Button(playback.playing ? "Pause replay" : playback.ended ? "Replay again" : "Play replay") {
                    if playback.playing { playback.player.pause() } else { playback.play() }
                }.buttonStyle(.bordered).frame(minHeight: 44)
            }
        }
        .onAppear { if scenePhase == .active { playback.play() } }
        .onDisappear { playback.player.pause() }
        .onChange(of: scenePhase) { _, phase in if phase != .active { playback.player.pause() } }
        .onReceive(NotificationCenter.default.publisher(for: .AVPlayerItemDidPlayToEndTime, object: playback.player.currentItem)) { _ in
            playback.ended = true
        }
    }
}
