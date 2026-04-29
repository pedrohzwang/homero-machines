import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Text, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useMachineStore } from '../store/useMachineStore';
import { ImagePickerButton } from '../components/ImagePickerButton';
import { savePhoto, deletePhoto } from '../utils/fileSystem';
import { theme } from '../theme';

type Props = StackScreenProps<RootStackParamList, 'MachineForm'>;

export function MachineFormScreen({ navigation, route }: Props) {
  const machineId = route.params?.machineId;
  const isEditing = !!machineId;

  const { getMachine, addMachine, updateMachine } = useMachineStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{name: string}>({ name: '' });

  useEffect(() => {
    if (machineId) {
      const machine = getMachine(machineId);
      if (machine) {
        setName(machine.name);
        setDescription(machine.description ?? '');
        setPhotos([...machine.photos]);
      }
    }
  }, [machineId, getMachine]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSave}
          style={{ marginRight: theme.spacing.lg }}
          disabled={saving}
        >
          <Text style={styles.headerSaveText}>Salvar</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, name, description, photos, saving]);

  const handleAddPhoto = async (uri: string) => {
    try {
      const savedUri = await savePhoto(uri);
      setPhotos((prev) => [...prev, savedUri]);
    } catch (e) {
      console.error(e); Alert.alert('Erro', 'Não foi possível salvar a foto. Tente novamente.');
    }
  };

  const handleRemovePhoto = async (index: number) => {
    const uri = photos[index];
    await deletePhoto(uri);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    let hasError = false;
    const newErrors = { name: '' };

    if (!name.trim()) {
      newErrors.name = 'O nome da máquina é obrigatório.';
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      return;
    }

    setSaving(true);
    try {
      if (isEditing && machineId) {
        updateMachine(machineId, {
          name: name.trim(),
          description: description.trim() || undefined,
          photos,
        });
      } else {
        addMachine({
          name: name.trim(),
          description: description.trim() || undefined,
          photos,
        });
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Photos section */}
      <Text style={styles.sectionLabel}>FOTOS DA MÁQUINA</Text>
      <View style={styles.photosRow}>
        {photos.map((uri, index) => (
          <View key={uri} style={styles.photoWrapper}>
            <Image source={{ uri }} style={styles.photoThumb} />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemovePhoto(index)}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color={theme.colors.danger}
              />
            </TouchableOpacity>
          </View>
        ))}
        <ImagePickerButton onImagePicked={handleAddPhoto} />
      </View>

      {/* Form fields */}
      <Text style={styles.fieldLabel}>Nome da máquina *</Text>
      <TextInput
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (errors.name) setErrors({ name: '' });
        }}
        placeholder="Nome da máquina"
        placeholderTextColor={theme.colors.placeholder}
        style={[styles.input, errors.name ? styles.inputError : null, { marginBottom: errors.name ? 0 : theme.spacing.lg }]}
      />
      <HelperText type="error" visible={!!errors.name} style={styles.helperText}>
        {errors.name}
      </HelperText>

      <Text style={styles.fieldLabel}>Descrição</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Descrição da máquina"
        placeholderTextColor={theme.colors.placeholder}
        style={[styles.input, styles.textArea]}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      {/* Save button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.8}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'SALVANDO...' : 'SALVAR MÁQUINA'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  headerSaveText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: theme.spacing.md,
  },
  photosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xxl,
  },
  photoWrapper: {
    position: 'relative',
  },
  photoThumb: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.sm,
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  fieldLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  helperText: {
    paddingHorizontal: 0,
    marginTop: 0,
    marginBottom: theme.spacing.sm,
  },
  textArea: {
    marginBottom: theme.spacing.lg,
    minHeight: 100,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
