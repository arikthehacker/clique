/**
 * ==============================
 * FILE: src/components/StickerLayer.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Draws a memory's stickers over its photo, at the same relative
 * spots wherever the photo is shown.
 *
 * Includes:
 * - Stickers placed by fractional x and y
 * - Sticker size that follows the photo size
 * - Optional tap on a sticker, used on the post screen to remove it
 *
 * Notes:
 * - Put it in a wrapper the same width and height as the photo.
 */

import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Sticker } from '../types';
import StickerArt from './StickerArt';

type StickerLayerProps = {
  stickers: Sticker[];
  width: number;
  height: number;
  onPressSticker?: (index: number) => void;
};

export default function StickerLayer({
  stickers,
  width,
  height,
  onPressSticker,
}: StickerLayerProps) {
  const size = Math.max(28, Math.min(width, height) / 4.2);

  return (
    <View
      pointerEvents={onPressSticker ? 'box-none' : 'none'}
      style={[
        styles.layer,
        {
          width: width,
          height: height,
        },
      ]}
    >
      {stickers.map((sticker, index) => (
        <TouchableOpacity
          key={`${sticker.art}-${index}`}
          disabled={!onPressSticker}
          onPress={() => onPressSticker?.(index)}
          style={[
            styles.sticker,
            {
              left: sticker.x * width - size / 2,
              top: sticker.y * height - size / 2,
            },
          ]}
        >
          <StickerArt
            art={sticker.art}
            size={size}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// sticker layer styling
const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },

  sticker: {
    position: 'absolute',
  },
});
