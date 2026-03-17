package com.quickmath.app

import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView
import com.quickmath.app.data.PreferencesManager
import kotlinx.coroutines.*
import java.util.*

class OverlayService : Service() {

    private lateinit var windowManager: WindowManager
    private var overlayView: View? = null
    private val serviceScope = CoroutineScope(Dispatchers.Main + Job())
    private lateinit var prefs: PreferencesManager

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        prefs = PreferencesManager(this)
        
        startMathCycle()
    }

    private fun startMathCycle() {
        serviceScope.launch {
            while (isActive) {
                // Wait for the frequency interval (e.g., 5 minutes)
                // In a real app, we'd pull this from prefs
                delay(5 * 60 * 1000) 
                showMathCard()
            }
        }
    }

    private fun showMathCard() {
        if (overlayView != null) return

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.BOTTOM
            y = 100
        }

        // For simplicity in this demo, we'd inflate a layout here
        // overlayView = LayoutInflater.from(this).inflate(R.layout.overlay_math_card, null)
        
        // Mocking the view logic for the "Native Path" structure
        // In a real build, you'd have a XML layout or ComposeView here
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
        overlayView?.let { windowManager.removeView(it) }
    }
}
