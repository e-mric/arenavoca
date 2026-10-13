import XCTest

final class PlaymakerJourneyTests: XCTestCase {
    func testIllustratedQuizRequiresSelectionAndConfirmation() {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.staticTexts["ArenaVoca"].waitForExistence(timeout: 10))
        XCTAssertFalse(app.staticTexts["missing-artwork"].exists)
        XCTAssertTrue(app.images["playmaker_football"].exists)
        let home = XCTAttachment(screenshot: app.screenshot())
        home.name = "Playmaker home"; home.lifetime = .keepAlways; add(home)
        tap("Try an example recap", in: app)
        capture("Playmaker football collection", in: app)
        tap("Start recap · 3 questions", in: app)
        XCTAssertTrue(app.staticTexts["Match recap"].isHittable)
        let check = app.buttons["Check answer"]
        scrollTo(check, in: app)
        XCTAssertFalse(check.isEnabled)
        tap("The player passes the ball.", in: app)
        XCTAssertFalse(app.staticTexts["You've got it."].exists)
        tap("Check answer", in: app)
        XCTAssertTrue(app.staticTexts["You've got it."].exists)
        let quiz = XCTAttachment(screenshot: app.screenshot())
        quiz.name = "Playmaker quiz"; quiz.lifetime = .keepAlways; add(quiz)
        tap("Next phrase", in: app)
        scrollTo(check, in: app)
        XCTAssertFalse(check.isEnabled)
        tap("Show text answers", in: app)
        XCTAssertTrue(app.buttons["The player shoots."].exists)
    }
    func testCollectionSaveControlsAndRacingArtwork() {
        let app = XCUIApplication()
        app.launch()
        tap("F1", in: app)
        tap("Try an example recap", in: app)
        let phrases = ["El piloto adelanta.", "El piloto frena.", "El piloto entra en boxes."]
        for phrase in phrases where app.buttons["Save phrase: \(phrase)"].exists {
            tap("Save phrase: \(phrase)", in: app)
        }
        app.swipeDown(); app.swipeDown()
        XCTAssertTrue(app.staticTexts["Your moments"].isHittable)
        capture("Playmaker F1 collection", in: app)
        for phrase in phrases { tap("Remove saved phrase: \(phrase)", in: app) }
        let start = app.buttons["Start recap · 0 questions"]
        scrollTo(start, in: app)
        XCTAssertFalse(start.isEnabled)
        XCTAssertTrue(app.staticTexts["Save a phrase to start your recap."].exists)
        tap("Save phrase: \(phrases[0])", in: app)
        app.terminate(); app.launch()
        let session = app.buttons.containing(.staticText, identifier: "Race weekend").firstMatch
        scrollTo(session, in: app); session.tap()
        XCTAssertTrue(app.buttons["Remove saved phrase: \(phrases[0])"].exists)
        XCTAssertTrue(app.buttons["Save phrase: \(phrases[1])"].exists)
        tap("Start recap · 1 questions", in: app)
        XCTAssertTrue(app.staticTexts["Race weekend · 1 of 1"].exists)
        tap("Leave practice", in: app)
        for phrase in phrases.dropFirst() { tap("Save phrase: \(phrase)", in: app) }
    }
    private func capture(_ name: String, in app: XCUIApplication) {
        let image = XCTAttachment(screenshot: app.screenshot())
        image.name = name; image.lifetime = .keepAlways; add(image)
    }
    private func tap(_ label: String, in app: XCUIApplication) {
        let button = app.buttons[label].firstMatch
        scrollTo(button, in: app)
        XCTAssertTrue(button.exists, label)
        button.tap()
    }
    private func scrollTo(_ element: XCUIElement, in app: XCUIApplication) {
        for _ in 0..<7 {
            if element.isHittable { return }
            app.swipeUp()
        }
        for _ in 0..<7 {
            if element.isHittable { return }
            app.swipeDown()
        }
    }
}
