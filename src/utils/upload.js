export class ChunkUpload {
  constructor(file, options = {}) {
    this.file = file
    this.chunkSize = options.chunkSize || 2 * 1024 * 1024 // 2MB
    this.chunks = Math.ceil(file.size / this.chunkSize)
    this.currentChunk = 0
  }

  async uploadChunks(uploadUrl) {
    const chunkPromises = []
    
    for (let i = 0; i < this.chunks; i++) {
      const start = i * this.chunkSize
      const end = Math.min(start + this.chunkSize, this.file.size)
      const chunk = this.file.slice(start, end)
      
      const formData = new FormData()
      formData.append('file', chunk)
      formData.append('chunk', i)
      formData.append('chunks', this.chunks)
      formData.append('filename', this.file.name)
      
      chunkPromises.push(
        fetch(uploadUrl, {
          method: 'POST',
          body: formData
        })
      )
    }
    
    return Promise.all(chunkPromises)
  }

  async upload(uploadUrl) {
    try {
      await this.uploadChunks(uploadUrl)
      // 通知服务器所有分片上传完成
      await fetch(`${uploadUrl}/merge`, {
        method: 'POST',
        body: JSON.stringify({
          filename: this.file.name,
          chunks: this.chunks
        })
      })
      return true
    } catch (error) {
      console.error('Upload failed:', error)
      return false
    }
  }
} 