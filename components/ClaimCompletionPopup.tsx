import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

interface ClaimCompletionPopupProps {
  visible: boolean;
  onYes: () => void;
  onNo: () => void;
  onClose: () => void;
}

export const ClaimCompletionPopup: React.FC<ClaimCompletionPopupProps> = ({
  visible,
  onYes,
  onNo,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Complete Claim?</Text>
          <Text style={styles.message}>Has this item been successfully claimed?</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.noButton]} onPress={onNo}>
              <Text style={styles.buttonText}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.yesButton]} onPress={onYes}>
              <Text style={[styles.buttonText, styles.yesButtonText]}>Yes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  container: {
    backgroundColor: colors.background,
    borderRadius: 16,
    maxWidth: 400,
    padding: 24,
    width: '80%',
  },
  message: {
    color: colors.gray,
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  noButton: {
    backgroundColor: colors.lightGray,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  yesButton: {
    backgroundColor: colors.primary,
  },
  yesButtonText: {
    color: colors.background,
  },
});
