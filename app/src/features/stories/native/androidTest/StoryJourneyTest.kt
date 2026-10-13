package com.arenavoca.mobile

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.test.platform.app.InstrumentationRegistry
import android.graphics.Bitmap
import java.io.File
import org.junit.Rule
import org.junit.Test

class StoryJourneyTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()
    private fun tap(label: String) = compose.onNodeWithText(label).performScrollTo().performClick()
    private fun capture(name: String) {
        val bitmap = compose.onRoot().captureToImage().asAndroidBitmap()
        File(InstrumentationRegistry.getInstrumentation().targetContext.filesDir, "story-$name.png").outputStream().use {
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, it)
        }
    }
    @Test fun footballStorySupportsHelpReflectionRetryAndReturnToCollection() {
        tap("Try an example recap")
        tap("Explore a story")
        compose.onNodeWithText("Fictional practice · not from your recording").assertExists()
        capture("football")
        tap("Show English")
        compose.onNodeWithText("One minute remains. The blue team is one goal behind. We need a goal to equalise.").assertExists()
        tap("Next scene")
        compose.onNodeWithText("Hide English").assertDoesNotExist()
        tap("Previous scene")
        tap("Next scene"); tap("Next scene"); tap("Try the activities")
        compose.onNodeWithText("Check answer").performScrollTo().assertIsNotEnabled()
        tap("Para ganar.")
        compose.onNodeWithText("Let's look again.").assertDoesNotExist()
        tap("Check answer"); tap("Try recalling")
        compose.onNodeWithText("Check word").performScrollTo().assertIsNotEnabled()
        tap("Give me a hint")
        compose.onNodeWithText("Missing word").performScrollTo().performTextInput("PASA")
        tap("Check word")
        compose.onNodeWithText("Recall · remembered with a hint").assertExists()
        tap("Make it your own")
        compose.onNodeWithText("Compare with an example").performScrollTo().assertIsNotEnabled()
        compose.onNodeWithText("Your Spanish answer").performScrollTo().performTextInput("Necesitamos descansar.")
        tap("Compare with an example")
        compose.onNodeWithText("Finish story").performScrollTo().assertIsNotEnabled()
        tap("Practise this again"); tap("Finish story")
        compose.onNodeWithText("Recognise · reviewed the explanation").assertExists()
        compose.onNodeWithText("Use · wrote your own answer\nNecesitamos descansar.").assertExists()
        capture("summary")
        tap("Read and practise again")
        compose.onNodeWithText("Read · Scene 1 of 3").assertExists()
        tap("Close story")
        compose.onNodeWithText("Your moments").assertExists()
        compose.onNodeWithText("Start recap · 3 questions").assertExists()
    }
    @Test fun racingStoryKeepsItsVocabularyAndUsesUnassistedRecall() {
        tap("F1"); tap("Explore a story")
        compose.onNodeWithText("Time to pit").assertExists()
        capture("f1")
        tap("Next scene"); tap("Next scene"); tap("Try the activities")
        tap("Los neumáticos."); tap("Check answer")
        compose.onNodeWithText("You've got it.").assertExists()
        tap("Try recalling")
        compose.onNodeWithText("El piloto entra en ___.").assertExists()
        compose.onNodeWithText("Missing word").performScrollTo().performTextInput("boxes")
        tap("Check word"); tap("Make it your own")
        compose.onNodeWithText("Your Spanish answer").performScrollTo().performTextInput("Prefiero parar después.")
        tap("Compare with an example"); tap("Ready to try elsewhere"); tap("Finish story")
        compose.onNodeWithText("Recall · remembered without a hint").assertExists()
        compose.onNodeWithText("Use · wrote your own answer\nPrefiero parar después.").assertExists()
        tap("Done")
        compose.onNodeWithText("Race recap").assertExists()
    }
}
