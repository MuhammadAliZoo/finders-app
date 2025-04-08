"use client"

import { useEffect } from "react"
import { View, Image, StyleSheet, Animated } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../context/ThemeContext"

const SplashScreen = () => {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const fadeAnim = new Animated.Value(0)

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start()

    // Navigate to the main screen after a delay
    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      })
    }, 2500)

    return () => clearTimeout(timer)
  }, [navigation, fadeAnim])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 80,
  },
})

export default SplashScreen

