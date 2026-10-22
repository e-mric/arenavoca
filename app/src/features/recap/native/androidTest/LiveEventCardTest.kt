package com.arenavoca.mobile

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.test.platform.app.InstrumentationRegistry
import com.arenavoca.recap.ReviewEvent
import android.graphics.Bitmap
import java.io.File
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class LiveEventCardTest {
    @get:Rule val compose = createComposeRule()
    @Test fun liveCardShowsStatusAvailableCountAndBilingualAction() {
        var opened = false
        val fixture = ReviewEvent("live-fixture", "Live match fixture", "football", "2026-10-20", 2, 0, isLive = true)
        compose.setContent { PlaymakerTheme { ReviewEventCard(fixture) { opened = true } } }
        compose.onNodeWithText("LIVE").assertIsDisplayed()
        compose.onNodeWithText("2 cards available so far").assertIsDisplayed()
        compose.onNodeWithText("Explore the moments").assertIsDisplayed()
        val bitmap = compose.onRoot().captureToImage().asAndroidBitmap()
        File(InstrumentationRegistry.getInstrumentation().targetContext.filesDir, "audit-14-live-component-fixture.png").outputStream().use {
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, it)
        }
        compose.onNodeWithText("Ver los momentos").performClick()
        assertTrue(opened)
    }
}
