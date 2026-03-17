package com.quickmath.app.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

class PreferencesManager(private val context: Context) {

    companion object {
        val ONBOARDED = booleanPreferencesKey("onboarded")
        val LANGUAGE = stringPreferencesKey("language")
        val SESSION_DURATION = intPreferencesKey("session_duration")
        val CARD_FREQUENCY = intPreferencesKey("card_frequency")
        val STRICT_MODE = booleanPreferencesKey("strict_mode")
        val DISPLAY_MODE = stringPreferencesKey("display_mode")
        val TRIAL_STARTED_AT = longPreferencesKey("trial_started_at")
        val HAS_PREMIUM = booleanPreferencesKey("has_premium")
        val IS_SESSION_ACTIVE = booleanPreferencesKey("is_session_active")
    }

    val onboarded: Flow<Boolean> = context.dataStore.data.map { it[ONBOARDED] ?: false }
    val language: Flow<String> = context.dataStore.data.map { it[LANGUAGE] ?: "en" }
    val sessionDuration: Flow<Int> = context.dataStore.data.map { it[SESSION_DURATION] ?: 15 }
    val cardFrequency: Flow<Int> = context.dataStore.data.map { it[CARD_FREQUENCY] ?: 5 }
    val strictMode: Flow<Boolean> = context.dataStore.data.map { it[STRICT_MODE] ?: false }
    val displayMode: Flow<String> = context.dataStore.data.map { it[DISPLAY_MODE] ?: "half" }
    val trialStartedAt: Flow<Long> = context.dataStore.data.map { it[TRIAL_STARTED_AT] ?: 0L }
    val hasPremium: Flow<Boolean> = context.dataStore.data.map { it[HAS_PREMIUM] ?: false }
    val isSessionActive: Flow<Boolean> = context.dataStore.data.map { it[IS_SESSION_ACTIVE] ?: false }

    suspend fun setOnboarded(value: Boolean) {
        context.dataStore.edit { it[ONBOARDED] = value }
    }

    suspend fun setLanguage(value: String) {
        context.dataStore.edit { it[LANGUAGE] = value }
    }

    suspend fun setStrictMode(value: Boolean) {
        context.dataStore.edit { it[STRICT_MODE] = value }
    }

    suspend fun setSessionActive(value: Boolean) {
        context.dataStore.edit { it[IS_SESSION_ACTIVE] = value }
    }
    
    suspend fun startTrial() {
        context.dataStore.edit { 
            it[TRIAL_STARTED_AT] = System.currentTimeMillis()
            it[HAS_PREMIUM] = true
        }
    }
}
