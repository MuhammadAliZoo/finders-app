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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Complete Claim?</Text>
          <Text style={styles.message}>
            Has this item been successfully claimed?
          </Text>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  noButton: {
    backgroundColor: colors.lightGray,
  },
  yesButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.text,
  },
  yesButtonText: {
    color: colors.background,
  },
}); 