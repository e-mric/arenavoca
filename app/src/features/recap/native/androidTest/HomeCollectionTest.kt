package com.arenavoca.mobile

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.test.platform.app.InstrumentationRegistry
import android.graphics.Bitmap
import java.io.File
import org.junit.Rule
import org.junit.Test

class HomeCollectionTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()
    private fun tap(label: String) {
        if (compose.onAllNodesWithText(label).fetchSemanticsNodes().isNotEmpty()) {
            val node = compose.onNodeWithText(label)
            if (!node.isDisplayed()) node.performScrollTo()
            node.performClick()
        }
        else compose.onNodeWithContentDescription(label).performClick()
    }
    private fun capture(name: String) {
        compose.waitForIdle()
        val bitmap = compose.onRoot().captureToImage().asAndroidBitmap()
        File(InstrumentationRegistry.getInstrumentation().targetContext.filesDir, "audit-$name.png").outputStream().use {
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, it)
        }
    }
    @Test fun eventHomeUsesRealDatesAndPendingRaceNeverOpensUnrelatedCards() {
        compose.onNodeWithText("Barcelona vs Madrid").assertExists()
        compose.onNodeWithText("28 October 2018").assertExists()
        compose.onNodeWithText("6 cards · 2 stories").assertExists()
        compose.onNodeWithText("Let’s review the match").assertExists()
        compose.onNodeWithText("LIVE").assertDoesNotExist()
        compose.onNodeWithText("Try an example recap").assertDoesNotExist()
        capture("01-home-football")
        tap("F1")
        compose.onNodeWithText("Marina Bay").assertExists()
        compose.onNodeWithText("11 October 2026").assertExists()
        compose.onNodeWithText("0 cards · Review coming soon").assertExists()
        capture("02-home-f1")
        tap("Ver la carrera")
        compose.onNodeWithText("Learning cards coming soon").assertExists()
        compose.onNodeWithText("El piloto adelanta.").assertDoesNotExist()
        capture("03-race-pending")
        tap("Back to games"); tap("Football"); tap("Repasemos el partido")
        capture("05-moments")
        compose.onNodeWithTag("open-alba-cutback").performScrollTo().performClick()
        capture("06-card-spanish")
        tap("Show meaning"); capture("07-card-meaning")
        tap("Show Spanish"); tap("Card details"); tap("Why this card?"); capture("08-card-evidence")
        tap("Back to moments"); tap("Close match moments")
        compose.onNodeWithText("More options").assertDoesNotExist()
        compose.onNodeWithText("Import saved phrases").assertDoesNotExist()
        compose.onNodeWithText("Game name").assertDoesNotExist()
        compose.onNodeWithText("Optional warm-up · 3 vocabulary cards").performScrollTo().assertIsDisplayed()
        capture("09-optional-warmup")
        tap("Calentemos")
        compose.onNodeWithText("El jugador pasa el balón.").assertExists()
        capture("10-warmup")
        tap("Close warm-up")
        tap("Repasemos el partido")
        compose.onNodeWithText("Cards 6").assertIsDisplayed()
        compose.onNodeWithText("Reveal match moments").assertDoesNotExist()
    }
}
