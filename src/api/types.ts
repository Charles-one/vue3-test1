export interface LoginData {
  username: string
  password: string
}

export interface LoginResponse {
  code: number
  data: {
    token: string
  }
  message: string
} 