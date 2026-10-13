package com.arenavoca.mobile

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import org.junit.Rule
import org.junit.Test
import androidx.compose.ui.graphics.asAndroidBitmap
import android.graphics.Bitmap
import androidx.test.platform.app.InstrumentationRegistry
import java.io.File

class RecapJourneyTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()
    private fun capture(name: String) {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val bitmap = compose.onRoot().captureToImage().asAndroidBitmap()
        File(context.filesDir, "playmaker-$name.png").outputStream().use { bitmap.compress(Bitmap.CompressFormat.PNG, 100, it) }
    }
    @Test fun completeRecapAndRetryOnlyTheMissedPhrase() {
        capture("home")
        compose.onNodeWithText("Try an example recap").performScrollTo().performClick()
        capture("collection-football")
        compose.onNodeWithText("Start recap · 3 questions").performScrollTo().performClick()
        compose.onNodeWithText("Match recap").assertIsDisplayed()
        capture("quiz")
        compose.onNodeWithText("Check answer").performScrollTo().assertIsNotEnabled()
        compose.onNodeWithContentDescription("The player shoots.").performScrollTo().performClick()
        compose.onNodeWithText("Check answer").performScrollTo().performClick()
        compose.onNodeWithText("One to practise.").performScrollTo().assertIsDisplayed()
        compose.onNodeWithText("Next phrase").performScrollTo().performClick()
        compose.onNodeWithContentDescription("The player shoots.").performScrollTo().performClick()
        compose.onNodeWithText("Check answer").performScrollTo().performClick()
        compose.onNodeWithText("Next phrase").performScrollTo().performClick()
        compose.onNodeWithContentDescription("The goalkeeper saves the ball.").performScrollTo().performClick()
        compose.onNodeWithText("Check answer").performScrollTo().performClick()
        compose.onNodeWithText("See my recap").performScrollTo().performClick()
        compose.onNodeWithText("2 / 3").performScrollTo().assertIsDisplayed()
        compose.onNodeWithText("Practise missed phrases").performScrollTo().performClick()
        compose.onNodeWithText("A night of football · 1 of 1").assertExists()
        compose.onNodeWithContentDescription("The player passes the ball.").performScrollTo().performClick()
        compose.onNodeWithText("Check answer").performScrollTo().performClick()
        compose.onNodeWithText("See my recap").performScrollTo().performClick()
        compose.onNodeWithText("1 / 1").performScrollTo().assertIsDisplayed()
    }
    @Test fun racingPicturesHaveATextAlternativeAndRequireExplicitConfirmation() {
        compose.onNodeWithText("F1").performScrollTo().performClick()
        compose.onNodeWithText("Try an example recap").performScrollTo().performClick()
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
        compose.onNodeWithText("Try an example recap").performScrollTo().performClick()
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
        compose.onNodeWithText("A night of football\n1 saved · Example").performScrollTo().performClick()
        compose.onNodeWithContentDescription("Remove saved phrase: ${phrases[0]}").assertExists()
        compose.onNodeWithContentDescription("Save phrase: ${phrases[1]}").assertExists()
        compose.onNodeWithText("Start recap · 1 questions").performScrollTo().performClick()
        compose.onNodeWithText("A night of football · 1 of 1").assertExists()
        compose.onNodeWithText("Leave practice").performScrollTo().performClick()
        // Restore the example for subsequent manual review.
        phrases.drop(1).forEach { phrase ->
            compose.onNodeWithContentDescription("Save phrase: $phrase").performScrollTo().performClick()
        }
    }

}
