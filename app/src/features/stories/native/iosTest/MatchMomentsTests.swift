import XCTest

final class MatchMomentsTests: XCTestCase {
    func testEvidenceAndRealMatchStory() {
        let app = XCUIApplication(); app.launch()
        tap("Explore match moments", in: app)
        XCTAssertFalse(app.staticTexts["Bale avanza por la izquierda."].exists)
        XCTAssertFalse(app.buttons["barca-opening-goal"].exists)
        tap("Reveal match moments", in: app)
        XCTAssertTrue(app.staticTexts["Bale avanza por la izquierda."].exists)
        tap("Why this card?", in: app)
        XCTAssertTrue(app.staticTexts["Commentary · The commentator identifies a run by Gareth Bale with Piqué chasing back."].exists)
        tap("barca-opening-goal", in: app)
        let phrase = app.staticTexts["Jordi Alba corre al espacio."]; scrollTo(phrase, in: app)
        capture("Match cards", in: app)
        tap("Practise this moment", in: app)
        XCTAssertTrue(app.staticTexts["From the recording · AI checked"].exists)
        XCTAssertTrue(app.staticTexts["Recording 13:28–13:34 · Match 10:21–10:27"].exists)
        capture("Match story", in: app)
        tap("Next scene", in: app); tap("Next scene", in: app); tap("Try the activities", in: app)
        tap("Alba.", in: app); tap("Check answer", in: app); tap("Try recalling", in: app)
        let field = app.textFields["Missing word"]; scrollTo(field, in: app); field.tap(); field.typeText("atrás")
        tap("Check word", in: app); tap("Make it your own", in: app)
        let response = app.descendants(matching: .any).matching(identifier: "story-response").firstMatch
        scrollTo(response, in: app); response.tap(); response.typeText("Me gusta el pase.")
        tap("Compare with an example", in: app); tap("Ready to try elsewhere", in: app); tap("Finish story", in: app)
        XCTAssertTrue(app.staticTexts["Recall · remembered without a hint"].exists)
        tap("Done", in: app); tap("Close match moments", in: app)
        tap("Explore match moments", in: app)
        XCTAssertTrue(app.buttons["Reveal match moments"].exists)
        XCTAssertFalse(app.staticTexts["Coutinho marca el primer gol."].exists)
    }
    private func capture(_ name: String, in app: XCUIApplication) {
        let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image)
    }
    private func tap(_ label: String, in app: XCUIApplication) {
        let button = app.buttons[label].firstMatch; scrollTo(button, in: app); XCTAssertTrue(button.exists, label); button.tap()
    }
    private func scrollTo(_ element: XCUIElement, in app: XCUIApplication) {
        for _ in 0..<12 { if element.isHittable { return }; app.swipeUp() }
        for _ in 0..<12 { if element.isHittable { return }; app.swipeDown() }
    }
}
