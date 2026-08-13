package com.studystranger.app

import android.os.Bundle
import android.widget.Toast
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Ensure our StudyHelper custom native plugin is registered with the Capacitor bridge
        registerPlugin(StudyHelperPlugin::class.java)
        
        // Show native splash greeting on start
        Toast.makeText(this, "Study Stranger Kotlin Core Activated! 🚀", Toast.LENGTH_LONG).show()
    }
}
