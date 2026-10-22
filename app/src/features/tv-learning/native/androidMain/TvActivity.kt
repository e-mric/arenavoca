package com.arenavoca.tv

import android.os.Bundle
import android.view.KeyEvent
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import com.arenavoca.tvlearning.TvLearning
import com.arenavoca.tvlearning.TvSequence

class TvActivity : ComponentActivity() {
    internal lateinit var learning: TvLearning
    internal lateinit var player: TvPlayer

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.getInsetsController(window, window.decorView).hide(WindowInsetsCompat.Type.systemBars())
        val alba = resources.getIdentifier("tv_alba", "raw", packageName)
        val sequence = if (BuildConfig.DEBUG && alba != 0 && intent.getStringExtra("sequence") != "demo") TvSequence.alba else TvSequence.demo
        learning = TvLearning(sequence)
        val resume = savedInstanceState?.getInt("position")
            ?: getSharedPreferences("tv-playback", MODE_PRIVATE).getInt("position-${sequence.id}", 0)
        player = TvPlayer(this, sequence, resume)
        setContent { TvLearningScreen(learning, player) }
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        when (keyCode) {
            KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE -> player.toggle()
            KeyEvent.KEYCODE_MEDIA_PLAY -> player.play()
            KeyEvent.KEYCODE_MEDIA_PAUSE -> player.pause()
            else -> return super.onKeyDown(keyCode, event)
        }
        return true
    }
    override fun onSaveInstanceState(outState: Bundle) {
        outState.putInt("position", player.position)
        super.onSaveInstanceState(outState)
    }
    override fun onPause() {
        player.pause()
        getSharedPreferences("tv-playback", MODE_PRIVATE).edit()
            .putInt("position-${learning.sequence.id}", player.position).apply()
        super.onPause()
    }
    override fun onDestroy() { player.release(); super.onDestroy() }
}
