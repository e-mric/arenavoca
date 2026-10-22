package com.arenavoca.tv

import android.graphics.Bitmap
import android.view.KeyEvent
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.test.platform.app.InstrumentationRegistry
import java.io.File
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalTestApi::class)
class TvComicTest {
    @get:Rule(order = 0) val playback = PlaybackFixture()
    @get:Rule(order = 1) val compose = createAndroidComposeRule<TvActivity>()
    private fun key(code: Int) {
        InstrumentationRegistry.getInstrumentation().sendKeyDownUpSync(code)
        compose.waitForIdle()
        android.os.SystemClock.sleep(100)
    }
    private fun select() = key(KeyEvent.KEYCODE_DPAD_CENTER)
    private fun openComic() {
        select()
        compose.onNodeWithTag("play").assertIsFocused()
        repeat(4) { key(KeyEvent.KEYCODE_DPAD_RIGHT) }
        compose.onNodeWithTag("comic").assertIsFocused()
        select()
    }
    private fun capture(name: String) {
        val image = compose.onRoot().captureToImage().asAndroidBitmap()
        File(InstrumentationRegistry.getInstrumentation().targetContext.filesDir, "comic-$name.png").outputStream().use { image.compress(Bitmap.CompressFormat.PNG, 100, it) }
    }
    @Test fun timedComicDoesNotSpoilSeekPauseOrStealFocusAndHoldIsMomentary() {
        compose.waitUntil(15_000) { compose.activity.player.ready }
        openComic()
        compose.onNodeWithText("Your panels will appear after the action.").assertIsDisplayed()
        compose.onNodeWithTag("comic-caption").assertDoesNotExist()
        assertFalse(compose.activity.player.playing)
        assertEquals(0, compose.activity.player.position)
        key(KeyEvent.KEYCODE_BACK)
        select(); select()
        compose.waitUntil(15_000) { compose.activity.learning.positionMs >= 6_300 }
        compose.onNodeWithTag("watch-surface").assertIsFocused()
        compose.onNodeWithTag("learning-panel").assertDoesNotExist()
        openComic()
        compose.onNodeWithTag("comic-caption").assertIsFocused()
        compose.onNodeWithText("Jordi Alba corre al espacio.").assertExists()
        compose.onNodeWithText("Coutinho marca el primer gol.").assertDoesNotExist()
        select()
        compose.onNodeWithTag("comic-english", useUnmergedTree = true).assertDoesNotExist()
        val beforeHold = compose.activity.player.position
        compose.mainClock.autoAdvance = false
        compose.onNodeWithTag("comic-caption").performKeyInput { keyDown(androidx.compose.ui.input.key.Key.DirectionCenter) }
        compose.mainClock.advanceTimeBy(650)
        compose.onNodeWithTag("comic-english", useUnmergedTree = true).assertExists()
        compose.onNodeWithTag("comic-caption").performKeyInput { keyUp(androidx.compose.ui.input.key.Key.DirectionCenter) }
        compose.mainClock.advanceTimeByFrame()
        compose.onNodeWithTag("comic-english", useUnmergedTree = true).assertDoesNotExist()
        compose.mainClock.autoAdvance = true
        compose.waitUntil(15_000) { compose.activity.learning.positionMs >= 9_500 }
        assertTrue(compose.activity.player.position > beforeHold)
        assertTrue(compose.activity.player.playing)
        compose.onNodeWithText("Jordi Alba corre al espacio.").assertExists() // New arrival doesn't replace reading.
        key(KeyEvent.KEYCODE_MEDIA_PAUSE)
        val paused = compose.activity.player.position
        key(KeyEvent.KEYCODE_DPAD_DOWN) // Next: Previous is disabled at first panel.
        compose.onNodeWithTag("comic-next").assertIsFocused()
        select()
        compose.onNodeWithText("Alba pasa el balón hacia atrás.").assertExists()
        capture("tv-cutback")
        assertFalse(compose.activity.player.playing)
        assertTrue(kotlin.math.abs(compose.activity.player.position - paused) < 500)
        compose.onNodeWithTag("comic-caption").assertIsFocused()
        repeat(2) { key(KeyEvent.KEYCODE_DPAD_DOWN) }
        compose.onNodeWithTag("comic-replay").assertIsFocused()
        select()
        compose.onNodeWithTag("tv-replay-video").assertExists()
        assertFalse(compose.activity.player.playing)
        key(KeyEvent.KEYCODE_BACK)
        compose.onNodeWithText("Alba pasa el balón hacia atrás.").assertExists()
        compose.onNodeWithTag("comic-count").assertTextEquals("2 / 2 available")
        assertFalse(compose.activity.player.playing)
        assertTrue(kotlin.math.abs(compose.activity.player.position - paused) < 500)
        key(KeyEvent.KEYCODE_BACK)
        compose.onNodeWithTag("learning-panel").assertDoesNotExist()
        assertFalse(compose.activity.player.playing)
        key(KeyEvent.KEYCODE_MEDIA_PLAY)
        compose.waitUntil(15_000) { compose.activity.learning.positionMs >= 14_500 }
        openComic()
        compose.onNodeWithTag("comic-count").assertTextEquals("1 / 3 available")
        assertTrue(compose.activity.player.playing)
        key(KeyEvent.KEYCODE_BACK)
        assertTrue(compose.activity.player.playing)
    }
}
