/**
 * ==============================
 * FILE: src/components/StickerArt.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Draws one sticker from its name. Every sticker is hand drawn.
 *
 * Includes:
 * - The sticker image, fit inside a square of the given size
 *
 * Notes:
 * - An unknown name draws nothing.
 */

import {
  Image,
  ImageSourcePropType,
} from 'react-native';

const STICKER_ART: Record<string, ImageSourcePropType> = {
  cat: require('../../assets/stickers/cat.png'),
  crying: require('../../assets/stickers/crying.png'),
  cupped: require('../../assets/stickers/cupped.png'),
  dizzy: require('../../assets/stickers/dizzy.png'),
  fist: require('../../assets/stickers/fist.png'),
  hands: require('../../assets/stickers/hands.png'),
  heart: require('../../assets/stickers/heart.png'),
  knock: require('../../assets/stickers/knock.png'),
  palm: require('../../assets/stickers/palm.png'),
  peace: require('../../assets/stickers/peace.png'),
  reach: require('../../assets/stickers/reach.png'),
  signature: require('../../assets/stickers/signature.png'),
  wave: require('../../assets/stickers/wave.png'),
};

type StickerArtProps = {
  art: string;
  size: number;
};

export default function StickerArt({
  art,
  size,
}: StickerArtProps) {
  const source = STICKER_ART[art];

  if (!source) {
    return null;
  }

  return (
    <Image
      source={source}
      resizeMode="contain"
      style={{
        width: size,
        height: size,
      }}
    />
  );
}
