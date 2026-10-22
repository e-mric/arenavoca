package com.arenavoca.mobile

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import org.junit.After
import org.junit.Rule
import org.junit.Test
import androidx.compose.ui.graphics.asAndroidBitmap
import android.graphics.Bitmap
import androidx.test.platform.app.InstrumentationRegistry
import java.io.File

class RecapJourneyTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()
    private var fixture: SavedSessionFixture? = null
    @After fun restoreSavedProgress() { fixture?.close() }
    private fun openSaved(sport: String = "football") {
        if (fixture == null) {
            fixture = SavedSessionFixture(compose.activity, sport)
            compose.activityRule.scenario.recreate()
        }
        if (sport == "f1") compose.onNodeWithText("F1").performScrollTo().performClick()
        compose.onAllNodesWithText(if (sport == "f1") "Repasemos la carrera" else "Repasemos el partido").onLast().performScrollTo().performClick()
    }
    private fun capture(name: String) {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val bitmap = compose.onRoot().captureToImage().asAndroidBitmap()
        File(context.filesDir, "playmaker-$name.png").outputStream().use { bitmap.compress(Bitmap.CompressFormat.PNG, 100, it) }
    }
    @Test fun completeRecapAndRetryOnlyTheMissedPhrase() {
        capture("home")
        openSaved()
        capture("collection-football")
        compose.onNodeWithText("Start recap · 3 questions").performScrollTo().performClick()
        compose.onNodeWithText("Match recap").assertIsDisplayed()
        capture("quiz")
        compose.onNodeWithText("Check answer").performScrollTo().assertIsNotEnabled()
        compose.onNodeWithContentDescription("The player shoots.").performScrollTo().performClick()
        compose.onNodeWithText("Check answer").performScrollTo().performClick()
        compose.onNodeWithText("One to practise.").performScrollTo().assertIsDisplayed()
        capture("recap-feedback")
        compose.onNodeWithText("Next phrase").performScrollTo().performClick()
        compose.onNodeWithContentDescription("The player shoots.").performScrollTo().performClick()
        compose.onNodeWithText("Check answer").performScrollTo().performClick()
        compose.onNodeWithText("Next phrase").performScrollTo().performClick()
        compose.onNodeWithContentDescription("The goalkeeper saves the ball.").performScrollTo().performClick()
        compose.onNodeWithText("Check answer").performScrollTo().performClick()
        compose.onNodeWithText("See my recap").performScrollTo().performClick()
        compose.onNodeWithText("2 / 3").performScrollTo().assertIsDisplayed()
        capture("recap-result")
        compose.onNodeWithText("Practise missed phrases").performScrollTo().performClick()
        compose.onNodeWithText("Saved football practice · 1 of 1").assertExists()
        compose.onNodeWithContentDescription("The player passes the ball.").performScrollTo().performClick()
        compose.onNodeWithText("Check answer").performScrollTo().performClick()
        compose.onNodeWithText("See my recap").performScrollTo().performClick()
        compose.onNodeWithText("1 / 1").performScrollTo().assertIsDisplayed()
    }
    @Test fun racingPicturesHaveATextAlternativeAndRequireExplicitConfirmation() {
        openSaved("f1")
        capture("collection-f1")
        compose.onNodeWithText("Start recap · 3 questions").performScrollTo().performClick()
        compose.onNodeWithContentDescription("The driver overtakes.").performScrollTo().performClick()
        compose.onNodeWithText("You've got it.").assertDoesNotExist()
        compose.onNodeWithText("Show text answers").performScrollTo().performClick()
        compose.onNodeWithText("The driver overtakes. · Selected").assertExists()
        compose.onNodeWithText("Check answer").performScrollTo().performClick()
        compose.onNodeWithText("You've got it.").performScrollTo().assertIsDisplayed()
    }

    @Test fun collectionSaveControlsUpdateThePracticeSetAndSurviveReopening() {
        openSaved()
        val phrases = listOf("El jugador pasa el balón.", "El jugador dispara.", "El portero para el balón.")
        phrases.forEach { phrase ->
            compose.onNodeWithContentDescription("Remove saved phrase: $phrase").performScrollTo().performClick()
            compose.onNodeWithContentDescription("Save phrase: $phrase").assertExists()
        }
        compose.onNodeWithText("Start recap · 0 questions").performScrollTo().assertIsNotEnabled()
        compose.onNodeWithText("Save a phrase to start your recap.").assertExists()
        compose.onNodeWithContentDescription("Save phrase: ${phrases[0]}").performScrollTo().performClick()
        compose.onNodeWithText("Start recap · 1 questions").performScrollTo().assertIsEnabled()
        compose.activityRule.scenario.recreate()
        openSaved()
        compose.onNodeWithContentDescription("Remove saved phrase: ${phrases[0]}").assertExists()
        compose.onNodeWithContentDescription("Save phrase: ${phrases[1]}").assertExists()
        compose.onNodeWithText("Start recap · 1 questions").performScrollTo().performClick()
        compose.onNodeWithText("Saved football practice · 1 of 1").assertExists()
        compose.onNodeWithText("Leave practice").performScrollTo().performClick()
        // Restore the fixture practice set.
        phrases.drop(1).forEach { phrase ->
            compose.onNodeWithContentDescription("Save phrase: $phrase").performScrollTo().performClick()
        }
    }

}
