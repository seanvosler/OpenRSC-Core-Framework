export type AdminExtensionMode = 'iframe' | 'component'

export interface AdminExtensionDescriptor {
  id: string
  name: string
  route: string
  mode: AdminExtensionMode
  url?: string
  category?: string
  requiredCapabilities?: string[]
}
