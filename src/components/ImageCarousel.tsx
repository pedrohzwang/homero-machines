import React, { useRef } from 'react';
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '../theme';

type ImageCarouselProps = {
  photos: string[];
  height?: number;
  width?: number;
};

export function ImageCarousel({ photos, height = 200, width }: ImageCarouselProps) {
  const screenWidth = width ?? Dimensions.get('window').width - 32;
  const [activeIndex, setActiveIndex] = React.useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    setActiveIndex(index);
  };

  if (photos.length === 0) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <Text style={styles.placeholderText}>Sem fotos</Text>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={[styles.image, { height, width: screenWidth }]}
            resizeMode="cover"
          />
        )}
      />
      {photos.length > 1 && (
        <View style={styles.dots}>
          {photos.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  placeholderText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
  },
  image: {
    borderRadius: theme.borderRadius.md,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
  },
  dotInactive: {
    backgroundColor: theme.colors.textMuted,
  },
});
