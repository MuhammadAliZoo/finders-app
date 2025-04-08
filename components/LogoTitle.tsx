import { Image, StyleSheet } from "react-native"

const LogoTitle = () => {
  return <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" />
}

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 30,
  },
})

export default LogoTitle

