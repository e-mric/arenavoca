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
    private fun tap(label: String) {
        if (compose.onAllNodesWithText(label).fetchSemanticsNodes().isNotEmpty()) {
            val node = compose.onNodeWithText(label)
            if (!node.isDisplayed()) node.performScrollTo()
            node.performClick()
        }
        else compose.onNodeWithContentDescription(label).performClick()
    }
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
        tap("Repasemos el partido");
        compose.onNodeWithTag("open-bale-run").performScrollTo().performClick()
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
        tap("Back to moments")
        compose.onNodeWithTag("open-bale-cross").performScrollTo().performClick()
        compose.onNodeWithTag("watch-match_646_648").performScrollTo().performClick()
        waitForPlayback()
        compose.runOnIdle { assertEquals(1, players(compose.activity.window.decorView).size) }
        compose.waitUntil(8_000) { compose.onAllNodesWithText("Replay finished").fetchSemanticsNodes().isNotEmpty() }
        tap("Replay again"); waitForPlayback()
        tap("Practise")
        compose.runOnIdle { assertTrue(players(compose.activity.window.decorView).isEmpty()) }
        compose.onNodeWithTag("watch-match_640_646").performScrollTo().performClick()
        waitForPlayback()
        tap("Next scene")
        compose.runOnIdle { assertTrue(players(compose.activity.window.decorView).isEmpty()) }
        compose.onNodeWithText("Replay").assertExists()
        tap("Close story"); tap("Back to moments"); tap("Close match moments")
        compose.runOnIdle { assertTrue(players(compose.activity.window.decorView).isEmpty()) }
    }
}
