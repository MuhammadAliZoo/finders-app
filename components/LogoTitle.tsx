import { Image, StyleSheet } from 'react-native';

const LogoTitle = () => {
  return <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />;
};

const styles = StyleSheet.create({
  logo: {
    height: 30,
    width: 120,
  },
});

export default LogoTitle;
