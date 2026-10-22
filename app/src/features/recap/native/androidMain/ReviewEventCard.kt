package com.arenavoca.mobile

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.arenavoca.recap.ReviewEvent
import com.arenavoca.recap.eventDateLabel

/** Live status is supplied by a current match source, never inferred from an old recording. */
@Composable internal fun ReviewEventCard(event: ReviewEvent, onOpen: () -> Unit) {
    OutlinedCard(Modifier.fillMaxWidth(), border = androidx.compose.foundation.BorderStroke(1.dp, PlaymakerInk),
        colors = CardDefaults.outlinedCardColors(containerColor = PlaymakerCream)) {
        Column(verticalArrangement = Arrangement.spacedBy(0.dp)) {
            SportArtwork(if (event.id == com.arenavoca.stories.MatchCatalog.pack.source.id) "comic_alba_run" else "playmaker_${event.sport}", cornerRadius = 0.dp)
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                if (event.isLive) Surface(color = MaterialTheme.colorScheme.secondaryContainer, shape = MaterialTheme.shapes.small) {
                    Text("LIVE", Modifier.padding(horizontal = 12.dp, vertical = 6.dp), fontWeight = FontWeight.Bold)
                }
                Text(event.title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.ExtraBold)
                Text(eventDateLabel(event.playedOn), color = MaterialTheme.colorScheme.onSurfaceVariant)
                Text(when {
                    event.isLive -> "${event.cardCount} ${if (event.cardCount == 1) "card" else "cards"} available so far"
                    event.sourceUrl != null -> "0 cards · Review coming soon"
                    else -> event.summary
                })
                val spanish = when {
                    event.isLive -> "Ver los momentos"
                    event.sourceUrl != null -> "Ver la carrera"
                    else -> event.action
                }
                val english = when {
                    event.isLive -> "Explore the moments"
                    event.sourceUrl != null -> "View the race"
                    event.sport == "f1" -> "Let’s review the race"
                    else -> "Let’s review the match"
                }
                Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(4.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Button(onClick = onOpen, modifier = Modifier.fillMaxWidth().heightIn(min = 54.dp)) { Text(spanish, fontWeight = FontWeight.Bold) }
                    Text(english, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}
