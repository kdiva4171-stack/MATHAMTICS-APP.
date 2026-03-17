package com.quickmath.app.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "quick_math_settings")

class PreferencesManager(private val context: Context) {

    companion object {
        val ONBOARDED = booleanPreferencesKey("onboarded")
        val LANGUAGE = stringPreferencesKey("language")
        val SESSION_DURATION = intPreferencesKey("session_duration")
        val CARD_FREQUENCY = intPreferencesKey("card_frequency")
        val DISPLAY_MODE = stringPreferencesKey("display_mode")
        val IS_SESSION_ACTIVE = booleanPreferencesKey("is_session_active")
        
        // Fun Pop-ups (Default: false)
        val FUN_POPUPS = booleanPreferencesKey("fun_popups")
        
        // Deep Breathe Settings
        val BREATHE_ENABLED = booleanPreferencesKey("breathe_enabled")
        val BREATHE_DURATION = intPreferencesKey("breathe_duration") // 6, 8, 10
        val BREATHE_HOLD = intPreferencesKey("breathe_hold") // 2, 3, 4
    }

    val onboarded: Flow<Boolean> = context.dataStore.data.map { it[ONBOARDED] ?: false }
    val language: Flow<String> = context.dataStore.data.map { it[LANGUAGE] ?: "en" }
    val sessionDuration: Flow<Int> = context.dataStore.data.map { it[SESSION_DURATION] ?: 10 }
    val cardFrequency: Flow<Int> = context.dataStore.data.map { it[CARD_FREQUENCY] ?: 3 }
    val displayMode: Flow<String> = context.dataStore.data.map { it[DISPLAY_MODE] ?: "half" }
    val isSessionActive: Flow<Boolean> = context.dataStore.data.map { it[IS_SESSION_ACTIVE] ?: false }
    val funPopups: Flow<Boolean> = context.dataStore.data.map { it[FUN_POPUPS] ?: false }
    val breatheEnabled: Flow<Boolean> = context.dataStore.data.map { it[BREATHE_ENABLED] ?: false }
    val breatheDuration: Flow<Int> = context.dataStore.data.map { it[BREATHE_DURATION] ?: 6 }
    val breatheHold: Flow<Int> = context.dataStore.data.map { it[BREATHE_HOLD] ?: 2 }

    suspend fun updateSetting(key: Preferences.Key<*>, value: Any) {
        context.dataStore.edit { prefs ->
            when (value) {
                is Boolean -> prefs[key as Preferences.Key<Boolean>] = value
                is Int -> prefs[key as Preferences.Key<Int>] = value
                is String -> prefs[key as Preferences.Key<String>] = value
                is Long -> prefs[key as Preferences.Key<Long>] = value
            }
        }
    }
}
