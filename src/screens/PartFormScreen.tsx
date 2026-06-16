import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useMachineStore } from '../store/useMachineStore';
import { ImagePickerButton } from '../components/ImagePickerButton';
import { savePhoto, deletePhoto } from '../utils/fileSystem';
import { theme } from '../theme';
import type { Part, Machine } from '../types';

const formatWeight = (text: string) => {
  const digits = text.replace(/\D/g, '');
  if (!digits) return '0,00';
  const num = parseInt(digits, 10);
  if (isNaN(num)) return '0,00';
  const str = num.toString().padStart(3, '0');
  const decimals = str.slice(-2);
  let integers = str.slice(0, -2);
  integers = integers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${integers},${decimals}`;
};

type Props = StackScreenProps<RootStackParamList, 'PartForm'>;

export function PartFormScreen({ navigation, route }: Props) {
  const { machineId, partId } = route.params;
  const { updateMachine, getMachine } = useMachineStore();
  const [machine, setMachine] = useState<Machine | null>(null);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1'); // default to 1
  const [weight, setWeight] = useState('0,00');
  const [power, setPower] = useState('0');
  const [voltage, setVoltage] = useState('0');
  const [photos, setPhotos] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Validation errors state
  const [errors, setErrors] = useState({ name: '', quantity: '', weight: '' });
  
  const [saving, setSaving] = useState(false);
  const isEditing = !!partId;

  // Single setup effect avoiding infinite loop
  useEffect(() => {
    const m = getMachine(machineId);
    setMachine(m);

    if (isEditing && m) {
      const part = m.parts.find((p) => p.id === partId);
      if (part) {
        setName(part.name);
        setQuantity(String(part.quantity));
        setWeight(formatWeight(part.weight.toFixed(2)));
        setPower(String(part.power ?? 0));
        setVoltage(String(part.voltage ?? 0));
        setPhotos(part.photos);
        setTags(part.tags ?? []);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machineId, partId, isEditing, getMachine]);

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
  }, [navigation, name, quantity, weight, power, voltage, photos, tags, saving]);

  const handleAddPhoto = async (uri: string) => {
    try {
      const savedUri = await savePhoto(uri);
      setPhotos((prev) => [...prev, savedUri]);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar a foto. Tente novamente.');
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
    const newErrors = { name: '', quantity: '', weight: '' };

    if (!name.trim()) {
      newErrors.name = 'O nome da peça é obrigatório.';
      hasError = true;
    }

    const parsedQuantity = parseInt(quantity, 10);
    const parsedWeight = parseFloat(weight.replace(/\./g, '').replace(',', '.'));

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      newErrors.quantity = 'Deve ser um número inteiro maior que zero.';
      hasError = true;
    }

    if (isNaN(parsedWeight) || parsedWeight < 0) {
      newErrors.weight = 'Deve ser um número válido e não negativo.';
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      return;
    }

    if (!machine) {
      Alert.alert('Erro', 'Máquina não encontrada.');
      return;
    }

    setSaving(true);
    try {
      const updatedParts = [...machine.parts];

      const partData: Part = {
        id: isEditing && partId ? partId : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: name.trim(),
        quantity: parsedQuantity,
        weight: parsedWeight,
        power: parseInt(power, 10) || 0,
        voltage: parseInt(voltage, 10) || 0,
        photos,
        tags,
      };

      if (isEditing && partId) {
        const index = updatedParts.findIndex((p) => p.id === partId);
        if (index >= 0) {
          updatedParts[index] = partData;
        }
      } else {
        updatedParts.push(partData);
      }

      updateMachine(machine.id, { parts: updatedParts });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar a peça.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.sectionLabel}>Fotos da peça</Text>
      <View style={styles.photosRow}>
        {photos.map((uri, index) => (
          <View key={uri} style={styles.photoWrapper}>
            <Image source={{ uri }} style={styles.photoThumb} />
            <TouchableOpacity
              style={styles.btnRemovePhoto}
              onPress={() => handleRemovePhoto(index)}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={24}
                color={theme.colors.danger}
              />
            </TouchableOpacity>
          </View>
        ))}
        <ImagePickerButton onImagePicked={handleAddPhoto} />
      </View>

      <Text style={styles.fieldLabel}>Nome da peça *</Text>
      <TextInput
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
        }}
        placeholder="Nome da peça"
        placeholderTextColor={theme.colors.placeholder}
        style={[styles.input, errors.name ? styles.inputError : null]}
        maxLength={100}
      />
      {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      <View style={styles.row}>
        <View style={[styles.flexArea, { marginRight: theme.spacing.sm }]}>
          <Text style={styles.fieldLabel}>Potência (W)</Text>
          <TextInput
            value={power}
            onChangeText={(text) => setPower(text.replace(/[^0-9]/g, '').slice(0, 8))}
            placeholder="0"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>
        <View style={[styles.flexArea, { marginLeft: theme.spacing.sm }]}>
          <Text style={styles.fieldLabel}>Tensão (V)</Text>
          <TextInput
            value={voltage}
            onChangeText={(text) => setVoltage(text.replace(/[^0-9]/g, '').slice(0, 8))}
            placeholder="0"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.flexArea, { marginRight: theme.spacing.sm }]}>
          <Text style={styles.fieldLabel}>Quantidade</Text>
          <TextInput
            value={quantity}
            onChangeText={(text) => {
              setQuantity(text.replace(/[^0-9]/g, ''));
              if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: '' }));
            }}
            placeholder="Quantidade"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="numeric"
            style={[styles.input, errors.quantity ? styles.inputError : null]}
          />
          {!!errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}
        </View>

        <View style={[styles.flexArea, { marginLeft: theme.spacing.sm }]}>
          <Text style={styles.fieldLabel}>Peso (kg)</Text>
          <TextInput
            value={weight}
            onChangeText={(text) => {
              setWeight(formatWeight(text));
              if (errors.weight) setErrors((prev) => ({ ...prev, weight: '' }));
            }}
            placeholder="0,00"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="numeric"
            style={[styles.input, errors.weight ? styles.inputError : null]}
          />
          {!!errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
        </View>
      </View>

      {/* Tags section */}
      <Text style={[styles.sectionLabel, { marginTop: 6 }]}>Tags</Text>
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
    paddingBottom: theme.spacing.xxl,
  },
  headerSaveText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: theme.fontSize.md,
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  flexArea: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 2,
    marginTop: 8,
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
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
  },
  btnRemovePhoto: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
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
