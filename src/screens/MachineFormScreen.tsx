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
import { Text } from 'react-native-paper';
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
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{name: string}>({ name: '' });

  useEffect(() => {
    if (machineId) {
      const machine = getMachine(machineId);
      if (machine) {
        setName(machine.name);
        setDescription(machine.description ?? '');
        setPhotos([...machine.photos]);
        setTags([...(machine.tags ?? [])]);
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
  }, [navigation, name, description, photos, tags, saving]);

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

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    setTags((prev) => [...prev, trimmed]);
    setTagInput('');
  };

  const handleRemoveTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveTag = (index: number, direction: 'up' | 'down') => {
    setTags((prev) => {
      const next = [...prev];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= next.length) return prev;
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    });
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
          tags,
        });
      } else {
        addMachine({
          name: name.trim(),
          description: description.trim() || undefined,
          photos,
          tags,
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
      <Text style={styles.sectionLabel}>Fotos da máquina</Text>
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
        style={[styles.input, errors.name ? styles.inputError : null]}
      />
      {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

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

      {/* Tags section */}
      <Text style={styles.sectionLabel}>Tags</Text>
      <View style={styles.tagInputRow}>
        <TextInput
          value={tagInput}
          onChangeText={setTagInput}
          placeholder="Nova tag..."
          placeholderTextColor={theme.colors.placeholder}
          style={[styles.input, styles.tagInput]}
          maxLength={20}
          onSubmitEditing={handleAddTag}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.tagAddBtn} onPress={handleAddTag}>
          <MaterialCommunityIcons name="plus" size={22} color={theme.colors.textOnPrimary} />
        </TouchableOpacity>
      </View>
      {tags.map((tag, index) => (
        <View key={`${tag}-${index}`} style={styles.tagRow}>
          <View style={styles.tagPill}>
            <Text style={styles.tagPillText}>{tag}</Text>
          </View>
          <View style={styles.tagRowActions}>
            <TouchableOpacity
              onPress={() => handleMoveTag(index, 'up')}
              disabled={index === 0}
              style={styles.tagMoveBtn}
            >
              <MaterialCommunityIcons
                name="chevron-up"
                size={20}
                color={index === 0 ? theme.colors.textMuted : theme.colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleMoveTag(index, 'down')}
              disabled={index === tags.length - 1}
              style={styles.tagMoveBtn}
            >
              <MaterialCommunityIcons
                name="chevron-down"
                size={20}
                color={index === tags.length - 1 ? theme.colors.textMuted : theme.colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRemoveTag(index)} style={styles.tagMoveBtn}>
              <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.sm,
  },
  headerSaveText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 2,
  },
  photosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: 6,
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
    marginBottom: 2,
    marginTop: 8,
  },
  input: {
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  errorText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.danger,
    marginTop: 2,
    marginBottom: 2,
  },
  textArea: {
    marginBottom: 0,
    minHeight: 80,
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: 4,
  },
  tagInput: {
    flex: 1,
    marginBottom: 0,
  },
  tagAddBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tagPill: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  tagPillText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  tagRowActions: {
    flexDirection: 'row',
    marginLeft: theme.spacing.sm,
  },
  tagMoveBtn: {
    padding: theme.spacing.xs,
  },
});
