package com.arenavoca.stories

data class StoryPanel(val title: String, val spanish: String, val english: String, val artwork: String, val evidence: MatchEvidence? = null)
data class SportStory(
    val id: String,
    val sport: String,
    val title: String,
    val targets: List<String>,
    val panels: List<StoryPanel>,
    val recognitionPrompt: String,
    val recognitionHelp: String,
    val choices: List<String>,
    val recognitionAnswer: String,
    val recognitionExplanation: String,
    val recallPrompt: String,
    val recallAnswer: String,
    val recallHint: String,
    val usePrompt: String,
    val useHelp: String,
    val modelAnswer: String,
    val transfer: String,
    val sourceTitle: String? = null
) {
    val provenanceLabel: String get() = if (sourceTitle == null) "Fictional practice · not from your recording" else "From the recording · AI checked"
}

/** Authored fictional practice, independent of recordings, teams and viewing history. */
object StoryCatalog {
    val stories = listOf(
        SportStory(
            "final-attack", "football", "One minute left",
            listOf("queda un minuto", "pasa el balón", "necesitamos un gol"),
            listOf(
                StoryPanel("The last chance", "Queda un minuto. El equipo azul pierde por un gol. Necesitamos un gol para empatar.", "One minute remains. The blue team is one goal behind. We need a goal to equalise.", "playmaker_football"),
                StoryPanel("A teammate is free", "Ana tiene el balón. Ve a Leo cerca de la portería. Ana pasa el balón a Leo.", "Ana has the ball. She sees Leo near the goal. Ana passes the ball to Leo.", "action_pass"),
                StoryPanel("The equaliser", "Leo dispara. El balón entra. ¡Gol! Ahora el partido está empatado.", "Leo shoots. The ball goes in. Goal! Now the match is level.", "action_shot")
            ),
            "¿Por qué necesita un gol el equipo?", "Why does the team need a goal?",
            listOf("Para ganar.", "Para empatar.", "Para descansar."), "Para empatar.",
            "The team is one goal behind. One goal makes the score level: empatar.",
            "Ana ___ el balón a Leo.", "pasa", "It means passes. It begins with p.",
            "¿Qué necesita tu equipo?", "What does your team need? Write a short answer in Spanish.",
            "Necesitamos un gol.", "Beyond sport: Necesitamos ayuda. — We need help."
        ),
        SportStory(
            "pit-stop", "f1", "Time to pit",
            listOf("entra en boxes", "cambia los neumáticos", "vuelve a la pista"),
            listOf(
                StoryPanel("A decision on track", "El piloto sigue en la pista. Los neumáticos están gastados. Decide parar ahora.", "The driver is still on track. The tyres are worn. The driver decides to stop now.", "playmaker_f1"),
                StoryPanel("A team effort", "El piloto entra en boxes. El equipo cambia los neumáticos. Todos trabajan juntos.", "The driver enters the pits. The team changes the tyres. Everyone works together.", "action_pits"),
                StoryPanel("Back in the race", "El piloto vuelve a la pista. Tiene neumáticos nuevos. La carrera continúa.", "The driver returns to the track. The driver has new tyres. The race continues.", "playmaker_f1")
            ),
            "¿Qué cambia el equipo?", "What does the team change?",
            listOf("El piloto.", "El coche.", "Los neumáticos."), "Los neumáticos.",
            "The team replaces the worn tyres: cambia los neumáticos.",
            "El piloto entra en ___.", "boxes", "The Spanish expression for the pit area begins with b.",
            "¿Prefieres parar ahora o después?", "Would you rather stop now or later? Write your preference in Spanish.",
            "Prefiero parar ahora.", "Beyond sport: Prefiero salir después. — I prefer to leave later."
        )
    )
    fun forSport(sport: String): SportStory? = stories.firstOrNull { it.sport == sport }
}
