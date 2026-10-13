package com.arenavoca.mobile

import android.view.View
import android.view.ViewGroup
import android.widget.VideoView
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.lifecycle.Lifecycle
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test

class MatchReplayTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()
    private fun tap(label: String) = compose.onNodeWithText(label).performScrollTo().performClick()
    private fun players(view: View): List<VideoView> = when (view) {
        is VideoView -> listOf(view)
        is ViewGroup -> (0 until view.childCount).flatMap { players(view.getChildAt(it)) }
        else -> emptyList()
    }
    private fun player(): VideoView = players(compose.activity.window.decorView).single()
    private fun waitForPlayback() = compose.waitUntil(10_000) {
        var progressed = false
        compose.runOnIdle { progressed = players(compose.activity.window.decorView).singleOrNull()?.let { it.isPlaying && it.currentPosition > 200 } == true }
        progressed
    }
    @Test fun actualVideoPlaysPausesEndsAndStopsWhenSwitchingOrLeaving() {
        tap("Explore match moments"); tap("Reveal match moments")
        compose.runOnIdle { assertTrue(players(compose.activity.window.decorView).isEmpty()) }
        compose.onNodeWithTag("watch-match_640_646").performScrollTo().performClick()
        waitForPlayback()
        tap("Pause replay")
        compose.runOnIdle { assertFalse(player().isPlaying) }
        tap("Play replay"); waitForPlayback()
        compose.activityRule.scenario.moveToState(Lifecycle.State.CREATED)
        compose.activityRule.scenario.moveToState(Lifecycle.State.RESUMED)
        compose.onNodeWithText("Replay paused").assertExists()
        compose.runOnIdle { assertFalse(player().isPlaying) }
        compose.onNodeWithTag("watch-match_646_648").performScrollTo().performClick()
        waitForPlayback()
        compose.runOnIdle { assertEquals(1, players(compose.activity.window.decorView).size) }
        compose.waitUntil(8_000) { compose.onAllNodesWithText("Replay finished").fetchSemanticsNodes().isNotEmpty() }
        tap("Replay again"); waitForPlayback()
        tap("Practise this moment")
        compose.runOnIdle { assertTrue(players(compose.activity.window.decorView).isEmpty()) }
        compose.onNodeWithTag("watch-match_640_646").performScrollTo().performClick()
        waitForPlayback()
        tap("Next scene")
        compose.runOnIdle { assertTrue(players(compose.activity.window.decorView).isEmpty()) }
        compose.onNodeWithText("Watch match moment").assertExists()
        tap("Close story"); tap("Close match moments")
        compose.runOnIdle { assertTrue(players(compose.activity.window.decorView).isEmpty()) }
    }
}
