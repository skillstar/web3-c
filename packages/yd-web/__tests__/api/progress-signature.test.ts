// __tests__/api/progress-signature.test.ts  
import { NextRequest } from 'next/server'  
import { POST } from '@/app/api/proxy/progress/signature/route'  

// Mock fetch  
global.fetch = jest.fn()  

describe('Progress Signature API', () => {  
  const originalEnv = process.env  

  beforeEach(() => {  
    jest.clearAllMocks()  
    process.env = { ...originalEnv }  
    process.env.API_URL = 'http://test-api.example.com'  
  })  

  afterEach(() => {  
    process.env = originalEnv  
  })  

  const createRequest = (body: any): NextRequest => {  
    return new NextRequest('http://localhost/api/proxy/progress/signature', {  
      method: 'POST',  
      headers: {  
        'Content-Type': 'application/json',  
      },  
      body: JSON.stringify(body),  
    })  
  }   

    describe('Environment Configuration', () => {  
    it('should handle missing API_URL', async () => {  
      delete process.env.API_URL  

      const validRequest = {  
        userAddress: '0x1234567890123456789012345678901234567890',  
        courseId: 1,  
        progress: 100  
      }  

      const request = createRequest(validRequest)  
      const response = await POST(request)  
      const data = await response.json()  

      expect(response.status).toBe(500)  
      expect(data.error).toBe('API configuration error')  
    })  
  })  

  
  describe('Input Validation', () => {  
    it('should validate ethereum address', async () => {  
      const invalidRequest = {  
        userAddress: 'invalid-address',  
        courseId: 1,  
        progress: 100  
      }  
  
      const request = createRequest(invalidRequest)  
      const response = await POST(request)  
      const data = await response.json()  
  
      expect(response.status).toBe(400)  
      expect(data.error).toBe('Invalid request data')  
    })  

    it('should validate courseId is a positive integer', async () => {  
      const invalidRequest = {  
        userAddress: '0x1234567890123456789012345678901234567890',  
        courseId: -1,  
        progress: 100  
      }  
  
      const request = createRequest(invalidRequest)  
      const response = await POST(request)  
      const data = await response.json()  
  
      expect(response.status).toBe(400)  
      expect(data.error).toBe('Invalid request data')  
    })  

    it('should validate progress is between 0 and 100', async () => {  
      const invalidRequest = {  
        userAddress: '0x1234567890123456789012345678901234567890',  
        courseId: 1,  
        progress: 101  
      }  
  
      const request = createRequest(invalidRequest)  
      const response = await POST(request)  
      const data = await response.json()  
  
      expect(response.status).toBe(400)  
      expect(data.error).toBe('Invalid request data')  
    })  

    it('should validate required fields are present', async () => {  
      const invalidRequest = {  
        userAddress: '0x1234567890123456789012345678901234567890',  
        // missing courseId and progress  
      }  
  
      const request = createRequest(invalidRequest)  
      const response = await POST(request)  
      const data = await response.json()  
  
      expect(response.status).toBe(400)  
      expect(data.error).toBe('Invalid request data')  
    })  
  })  

  describe('API Integration', () => {  
    it('should handle valid request successfully', async () => {  
      const mockApiResponse = {  
        data: {  
          signature: '0x1234567890abcdef',  
          deadline: '1234567890',  
          nonce: '1'  
        }  
      }  
  
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({  
        ok: true,  
        json: async () => mockApiResponse  
      })  
  
      const validRequest = {  
        userAddress: '0x1234567890123456789012345678901234567890',  
        courseId: 1,  
        progress: 100  
      }  
  
      const request = createRequest(validRequest)  
      const response = await POST(request)  
      const data = await response.json()  
  
      expect(response.status).toBe(200)  
      expect(data.data).toEqual(mockApiResponse.data)  
      expect(data.timestamp).toBeDefined()  
    })  

    it('should handle API error response', async () => {  
      const mockErrorResponse = {  
        error: 'Internal server error'  
      }  
  
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({  
        ok: false,  
        status: 500,  
        json: async () => mockErrorResponse  
      })  
  
      const validRequest = {  
        userAddress: '0x1234567890123456789012345678901234567890',  
        courseId: 1,  
        progress: 100  
      }  
  
      const request = createRequest(validRequest)  
      const response = await POST(request)  
      const data = await response.json()  
  
      expect(response.status).toBe(500)  
      expect(data.error).toBeDefined()  
    })  

    it('should handle network errors', async () => {  
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(  
        new Error('Network error')  
      )  
  
      const validRequest = {  
        userAddress: '0x1234567890123456789012345678901234567890',  
        courseId: 1,  
        progress: 100  
      }  
  
      const request = createRequest(validRequest)  
      const response = await POST(request)  
      const data = await response.json()  
  
      expect(response.status).toBe(500)  
      expect(data.error).toBeDefined()  
    })  
  })  

  describe('Environment Configuration', () => {  
    it('should handle missing API_URL', async () => {  
      process.env.API_URL = undefined  
  
      const validRequest = {  
        userAddress: '0x1234567890123456789012345678901234567890',  
        courseId: 1,  
        progress: 100  
      }  
  
      const request = createRequest(validRequest)  
      const response = await POST(request)  
      const data = await response.json()  
  
      expect(response.status).toBe(500)  
      expect(data.error).toBe('API configuration error')  
    })  
  })  

  describe('Response Format', () => {  
    it('should include timestamp in response', async () => {  
      const mockApiResponse = {  
        data: {  
          signature: '0x1234567890abcdef',  
          deadline: '1234567890',  
          nonce: '1'  
        }  
      }  
  
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({  
        ok: true,  
        json: async () => mockApiResponse  
      })  
  
      const validRequest = {  
        userAddress: '0x1234567890123456789012345678901234567890',  
        courseId: 1,  
        progress: 100  
      }  
  
      const request = createRequest(validRequest)  
      const response = await POST(request)  
      const data = await response.json()  
  
      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)  
    })  

    it('should validate API response format', async () => {  
      const mockInvalidResponse = {  
        data: {  
          // missing required fields  
        }  
      }  
  
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({  
        ok: true,  
        json: async () => mockInvalidResponse  
      })  
  
      const validRequest = {  
        userAddress: '0x1234567890123456789012345678901234567890',  
        courseId: 1,  
        progress: 100  
      }  
  
      const request = createRequest(validRequest)  
      const response = await POST(request)  
      const data = await response.json()  
  
      expect(response.status).toBe(502)  
      expect(data.error).toBe('Invalid API response format')  
    })  
  })  
})  