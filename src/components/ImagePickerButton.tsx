import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Modal, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../theme';

type ImagePickerButtonProps = {
  onImagePicked: (uri: string) => void;
};

export function ImagePickerButton({ onImagePicked }: ImagePickerButtonProps) {
  const [visible, setVisible] = useState(false);

  const openCamera = async () => {
    setVisible(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onImagePicked(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    setVisible(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onImagePicked(result.assets[0].uri);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setVisible(true)}
      >
        <MaterialCommunityIcons
          name="camera-plus-outline"
          size={32}
          color={theme.colors.primary}
        />
      </TouchableOpacity>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <View style={styles.handle} />
          <Text style={styles.modalTitle}>Adicionar foto</Text>
          <TouchableOpacity style={styles.option} onPress={openCamera}>
            <MaterialCommunityIcons
              name="camera-outline"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.optionText}>Tirar foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={openGallery}>
            <MaterialCommunityIcons
              name="image-outline"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.optionText}>Escolher da galeria</Text>
          </TouchableOpacity>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  modal: {
    backgroundColor: theme.colors.modalBackground,
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.textMuted,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.lg,
  },
  optionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
});
