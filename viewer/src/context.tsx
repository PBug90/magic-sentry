import { createContext, useContext } from 'react'

const IconSrcContext = createContext<(path: string) => string>((p) => p)

export const IconSrcProvider = IconSrcContext.Provider

export function useIconSrc(): (path: string) => string {
  return useContext(IconSrcContext)
}
