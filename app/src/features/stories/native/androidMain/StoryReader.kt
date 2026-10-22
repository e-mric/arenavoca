package com.arenavoca.mobile

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.arenavoca.stories.*

@Composable internal fun StoryEntry(sport: String, onOpen: (SportStory) -> Unit) {
    val story = StoryCatalog.forSport(sport) ?: return
    OutlinedCard(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("Stories between matches", style = MaterialTheme.typography.labelLarge, color = PlaymakerBlue)
            Text(story.title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Text("Fictional practice · 3 scenes\nRead, remember, then make it your own.", style = MaterialTheme.typography.bodyMedium)
            Button(onClick = { onOpen(story) }, modifier = Modifier.heightIn(min = 48.dp)) { Text("Explore a story") }
        }
    }
}

@Composable internal fun StoryReader(story: SportStory, onClose: () -> Unit) {
    var lesson by remember(story.id) { mutableStateOf(StoryLesson(story)) }
    var revision by remember(story.id) { mutableIntStateOf(0) }
    var translated by remember(lesson, lesson.panelIndex, lesson.stage) { mutableStateOf(false) }
    var selected by remember(lesson, lesson.stage) { mutableStateOf("") }
    var answer by remember(lesson, lesson.stage) { mutableStateOf("") }
    var details by remember { mutableStateOf(false) }
    var phraseHelp by remember { mutableStateOf(false) }
    val scroll = rememberScrollState()
    @Suppress("UNUSED_VARIABLE") val observed = revision
    fun update(action: () -> Unit) { action(); revision++ }
    LaunchedEffect(lesson, lesson.stage, lesson.panelIndex) { scroll.scrollTo(0) }
    BackHandler { onClose() }
    Surface(Modifier.fillMaxSize()) {
        Box(contentAlignment = androidx.compose.ui.Alignment.TopCenter) {
            Column(Modifier.widthIn(max = 620.dp).fillMaxSize().safeDrawingPadding().padding(horizontal = 20.dp)) {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    CompactBack("Close story", onClose)
                    Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(story.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        if (lesson.stage == StoryStage.READ) Text("Read · Scene ${lesson.panelIndex + 1} of 3", style = MaterialTheme.typography.bodySmall)
                    }
                    IconButton(onClick = { details = !details }) { Icon(painterResource(R.drawable.ic_more), contentDescription = "Story details") }
                }
                Column(Modifier.weight(1f).verticalScroll(scroll).padding(vertical = 16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                if (details) {
                    Text(story.provenanceLabel, style = MaterialTheme.typography.labelMedium, color = PlaymakerBlue)
                    story.sourceTitle?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
                    Text("Prototype Spanish · awaiting fluent review", style = MaterialTheme.typography.bodySmall)
                }
                when (lesson.stage) {
                    StoryStage.READ -> {
                        val evidence = lesson.panel.evidence
                        if (evidence == null) SportArtwork(lesson.panel.artwork)
                        else key(lesson.panelIndex) {
                            var replay by remember { mutableStateOf(false) }
                            MatchReplayView(evidence, comicMomentArtwork(lesson.panel.artwork), replay, compact = true) { replay = it }
                        }
                        ComicCaption(Modifier.fillMaxWidth()) {
                            Column(Modifier.padding(16.dp)) {
                            Text(lesson.panel.spanish, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                            if (details) lesson.panel.evidence?.let { MatchEvidenceDetails(it) }
                            TextButton(onClick = { translated = !translated }) { Text(if (translated) "Hide English" else "Show English") }
                            if (translated) Text(lesson.panel.english, color = PlaymakerBlue)
                            }
                        }
                        HorizontalDivider()
                        TextButton(onClick = { phraseHelp = !phraseHelp }) { Text("Phrase help") }
                        if (phraseHelp) Text(story.targets.joinToString(" · "), style = MaterialTheme.typography.bodyMedium)
                    }
                    StoryStage.RECOGNISE -> {
                        Text("1 · Recognise", style = MaterialTheme.typography.titleMedium)
                        Text(story.recognitionPrompt, style = MaterialTheme.typography.headlineSmall)
                        Text(story.recognitionHelp)
                        story.choices.forEach { choice ->
                            OutlinedButton(onClick = { selected = choice }, enabled = !lesson.recognitionChecked, modifier = Modifier.fillMaxWidth().heightIn(min = 54.dp)) { Text(if (selected == choice) "$choice · Selected" else choice) }
                        }
                        if (!lesson.recognitionChecked) StoryAction("Check answer", selected.isNotEmpty()) { update { lesson.checkRecognition(selected) } }
                        else {
                            Text(if (lesson.recognitionCorrect) "You've got it." else "Let's look again.", fontWeight = FontWeight.Bold)
                            Text("${story.recognitionAnswer}\n${story.recognitionExplanation}")
                            StoryAction("Try recalling") { update { lesson.advance() } }
                        }
                    }
                    StoryStage.RECALL -> {
                        Text("2 · Recall", style = MaterialTheme.typography.titleMedium)
                        Text("Remember the missing word", style = MaterialTheme.typography.headlineSmall)
                        Text(story.recallPrompt, style = MaterialTheme.typography.titleLarge)
                        OutlinedTextField(answer, { answer = it.take(80) }, label = { Text("Missing word") }, enabled = !lesson.recallChecked, singleLine = true, modifier = Modifier.fillMaxWidth())
                        if (lesson.hintUsed) Text(story.recallHint)
                        if (!lesson.recallChecked) {
                            if (!lesson.hintUsed) TextButton(onClick = { update { lesson.showHint() } }) { Text("Give me a hint") }
                            StoryAction("Check word", answer.isNotBlank()) { update { lesson.checkRecall(answer) } }
                        } else {
                            Text(lesson.recallSummary, fontWeight = FontWeight.Bold)
                            Text(story.recallPrompt.replace("___", story.recallAnswer))
                            StoryAction("Make it your own") { update { lesson.advance() } }
                        }
                    }
                    StoryStage.USE -> {
                        Text("3 · Use", style = MaterialTheme.typography.titleMedium)
                        Text(story.usePrompt, style = MaterialTheme.typography.headlineSmall)
                        Text(story.useHelp)
                        OutlinedTextField(answer, { answer = it.take(280) }, label = { Text("Your Spanish answer") }, enabled = !lesson.modelRevealed, modifier = Modifier.fillMaxWidth(), minLines = 2)
                        Text("Your own answer can be different. This is self-practice, with no automatic grading.", style = MaterialTheme.typography.bodySmall)
                        if (!lesson.modelRevealed) StoryAction("Compare with an example", answer.isNotBlank()) { update { lesson.revealModel(answer) } }
                        else {
                            Text("One possible answer", style = MaterialTheme.typography.labelLarge, color = PlaymakerBlue)
                            Text(story.modelAnswer, style = MaterialTheme.typography.titleLarge)
                            Text(story.transfer)
                            Text("How do you feel about your answer?")
                            listOf(false to "Ready to try elsewhere", true to "Practise this again").forEach { (needsPractice, label) ->
                                FilterChip(lesson.reflection == label, { update { lesson.reflect(needsPractice) } }, { Text(label) })
                            }
                            StoryAction("Finish story", lesson.canContinue) { update { lesson.advance() } }
                        }
                    }
                    StoryStage.SUMMARY -> {
                        Text("A story to remember", style = MaterialTheme.typography.headlineSmall)
                        Text(lesson.recognitionSummary)
                        Text(lesson.recallSummary)
                        Text("Use · wrote your own answer\n${lesson.response}")
                        Text("Your reflection · ${lesson.reflection}")
                        Text("This is a practice attempt, not a language level. This story attempt is not saved.", style = MaterialTheme.typography.bodySmall)
                        StoryAction("Read and practise again") { lesson = StoryLesson(story) }
                        TextButton(onClick = onClose) { Text("Done") }
                    }
                }
                }
                if (lesson.stage == StoryStage.READ) Row(Modifier.fillMaxWidth().padding(vertical = 12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    if (lesson.panelIndex > 0) CompactBack("Previous scene") { update { lesson.previousPanel() } }
                    Button(onClick = { update { lesson.advance() } }, modifier = Modifier.weight(1f).heightIn(min = 54.dp)) {
                        Text(if (lesson.panelIndex == 2) "Try the activities" else "Next scene")
                    }
                }
            }
        }
    }
}

@Composable private fun StoryAction(label: String, enabled: Boolean = true, onClick: () -> Unit) {
    Button(onClick, enabled = enabled, modifier = Modifier.fillMaxWidth().heightIn(min = 54.dp)) { Text(label, fontWeight = FontWeight.Bold) }
}
