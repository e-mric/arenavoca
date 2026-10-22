package com.arenavoca.mobile

import android.graphics.Bitmap
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.semantics.SemanticsActions
import androidx.compose.ui.semantics.SemanticsProperties
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.test.platform.app.InstrumentationRegistry
import java.io.File
import org.junit.Rule
import org.junit.Test

class PassingWarmupTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()
    private fun open() {
        compose.onNodeWithText("Calentemos").performScrollTo().performClick()
        compose.onNodeWithTag("warmup-meaning-area").assertExists()
    }
    private fun state(value: String) = SemanticsMatcher.expectValue(SemanticsProperties.StateDescription, value)
    private fun capture(name: String) {
        val image = compose.onRoot().captureToImage().asAndroidBitmap()
        File(InstrumentationRegistry.getInstrumentation().targetContext.filesDir, "warmup-$name.png").outputStream().use { image.compress(Bitmap.CompressFormat.PNG, 100, it) }
    }
    @Test fun holdsConnectObjectsToWordsAndReleaseOrMovementClearsThem() {
        open()
        val scene = compose.onNodeWithTag("warmup-scene")
        val phrase = compose.onNodeWithTag("comic-spanish-warmup-pass", useUnmergedTree = true)
        compose.onNodeWithText("Skip warm-up").assertIsDisplayed()
        capture("read")
        compose.mainClock.autoAdvance = false
        scene.performTouchInput { down(Offset(width * .30f, height * .34f)) }
        compose.mainClock.advanceTimeBy(650)
        phrase.assert(state("el jugador"))
        compose.onNodeWithText("the player").assertIsDisplayed()
        capture("player")
        scene.performTouchInput { up() }
        compose.mainClock.advanceTimeByFrame()
        phrase.assert(state("No highlighted word"))
        scene.performTouchInput { down(Offset(width * .54f, height * .74f)) }
        compose.mainClock.advanceTimeBy(650)
        phrase.assert(state("el balón"))
        compose.onNodeWithText("the ball").assertIsDisplayed()
        val art = scene.fetchSemanticsNode().boundsInRoot
        val label = compose.onNodeWithTag("warmup-word-label", useUnmergedTree = true).fetchSemanticsNode().boundsInRoot
        org.junit.Assert.assertTrue("Ball label must clear the ball halo", label.bottom < art.top + art.height * .66f)
        org.junit.Assert.assertTrue("Ball label must clear the receiving player", label.right < art.left + art.width * .82f)
        capture("ball")
        scene.performTouchInput { cancel() }
        compose.mainClock.advanceTimeByFrame()
        phrase.assert(state("No highlighted word"))
        scene.performTouchInput { down(Offset(width * .30f, height * .34f)); moveBy(Offset(60f, 0f)) }
        compose.mainClock.advanceTimeBy(650)
        compose.onNodeWithText("the player").assertDoesNotExist()
        scene.performTouchInput { up() }
        compose.mainClock.autoAdvance = true
    }
    @Test fun bottomBlankSpaceTranslatesButFlickPassesWithoutTranslationOrCompletionGate() {
        open()
        val panel = compose.onNodeWithTag("warmup-meaning-area")
        val pitch = compose.onNodeWithTag("warmup-pitch", useUnmergedTree = true)
        val english = compose.onNodeWithTag("warmup-english", useUnmergedTree = true)
        val phrase = compose.onNodeWithTag("comic-spanish-warmup-pass", useUnmergedTree = true)
        compose.mainClock.autoAdvance = false
        // Empty space near the bottom, not the Spanish text, is a translation target.
        panel.performTouchInput { down(Offset(width * .5f, height - 10f)) }
        compose.mainClock.advanceTimeBy(650)
        english.assertIsDisplayed()
        capture("english")
        panel.performTouchInput { up() }
        compose.mainClock.advanceTimeByFrame()
        english.assertDoesNotExist()
        panel.performTouchInput { down(Offset(width * .5f, height - 10f)) }
        compose.mainClock.advanceTimeBy(650)
        panel.performTouchInput { cancel() }
        compose.mainClock.advanceTimeByFrame()
        english.assertDoesNotExist()
        // A backwards flick is not a pass and cannot leave a delayed translation behind.
        pitch.performTouchInput { swipe(Offset(width * .14f, height * .78f), Offset(width * .02f, height * .80f), 200) }
        compose.mainClock.advanceTimeBy(650)
        english.assertDoesNotExist()
        compose.onNodeWithText("¡Buen pase!").assertDoesNotExist()
        // Holding the mini-pitch ball reveals English but never counts as a pass.
        pitch.performTouchInput { down(Offset(width * .14f, height * .78f)) }
        compose.mainClock.advanceTimeBy(650)
        english.assertIsDisplayed()
        pitch.performTouchInput { up() }
        compose.mainClock.advanceTimeByFrame()
        compose.onNodeWithText("¡Buen pase!").assertDoesNotExist()
        // Movement on the ball cancels the hold and animates a directional pass.
        pitch.performTouchInput { swipe(Offset(width * .14f, height * .78f), Offset(width * .79f, height * .47f), 250) }
        compose.mainClock.advanceTimeBy(850)
        english.assertDoesNotExist()
        phrase.assert(state("pasa"))
        compose.onNodeWithText("¡Buen pase!", useUnmergedTree = true).assertIsDisplayed()
        val art = compose.onNodeWithTag("warmup-scene").fetchSemanticsNode().boundsInRoot
        val label = compose.onNodeWithTag("warmup-word-label", useUnmergedTree = true).fetchSemanticsNode().boundsInRoot
        org.junit.Assert.assertTrue("Pass caption must stay above the path and receiver", label.bottom < art.top + art.height * .55f)
        capture("pass")
        compose.mainClock.advanceTimeBy(1500) // Ball returns for another optional pass.
        pitch.performTouchInput { swipe(Offset(width * .14f, height * .78f), Offset(width * .79f, height * .47f), 250) }
        compose.mainClock.advanceTimeBy(850)
        phrase.assert(state("pasa"))
        compose.mainClock.autoAdvance = true
        compose.onNodeWithText("Next card").performClick()
        compose.onNodeWithText("El jugador dispara.").assertIsDisplayed()
        english.assertDoesNotExist()
        compose.onNodeWithText("Skip warm-up").performClick()
        compose.onNodeWithText("Repasemos el partido").assertExists()
    }
    @Test fun accessibleAlternativesWorkAndBackgroundingClearsTransientState() {
        open()
        val panel = compose.onNodeWithTag("warmup-meaning-area")
        panel.performSemanticsAction(SemanticsActions.OnClick) { it() }
        compose.onNodeWithTag("warmup-english", useUnmergedTree = true).assertIsDisplayed()
        panel.performSemanticsAction(SemanticsActions.OnClick) { it() }
        compose.onNodeWithTag("warmup-english", useUnmergedTree = true).assertDoesNotExist()
        val passAction = panel.fetchSemanticsNode().config[SemanticsActions.CustomActions].first { it.label == "Pass ball" }
        compose.runOnIdle { passAction.action() }
        compose.onNodeWithText("¡Buen pase!", useUnmergedTree = true).assertIsDisplayed()
        val ballAction = compose.onNodeWithTag("warmup-scene").fetchSemanticsNode().config[SemanticsActions.CustomActions].first { it.label == "Show ball word" }
        compose.runOnIdle { ballAction.action() }
        compose.onNodeWithText("the ball").assertIsDisplayed()
        compose.activityRule.scenario.moveToState(androidx.lifecycle.Lifecycle.State.CREATED)
        compose.activityRule.scenario.moveToState(androidx.lifecycle.Lifecycle.State.RESUMED)
        compose.onNodeWithText("the ball").assertDoesNotExist()
        compose.onNodeWithText("¡Buen pase!").assertDoesNotExist()
        compose.onNodeWithText("Skip warm-up").performClick()
    }
}
