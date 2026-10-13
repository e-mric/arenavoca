package com.arenavoca.mobile

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.test.platform.app.InstrumentationRegistry
import android.graphics.Bitmap
import java.io.File
import org.junit.Rule
import org.junit.Test

class MatchMomentsTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()
    private fun tap(label: String) = compose.onNodeWithText(label).performScrollTo().performClick()
    private fun capture(name: String) {
        val bitmap = compose.onRoot().captureToImage().asAndroidBitmap()
        File(InstrumentationRegistry.getInstrumentation().targetContext.filesDir, "match-$name.png").outputStream().use { bitmap.compress(Bitmap.CompressFormat.PNG, 100, it) }
    }
    @Test fun realMomentsRequireRevealAndCarryEvidenceThroughPractice() {
        tap("Explore match moments")
        compose.onNodeWithText("Bale avanza por la izquierda.").assertDoesNotExist()
        compose.onNodeWithText("The run, the pass, the goal").assertDoesNotExist()
        tap("Reveal match moments")
        compose.onNodeWithText("Bale avanza por la izquierda.").performScrollTo().assertIsDisplayed()
        compose.onAllNodesWithText("Why this card?")[0].performScrollTo().performClick()
        compose.onNodeWithText("Commentary · The commentator identifies a run by Gareth Bale with Piqué chasing back.").assertExists()
        tap("The run, the pass, the goal")
        compose.onNodeWithText("Jordi Alba corre al espacio.").performScrollTo().assertIsDisplayed()
        capture("cards")
        tap("Practise this moment")
        compose.onNodeWithText("From the recording · AI checked").assertExists()
        compose.onNodeWithText("Recording 13:28–13:34 · Match 10:21–10:27").assertExists()
        capture("story")
        tap("Next scene"); tap("Next scene"); tap("Try the activities")
        tap("Alba."); tap("Check answer"); tap("Try recalling")
        compose.onNodeWithText("Missing word").performScrollTo().performTextInput("atrás")
        tap("Check word"); tap("Make it your own")
        compose.onNodeWithText("Your Spanish answer").performScrollTo().performTextInput("Me gusta el pase.")
        tap("Compare with an example"); tap("Ready to try elsewhere"); tap("Finish story")
        compose.onNodeWithText("Recall · remembered without a hint").assertExists()
        tap("Done"); tap("Close match moments")
        tap("Explore match moments")
        compose.onNodeWithText("Reveal match moments").assertExists()
        compose.onNodeWithText("Coutinho marca el primer gol.").assertDoesNotExist()
    }
    @Test fun footballPackIsNotShownAsAF1ViewingSession() {
        tap("F1")
        compose.onNodeWithText("Explore match moments").assertDoesNotExist()
        tap("Explore a story")
        compose.onNodeWithText("Fictional practice · not from your recording").assertExists()
    }
}
