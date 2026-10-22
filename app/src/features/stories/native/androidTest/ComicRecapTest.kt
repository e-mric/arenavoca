package com.arenavoca.mobile

import android.graphics.Bitmap
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.test.*
import androidx.compose.ui.semantics.SemanticsActions
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.test.platform.app.InstrumentationRegistry
import java.io.File
import org.junit.Rule
import org.junit.Test

class ComicRecapTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()
    private fun open() {
        compose.onNodeWithText("Repasemos el partido").performScrollTo().performClick()
        compose.onNodeWithText("Reveal match moments").assertDoesNotExist()
        compose.onNodeWithText("Cards 6").assertIsDisplayed()
        compose.onNodeWithText("Stories 2").performClick()
        compose.onNodeWithTag("open-comic").performScrollTo().performClick()
    }
    private fun capture(name: String) {
        val image = compose.onRoot().captureToImage().asAndroidBitmap()
        File(InstrumentationRegistry.getInstrumentation().targetContext.filesDir, "comic-$name.png").outputStream().use { image.compress(Bitmap.CompressFormat.PNG, 100, it) }
    }
    @Test fun holdReleaseCancelAndAccessibleTranslationAcrossComicPanels() {
        open()
        // A single scrolling story, with captions overlapping their artwork.
        val art = compose.onNodeWithTag("comic-art-alba-run").fetchSemanticsNode().boundsInRoot
        val caption = compose.onNodeWithTag("comic-caption-alba-run").fetchSemanticsNode().boundsInRoot
        org.junit.Assert.assertTrue("Caption should overlap the illustrated panel", caption.top < art.bottom)
        compose.onNodeWithText("Next panel").assertDoesNotExist()
        val first = compose.onNodeWithTag("comic-spanish-alba-run")
        val english = compose.onNodeWithTag("comic-english-alba-run")
        english.assertDoesNotExist()
        first.performTouchInput { click() } // A regular tap never reveals English.
        english.assertDoesNotExist()
        compose.mainClock.autoAdvance = false
        first.performTouchInput { down(center) }
        compose.mainClock.advanceTimeBy(650)
        english.assertIsDisplayed()
        first.performTouchInput { up() }
        compose.mainClock.advanceTimeByFrame()
        english.assertDoesNotExist()
        first.performTouchInput { down(center) }
        compose.mainClock.advanceTimeBy(650)
        english.assertIsDisplayed()
        first.performTouchInput { cancel() }
        compose.mainClock.advanceTimeByFrame()
        english.assertDoesNotExist()
        compose.mainClock.autoAdvance = true
        capture("run")
        compose.onAllNodesWithText("Replay moment").onFirst().performClick()
        compose.waitUntil(10_000) { compose.onAllNodesWithText("Playing match moment").fetchSemanticsNodes().isNotEmpty() }
        compose.onNodeWithTag("replay-video-match_808_814").assertExists()
        compose.onNodeWithTag("stadium-replay-dialog").assertIsDisplayed()
        compose.onNodeWithContentDescription("Close replay").performClick()
        compose.onNodeWithTag("replay-video-match_808_814").assertDoesNotExist()
        // Accessibility activation is an intentional alternate action, with a visible hide control.
        first.performSemanticsAction(SemanticsActions.OnClick) { it() }
        english.assertIsDisplayed()
        compose.activityRule.scenario.moveToState(androidx.lifecycle.Lifecycle.State.CREATED)
        compose.activityRule.scenario.moveToState(androidx.lifecycle.Lifecycle.State.RESUMED)
        english.assertDoesNotExist()
        first.performSemanticsAction(SemanticsActions.OnClick) { it() }
        compose.onNodeWithText("Hide English").performScrollTo().performClick()
        english.assertDoesNotExist()
        val cutback = compose.onNodeWithTag("comic-spanish-alba-cutback")
        compose.onNodeWithTag("comic-scroll").performScrollToNode(hasTestTag("comic-spanish-alba-cutback"))
        cutback.assertTextEquals("Alba pasa el balón hacia atrás.")
        cutback.performSemanticsAction(SemanticsActions.OnClick) { it() }
        compose.onNodeWithTag("comic-english-alba-cutback").assertIsDisplayed()
        capture("cutback-english")
        compose.onNodeWithText("Hide English").performClick()
        compose.onNodeWithTag("comic-scroll").performScrollToNode(hasTestTag("comic-spanish-coutinho-goal"))
        compose.onNodeWithTag("comic-spanish-coutinho-goal").assertIsDisplayed()
        compose.onNodeWithTag("comic-english-coutinho-goal").assertDoesNotExist()
        capture("goal")
        compose.onNodeWithContentDescription("Back to stories").performClick()
        compose.onNodeWithTag("open-comic").assertExists()
    }
}
