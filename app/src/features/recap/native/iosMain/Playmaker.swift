import SwiftUI
import ArenaVocaShared

let playmakerBlue = Color(red: 0.086, green: 0.275, blue: 0.929)
let playmakerInk = Color(red: 0.078, green: 0.137, blue: 0.322)
let playmakerCream = Color(red: 1, green: 0.98, blue: 0.949)
let playmakerLavender = Color(red: 0.867, green: 0.847, blue: 1)

struct SportArtwork: View {
    let name: String
    var cornerRadius: CGFloat = 24
    var body: some View {
        if let path = Bundle.main.path(forResource: name, ofType: "png"),
           let image = UIImage(contentsOfFile: path) {
            Image(uiImage: image).renderingMode(.original).resizable().aspectRatio(contentMode: .fit)
                .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
                .accessibilityLabel("Sports illustration")
                .accessibilityIdentifier(name)
        } else {
            Text("Artwork unavailable").accessibilityIdentifier("missing-artwork")
        }
    }
}

struct PhraseCard: View {
    let phrase: Phrase
    let saved: Bool
    let onToggle: () -> Void
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            SportArtwork(name: "action_\(phrase.id)", cornerRadius: 0).accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 8) {
                Text(phrase.spanish).font(.headline).frame(minHeight: 60, alignment: .topLeading)
                    .fixedSize(horizontal: false, vertical: true)
                Text(phrase.english).font(.caption).foregroundStyle(.secondary)
                    .frame(minHeight: 34, alignment: .topLeading).fixedSize(horizontal: false, vertical: true)
                Button(action: onToggle) {
                    Label(saved ? "Saved" : "Save", systemImage: saved ? "bookmark.fill" : "bookmark")
                        .font(.subheadline.bold()).frame(maxWidth: .infinity, minHeight: 48)
                        .foregroundStyle(saved ? playmakerBlue : playmakerInk)
                        .background(saved ? playmakerLavender : Color(red: 0.953, green: 0.945, blue: 0.925), in: Capsule())
                }.buttonStyle(.plain)
                    .accessibilityLabel("\(saved ? "Remove saved phrase" : "Save phrase"): \(phrase.spanish)")
                    .accessibilityValue(saved ? "Saved" : "Not saved")
            }.padding(14)
        }.frame(maxWidth: .infinity, alignment: .leading)
            .background(.white)
            .clipShape(RoundedRectangle(cornerRadius: 24))
            .overlay(RoundedRectangle(cornerRadius: 24).stroke(Color(red: 0.89, green: 0.875, blue: 0.847), lineWidth: 1))
    }
}
