package com.arenavoca.mobile

import android.content.Context
import com.arenavoca.recap.PracticeCatalog
import com.arenavoca.recap.RecapLibrary

/** Legacy saved-session regression fixture; does not restore removed home controls. */
internal class SavedSessionFixture(context: Context, sport: String) : AutoCloseable {
    private val storage = context.getSharedPreferences("recap", 0)
    private val original = storage.getString("progress", null)
    init {
        val library = RecapLibrary()
        val session = library.createSession(if (sport == "football") "Saved football practice" else "Saved race practice", sport)!!
        PracticeCatalog.forSport(sport).forEach { library.save(session.id, it.id) }
        check(storage.edit().putString("progress", library.exportProgress()).commit())
    }
    override fun close() { storage.edit().putString("progress", original).commit() }
}
