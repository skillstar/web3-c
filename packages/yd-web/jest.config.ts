// jest.config.ts  
import type { Config } from 'jest'  
import nextJest from 'next/jest'  

const createJestConfig = nextJest({  
  dir: './',  
})  

const config: Config = {  
  testEnvironment: 'node',  
  moduleNameMapper: {  
    '^@/(.*)$': '<rootDir>/app/$1',  
  },  
  // 移除 setupFilesAfterEnv 配置，因为我们暂时不需要它  
}  

export default createJestConfig(config)