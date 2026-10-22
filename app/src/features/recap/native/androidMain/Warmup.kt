package com.arenavoca.mobile

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.arenavoca.recap.PracticeCatalog

@Composable internal fun WarmupEntry(sport: String, onOpen: () -> Unit) {
    val count = PracticeCatalog.forSport(sport).size
    OutlinedCard(Modifier.fillMaxWidth().testTag("warmup-entry"), border = androidx.compose.foundation.BorderStroke(1.dp, PlaymakerInk)) {
        Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(if (sport == "f1") "Antes de la carrera" else "Antes del partido",
                style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Text("Optional warm-up · $count vocabulary cards", style = MaterialTheme.typography.bodyMedium)
            TextButton(onClick = onOpen) { Text("Calentemos", fontWeight = FontWeight.Bold) }
            Text("Let’s warm up", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

/** Generic sport vocabulary, available without opening or revealing any match outcome. */
@Composable internal fun WarmupReader(sport: String, onClose: () -> Unit) {
    val phrases = remember(sport) { PracticeCatalog.forSport(sport) }
    var index by rememberSaveable(sport) { mutableIntStateOf(0) }
    val phrase = phrases[index]
    BackHandler(onBack = onClose)
    Surface(Modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize().safeDrawingPadding()) {
            Row(Modifier.padding(horizontal = 12.dp), verticalAlignment = Alignment.CenterVertically) {
                CompactBack("Close warm-up", onClose)
                Text("Calentamiento", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f))
                Text("${index + 1} / ${phrases.size}", Modifier.padding(end = 12.dp), style = MaterialTheme.typography.labelLarge)
            }
            BoxWithConstraints(Modifier.weight(1f)) {
                val panelHeight = (maxHeight - (maxWidth - 32.dp) / 1.5f - 8.dp).coerceAtLeast(0.dp)
                Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(20.dp)) {
                    if (sport == "football" && phrase.id == "pass") {
                        PassingWarmup(panelHeight)
                    } else {
                        SportArtwork("action_${phrase.id}", cornerRadius = 0.dp)
                        ComicCaption(Modifier.padding(horizontal = 20.dp).fillMaxWidth()) {
                        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Text("Hold Spanish for English", style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant)
                            key(phrase.id) { HoldSpanish(phrase.spanish, phrase.english, "warmup-${phrase.id}") }
                        }
                        }
                    }
                }
            }
            Row(Modifier.fillMaxWidth().padding(start = 20.dp, end = 20.dp, top = 10.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                if (index > 0) OutlinedButton(onClick = { index-- }, modifier = Modifier.heightIn(min = 54.dp)) { Text("Previous") }
                Button(onClick = { if (index == phrases.lastIndex) onClose() else index++ },
                    modifier = Modifier.weight(1f).heightIn(min = 54.dp)) { Text(if (index == phrases.lastIndex) "Done" else "Next card") }
            }
            TextButton(onClick = onClose, modifier = Modifier.align(Alignment.CenterHorizontally)) { Text("Skip warm-up") }
        }
    }
}
