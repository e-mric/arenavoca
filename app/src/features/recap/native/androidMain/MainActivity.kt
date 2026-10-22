package com.arenavoca.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.BackHandler
import androidx.core.view.WindowCompat
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.arenavoca.recap.*
import com.arenavoca.stories.SportStory

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.getInsetsController(window, window.decorView).apply {
            isAppearanceLightStatusBars = true
            isAppearanceLightNavigationBars = true
        }
        val storage = getSharedPreferences("recap", MODE_PRIVATE)
        setContent {
            val library = remember { RecapLibrary(storage.getString("progress", "") ?: "") }
            var revision by remember { mutableIntStateOf(0) }
            var notice by remember { mutableStateOf(library.warning) }
            var session by remember { mutableStateOf<WatchedSession?>(null) }
            var quiz by remember { mutableStateOf<Quiz?>(null) }
            var story by remember { mutableStateOf<SportStory?>(null) }
            var matchMoments by remember { mutableStateOf(false) }
            var sport by remember { mutableStateOf("football") }
            var warmup by remember { mutableStateOf(false) }
            var racePreview by remember { mutableStateOf<ReviewEvent?>(null) }
            fun save() {
                if (!storage.edit().putString("progress", library.exportProgress()).commit()) notice = "Device storage unavailable. Progress may not survive reopening."
                revision++
            }
            val accent = PlaymakerBlue
            PlaymakerTheme {
                if (warmup) {
                    WarmupReader(sport) { warmup = false }
                } else if (matchMoments) {
                    MatchMomentsReader { matchMoments = false }
                } else if (story != null) {
                    StoryReader(story!!) { story = null }
                } else {
                val scrollState = rememberScrollState()
                Surface(Modifier.fillMaxSize()) {
                  Box(contentAlignment = Alignment.TopCenter) {
                    Column(Modifier.widthIn(max = 620.dp).fillMaxWidth().safeDrawingPadding().verticalScroll(scrollState).padding(24.dp), verticalArrangement = Arrangement.spacedBy(18.dp)) {
                        @Suppress("UNUSED_VARIABLE") val currentRevision = revision
                        Text("ArenaVoca", color = accent, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black)
                        Text(if (quiz != null) "Match recap" else if (session != null) "Your moments" else if (racePreview != null) "Your race" else "Make your\nSpanish move.", style = if (quiz == null && session == null && racePreview == null) MaterialTheme.typography.headlineMedium else MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold)
                        if (notice.isNotBlank()) Text(notice)
                        val attempt = quiz
                        val active = session
                        LaunchedEffect(active?.id, attempt, attempt?.index, racePreview?.id) { scrollState.scrollTo(0) }
                        when {
                            attempt != null -> {
                                if (attempt.complete) {
                                    Text("${attempt.correct} / ${attempt.total}", style = MaterialTheme.typography.displayLarge, color = accent)
                                    Text("A little more Spanish, from a sport you know.")
                                    Text("This is an attempt score, not a language level.")
                                    if (attempt.retryMistakes() != null) Action("Practise missed phrases") { quiz = attempt.retryMistakes() }
                                    Action("Back to collection") { quiz = null }
                                } else {
                                    val question = attempt.question!!
                                    var selected by remember(attempt, attempt.index) { mutableStateOf<String?>(null) }
                                    var textAnswers by remember { mutableStateOf(false) }
                                    Text("${active!!.title} · ${attempt.index + 1} of ${attempt.total}")
                                    LinearProgressIndicator(progress = { attempt.index.toFloat() / attempt.total }, modifier = Modifier.fillMaxWidth())
                                    Text("Find the action", style = MaterialTheme.typography.titleLarge)
                                    Card { Text(question.prompt, Modifier.padding(24.dp), style = MaterialTheme.typography.headlineMedium) }
                                    TextButton(onClick = { textAnswers = !textAnswers }) { Text(if(textAnswers) "Use pictures" else "Show text answers") }
                                    question.visualChoices().chunked(2).forEachIndexed { row, choices ->
                                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                            choices.forEachIndexed { column, choice ->
                                                VisualAnswer(choice, row * 2 + column + 1, selected == choice.answer, attempt.feedback == null, textAnswers, Modifier.weight(1f)) { selected = choice.answer }
                                            }
                                            if (choices.size == 1) Spacer(Modifier.weight(1f))
                                        }
                                    }
                                    if (attempt.feedback == null) Action("Check answer", selected != null) { selected?.let { attempt.answer(it); revision++ } }
                                    attempt.feedback?.let { feedback ->
                                        Card { Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                            Text(if (feedback.correct) "You've got it." else "One to practise.", color = accent)
                                            Text(feedback.answer); Text(feedback.explanation)
                                        } }
                                        Action(if (attempt.index + 1 == attempt.total) "See my recap" else "Next phrase") {
                                            attempt.next(); if (attempt.complete) library.record(attempt); save()
                                        }
                                    }
                                    TextButton(onClick = { quiz = null }) { Text("Leave practice") }
                                }
                            }
                            active != null -> {
                                Text(active.title, style = MaterialTheme.typography.titleLarge)
                                Text(if (active.example) "General vocabulary practice" else if (active.imported) "Imported from your viewing session · manually saved phrases" else "Manually selected vocabulary from your session", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                val saved = library.savedPhraseIds(active.id)
                                Action("Start recap · ${saved.size} questions", saved.isNotEmpty()) { quiz = library.startQuiz(active.id) }
                                if (saved.isEmpty()) Text("Save a phrase to start your recap.")
                                StoryEntry(active.sport) { story = it }
                                Text("${saved.size} phrases saved · Spanish through sport", style = MaterialTheme.typography.labelLarge, color = accent)
                                val columns = if (LocalConfiguration.current.screenWidthDp < 360 || LocalDensity.current.fontScale > 1.25f) 1 else 2
                                library.phrases(active.sport).chunked(columns).forEach { phrases ->
                                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                        phrases.forEach { phrase ->
                                            PhraseCard(phrase, phrase.id in saved, Modifier.weight(1f)) {
                                                if (phrase.id in saved) library.remove(active.id, phrase.id) else library.save(active.id, phrase.id)
                                                save()
                                            }
                                        }
                                        if (phrases.size < columns) Spacer(Modifier.weight(1f))
                                    }
                                }
                                TextButton(onClick = { session = null }) { Text("All sessions") }
                            }
                            racePreview != null -> {
                                val race = racePreview!!
                                SportArtwork("playmaker_f1")
                                Text(race.title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                                Text(eventDateLabel(race.playedOn))
                                Text("Learning cards coming soon", style = MaterialTheme.typography.titleLarge)
                                Text("This race is in your collection. Its moments and stories are not ready yet.")
                                val uriHandler = androidx.compose.ui.platform.LocalUriHandler.current
                                Action("Ver los mejores momentos") { uriHandler.openUri(race.sourceUrl!!) }
                                Text("Watch the highlights", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                TextButton(onClick = { racePreview = null }) { Text("Back to games") }
                            }
                            else -> {
                                val events = reviewEvents(library, sport)
                                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                    FilterChip(sport == "football", { sport = "football" }, { Text("Football") })
                                    FilterChip(sport == "f1", { sport = "f1" }, { Text("F1") })
                                }
                                events.forEachIndexed { index, event ->
                                    if (index == 1) Text("Previous games", style = MaterialTheme.typography.titleLarge)
                                    ReviewEventCard(event) {
                                        when {
                                            event.session != null -> session = event.session
                                            event.sourceUrl != null -> racePreview = event
                                            else -> matchMoments = true
                                        }
                                    }
                                }
                                WarmupEntry(sport) { warmup = true }
                            }
                        }
                        Text("Prototype Spanish · awaiting fluent review", style = MaterialTheme.typography.labelSmall)
                    }
                }
                }
                BackHandler(session != null || quiz != null || racePreview != null) { if (quiz != null) quiz = null else if (session != null) session = null else if (racePreview != null) racePreview = null }
                }
            }
        }
    }
}
@Composable private fun Action(label: String, enabled: Boolean = true, onClick: () -> Unit) {
    Button(onClick = onClick, enabled = enabled, modifier = Modifier.fillMaxWidth().heightIn(min = 54.dp)) { Text(label, fontWeight = FontWeight.Bold) }
}
