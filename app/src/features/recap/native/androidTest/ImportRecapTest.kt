package com.arenavoca.mobile

import android.net.Uri
import androidx.activity.compose.LocalActivityResultRegistryOwner
import androidx.activity.result.ActivityResultRegistry
import androidx.activity.result.ActivityResultRegistryOwner
import androidx.activity.result.contract.ActivityResultContract
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.core.app.ActivityOptionsCompat
import androidx.test.platform.app.InstrumentationRegistry
import com.arenavoca.recap.RecapLibrary
import java.io.File
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test

/** Stub only the OS picker response; exercise the actual file reader and import callback. */
class ImportRecapTest {
    @get:Rule val compose = createComposeRule()
    private fun showFile(raw: String, library: RecapLibrary): File {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val file = File(context.cacheDir, "recap-import-test.json").apply { writeText(raw) }
        val owner = object : ActivityResultRegistryOwner {
            override val activityResultRegistry = object : ActivityResultRegistry() {
                override fun <I, O> onLaunch(requestCode: Int, contract: ActivityResultContract<I, O>, input: I, options: ActivityOptionsCompat?) {
                    dispatchResult(requestCode, Uri.fromFile(file))
                }
            }
        }
        compose.setContent {
            CompositionLocalProvider(LocalActivityResultRegistryOwner provides owner) {
                MaterialTheme {
                    var status by remember { mutableStateOf("") }
                    ImportRecap(onImport = { status = library.importRecap(it).message }, onError = { status = it })
                    Text(status)
                }
            }
        }
        compose.onNodeWithText("Import saved phrases").performClick()
        return file
    }
    @Test fun selectedFileBecomesAnF1Quiz() {
        val library = RecapLibrary()
        val file = showFile("""{"kind":"arenavoca-recap","version":1,"sourceId":"android-picker-demo","title":"Race recap","sport":"f1","phraseIds":["overtake"],"example":false}""", library)
        try {
            compose.waitUntil(5_000) { compose.onAllNodesWithText("1 saved phrases ready to practise. Existing progress has been kept.").fetchSemanticsNodes().isNotEmpty() }
            compose.runOnIdle {
                val session = library.sessions().single()
                assertEquals("Race recap", session.title)
                assertEquals("overtake", library.startQuiz(session.id)!!.question!!.phraseId)
            }
        } finally { file.delete() }
    }
    @Test fun oversizedFileShowsRecoveryAndLeavesExistingProgressUntouched() {
        val library = RecapLibrary().apply { loadExample("football") }
        val before = library.exportProgress()
        val file = showFile("x".repeat(32_769), library)
        try {
            compose.waitUntil(5_000) { compose.onAllNodesWithText("Could not read this recap file. Choose an ArenaVoca export smaller than 32 KB.").fetchSemanticsNodes().isNotEmpty() }
            compose.runOnIdle { assertEquals(before, library.exportProgress()) }
        } finally { file.delete() }
    }
}
