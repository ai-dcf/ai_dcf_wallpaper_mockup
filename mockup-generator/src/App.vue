<template>
  <div class="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden text-gray-800">
    <!-- Header -->
    <header class="h-14 bg-white shadow-sm border-b flex items-center px-6 justify-between shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">M</div>
        <h1 class="text-xl font-bold m-0 text-gray-800 tracking-wide">MJCN 壁纸样机生成器 (Clone)</h1>
      </div>
      <div class="flex items-center gap-4">
        <a-button type="primary" class="bg-green-500 hover:bg-green-600 border-none">登录</a-button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex overflow-hidden">
      <!-- Left Sidebar: Templates -->
      <aside class="w-64 bg-white border-r shadow-inner flex flex-col overflow-hidden shrink-0 z-10">
        <div class="p-4 font-semibold border-b bg-gray-50">选择模板</div>
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <div 
            v-for="template in mockupStore.templates" 
            :key="template.id"
            @click="mockupStore.setActiveTemplate(template.id)"
            class="group cursor-pointer rounded-lg border-2 p-2 hover:shadow-md transition-all relative overflow-hidden"
            :class="mockupStore.activeTemplateId === template.id ? 'border-green-500 shadow-sm' : 'border-transparent bg-gray-50 hover:border-gray-200'"
          >
            <div class="h-32 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden mb-2">
              <img :src="template.frameImg" class="max-h-full max-w-full object-contain" alt=""/>
            </div>
            <div class="text-center font-medium text-sm">{{ template.name }}</div>
            <!-- Checkmark badge if selected -->
            <div v-if="mockupStore.activeTemplateId === template.id" class="absolute top-1 right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              <CheckOutlined />
            </div>
          </div>
        </div>
      </aside>

      <!-- Center Canvas Area -->
      <section class="flex-1 relative flex items-center justify-center overflow-hidden bg-[#e5e7eb] canvas-container" ref="canvasContainerRef">
        <!-- The Render Target -->
        <div 
          ref="renderTargetRef"
          class="relative shadow-2xl transition-transform duration-200 ease-out flex items-center justify-center"
          :style="computedCanvasStyle"
        >
          <!-- Frame Image (Top or Bottom depending on zIndex) -->
          <img 
            :src="activeTemplate.frameImg" 
            class="absolute pointer-events-none"
            :style="{ zIndex: activeTemplate.zIndex, width: activeTemplate.frameWidth + 'px', height: activeTemplate.frameHeight + 'px' }"
          />
          
          <!-- User Image Layer -->
          <div 
            class="absolute overflow-hidden flex items-center justify-center bg-gray-200"
            :style="{
              width: activeTemplate.screenWidth + 'px',
              height: activeTemplate.screenHeight + 'px',
              left: activeTemplate.screenOffsetX + 'px',
              top: activeTemplate.screenOffsetY + 'px',
              zIndex: 5
            }"
          >
            <img 
              v-if="mockupStore.userImage" 
              :src="mockupStore.userImage" 
              class="object-cover w-full h-full"
              alt="User Upload"
            />
            <div v-else class="text-gray-400 flex flex-col items-center gap-2">
              <PictureOutlined class="text-3xl" />
              <span>上传图片</span>
            </div>
          </div>
        </div>
        
        <!-- Canvas Controls (Zoom etc) -->
        <div class="absolute bottom-6 right-6 bg-white rounded-full shadow-lg border px-4 py-2 flex items-center gap-4">
          <a-button type="text" shape="circle" @click="zoomOut"><MinusOutlined /></a-button>
          <span class="text-sm font-medium w-12 text-center">{{ Math.round(zoomScale * 100) }}%</span>
          <a-button type="text" shape="circle" @click="zoomIn"><PlusOutlined /></a-button>
        </div>
      </section>

      <!-- Right Sidebar: Settings -->
      <aside class="w-80 bg-white border-l shadow-xl flex flex-col shrink-0 z-10 overflow-hidden">
        <div class="p-4 font-semibold border-b bg-gray-50 flex justify-between items-center">
          <span>设置面板</span>
        </div>
        
        <div class="flex-1 overflow-y-auto p-5 space-y-8">
          <!-- Background Settings -->
          <div>
            <h3 class="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">背景设置</h3>
            <a-radio-group v-model:value="mockupStore.bgType" class="w-full grid grid-cols-4 gap-2 text-center">
              <a-radio-button value="image" class="!px-0"><PictureOutlined /></a-radio-button>
              <a-radio-button value="gradient" class="!px-0"><BgColorsOutlined /></a-radio-button>
              <a-radio-button value="color" class="!px-0"><FormatPainterOutlined /></a-radio-button>
              <a-radio-button value="transparent" class="!px-0"><BorderOuterOutlined /></a-radio-button>
            </a-radio-group>
            
            <div class="mt-4 p-3 bg-gray-50 rounded-lg border">
              <div v-if="mockupStore.bgType === 'color'" class="flex items-center gap-3">
                <input type="color" v-model="mockupStore.bgColor" class="w-8 h-8 rounded cursor-pointer border-none p-0" />
                <span class="text-sm text-gray-600 uppercase">{{ mockupStore.bgColor }}</span>
              </div>
              <div v-if="mockupStore.bgType === 'gradient'" class="text-sm text-gray-500">
                暂使用默认渐变色 (可扩展)
              </div>
              <div v-if="mockupStore.bgType === 'transparent'" class="text-sm text-gray-500">
                导出时背景将为透明
              </div>
              <div v-if="mockupStore.bgType === 'image'" class="text-sm text-gray-500">
                请上传背景图
              </div>
            </div>
          </div>
          
          <a-divider />

          <!-- Image Upload -->
          <div>
            <h3 class="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">壁纸上传</h3>
            <div 
              class="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
              @click="triggerUpload"
            >
              <CloudUploadOutlined class="text-4xl text-green-500 mb-3" />
              <div class="font-medium text-gray-700">点击或拖拽图片到此</div>
              <div class="text-xs text-gray-400 mt-2">支持 JPG, PNG 格式</div>
              <input type="file" ref="fileInputRef" class="hidden" accept="image/*" @change="handleFileUpload" />
            </div>
            <div v-if="mockupStore.userImage" class="mt-3 flex justify-between items-center">
              <span class="text-sm text-green-600 flex items-center gap-1"><CheckCircleOutlined /> 已上传</span>
              <a-button danger size="small" type="text" @click="mockupStore.setUserImage(null)">清除</a-button>
            </div>
          </div>

        </div>

        <!-- Export Footer -->
        <div class="p-5 border-t bg-gray-50">
          <a-button type="primary" size="large" block class="bg-gray-800 hover:bg-black border-none h-12 text-lg font-bold" @click="exportImage" :loading="isExporting">
            <DownloadOutlined /> 保存/导出
          </a-button>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMockupStore } from './store'
