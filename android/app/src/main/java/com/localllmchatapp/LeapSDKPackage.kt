package com.localllmchatapp

import android.util.Log
import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.localllmchatapp.LeapSDKModule
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.module.model.ReactModuleInfo
import java.util.HashMap

class LeapSDKPackage : BaseReactPackage() {

    override fun getModule(
        name: String,
        reactContext: ReactApplicationContext
    ): NativeModule? {
        Log.d("LeapSDKPackage", "Requesting module: $name")
        if (name.equals(LeapSDKModule.NAME, ignoreCase = true)) {
            Log.d("LeapSDKPackage", "Creating instance of LeapSDKModule")
            return LeapSDKModule(reactContext)
        }
        return null
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        Log.d("LeapSDKPackage", "getReactModuleInfoProvider")
        return ReactModuleInfoProvider {
            val moduleInfos = HashMap<String, ReactModuleInfo>()
            moduleInfos[LeapSDKModule.NAME] = ReactModuleInfo(
                name = LeapSDKModule.NAME,
                className = LeapSDKModule::class.java.getName(),
                canOverrideExistingModule = false,
                needsEagerInit = false,
                isCxxModule = false,
                isTurboModule = true
            )
            moduleInfos
        }
    }
}