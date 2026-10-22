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
    private fun tap(label: String) {
        if (compose.onAllNodesWithText(label).fetchSemanticsNodes().isNotEmpty()) {
            val node = compose.onNodeWithText(label)
            if (!node.isDisplayed()) node.performScrollTo()
            node.performClick()
        }
        else compose.onNodeWithContentDescription(label).performClick()
    }
    private fun capture(name: String) {
        val bitmap = compose.onRoot().captureToImage().asAndroidBitmap()
        File(InstrumentationRegistry.getInstrumentation().targetContext.filesDir, "match-$name.png").outputStream().use { bitmap.compress(Bitmap.CompressFormat.PNG, 100, it) }
    }
    @Test fun realMomentsOpenDirectlyAndCarryEvidenceThroughPractice() {
        tap("Repasemos el partido")
        compose.onNodeWithText("Bale avanza por la izquierda.").assertDoesNotExist()
        compose.onNodeWithText("The run, the pass, the goal").assertDoesNotExist()

        compose.onNodeWithTag("open-bale-run").performScrollTo().performClick()
        compose.onNodeWithText("Bale avanza por la izquierda.").performScrollTo().assertIsDisplayed()
        tap("Card details"); tap("Why this card?")
        compose.onNodeWithText("Commentary · The commentator identifies a run by Gareth Bale with Piqué chasing back.").assertExists()
        tap("Back to moments");
        compose.onNodeWithTag("open-alba-run").performScrollTo().performClick()
        compose.onNodeWithText("Jordi Alba corre al espacio.").performScrollTo().assertIsDisplayed()
        capture("cards")
        tap("Practise")
        tap("Story details")
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
        tap("Done"); tap("Back to moments"); tap("Close match moments")
        tap("Repasemos el partido")
        compose.onNodeWithText("Cards 6").assertIsDisplayed()
        compose.onNodeWithText("Reveal match moments").assertDoesNotExist()
        compose.onNodeWithText("Coutinho marca el primer gol.").assertDoesNotExist()
    }

    @Test fun singleCardRevealsMeaningAndPersistsLocalSave() {
        tap("Repasemos el partido")
        compose.onNodeWithText("Alba pasa el balón hacia atrás.").assertDoesNotExist()
        compose.onNodeWithTag("open-alba-cutback").performScrollTo().performClick()
        val card = com.arenavoca.stories.MatchCatalog.pack.cards.single { it.id == "alba-cutback" }
        compose.onNodeWithTag("match-phrase").assertTextEquals(card.spanish)
        compose.onNodeWithText(card.english).assertDoesNotExist()
        tap("Show meaning")
        compose.onNodeWithTag("match-phrase").assertTextEquals(card.english)
        compose.onNodeWithText(card.spanish).assertDoesNotExist()
        tap("Show Spanish")
        val saveLabel = if (compose.onAllNodesWithContentDescription("Saved").fetchSemanticsNodes().isNotEmpty()) "Saved" else "Save"
        tap(saveLabel)
        compose.waitUntil(5_000) { compose.onAllNodesWithText("Saved on this phone").fetchSemanticsNodes().isNotEmpty() }
        compose.activityRule.scenario.recreate()
        tap("Repasemos el partido")
        compose.onNodeWithText("Cards 6").assertIsDisplayed()
        compose.onNodeWithTag("open-alba-cutback").performScrollTo().performClick()
        compose.onNodeWithContentDescription("Saved").assertIsDisplayed()
        compose.onNodeWithTag("match-phrase").assertTextEquals(card.spanish)
    }
    @Test fun footballPackIsNotShownAsAF1ViewingSession() {
        tap("F1")
        compose.onNodeWithText("Repasemos el partido").assertDoesNotExist()
        tap("Calentemos")
        compose.onNodeWithText("El piloto adelanta.").assertExists()
        compose.onNodeWithText("Jordi Alba corre al espacio.").assertDoesNotExist()
        tap("Close warm-up")
    }

    @Test fun collectionTabsAndNextCardKeepContentAndTranslationSeparate() {
        val pack = com.arenavoca.stories.MatchCatalog.pack
        tap("Repasemos el partido")
        tap("Stories 2")
        compose.onNodeWithText(pack.stories.first().title).assertExists()
        capture("stories-tab")
        tap("Cards 6")
        compose.onNodeWithTag("open-alba-cutback").performScrollTo().performClick()
        tap(if (compose.onAllNodesWithContentDescription("Saved").fetchSemanticsNodes().isNotEmpty()) "Saved" else "Save")
        compose.waitUntil(5_000) { compose.onAllNodesWithText("Saved on this phone").fetchSemanticsNodes().isNotEmpty() }
        tap("Show meaning")
        tap("Next card")
        compose.onNodeWithTag("match-phrase").assertTextEquals(pack.cards.last().spanish)
        compose.onNodeWithText("Show meaning").assertIsDisplayed()
        compose.onNodeWithText("Saved on this phone").assertDoesNotExist()
        capture("last-card")
        compose.onNodeWithText("Back to moments").performClick()
        val savedTab = compose.onAllNodes(hasText("Saved ", substring = true) and hasClickAction()).onFirst()
        savedTab.performClick()
        compose.onNodeWithTag("open-alba-cutback").assertExists()
        capture("saved-tab")
        tap("About this match")
        compose.onNodeWithText("Prepared from selected passages", substring = true).assertExists()
        capture("about")
        tap("Stories 2")
        tap(pack.stories.first().title)
        compose.onNodeWithText("Next scene").assertIsDisplayed()
        capture("story-reading")
    }
}
