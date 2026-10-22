package com.arenavoca.mobile

import androidx.compose.foundation.Image
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.semantics.*
import com.arenavoca.recap.Phrase
import com.arenavoca.recap.VisualChoice

internal val PlaymakerBlue = Color(0xFF1646ED)
internal val PlaymakerInk = Color(0xFF142352)
internal val PlaymakerCream = Color(0xFFFFFAF2)

@Composable internal fun PlaymakerTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = lightColorScheme(
        primary = PlaymakerBlue, onPrimary = Color.White,
        primaryContainer = Color(0xFFDDD8FF), onPrimaryContainer = PlaymakerInk,
        secondary = Color(0xFF934530), secondaryContainer = Color(0xFFFFC4B7),
        onSecondaryContainer = PlaymakerInk, background = PlaymakerCream,
        onBackground = PlaymakerInk, surface = PlaymakerCream,
        onSurface = PlaymakerInk, surfaceVariant = Color(0xFFECE8FC),
        onSurfaceVariant = Color(0xFF4E5268), outline = Color(0xFF74788B)
    ), shapes = Shapes(small = RoundedCornerShape(4.dp), medium = RoundedCornerShape(8.dp), large = RoundedCornerShape(12.dp)), content = content)
}
internal fun artworkResource(name: String): Int = when(name) {
    "comic_bale_run" -> R.drawable.comic_bale_run
    "comic_bale_cross" -> R.drawable.comic_bale_cross
    "comic_benzema_volley" -> R.drawable.comic_benzema_volley
    "comic_alba_run" -> R.drawable.comic_alba_run
    "comic_alba_cutback" -> R.drawable.comic_alba_cutback
    "comic_alba_goal" -> R.drawable.comic_alba_goal
    "match_run" -> R.drawable.match_run
    "match_cutback" -> R.drawable.match_cutback
    "match_goal" -> R.drawable.match_goal
    "match_bale_run" -> R.drawable.match_bale_run
    "match_cross" -> R.drawable.match_cross
    "match_volley" -> R.drawable.match_volley

    "action_pass" -> R.drawable.action_pass
    "action_shot" -> R.drawable.action_shot
    "action_save" -> R.drawable.action_save
    "action_overtake" -> R.drawable.action_overtake
    "action_brake" -> R.drawable.action_brake
    "action_pits" -> R.drawable.action_pits
    "playmaker_f1" -> R.drawable.playmaker_f1
    else -> R.drawable.playmaker_football
}
@Composable internal fun SportArtwork(name: String, modifier: Modifier = Modifier, cornerRadius: Dp = 4.dp) {
    Image(painterResource(artworkResource(name)), contentDescription = null,
        modifier = modifier.fillMaxWidth().aspectRatio(1.5f).clip(RoundedCornerShape(cornerRadius)), contentScale = ContentScale.Fit)
}
@Composable internal fun PhraseCard(phrase: Phrase, saved: Boolean, modifier: Modifier = Modifier, onToggle: () -> Unit) {
    OutlinedCard(modifier = modifier, shape = RoundedCornerShape(24.dp),
        border = BorderStroke(1.dp, Color(0xFFE3DFD8)),
        colors = CardDefaults.outlinedCardColors(containerColor = Color.White)) {
        SportArtwork("action_${phrase.id}", cornerRadius = 0.dp)
        Column(Modifier.padding(horizontal = 14.dp, vertical = 12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(phrase.spanish, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, minLines = 3)
            Text(phrase.english, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, minLines = 2)
            FilledTonalButton(onClick = onToggle,
                modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp).semantics {
                    contentDescription = "${if (saved) "Remove saved phrase" else "Save phrase"}: ${phrase.spanish}"
                    stateDescription = if (saved) "Saved" else "Not saved"
                },
                colors = ButtonDefaults.filledTonalButtonColors(containerColor = if (saved) Color(0xFFDDD8FF) else Color(0xFFF3F1EC), contentColor = if (saved) PlaymakerBlue else PlaymakerInk),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp)) {
                Text(if (saved) "✓ Saved" else "+ Save", fontWeight = FontWeight.Bold)
            }
        }
    }
}
@Composable internal fun VisualAnswer(choice: VisualChoice, number: Int, selected: Boolean, enabled: Boolean, showText: Boolean, modifier: Modifier = Modifier, onClick: () -> Unit) {
    val label = if (showText) choice.answer else "Option $number"
    OutlinedCard(onClick = onClick, enabled = enabled,
        modifier = modifier.semantics { contentDescription = choice.imageDescription; this.selected = selected },
        shape = RoundedCornerShape(24.dp),
        border = BorderStroke(if (selected) 3.dp else 1.dp, if(selected) PlaymakerBlue else Color(0xFFD9D5EC)),
        colors = CardDefaults.outlinedCardColors(containerColor = if(selected) Color(0xFFDDD8FF) else Color(0xFFEFEAFB))) {
        SportArtwork(choice.artwork)
        Text(if(selected) "$label · Selected" else label, Modifier.padding(14.dp), fontWeight = FontWeight.Bold)
    }
}
