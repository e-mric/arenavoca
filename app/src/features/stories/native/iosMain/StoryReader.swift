import SwiftUI
import ArenaVocaShared

struct StoryPresentation: Identifiable {
    let story: SportStory
    var id: String { story.id }
}

struct StoryEntry: View {
    let sport: String
    let onOpen: (SportStory) -> Void
    var body: some View {
        if let story = StoryCatalog.shared.forSport(sport: sport) {
            VStack(alignment: .leading, spacing: 10) {
                Text("Stories between matches").font(.subheadline.bold()).foregroundStyle(playmakerBlue)
                Text(story.title).font(.title2.bold())
                Text("Fictional practice · 3 scenes\nRead, remember, then make it your own.").font(.callout)
                Button("Explore a story") { onOpen(story) }.buttonStyle(.borderedProminent).buttonBorderShape(.capsule).frame(minHeight: 48)
            }.padding(20).frame(maxWidth: .infinity, alignment: .leading)
                .background(.white, in: RoundedRectangle(cornerRadius: 24))
                .overlay(RoundedRectangle(cornerRadius: 24).stroke(playmakerLavender, lineWidth: 1))
        }
    }
}

struct StoryReader: View {
    @Environment(\.dismiss) private var dismiss
    @State private var lesson: StoryLesson
    @State private var revision = 0
    @State private var activeReplay: String?
    @State private var translated = false
    @State private var selected = ""
    @State private var answer = ""
    init(story: SportStory) { _lesson = State(initialValue: StoryLesson(story: story)) }
    private var story: SportStory { lesson.story }
    private func update(_ action: () -> Void) { action(); revision += 1 }
    private func advance() { activeReplay = nil; update { _ = lesson.advance() }; translated = false; selected = ""; answer = "" }

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    Button("Close story") { dismiss() }.frame(minHeight: 44).id("story-top")
                    Text(story.title).font(.system(.largeTitle, design: .rounded, weight: .heavy))
                    Text(story.provenanceLabel).font(.caption.bold()).foregroundStyle(playmakerBlue)
                    if let source = story.sourceTitle { Text(source).font(.caption) }
                    content
                    Text("Prototype Spanish · awaiting fluent review").font(.caption2).foregroundStyle(.secondary)
                }.padding(24).frame(maxWidth: 620)
            }
            .onChange(of: lesson.stage) { _, _ in proxy.scrollTo("story-top", anchor: .top) }
            .onChange(of: lesson.panelIndex) { _, _ in proxy.scrollTo("story-top", anchor: .top) }
        }
        .frame(maxWidth: .infinity).background(playmakerCream).foregroundStyle(playmakerInk)
        .preferredColorScheme(.light).tint(playmakerBlue)
        .accessibilityIdentifier("story-reader-\(revision)")
    }

    @ViewBuilder private var content: some View {
        switch lesson.stage {
        case .read:
            Text("Read · Scene \(lesson.panelIndex + 1) of 3").font(.subheadline.bold())
            if let evidence = lesson.panel.evidence {
                MatchReplayView(evidence: evidence, artwork: lesson.panel.artwork, active: $activeReplay)
            } else { SportArtwork(name: lesson.panel.artwork) }
            Text(lesson.panel.title).font(.headline)
            Text(lesson.panel.spanish).font(.title2)
            if let evidence = lesson.panel.evidence { MatchEvidenceDetails(evidence: evidence) }
            Button(translated ? "Hide English" : "Show English") { translated.toggle() }.frame(minHeight: 44)
            if translated { Text(lesson.panel.english) }
            if lesson.panelIndex == 0 { Text("Notice these phrases:\n\(story.targets.joined(separator: " · "))").font(.callout) }
            action(lesson.panelIndex == 2 ? "Try the activities" : "Next scene") { advance() }
            if lesson.panelIndex > 0 {
                Button("Previous scene") { activeReplay = nil; update { _ = lesson.previousPanel() }; translated = false }.frame(minHeight: 44)
            }
        case .recognise:
            Text("1 · Recognise").font(.headline)
            Text(story.recognitionPrompt).font(.title2.bold())
            Text(story.recognitionHelp)
            ForEach(story.choices, id: \.self) { choice in
                Button { selected = choice } label: {
                    Text(selected == choice ? "\(choice) · Selected" : choice).frame(maxWidth: .infinity, minHeight: 44)
                }.buttonStyle(.bordered).disabled(lesson.recognitionChecked)
                    .accessibilityAddTraits(selected == choice ? .isSelected : [])
            }
            if !lesson.recognitionChecked {
                action("Check answer", enabled: !selected.isEmpty) { update { _ = lesson.checkRecognition(choice: selected) } }
            } else {
                Text(lesson.recognitionCorrect ? "You've got it." : "Let's look again.").font(.headline)
                Text("\(story.recognitionAnswer)\n\(story.recognitionExplanation)")
                action("Try recalling") { advance() }
            }
        case .recall:
            Text("2 · Recall").font(.headline)
            Text("Remember the missing word").font(.title2.bold())
            Text(story.recallPrompt).font(.title2)
            TextField("Missing word", text: $answer).textFieldStyle(.roundedBorder).disabled(lesson.recallChecked)
                .autocorrectionDisabled().textInputAutocapitalization(.never)
                .onChange(of: answer) { _, value in answer = String(value.prefix(80)) }
            if lesson.hintUsed { Text(story.recallHint) }
            if !lesson.recallChecked {
                if !lesson.hintUsed { Button("Give me a hint") { update { _ = lesson.showHint() } }.frame(minHeight: 44) }
                action("Check word", enabled: !answer.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty) { update { _ = lesson.checkRecall(answer: answer) } }
            } else {
                Text(lesson.recallSummary).font(.headline)
                Text(story.recallPrompt.replacingOccurrences(of: "___", with: story.recallAnswer))
                action("Make it your own") { advance() }
            }
        case .use:
            Text("3 · Use").font(.headline)
            Text(story.usePrompt).font(.title2.bold())
            Text(story.useHelp)
            TextField("Your Spanish answer", text: $answer, axis: .vertical).lineLimit(2...5)
                .accessibilityIdentifier("story-response")
                .textFieldStyle(.roundedBorder).disabled(lesson.modelRevealed).autocorrectionDisabled()
                .onChange(of: answer) { _, value in answer = String(value.prefix(280)) }
            Text("Your own answer can be different. This is self-practice, with no automatic grading.").font(.caption)
            if !lesson.modelRevealed {
                action("Compare with an example", enabled: !answer.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty) { update { _ = lesson.revealModel(answer: answer) } }
            } else {
                Text("One possible answer").font(.subheadline.bold()).foregroundStyle(playmakerBlue)
                Text(story.modelAnswer).font(.title2)
                Text(story.transfer)
                Text("How do you feel about your answer?")
                ForEach(["Ready to try elsewhere", "Practise this again"], id: \.self) { label in
                    Button { update { _ = lesson.reflect(needsPractice: label == "Practise this again") } } label: {
                        Text(lesson.reflection == label ? "✓ \(label)" : label).frame(minHeight: 44)
                    }.buttonStyle(.bordered).accessibilityAddTraits(lesson.reflection == label ? .isSelected : [])
                }
                action("Finish story", enabled: lesson.canContinue) { advance() }
            }
        case .summary:
            Text("A story to remember").font(.title2.bold())
            Text(lesson.recognitionSummary)
            Text(lesson.recallSummary)
            Text("Use · wrote your own answer\n\(lesson.response)")
            Text("Your reflection · \(lesson.reflection)")
            Text("This is a practice attempt, not a language level. This story attempt is not saved.").font(.caption)
            action("Read and practise again") { lesson = StoryLesson(story: story); translated = false; selected = ""; answer = "" }
            Button("Done") { dismiss() }.frame(minHeight: 44)
        default: EmptyView()
        }
    }
    private func action(_ title: String, enabled: Bool = true, perform: @escaping () -> Void) -> some View {
        Button(action: perform) { Text(title).font(.headline).frame(maxWidth: .infinity, minHeight: 54) }
            .buttonStyle(.borderedProminent).foregroundStyle(.white).buttonBorderShape(.capsule).disabled(!enabled)
    }
}
