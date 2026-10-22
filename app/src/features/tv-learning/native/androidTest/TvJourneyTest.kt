package com.arenavoca.tv

import android.view.KeyEvent
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test

/** Real player, remote input and geometry; no mocked playback clock. */
class TvJourneyTest {
    @get:Rule(order = 0) val playback = PlaybackFixture()
    @get:Rule(order = 1) val compose = createAndroidComposeRule<TvActivity>()
    private fun key(code: Int) {
        InstrumentationRegistry.getInstrumentation().sendKeyDownUpSync(code)
        compose.waitForIdle()
    }
    private fun select() = key(KeyEvent.KEYCODE_DPAD_CENTER)
    private fun untilPosition(ms: Int) = compose.waitUntil(45_000) { compose.activity.learning.positionMs >= ms }
    private fun fullScreen() {
        compose.onNodeWithTag("learning-panel").assertDoesNotExist()
        compose.onNodeWithTag("controls").assertDoesNotExist()
        compose.onNodeWithTag("watch-surface").assertIsFocused()
        val root = compose.onNodeWithTag("tv-root").fetchSemanticsNode().boundsInRoot
        val video = compose.onNodeWithTag("match-video").fetchSemanticsNode().boundsInRoot
        assertTrue(video.width >= root.width * .99f)
        assertTrue(video.height >= root.height * .99f)
    }
    private fun moments(index: Int, saved: Boolean = false) {
        select()
        compose.onNodeWithTag("play").assertIsFocused()
        repeat(if (saved) 2 else 1) { key(KeyEvent.KEYCODE_DPAD_RIGHT) }
        compose.onNodeWithTag(if (saved) "saved-list" else "moments").assertIsFocused()
        select()
        repeat(index) { key(KeyEvent.KEYCODE_DPAD_DOWN) }
        select()
        compose.onNodeWithTag("flip").assertIsFocused()
    }
    private fun save() {
        key(KeyEvent.KEYCODE_DPAD_RIGHT)
        compose.onNodeWithTag("save").assertIsFocused()
        select()
        compose.waitUntil(5_000) { compose.onAllNodesWithText("Saved on this TV").fetchSemanticsNodes().isNotEmpty() }
    }
    @Test fun remoteCardJourneyPreservesFullScreenPlaybackAndLocalSaves() {
        compose.waitUntil(15_000) { compose.activity.player.ready }
        val cards = compose.activity.learning.sequence.moments
        fullScreen()
        select(); select() // Explicitly start playback, then hide controls.
        untilPosition(cards[0].endMs + 500)
        fullScreen() // Arrival never opens a card or steals focus.
        moments(0)
        val video = compose.onNodeWithTag("match-video").fetchSemanticsNode().boundsInRoot
        val root = compose.onNodeWithTag("tv-root").fetchSemanticsNode().boundsInRoot
        assertEquals(.72f, video.width / root.width, .02f)
        assertEquals(16f / 9f, video.width / video.height, .02f)
        select()
        compose.onNodeWithTag("card-phrase").assertTextEquals(cards[0].phrase.english)
        save()
        untilPosition(cards[1].endMs + 500)
        compose.onNodeWithTag("card-phrase").assertTextEquals(cards[0].phrase.english)
        assertTrue(compose.activity.player.playing)
        key(KeyEvent.KEYCODE_MEDIA_PAUSE)
        val paused = compose.activity.player.position
        key(KeyEvent.KEYCODE_BACK); fullScreen()
        moments(1)
        compose.onNodeWithTag("card-phrase").assertTextEquals(cards[1].phrase.spanish)
        assertFalse(compose.activity.player.playing)
        assertTrue(kotlin.math.abs(compose.activity.player.position - paused) < 500)
        save()
        key(KeyEvent.KEYCODE_MEDIA_PLAY)
        untilPosition(cards[2].endMs + 500)
        key(KeyEvent.KEYCODE_BACK); fullScreen()
        moments(2); save()
        key(KeyEvent.KEYCODE_BACK); fullScreen()
        select(); repeat(2) { key(KeyEvent.KEYCODE_DPAD_RIGHT) }; select()
        // Saved collection: three card buttons, then practice.
        repeat(3) { key(KeyEvent.KEYCODE_DPAD_DOWN) }
        compose.onNodeWithTag("practice").assertIsFocused(); select()
        repeat(3) { select(); compose.onNodeWithText("Next").assertIsFocused(); select() }
        compose.onNodeWithText("Done").assertIsFocused(); select(); fullScreen()
        val resumePosition = compose.activity.player.position
        compose.activityRule.scenario.recreate()
        compose.waitUntil(15_000) { compose.activity.player.ready }
        fullScreen()
        moments(2, saved = true)
        compose.onNodeWithTag("card-phrase").assertTextEquals(cards[2].phrase.spanish)
        compose.onNodeWithText("Saved").assertExists()
        assertFalse(compose.activity.player.playing)
        assertTrue("Recreation must restore the watched position", kotlin.math.abs(compose.activity.player.position - resumePosition) < 800)
        key(KeyEvent.KEYCODE_BACK); fullScreen()
    }
}
