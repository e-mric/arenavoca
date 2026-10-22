package com.arenavoca.stories

import com.arenavoca.tvlearning.TvSequence
import kotlin.test.*

class ComicRecapTest {
    @Test fun comicUsesGroundedAlbaPhrasesAndNeverExposesFuturePanels() {
        val sequence = TvSequence.alba
        assertTrue(AlbaComic.available(sequence.sourceOffsetSeconds).isEmpty())
        sequence.moments.forEachIndexed { index, moment ->
            val boundary = sequence.sourceOffsetSeconds + moment.endMs / 1000
            assertEquals(index, AlbaComic.available(boundary - 1).size)
            val available = AlbaComic.available(boundary)
            assertEquals(index + 1, available.size)
            assertEquals(moment.phrase.spanish, available.last().spanish)
            assertEquals(moment.phrase.english, available.last().english)
            assertNotNull(AlbaComic.artwork(available.last().id))
        }
        assertEquals(listOf("alba-run", "alba-cutback", "coutinho-goal"), AlbaComic.cards.map { it.id })
        assertNull(AlbaComic.artwork("bale-run"))
        assertTrue(AlbaComic.available(808).isEmpty()) // Seeking back hides future panels again.
    }
}
