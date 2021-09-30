declare module '*/export.json' {
  const exportConfig: {
    channels: {
      filter: string[]
      ignore: string[]
    }
    exportDir: 'exports' | string
    strategy: 'channels' | 'bulk'
  }
  export default exportConfig
}
