import SwiftUI
import ArenaVocaShared

struct MatchPackEntry: View {
    let onOpen: () -> Void
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("From the actual match").font(.subheadline.bold()).foregroundStyle(playmakerBlue)
            Text(MatchCatalog.shared.pack.source.title).font(.title2.bold())
            Text("6 cards · 2 stories\nBuilt from commentary and on-screen action.").font(.callout)
            Button("Explore match moments", action: onOpen).buttonStyle(.borderedProminent).buttonBorderShape(.capsule).frame(minHeight: 48)
        }.padding(20).frame(maxWidth: .infinity, alignment: .leading)
            .background(.white, in: RoundedRectangle(cornerRadius: 24))
            .overlay(RoundedRectangle(cornerRadius: 24).stroke(playmakerLavender, lineWidth: 1))
    }
}

struct MatchEvidenceDetails: View {
    let evidence: MatchEvidence
    @State private var expanded = false
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Recording \(evidence.recordingRange) · Match \(evidence.matchClock)").font(.caption)
            Button(expanded ? "Hide evidence" : "Why this card?") { expanded.toggle() }.frame(minHeight: 44)
            if expanded {
                Text("Commentary · \(evidence.commentarySummary)").font(.callout)
                Text("On screen · \(evidence.visualObservation)").font(.callout)
                Text("\(evidence.reviewStatus)\nIllustration, not a broadcast frame.").font(.caption)
            }
        }.onChange(of: evidence.startSeconds) { _, _ in expanded = false }
    }
}

struct MatchMomentsReader: View {
    @Environment(\.dismiss) private var dismiss
    private let pack = MatchCatalog.shared.pack
    @State private var revealed = false
    @State private var selected = MatchCatalog.shared.pack.stories[0].id
    @State private var lesson: StoryPresentation?
    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    Button("Close match moments") { dismiss() }.frame(minHeight: 44).id("match-top")
                    Text(pack.source.title).font(.system(.largeTitle, design: .rounded, weight: .heavy))
                    Text("From commentary + on-screen action").font(.subheadline.bold()).foregroundStyle(playmakerBlue)
                    if !revealed {
                        SportArtwork(name: "playmaker_football")
                        Text("Ready to revisit these moments?").font(.title2.bold())
                        Text("These cards reveal action from recording 10:40–13:42, including a scoring moment. We don't know how far you've watched.")
                        action("Reveal match moments") { revealed = true }
                    } else {
                        Text("AI-prepared selection · 6 cards · 2 stories").font(.caption)
                        ForEach(pack.stories, id: \.id) { story in
                            Button { selected = story.id } label: {
                                Text(selected == story.id ? "✓ \(story.title)" : story.title).frame(minHeight: 44)
                            }.buttonStyle(.bordered).accessibilityIdentifier(story.id)
                                .accessibilityAddTraits(selected == story.id ? .isSelected : [])
                        }
                        action("Practise this moment") { if let story = pack.lesson(storyId: selected) { lesson = StoryPresentation(story: story) } }
                        if let story = pack.stories.first(where: { $0.id == selected }) {
                            ForEach(story.cardIds, id: \.self) { id in
                                if let card = pack.cards.first(where: { $0.id == id }) {
                                    VStack(alignment: .leading, spacing: 10) {
                                        SportArtwork(name: card.artwork)
                                        Text(card.spanish).font(.title2.bold())
                                        Text(card.english)
                                        Text(card.hint).font(.caption)
                                        MatchEvidenceDetails(evidence: card.evidence)
                                    }.padding(16).frame(maxWidth: .infinity, alignment: .leading)
                                        .background(.white, in: RoundedRectangle(cornerRadius: 24))
                                        .overlay(RoundedRectangle(cornerRadius: 24).stroke(playmakerLavender, lineWidth: 1))
                                }
                            }
                        }
                        Text("Prepared from selected passages of your recording. This is not live match detection. Practice attempts are not saved.").font(.caption)
                    }
                    Text("Prototype Spanish · awaiting fluent review").font(.caption2)
                }.padding(24).frame(maxWidth: 620)
            }
            .onChange(of: selected) { _, _ in proxy.scrollTo("match-top", anchor: .top) }
            .onChange(of: revealed) { _, _ in proxy.scrollTo("match-top", anchor: .top) }
        }.frame(maxWidth: .infinity).background(playmakerCream).foregroundStyle(playmakerInk)
            .preferredColorScheme(.light).tint(playmakerBlue)
            .fullScreenCover(item: $lesson) { StoryReader(story: $0.story) }
    }
    private func action(_ title: String, perform: @escaping () -> Void) -> some View {
        Button(action: perform) { Text(title).font(.headline).frame(maxWidth: .infinity, minHeight: 54) }
            .buttonStyle(.borderedProminent).foregroundStyle(.white).buttonBorderShape(.capsule)
    }
}
