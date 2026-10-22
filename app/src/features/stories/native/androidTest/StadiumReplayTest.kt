package com.arenavoca.mobile

import android.graphics.Color
import android.graphics.Bitmap
import android.view.KeyEvent
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.test.platform.app.InstrumentationRegistry
import androidx.lifecycle.Lifecycle
import java.io.File
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class StadiumReplayTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()
    @Test fun dialogReplaysAndDismissesWithoutMovingTheComic() {
        compose.onNodeWithText("Repasemos el partido").performScrollTo().performClick()
        compose.onNodeWithText("Stories 2").performClick()
        compose.onNodeWithTag("open-comic").performScrollTo().performClick()
        compose.onAllNodesWithText("Replay moment").onFirst().performScrollTo()
        val before = compose.onNodeWithTag("comic-caption-alba-run").fetchSemanticsNode().boundsInRoot
        compose.onAllNodesWithText("Replay moment").onFirst().performClick()
        compose.onNodeWithTag("stadium-replay-dialog").assertIsDisplayed()
        compose.waitUntil(10_000) { compose.onAllNodesWithText("Playing match moment").fetchSemanticsNodes().isNotEmpty() }
        val video = compose.onNodeWithTag("replay-video-match_808_814")
        val originalWidth = video.fetchSemanticsNode().boundsInRoot.width
        assertEquals(16f / 9f, originalWidth / video.fetchSemanticsNode().boundsInRoot.height, .02f)
        // Status alone used to pass even while the dialog's video surface was black.
        // This private football fixture has a green pitch; the surrounding comic is blue.
        var visiblePitch = false
        compose.waitUntil(5_000) {
            val frame = InstrumentationRegistry.getInstrumentation().uiAutomation.takeScreenshot()
            var green = 0
            for (y in 0 until frame.height step 8) for (x in 0 until frame.width step 8) {
                val pixel = frame.getPixel(x, y)
                if (Color.green(pixel) > Color.red(pixel) * 1.2f &&
                    Color.green(pixel) > Color.blue(pixel) * 1.2f && Color.green(pixel) > 45) green++
            }
            frame.recycle()
            visiblePitch = green > 300
            visiblePitch
        }
        assertTrue("The replay must display decoded match pixels", visiblePitch)
        compose.onNodeWithContentDescription("Close replay").assertIsDisplayed()
        compose.onNodeWithText("Expand replay").assertIsDisplayed()
        val image = InstrumentationRegistry.getInstrumentation().uiAutomation.takeScreenshot()
        File(InstrumentationRegistry.getInstrumentation().targetContext.filesDir, "stadium-replay.png").outputStream().use { image.compress(Bitmap.CompressFormat.PNG, 100, it) }
        compose.onNodeWithText("Pausar").performClick()
        compose.onNodeWithText("Replay paused").assertExists()
        compose.onNodeWithText("Expand replay").performClick()
        assertTrue(video.fetchSemanticsNode().boundsInRoot.width > originalWidth)
        compose.onNodeWithText("Continuar").performClick()
        compose.waitUntil(10_000) { compose.onAllNodesWithText("Replay finished").fetchSemanticsNodes().isNotEmpty() }
        compose.onNodeWithText("Repetir").performClick()
        compose.onNodeWithText("Playing match moment").assertExists()
        compose.activityRule.scenario.moveToState(Lifecycle.State.CREATED)
        compose.activityRule.scenario.moveToState(Lifecycle.State.RESUMED)
        compose.onNodeWithText("Replay paused").assertExists()
        InstrumentationRegistry.getInstrumentation().sendKeyDownUpSync(KeyEvent.KEYCODE_BACK)
        compose.onNodeWithTag("stadium-replay-dialog").assertDoesNotExist()
        compose.onNodeWithTag("replay-video-match_808_814").assertDoesNotExist()
        assertEquals(before, compose.onNodeWithTag("comic-caption-alba-run").fetchSemanticsNode().boundsInRoot)
        compose.onAllNodesWithText("Replay moment").onFirst().performClick()
        compose.onNodeWithContentDescription("Close replay").performClick()
        compose.onNodeWithTag("stadium-replay-dialog").assertDoesNotExist()
    }
}
