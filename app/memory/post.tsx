
// FILE: app/memory/post.tsx
// PURPOSE: pick a frame, add caption, then save into context & return to index

import React, { useState } from 'react'
import {
  View, Text, StyleSheet, Image, TextInput,
  TouchableOpacity, ScrollView
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useMemory } from '../_context/MemoryContext'
import { Ionicons } from '@expo/vector-icons'

const FRAMES = ['polaroid','vintage','none']  // your frame IDs

export default function MemoryPost() {
  const { uri } = useLocalSearchParams<{ uri: string }>()
  const router = useRouter()
  const { addMemory } = useMemory()
  const [caption, setCaption] = useState('')
  const [frame, setFrame] = useState(FRAMES[0])

  const submit = () => {
    addMemory({ uri, frame, caption })
    router.replace('/memory')
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri }} style={styles.preview} />

      <Text style={styles.label}>Choose Frame:</Text>
      <View style={styles.framesRow}>
        {FRAMES.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.frameBtn,
              frame===f && styles.frameBtnActive
            ]}
            onPress={()=>setFrame(f)}
          >
            <Text>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Add a caption…"
        value={caption}
        onChangeText={setCaption}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={submit}>
        <Ionicons name="checkmark" size={24} color="#fff"/>
        <Text style={styles.saveText}>Save Memory</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow:1, padding:16, backgroundColor:'#F1E3C0' },
  preview: { width:'100%', height:300, borderRadius:12, marginBottom:16 },
  label: { fontSize:16, marginBottom:8 },
  framesRow: { flexDirection:'row', marginBottom:16 },
  frameBtn: {
    padding:8, borderWidth:1, borderColor:'#ccc',
    borderRadius:8, marginRight:8
  },
  frameBtnActive: {
    borderColor:'#b7931d', backgroundColor:'#fffef2'
  },
  input: {
    backgroundColor:'#fff', padding:12, borderRadius:8, height:80, textAlignVertical:'top'
  },
  saveBtn: {
    flexDirection:'row', alignItems:'center',
    backgroundColor:'#b7931d', padding:12,
    borderRadius:8, marginTop:20, justifyContent:'center'
  },
  saveText: { color:'#fff', marginLeft:8, fontSize:16 }
})
