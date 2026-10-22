package com.arenavoca.tv

import android.graphics.Bitmap
import android.view.KeyEvent
import android.view.View
import android.view.ViewGroup
import android.widget.VideoView
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.test.platform.app.InstrumentationRegistry
import java.io.File
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test

class TvReplayTest {
    @get:Rule(order = 0) val playback = PlaybackFixture()
    @get:Rule(order = 1) val compose = createAndroidComposeRule<TvActivity>()
    private fun key(code: Int) { InstrumentationRegistry.getInstrumentation().sendKeyDownUpSync(code); compose.waitForIdle() }
    private fun select() = key(KeyEvent.KEYCODE_DPAD_CENTER)
    private fun views(view: View): List<VideoView> = when (view) {
        is VideoView -> listOf(view)
        is ViewGroup -> (0 until view.childCount).flatMap { views(view.getChildAt(it)) }
        else -> emptyList()
    }
    @Test fun separateReplayPreservesMainMatchAndBackRestoresSelectedCard() {
        compose.waitUntil(15_000) { compose.activity.player.ready }
        val moment = compose.activity.learning.sequence.moments[1]
        select(); select()
        compose.waitUntil(30_000) { compose.activity.player.position > moment.endMs + 200 }
        select(); key(KeyEvent.KEYCODE_DPAD_RIGHT); select(); key(KeyEvent.KEYCODE_DPAD_DOWN); select()
        compose.onNodeWithTag("card-phrase").assertTextEquals(moment.phrase.spanish)
        key(KeyEvent.KEYCODE_DPAD_DOWN)
        compose.onNodeWithTag("replay-moment").assertIsFocused(); select()
        compose.waitUntil(10_000) { compose.onAllNodesWithText("Replay playing · muted").fetchSemanticsNodes().isNotEmpty() }
        compose.runOnIdle {
            val replay = views(compose.activity.window.decorView).single { it !== compose.activity.player.view }
            assertTrue("Replay starts at ${replay.currentPosition}, expected ${moment.startMs}", replay.currentPosition >= moment.startMs - 300)
            assertTrue(replay.currentPosition < moment.endMs + 500)
        }
        compose.onNodeWithTag("close-tv-replay").assertIsFocused()
        key(KeyEvent.KEYCODE_DPAD_UP); select()
        compose.onNodeWithText("Replay paused · muted").assertExists()
        val mainPosition = compose.activity.player.position
        compose.waitUntil(5_000) { compose.activity.player.position > mainPosition + 500 }
        assertTrue(compose.activity.player.playing)
        val image = InstrumentationRegistry.getInstrumentation().uiAutomation.takeScreenshot()
        File(InstrumentationRegistry.getInstrumentation().targetContext.filesDir, "tv-independent-replay.png").outputStream().use { image.compress(Bitmap.CompressFormat.PNG, 100, it) }
        select()
        compose.waitUntil(15_000) { compose.onAllNodesWithText("Replay finished").fetchSemanticsNodes().isNotEmpty() }
        select()
        compose.waitUntil(5_000) { compose.onAllNodesWithText("Replay playing · muted").fetchSemanticsNodes().isNotEmpty() }
        key(KeyEvent.KEYCODE_MEDIA_PAUSE) // Explicit main-video command remains independent.
        val paused = compose.activity.player.position
        key(KeyEvent.KEYCODE_BACK)
        compose.onNodeWithTag("tv-replay-video").assertDoesNotExist()
        compose.onNodeWithTag("card-phrase").assertTextEquals(moment.phrase.spanish)
        assertFalse(compose.activity.player.playing)
        assertTrue(kotlin.math.abs(paused - compose.activity.player.position) < 500)
        compose.runOnIdle { assertEquals(1, views(compose.activity.window.decorView).size) }
        // A cold launch resumes the same sequence paused; unrelated sequence data is untouched.
        key(KeyEvent.KEYCODE_BACK)
        compose.activityRule.scenario.close()
        val reopened = androidx.test.core.app.ActivityScenario.launch(TvActivity::class.java)
        try {
            var activity: TvActivity? = null
            reopened.onActivity { activity = it }
            compose.waitUntil(10_000) { activity!!.player.ready }
            reopened.onActivity {
                assertFalse(it.player.playing)
                assertTrue(kotlin.math.abs(it.player.position - paused) < 800)
                assertTrue(it.learning.sequence.moments[1].endMs <= it.player.position)
            }
        } finally { reopened.close() }
    }
}
