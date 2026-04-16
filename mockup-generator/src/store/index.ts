import { defineStore } from 'pinia'

export const useMockupStore = defineStore('mockup', {
  state: () => ({
    // Available templates
    templates: [
      {
        id: 'default1',
        name: 'iPhone 默认',
        type: 'phone',
        frameImg: '/iphone-frame.svg',
        screenWidth: 356,
        screenHeight: 756,
        screenOffsetX: 22,
        screenOffsetY: 22,
        frameWidth: 400,
        frameHeight: 800,
        zIndex: 10 // Frame on top of the image
      },
      {
        id: 'mac1',
        name: 'MacBook 桌面',
        type: 'desktop',
        frameImg: '/mac-frame.svg',
        screenWidth: 640,
        screenHeight: 400,
        screenOffsetX: 30,
        screenOffsetY: 30,
        frameWidth: 700,
        frameHeight: 460,
        zIndex: 10
      }
    ],
    // Selected template
    activeTemplateId: 'default1',
    
    // User uploaded image
    userImage: null as string | null,
    
    // Background settings
    bgType: 'color', // 'color', 'gradient', 'image', 'transparent'
    bgColor: '#e2e8f0',
    bgGradient: 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    bgImage: null as string | null,
    
    // Additional settings
    scale: 1, // Canvas zoom scale
    imageScale: 1, // Uploaded image scale inside frame
  }),
  getters: {
    activeTemplate: (state) => state.templates.find(t => t.id === state.activeTemplateId) || state.templates[0]
  },
  actions: {
    setActiveTemplate(id: string) {
      this.activeTemplateId = id
    },
    setUserImage(img: string | null) {
      this.userImage = img
    },
    setBgType(type: string) {
      this.bgType = type
    },
    setBgColor(color: string) {
      this.bgColor = color
      this.bgType = 'color'
    }
  }
})
