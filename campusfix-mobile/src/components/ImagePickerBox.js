import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

export default function ImagePickerBox({ images = [], onChange }) {
  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please allow gallery access to attach a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      onChange([...images, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please allow camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets?.[0]?.uri) {
      onChange([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (uri) => {
    onChange(images.filter((item) => item !== uri));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Upload Photograph</Text>
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.pickBtn} onPress={pickFromGallery}>
          <Ionicons name="images-outline" size={18} color={COLORS.forestGreen} />
          <Text style={styles.pickText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pickBtn} onPress={takePhoto}>
          <Ionicons name="camera-outline" size={18} color={COLORS.forestGreen} />
          <Text style={styles.pickText}>Camera</Text>
        </TouchableOpacity>
      </View>

      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewRow}>
          {images.map((uri) => (
            <View key={uri} style={styles.thumbWrap}>
              <Image source={{ uri }} style={styles.thumb} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(uri)}>
                <Ionicons name="close" size={14} color={COLORS.softWhite} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  label: { ...TYPOGRAPHY.label, marginBottom: 8 },
  btnRow: { flexDirection: 'row', gap: 10 },
  pickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.softWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickText: { fontSize: 14, fontWeight: '600', color: COLORS.forestGreen },
  previewRow: { marginTop: 10 },
  thumbWrap: { marginRight: 10, position: 'relative' },
  thumb: { width: 84, height: 84, borderRadius: RADIUS.sm, backgroundColor: COLORS.softBeige },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(29, 64, 54, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
