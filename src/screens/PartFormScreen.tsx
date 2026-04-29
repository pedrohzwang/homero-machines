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
import { Text, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useMachineStore } from '../store/useMachineStore';
import { ImagePickerButton } from '../components/ImagePickerButton';
import { savePhoto, deletePhoto } from '../utils/fileSystem';
import { theme } from '../theme';
import type { Part } from '../types';

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
  const [photos, setPhotos] = useState<string[]>([]);
  
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
        setPhotos(part.photos);
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
  }, [navigation, name, quantity, weight, photos, saving]);

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
        photos,
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
      <Text style={styles.fieldLabel}>Nome da Peça *</Text>
      <TextInput
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
        }}
        placeholder="Nome da Peça"
        placeholderTextColor={theme.colors.placeholder}
        style={[styles.input, errors.name ? styles.inputError : null]}
        maxLength={100}
      />
      <HelperText type="error" visible={!!errors.name} style={styles.helperText}>
        {errors.name}
      </HelperText>

      <View style={styles.row}>
        <View style={[styles.flexArea, { marginRight: theme.spacing.sm }]}>
          <Text style={styles.fieldLabel}>Quantidade *</Text>
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
          <HelperText type="error" visible={!!errors.quantity} style={styles.helperText}>
            {errors.quantity}
          </HelperText>
        </View>

        <View style={[styles.flexArea, { marginLeft: theme.spacing.sm }]}>
          <Text style={styles.fieldLabel}>Peso (kg) *</Text>
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
          <HelperText type="error" visible={!!errors.weight} style={styles.helperText}>
            {errors.weight}
          </HelperText>
        </View>
      </View>

      <Text style={styles.sectionLabel}>FOTOS DA PEÇA</Text>
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
    paddingBottom: theme.spacing.xxl * 2,
  },
  headerSaveText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: theme.fontSize.md,
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  flexArea: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  photosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
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
});
