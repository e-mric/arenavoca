package com.arenavoca.tv

import androidx.test.platform.app.InstrumentationRegistry
import org.junit.rules.ExternalResource

/** Emulator-only fixture: ordinary launches retain playback, each independent journey starts fresh. */
class PlaybackFixture : ExternalResource() {
    override fun before() {
        InstrumentationRegistry.getInstrumentation().targetContext
            .getSharedPreferences("tv-playback", 0).edit().clear().commit()
    }
}
