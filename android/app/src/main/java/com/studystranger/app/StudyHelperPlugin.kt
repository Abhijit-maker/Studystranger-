package com.studystranger.app

import android.content.Context
import android.os.Build
import android.os.BatteryManager
import android.os.Environment
import android.os.StatFs
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.widget.Toast
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "StudyHelper")
class StudyHelperPlugin : Plugin() {

    @PluginMethod
    fun showToast(call: PluginCall) {
        val message = call.getString("message") ?: "Greetings from Study Stranger Native Core!"
        
        activity.runOnUiThread {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        }
        
        val ret = JSObject()
        ret.put("success", true)
        call.resolve(ret)
    }

    @PluginMethod
    fun getDeviceStats(call: PluginCall) {
        val ret = JSObject()
        try {
            // Get Battery Percentage using Android SDK BatteryManager
            val batteryManager = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
            val batteryLevel = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
            ret.put("batteryLevel", batteryLevel)

            // Get Free Storage using Android SDK StatFs
            val path = Environment.getDataDirectory()
            val stat = StatFs(path.path)
            val blockSize = stat.blockSizeLong
            val availableBlocks = stat.availableBlocksLong
            val freeBytes = availableBlocks * blockSize
            val freeMegabytes = freeBytes / (1024 * 1024)
            ret.put("freeStorageMB", freeMegabytes)
            ret.put("isLowStorage", freeMegabytes < 500)
            
            call.resolve(ret)
        } catch (e: Exception) {
            ret.put("error", e.message)
            call.reject("Failed to retrieve device stats", e)
        }
    }

    @PluginMethod
    fun triggerHaptic(call: PluginCall) {
        val type = call.getString("type") ?: "success"
        val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }

        try {
            if (vibrator.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    when (type) {
                        "success" -> {
                            vibrator.vibrate(VibrationEffect.createOneShot(100, VibrationEffect.DEFAULT_AMPLITUDE))
                        }
                        "failure" -> {
                            val pattern = longArrayOf(0, 100, 100, 150)
                            val amplitudes = intArrayOf(0, VibrationEffect.DEFAULT_AMPLITUDE, 0, VibrationEffect.DEFAULT_AMPLITUDE)
                            vibrator.vibrate(VibrationEffect.createWaveform(pattern, amplitudes, -1))
                        }
                        "celebrate" -> {
                            val pattern = longArrayOf(0, 80, 80, 80, 80, 150)
                            val amplitudes = intArrayOf(0, VibrationEffect.DEFAULT_AMPLITUDE, 0, VibrationEffect.DEFAULT_AMPLITUDE, 0, VibrationEffect.DEFAULT_AMPLITUDE)
                            vibrator.vibrate(VibrationEffect.createWaveform(pattern, amplitudes, -1))
                        }
                        else -> {
                            vibrator.vibrate(VibrationEffect.createOneShot(50, VibrationEffect.DEFAULT_AMPLITUDE))
                        }
                    }
                } else {
                    @Suppress("DEPRECATION")
                    when (type) {
                        "success" -> vibrator.vibrate(100)
                        "failure" -> vibrator.vibrate(longArrayOf(0, 100, 100, 150), -1)
                        "celebrate" -> vibrator.vibrate(longArrayOf(0, 80, 80, 80, 80, 150), -1)
                        else -> vibrator.vibrate(50)
                    }
                }
            }
            val ret = JSObject()
            ret.put("vibrated", true)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Vibration failed", e)
        }
    }
}
