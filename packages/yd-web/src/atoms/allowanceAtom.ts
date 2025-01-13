// atoms/allowanceAtom.ts  
import { atom } from 'jotai'  

export const allowanceAtom = atom<bigint>(BigInt(0));  
export const allowanceLoadingAtom = atom<boolean>(false); 