import { 
  CheckOutlined, PlusOutlined, MinusOutlined, 
  PictureOutlined, BgColorsOutlined, FormatPainterOutlined, 
  BorderOuterOutlined, CloudUploadOutlined, CheckCircleOutlined, DownloadOutlined 
} from '@ant-design/icons-vue'
import html2canvas from 'html2canvas'

const mockupStore = useMockupStore()
const activeTemplate = computed(() => mockupStore.activeTemplate)

// Zoom functionality
const zoomScale = ref(1)
const canvasContainerRef = ref<HTMLElement | null>(null)
const renderTargetRef = ref<HTMLElement | null>(null)
const isExporting = ref(false)

const zoomIn = () => {
  if (zoomScale.value < 3) zoomScale.value += 0.1
}
const zoomOut = () => {
  if (zoomScale.value > 0.2) zoomScale.value -= 0.1
}

// Auto-fit logic
const fitToScreen = () => {
  if (!canvasContainerRef.value || !activeTemplate.value) return
  const containerW = canvasContainerRef.value.clientWidth
  const containerH = canvasContainerRef.value.clientHeight
  const targetW = activeTemplate.value.frameWidth + 100 // padding
  const targetH = activeTemplate.value.frameHeight + 100
  
  const scaleX = containerW / targetW
  const scaleY = containerH / targetH
  const minScale = Math.min(scaleX, scaleY, 1) // don't scale up past 1 initially
  
  zoomScale.value = minScale
}

onMounted(() => {
  window.addEventListener('resize', fitToScreen)
  setTimeout(fitToScreen, 100)
})
onUnmounted(() => {
  window.removeEventListener('resize', fitToScreen)
})

// Background style for the render target
const computedCanvasStyle = computed(() => {
  const baseStyle: Record<string, string> = {
    transform: `scale(${zoomScale.value})`,
    width: `${activeTemplate.value.frameWidth + 80}px`, // Padding around the device for background
    height: `${activeTemplate.value.frameHeight + 80}px`,
  }
  
  if (mockupStore.bgType === 'color') {
    baseStyle.backgroundColor = mockupStore.bgColor
  } else if (mockupStore.bgType === 'gradient') {
    baseStyle.background = mockupStore.bgGradient
  } else if (mockupStore.bgType === 'transparent') {
    baseStyle.backgroundColor = 'transparent'
  } else if (mockupStore.bgType === 'image') {
    // Add image logic
    baseStyle.backgroundColor = '#ccc'
  }
  
  return baseStyle
})

// File Upload
const fileInputRef = ref<HTMLInputElement | null>(null)

const triggerUpload = () => {
  fileInputRef.value?.click()
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      mockupStore.setUserImage(e.target.result as string)
    }
  }
  reader.readAsDataURL(file)
}

// Export logic
const exportImage = async () => {
  if (!renderTargetRef.value) return
  isExporting.value = true
  
  try {
    // Temporarily reset transform for clean capture
    const originalTransform = renderTargetRef.value.style.transform
    renderTargetRef.value.style.transform = 'none'
    
    const canvas = await html2canvas(renderTargetRef.value, {
      backgroundColor: mockupStore.bgType === 'transparent' ? null : null,
      scale: 2, // High resolution
      useCORS: true,
      logging: false
    })
    
    // Restore transform
    renderTargetRef.value.style.transform = originalTransform
    
    const dataUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `mockup-${Date.now()}.png`
    a.click()
  } catch (error) {
    console.error('Export failed:', error)
    alert('导出失败，请重试')
  } finally {
    isExporting.value = false
  }
}
</script>
