package com.arenavoca.mobile

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import org.junit.Rule
import org.junit.Test

class WarmupTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()
    private fun tap(text: String) {
        val node = compose.onNodeWithText(text)
        if (!node.isDisplayed()) node.performScrollTo()
        node.performClick()
    }
    @Test fun optionalWarmupIsSportSpecificAndNeverGatesOrSpoilsTheMatch() {
        compose.onNodeWithText("More options").assertDoesNotExist()
        compose.onNodeWithText("Import saved phrases").assertDoesNotExist()
        compose.onNodeWithText("Add to my games").assertDoesNotExist()
        compose.onNodeWithText("Vocabulary practice").assertDoesNotExist()
        tap("Repasemos el partido") // Works before any warm-up.
        compose.onNodeWithText("Cards 6").assertIsDisplayed()
        compose.onNodeWithText("Reveal match moments").assertDoesNotExist()
        compose.onNodeWithContentDescription("Close match moments").performClick()
        tap("Calentemos")
        compose.onNodeWithText("1 / 3").assertExists()
        compose.onNodeWithText("The player passes the ball.").assertDoesNotExist()
        val caption = compose.onNodeWithTag("comic-spanish-warmup-pass")
        compose.mainClock.autoAdvance = false
        caption.performTouchInput { down(center) }
        compose.mainClock.advanceTimeBy(650)
        compose.onNodeWithText("The player passes the ball.").assertIsDisplayed()
        caption.performTouchInput { up() }
        compose.mainClock.advanceTimeByFrame()
        compose.onNodeWithText("The player passes the ball.").assertDoesNotExist()
        compose.mainClock.autoAdvance = true
        tap("Next card")
        compose.onNodeWithText("El jugador dispara.").assertExists()
        compose.onNodeWithText("The player shoots.").assertDoesNotExist()
        tap("Next card")
        compose.onNodeWithText("El portero para el balón.").assertExists()
        compose.onNodeWithText("Coutinho marca el primer gol.").assertDoesNotExist()
        tap("Done")
        tap("F1"); tap("Calentemos")
        compose.onNodeWithText("El piloto adelanta.").assertExists()
        compose.onNodeWithText("El jugador pasa el balón.").assertDoesNotExist()
        compose.onNodeWithContentDescription("Close warm-up").performClick() // No completion requirement.
        tap("Ver la carrera")
        compose.onNodeWithText("Learning cards coming soon").assertExists()
    }
}
