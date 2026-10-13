import SwiftUI
import ArenaVocaShared
import UniformTypeIdentifiers

@main
struct ArenaVocaApp: App {
    var body: some Scene { WindowGroup { RecapView() } }
}

final class PracticeModel: ObservableObject {
    let library = RecapLibrary(initialJson: UserDefaults.standard.string(forKey: "arenavoca.recap") ?? "")
    @Published var session: WatchedSession?
    @Published var quiz: Quiz?
    func update(save: Bool = false) {
        if save { UserDefaults.standard.set(library.exportProgress(), forKey: "arenavoca.recap") }
        objectWillChange.send()
    }
}

struct RecapView: View {
    @StateObject private var model = PracticeModel()
    @State private var sport = "football"
    @State private var storyPresentation: StoryPresentation?
    @State private var matchMoments = false
    @State private var title = ""
    @State private var importing = false
    @State private var importNotice = ""
    @State private var selectedAnswer: String?
    @State private var textAnswers = false
    @Environment(\.dynamicTypeSize) private var typeSize
    private var accent: Color { playmakerBlue }
    var body: some View {
      ScrollViewReader { proxy in
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                Text("ArenaVoca").id("recap-top").font(.title2.weight(.black)).foregroundStyle(accent)
                Text(model.quiz != nil ? "Match recap" : model.session != nil ? "Your moments" : "Make your\nSpanish move.")
                    .font(.system(.largeTitle, design: .rounded, weight: .heavy))
                if !model.library.warning.isEmpty { Text(model.library.warning).foregroundStyle(.orange) }
                if !importNotice.isEmpty { Text(importNotice).font(.callout).accessibilityIdentifier("importNotice") }
                if let quiz = model.quiz { quizContent(quiz) }
                else if let session = model.session { collection(session) }
                else { home }
                Text("Prototype Spanish · awaiting fluent review").font(.caption2).foregroundStyle(.secondary)
            }.padding(24).frame(maxWidth: 620)
        }
        .onChange(of: model.session?.id) { _, _ in proxy.scrollTo("recap-top", anchor: .top) }
        .onChange(of: model.quiz?.question?.phraseId) { _, _ in proxy.scrollTo("recap-top", anchor: .top) }
      }
        .frame(maxWidth: .infinity)
        .background(playmakerCream).foregroundStyle(playmakerInk)
        .preferredColorScheme(.light).tint(accent)
        .fullScreenCover(item: $storyPresentation) { StoryReader(story: $0.story) }
        .fullScreenCover(isPresented: $matchMoments) { MatchMomentsReader() }
        .fileImporter(isPresented: $importing, allowedContentTypes: [.json, .plainText], allowsMultipleSelection: false) { result in
            do {
                guard let url = try result.get().first else { return }
                let access = url.startAccessingSecurityScopedResource()
                defer { if access { url.stopAccessingSecurityScopedResource() } }
                let file = try FileHandle(forReadingFrom: url)
                defer { try? file.close() }
                let data = try file.read(upToCount: 32_769) ?? Data()
                guard data.count <= 32_768, let raw = String(data: data, encoding: .utf8) else {
                    importNotice = "Could not read this recap file. Choose an ArenaVoca export smaller than 32 KB."
                    return
                }
                let imported = model.library.importRecap(raw: raw)
                importNotice = imported.message
                if let session = imported.session { model.session = session; model.update(save: true) }
            } catch {
                importNotice = "Could not open this recap file. Your saved progress is unchanged. Try choosing the file again."
            }
        }
    }
    private var home: some View {
        VStack(alignment: .leading, spacing: 20) {
            VStack(alignment: .leading, spacing: 16) {
                Picker("Sport", selection: $sport) {
                    Text("Football").tag("football"); Text("F1").tag("f1")
                }.pickerStyle(.segmented)
                SportArtwork(name: "playmaker_\(sport)")
                Text(sport == "f1" ? "Race recap" : "Match recap").font(.title2.bold())
                Text("Example session · 3 phrases · No timer").font(.caption)
                primary("Try an example recap") {
                    model.session = model.library.loadExample(sport: sport); model.update(save: true)
                }
            }.padding(20).background(playmakerLavender.opacity(0.5), in: RoundedRectangle(cornerRadius: 24))
            if sport == "football" { MatchPackEntry { matchMoments = true } }
            StoryEntry(sport: sport) { storyPresentation = StoryPresentation(story: $0) }
            Text("Your sessions").font(.title2.bold())
            Button("Import saved phrases") { importing = true }.padding(.vertical, 8)
            if model.library.sessions().isEmpty { Text("Your collection starts with one match.").foregroundStyle(.secondary) }
            ForEach(model.library.sessions(), id: \.id) { session in
                Button { model.session = session } label: {
                    HStack {
                        SportArtwork(name: "playmaker_\(session.sport)").frame(width: 88)
                        VStack(alignment: .leading, spacing: 6) {
                            Text(session.title).font(.headline)
                            Text("\(model.library.savedPhraseIds(sessionId: session.id).count) saved phrases\(session.example ? " · Example" : "")").font(.caption)
                        }
                        Spacer(); Image(systemName: "chevron.right")
                    }.padding(18).frame(maxWidth: .infinity).background(playmakerLavender.opacity(0.35), in: RoundedRectangle(cornerRadius: 18))
                }.buttonStyle(.plain)
            }
            TextField("Match or race you watched", text: $title).textFieldStyle(.roundedBorder)
                .onChange(of: title) { _, value in title = String(value.prefix(100)) }
            primary("Add my session", enabled: !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty) {
                model.session = model.library.createSession(title: title, sport: sport); title = ""; model.update(save: true)
            }
            Text("Export saved phrases from the viewing app's browser phrase library, move the recap file to this phone, then import it here. Progress stays on this device; account sync is coming later.").font(.caption).foregroundStyle(.secondary)
        }
    }
    private func collection(_ session: WatchedSession) -> some View {
        let saved = model.library.savedPhraseIds(sessionId: session.id)
        return VStack(alignment: .leading, spacing: 18) {
            Text(session.title).font(.title2)
            Text(session.example ? "Example session · sample vocabulary" : session.imported ? "Imported from your viewing session · manually saved phrases" : "Manually selected vocabulary from your session").font(.caption).foregroundStyle(.secondary)
            primary("Start recap · \(saved.count) questions", enabled: !saved.isEmpty) { selectedAnswer = nil; model.quiz = model.library.startQuiz(sessionId: session.id) }
            if saved.isEmpty { Text("Save a phrase to start your recap.") }
            StoryEntry(sport: session.sport) { storyPresentation = StoryPresentation(story: $0) }
            Text("\(saved.count) phrases saved · Spanish through sport").font(.subheadline.weight(.semibold)).foregroundStyle(accent)
            LazyVGrid(columns: typeSize.isAccessibilitySize ? [GridItem(.flexible())] : [GridItem(.adaptive(minimum: 150), spacing: 12, alignment: .top)], alignment: .leading, spacing: 16) {
                ForEach(model.library.phrases(sport: session.sport), id: \.id) { phrase in
                    PhraseCard(phrase: phrase, saved: saved.contains(phrase.id)) {
                        if saved.contains(phrase.id) { model.library.remove(sessionId: session.id, phraseId: phrase.id) }
                        else { _ = model.library.save(sessionId: session.id, phraseId: phrase.id) }
                        model.update(save: true)
                    }
                }
            }
            Button("All sessions") { model.session = nil }.padding(.vertical, 8)
        }
    }
    @ViewBuilder private func quizContent(_ quiz: Quiz) -> some View {
        if quiz.complete {
            Text("\(quiz.correct) / \(quiz.total)").font(.system(size: 72, weight: .bold, design: .rounded)).foregroundStyle(accent)
            Text("A little more Spanish, from a sport you know.").font(.title2)
            Text("This is an attempt score, not a language level.").font(.caption).foregroundStyle(.secondary)
            if quiz.retryMistakes() != nil { primary("Practise missed phrases") { selectedAnswer = nil; model.quiz = quiz.retryMistakes() } }
            primary("Back to collection") { model.quiz = nil }
        } else if let question = quiz.question {
            Text("\(model.session?.title ?? "") · \(quiz.index + 1) of \(quiz.total)").font(.subheadline)
            ProgressView(value: Double(quiz.index), total: Double(quiz.total))
            Text("Find the action").font(.headline)
            Text(question.prompt).font(.title.bold()).padding(24).frame(maxWidth: .infinity, alignment: .leading)
                .background(playmakerLavender.opacity(0.5), in: RoundedRectangle(cornerRadius: 24))
            Button(textAnswers ? "Use pictures" : "Show text answers") { textAnswers.toggle() }
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: typeSize.isAccessibilitySize ? 1 : 2), spacing: 12) {
                ForEach(Array(question.visualChoices().enumerated()), id: \.element.artwork) { index, choice in
                    Button { selectedAnswer = choice.answer } label: {
                        VStack(alignment: .leading, spacing: 10) {
                            SportArtwork(name: choice.artwork)
                            Text(textAnswers ? choice.answer : "Option \(index + 1)")
                                .font(.headline).padding(.horizontal, 12).padding(.bottom, 12)
                            if selectedAnswer == choice.answer { Text("Selected").font(.caption.bold()).padding(.horizontal, 12).padding(.bottom, 10) }
                        }.frame(maxWidth: .infinity, alignment: .leading)
                            .background(playmakerLavender.opacity(selectedAnswer == choice.answer ? 0.85 : 0.35), in: RoundedRectangle(cornerRadius: 24))
                            .overlay(RoundedRectangle(cornerRadius: 24).stroke(selectedAnswer == choice.answer ? accent : .clear, lineWidth: 3))
                    }.buttonStyle(.plain).disabled(quiz.feedback != nil)
                        .accessibilityLabel(choice.imageDescription)
                        .accessibilityAddTraits(selectedAnswer == choice.answer ? .isSelected : [])
                }
            }
            if quiz.feedback == nil {
                primary("Check answer", enabled: selectedAnswer != nil) {
                    if let answer = selectedAnswer { _ = quiz.answer(choice: answer); model.update() }
                }
            }
            if let feedback = quiz.feedback {
                VStack(alignment: .leading, spacing: 10) {
                    Text(feedback.correct ? "You've got it." : "One to practise.").font(.headline).foregroundStyle(accent)
                    Text(feedback.answer); Text(feedback.explanation).foregroundStyle(.secondary)
                }.padding(20).frame(maxWidth: .infinity, alignment: .leading).background(playmakerLavender.opacity(0.5), in: RoundedRectangle(cornerRadius: 20))
                primary(quiz.index + 1 == quiz.total ? "See my recap" : "Next phrase") {
                    selectedAnswer = nil; _ = quiz.next(); if quiz.complete { _ = model.library.record(quiz: quiz) }; model.update(save: true)
                }
            }
            Button("Leave practice") { model.quiz = nil }.padding(.vertical, 8)
        }
    }
    private func primary(_ title: String, enabled: Bool = true, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title).font(.headline).frame(maxWidth: .infinity, minHeight: 54)
        }.buttonStyle(.borderedProminent).foregroundStyle(.white).buttonBorderShape(.capsule).disabled(!enabled)
    }
}
