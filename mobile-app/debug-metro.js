const path = require('path');

try {
    console.log("1. Loading @expo/metro-config...");
    const { getDefaultConfig } = require("@expo/metro-config");
    console.log("✅ Loaded @expo/metro-config");

    console.log("2. Loading nativewind/metro...");
    const { withNativeWind } = require("nativewind/metro");
    console.log("✅ Loaded nativewind/metro");

    console.log("3. Getting default config...");
    const config = getDefaultConfig(__dirname);
    console.log("✅ Got default config");

    console.log("4. Applying withNativeWind...");
    const wrappedConfig = withNativeWind(config, { input: "./global.css" });
    console.log("✅ Applied withNativeWind");

} catch (error) {
    console.error("❌ ERROR:", error);
    console.error("Stack:", error.stack);
}
