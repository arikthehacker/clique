/**
 * ==============================
 * FILE: src/components/MemoryFrame.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Draws one memory in its frame, the same way on every screen: the feed,
 * the memory screen and the post preview.
 *
 * Includes:
 * - Polaroid: a white card with the caption written on the bottom strip
 * - Vintage: the gold frame with the photo set into its window
 * - None: the photo on its own, caption underneath
 * - Stickers on top of the photo
 *
 * Notes:
 * - width is the outside width of the whole thing, frame included.
 */

import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  FrameType,
  Sticker,
} from '../types';
import StickerLayer from './StickerLayer';

const vintageFrame = require('../../assets/images/default-memory.png');

// the gold frame's window, as fractions of the frame image
const VINTAGE_RATIO = 1455 / 1600;
const VINTAGE_WINDOW = {
  left: 0.2325,
  top: 0.2399,
  width: 0.5519,
  height: 0.5182,
};

type MemoryFrameProps = {
  uri: string;
  frame: FrameType;
  width: number;
  stickers?: Sticker[];
  caption?: string;
  tilt?: number;
  onPressSticker?: (index: number) => void;
};

export default function MemoryFrame({
  uri,
  frame,
  width,
  stickers = [],
  caption = '',
  tilt = 0,
  onPressSticker,
}: MemoryFrameProps) {
  if (frame === 'polaroid') {
    const pad = width * 0.06;
    const photo = width - pad * 2;

    return (
      <View
        style={[
          styles.polaroid,
          {
            width: width,
            padding: pad,
            paddingBottom: 0,
            transform: [{ rotate: `${tilt}deg` }],
          },
        ]}
      >
        <View
          style={{
            width: photo,
            height: photo,
          }}
        >
          <Image
            source={{ uri: uri }}
            style={[
              styles.fill,
              styles.polaroidPhoto,
            ]}
          />

          <StickerLayer
            stickers={stickers}
            width={photo}
            height={photo}
            onPressSticker={onPressSticker}
          />
        </View>

        <View
          style={[
            styles.strip,
            { height: width * 0.2 },
          ]}
        >
          <Text
            style={[
              styles.polaroidCaption,
              { fontSize: Math.max(13, width * 0.075) },
            ]}
            numberOfLines={1}
          >
            {caption}
          </Text>
        </View>
      </View>
    );
  }

  if (frame === 'vintage') {
    const height = width * VINTAGE_RATIO;
    const photoWidth = width * VINTAGE_WINDOW.width;
    const photoHeight = height * VINTAGE_WINDOW.height;

    return (
      <View
        style={{
          width: width,
          transform: [{ rotate: `${tilt}deg` }],
        }}
      >
        <View
          style={{
            width: width,
            height: height,
          }}
        >
          {/* photo sits a hair under the frame so no gap shows at the edges */}
          <Image
            source={{ uri: uri }}
            resizeMode="cover"
            style={{
              position: 'absolute',
              left: width * VINTAGE_WINDOW.left - 2,
              top: height * VINTAGE_WINDOW.top - 2,
              width: photoWidth + 4,
              height: photoHeight + 4,
            }}
          />

          <Image
            source={vintageFrame}
            style={styles.fill}
          />

          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              left: width * VINTAGE_WINDOW.left,
              top: height * VINTAGE_WINDOW.top,
            }}
          >
            <StickerLayer
              stickers={stickers}
              width={photoWidth}
              height={photoHeight}
              onPressSticker={onPressSticker}
            />
          </View>
        </View>

        {caption.length > 0 && (
          <Text
            style={[
              styles.caption,
              { fontSize: Math.max(13, width * 0.07) },
            ]}
            numberOfLines={1}
          >
            {caption}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View
      style={{
        width: width,
        transform: [{ rotate: `${tilt}deg` }],
      }}
    >
      <View
        style={[
          styles.plain,
          {
            width: width,
            height: width,
          },
        ]}
      >
        <Image
          source={{ uri: uri }}
          style={[
            styles.fill,
            styles.plainPhoto,
          ]}
        />

        <StickerLayer
          stickers={stickers}
          width={width}
          height={width}
          onPressSticker={onPressSticker}
        />
      </View>

      {caption.length > 0 && (
        <Text
          style={[
            styles.caption,
            { fontSize: Math.max(13, width * 0.07) },
          ]}
          numberOfLines={1}
        >
          {caption}
        </Text>
      )}
    </View>
  );
}

// memory frame styling
const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },

  polaroid: {
    backgroundColor: '#fdfaf3',
    borderRadius: 3,
    shadowColor: '#5a4400',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },

  polaroidPhoto: {
    backgroundColor: '#e8dcc0',
  },

  strip: {
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  polaroidCaption: {
    fontFamily: 'Gaegu-Bold',
    color: '#4a3b12',
    textAlign: 'center',
  },

  plain: {
    borderRadius: 14,
    shadowColor: '#5a4400',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },

  plainPhoto: {
    borderRadius: 14,
    backgroundColor: '#e8dcc0',
  },

  caption: {
    marginTop: 8,
    fontFamily: 'Gaegu-Bold',
    color: '#4a3b12',
    textAlign: 'center',
  },
});
