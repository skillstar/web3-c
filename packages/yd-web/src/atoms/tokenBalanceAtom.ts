// atoms/tokenBalanceAtom.ts  
import { atom } from 'jotai'  

export const tokenBalanceAtom = atom<number>(0)  
export const tokenBalanceLoadingAtom = atom<boolean>(false)