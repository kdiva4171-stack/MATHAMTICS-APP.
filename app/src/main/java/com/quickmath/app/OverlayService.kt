package com.quickmath.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.os.Build
import android.os.IBinder
import android.speech.tts.TextToSpeech
import android.view.Gravity
import android.view.WindowManager
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.NotificationCompat
import androidx.lifecycle.*
import androidx.savedstate.SavedStateRegistry
import androidx.savedstate.SavedStateRegistryController
import androidx.savedstate.SavedStateRegistryOwner
import com.quickmath.app.data.PreferencesManager
import com.quickmath.app.logic.MathGenerator
import com.quickmath.app.logic.MathQuestion
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first
import java.util.*

class OverlayService : Service(), TextToSpeech.OnInitListener, LifecycleOwner, SavedStateRegistryOwner {

    private lateinit var windowManager: WindowManager
    private lateinit var audioManager: AudioManager
    private var tts: TextToSpeech? = null
    private val serviceScope = CoroutineScope(Dispatchers.Main + Job())
    private lateinit var prefs: PreferencesManager
    
    private var overlayView: ComposeView? = null
    private var audioFocusRequest: AudioFocusRequest? = null

    // Lifecycle requirements for ComposeView in Service
    private val lifecycleRegistry = LifecycleRegistry(this)
    override val lifecycle: Lifecycle get() = lifecycleRegistry
    private val savedStateRegistryController = SavedStateRegistryController.create(this)
    override val savedStateRegistry: SavedStateRegistry get() = savedStateRegistryController.savedStateRegistry

    override fun onCreate() {
        super.onCreate()
        savedStateRegistryController.performRestore(null)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_CREATE)
        
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        audioManager = getSystemService(AUDIO_SERVICE) as AudioManager
        tts = TextToSpeech(this, this)
        prefs = PreferencesManager(this)
        
        startForeground(1, createNotification())
        startCycle()
    }

    private fun startCycle() {
        serviceScope.launch {
            while (isActive) {
                val isSessionActive = prefs.isSessionActive.first()
                if (!isSessionActive) {
                    delay(5000)
                    continue
                }

                val frequency = prefs.cardFrequency.first()
                delay(frequency * 60 * 1000L)

                // Decide whether to show Math or Breathe
                val breatheEnabled = prefs.breatheEnabled.first()
                if (breatheEnabled && Random().nextBoolean()) {
                    showBreatheCard()
                } else {
                    showMathCard()
                }
            }
        }
    }

    private fun showMathCard() {
        duckAudio()
        val question = MathGenerator.generate()
        showOverlay {
            MathCardUI(question = question, onDismiss = { hideOverlay() })
        }
    }

    private fun showBreatheCard() {
        serviceScope.launch {
            val duration = prefs.breatheDuration.first()
            val hold = prefs.breatheHold.first()
            showOverlay {
                BreatheCardUI(inhaleExhaleSec = duration, holdSec = hold, onDismiss = { hideOverlay() })
            }
        }
    }

    private fun showOverlay(content: @Composable () -> Unit) {
        if (overlayView != null) return

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        )

        overlayView = ComposeView(this).apply {
            setContent {
                Box(
                    modifier = Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.6f)),
                    contentAlignment = Alignment.Center
                ) {
                    content()
                }
            }
            // Set lifecycle owners for Compose
            setViewTreeLifecycleOwner(this@OverlayService)
            setViewTreeSavedStateRegistryOwner(this@OverlayService)
        }

        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_START)
        windowManager.addView(overlayView, params)
    }

    private fun hideOverlay() {
        overlayView?.let {
            windowManager.removeView(it)
            overlayView = null
            unduckAudio()
            lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_STOP)
        }
    }

    private fun duckAudio() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val playbackAttributes = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ASSISTANCE_NAVIGATION_GUIDANCE)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build()
            audioFocusRequest = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                .setAudioAttributes(playbackAttributes)
                .setAcceptsDelayedFocusGain(true)
                .setOnAudioFocusChangeListener { }
                .build()
            audioManager.requestAudioFocus(audioFocusRequest!!)
        } else {
            @Suppress("DEPRECATION")
            audioManager.requestAudioFocus(null, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
        }
        tts?.speak("Think quickly", TextToSpeech.QUEUE_FLUSH, null, null)
    }

    private fun unduckAudio() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            audioFocusRequest?.let { audioManager.abandonAudioFocusRequest(it) }
        } else {
            @Suppress("DEPRECATION")
            audioManager.abandonAudioFocus(null)
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) tts?.language = Locale.US
    }

    private fun createNotification(): Notification {
        val channelId = "quick_math_service"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, "Quick Math Active", NotificationManager.IMPORTANCE_LOW)
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("Quick Math Session Active")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_DESTROY)
        serviceScope.cancel()
        tts?.shutdown()
        overlayView?.let { windowManager.removeView(it) }
    }
}

@Composable
fun MathCardUI(question: MathQuestion, onDismiss: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(0.85f).padding(16.dp),
        shape = RoundedCornerShape(32.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("Think quick!", color = Color.Gray, fontSize = 14.sp, fontWeight = FontWeight.Medium)
            Spacer(modifier = Modifier.height(16.dp))
            Text("${question.a} ${question.op} ${question.b} = ?", fontSize = 32.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(24.dp))
            question.options.forEach { opt ->
                Button(
                    onClick = { if (opt == question.answer) onDismiss() },
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF3F4F6), contentColor = Color.Black)
                ) {
                    Text(opt.toString(), fontSize = 18.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun BreatheCardUI(inhaleExhaleSec: Int, holdSec: Int, onDismiss: () -> Unit) {
    var phase by remember { mutableStateOf("Inhale") }
    var progress by remember { mutableFloatStateOf(0f) }
    val infiniteTransition = rememberInfiniteTransition(label = "breathe")
    
    // Simple state machine for breathing
    LaunchedEffect(Unit) {
        repeat(2) {
            phase = "Inhale"
            animate(0f, 1f, animationSpec = tween(inhaleExhaleSec * 1000)) { v, _ -> progress = v }
            phase = "Hold"
            delay(holdSec * 1000L)
            phase = "Exhale"
            animate(1f, 0f, animationSpec = tween(inhaleExhaleSec * 1000)) { v, _ -> progress = v }
            phase = "Rest"
            delay(holdSec * 1000L)
        }
        onDismiss()
    }

    val size = 100.dp + (150.dp * progress)

    Card(
        modifier = Modifier.fillMaxWidth(0.85f).padding(16.dp),
        shape = RoundedCornerShape(32.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(
            modifier = Modifier.padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(phase, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFF6366F1))
            Spacer(modifier = Modifier.height(40.dp))
            Box(
                modifier = Modifier
                    .size(250.dp),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(size)
                        .clip(CircleShape)
                        .background(Color(0xFF6366F1).copy(alpha = 0.3f))
                        .border(2.dp, Color(0xFF6366F1), CircleShape)
                )
            }
            Spacer(modifier = Modifier.height(40.dp))
            Text("Breathe for $inhaleExhaleSec seconds", color = Color.Gray, fontSize = 14.sp)
        }
    }
}
