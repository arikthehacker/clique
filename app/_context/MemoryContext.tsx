
// FILE: app/context/MemoryContext.tsx
// PURPOSE: hold in‑memory list of captured photos, so any screen can read/add

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Memory = {
  id: string
  uri: string
  frame: string   // e.g. 'polaroid' | 'vintage' | ...
  caption: string
  timestamp: number
}

type MemoryCtx = {
  memories: Memory[]
  addMemory: (m: Omit<Memory,'id'|'timestamp'>) => void
}

const MemoryContext = createContext<MemoryCtx>({
  memories: [],
  addMemory: () => {}
})

export function MemoryProvider({ children }: { children: ReactNode }) {
  const [memories, setMemories] = useState<Memory[]>([])

  function addMemory(data: Omit<Memory,'id'|'timestamp'>) {
    const newMem: Memory = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...data
    }
    setMemories([newMem, ...memories])
  }

  return (
    <MemoryContext.Provider value={{ memories, addMemory }}>
      {children}
    </MemoryContext.Provider>
  )
}

export function useMemory() {
  return useContext(MemoryContext)
}
