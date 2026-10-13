import XCTest

final class StoryJourneyTests: XCTestCase {
    func testFootballStoryAndCollectionReturn() {
        let app = XCUIApplication(); app.launch()
        tap("Try an example recap", in: app)
        tap("Explore a story", in: app)
        XCTAssertTrue(app.staticTexts["Fictional practice · not from your recording"].exists)
        capture("Story football", in: app)
        tap("Show English", in: app)
        XCTAssertTrue(app.staticTexts["One minute remains. The blue team is one goal behind. We need a goal to equalise."].exists)
        tap("Next scene", in: app)
        XCTAssertFalse(app.buttons["Hide English"].exists)
        tap("Previous scene", in: app)
        tap("Next scene", in: app); tap("Next scene", in: app); tap("Try the activities", in: app)
        XCTAssertFalse(app.buttons["Check answer"].isEnabled)
        tap("Para ganar.", in: app)
        XCTAssertFalse(app.staticTexts["Let's look again."].exists)
        tap("Check answer", in: app); tap("Try recalling", in: app)
        XCTAssertFalse(app.buttons["Check word"].isEnabled)
        tap("Give me a hint", in: app)
        let missing = app.textFields["Missing word"]; scrollTo(missing, in: app); missing.tap(); missing.typeText("PASA")
        tap("Check word", in: app); tap("Make it your own", in: app)
        XCTAssertFalse(app.buttons["Compare with an example"].isEnabled)
        let response = app.descendants(matching: .any).matching(identifier: "story-response").firstMatch
        scrollTo(response, in: app); response.tap(); response.typeText("Necesitamos descansar.")
        tap("Compare with an example", in: app)
        XCTAssertFalse(app.buttons["Finish story"].isEnabled)
        tap("Practise this again", in: app); tap("Finish story", in: app)
        XCTAssertTrue(app.staticTexts["Recognise · reviewed the explanation"].exists)
        XCTAssertTrue(app.staticTexts["Recall · remembered with a hint"].exists)
        XCTAssertTrue(app.staticTexts["Use · wrote your own answer\nNecesitamos descansar."].exists)
        capture("Story summary", in: app)
        tap("Read and practise again", in: app)
        XCTAssertTrue(app.staticTexts["Read · Scene 1 of 3"].exists)
        tap("Close story", in: app)
        XCTAssertTrue(app.staticTexts["Your moments"].exists)
        XCTAssertTrue(app.buttons["Start recap · 3 questions"].exists)
    }
    func testRacingStoryWithUnassistedRecall() {
        let app = XCUIApplication(); app.launch()
        tap("F1", in: app); tap("Explore a story", in: app)
        XCTAssertTrue(app.staticTexts["Time to pit"].exists)
        capture("Story F1", in: app)
        tap("Next scene", in: app); tap("Next scene", in: app); tap("Try the activities", in: app)
        tap("Los neumáticos.", in: app); tap("Check answer", in: app)
        XCTAssertTrue(app.staticTexts["You've got it."].exists)
        tap("Try recalling", in: app)
        let missing = app.textFields["Missing word"]; scrollTo(missing, in: app); missing.tap(); missing.typeText("boxes")
        tap("Check word", in: app); tap("Make it your own", in: app)
        let response = app.descendants(matching: .any).matching(identifier: "story-response").firstMatch
        scrollTo(response, in: app); response.tap(); response.typeText("Prefiero parar ahora.")
        tap("Compare with an example", in: app); tap("Ready to try elsewhere", in: app); tap("Finish story", in: app)
        XCTAssertTrue(app.staticTexts["Recall · remembered without a hint"].exists)
        tap("Done", in: app)
        XCTAssertTrue(app.staticTexts["Race recap"].exists)
    }
    private func capture(_ name: String, in app: XCUIApplication) {
        let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image)
    }
    private func tap(_ label: String, in app: XCUIApplication) {
        let button = app.buttons[label].firstMatch; scrollTo(button, in: app)
        XCTAssertTrue(button.exists, label); button.tap()
    }
    private func scrollTo(_ element: XCUIElement, in app: XCUIApplication) {
        for _ in 0..<8 { if element.isHittable { return }; app.swipeUp() }
        for _ in 0..<8 { if element.isHittable { return }; app.swipeDown() }
    }
}
