<template>
  <view class="container">
    <!-- 顶部渐变标题区 -->
    <view class="header-banner">
      <view class="header-bg">
        <view class="bg-circle circle-1"></view>
        <view class="bg-circle circle-2"></view>
        <view class="bg-circle circle-3"></view>
      </view>
      <view class="header-content">
        <view class="title">免费证件照制作</view>
        <view class="subtitle">让每一张证件照都完美无瑕</view>
        <view class="header-tags">
          <view class="header-tag">专业</view>
          <view class="header-tag">高效</view>
          <view class="header-tag">便捷</view>
        </view>
      </view>
    </view>

    <!-- 功能展示容器 -->
    <view class="features-container">
      <view class="section-title-box">
        <view class="section-icon">✨</view>
        <text class="section-title">强大功能</text>
      </view>
      
      <view class="waterfall-wrapper">
        <!-- 左列 -->
        <view class="waterfall-column">
          <!-- 1. 换背景颜色 -->
          <view class="feature-item" @tap="showFeatureDetail('background')">
            <view class="feature-bg bg-1"></view>
            <view class="feature-content">
              <text class="feature-icon">🎨</text>
              <text class="feature-title">智能换底色</text>
              <text class="feature-desc">一键更换证件照背景</text>
              <view class="color-dots">
                <view class="dot dot-red"></view>
                <view class="dot dot-blue"></view>
                <view class="dot dot-white"></view>
                <view class="dot dot-gray"></view>
              </view>
            </view>
          </view>

          <!-- 4. 水印 -->
          <view class="feature-item" @tap="showFeatureDetail('watermark')">
            <view class="feature-bg bg-4"></view>
            <view class="feature-content">
              <text class="feature-icon">🔖</text>
              <text class="feature-title">个性水印</text>
              <text class="feature-desc">自定义水印标识</text>
              <view class="watermark-tags">
                <view class="watermark-tag">↔️ 间距</view>
                <view class="watermark-tag">📏 大小</view>
              </view>
            </view>
          </view>

          <!-- 5. 其他 -->
          <view class="feature-item" @tap="showFeatureDetail('other')">
            <view class="feature-bg bg-5"></view>
            <view class="feature-content">
              <text class="feature-icon">⚙️</text>
              <text class="feature-title">其他设置</text>
              <text class="feature-desc">更多专业调整选项</text>
              <view class="other-tags">
                <view class="other-tag">📦 KB大小</view>
                <view class="other-tag">👤 面部比例</view>
              </view>
            </view>
          </view>
        </view>

        <!-- 右列 -->
        <view class="waterfall-column">
          <!-- 2. 尺寸 -->
          <view class="feature-item" @tap="showFeatureDetail('size')">
            <view class="feature-bg bg-2"></view>
            <view class="feature-content">
              <text class="feature-icon">📐</text>
              <text class="feature-title">多种尺寸</text>
              <text class="feature-desc">适配各类证件需求</text>
              <view class="size-tags">
                <view class="size-tag">一寸 295×413</view>
                <view class="size-tag">二寸 413×626</view>
                <view class="size-tag">小一寸 260×378</view>
                <view class="size-tag">大一寸 390×567</view>
				<view class="size-tag">小二寸 413x531</view>
              </view>
            </view>
          </view>

          <!-- 3. 美颜 -->
          <view class="feature-item" @tap="showFeatureDetail('beauty')">
            <view class="feature-bg bg-3"></view>
            <view class="feature-content">
              <text class="feature-icon">✨</text>
              <text class="feature-title">智能美颜</text>
              <text class="feature-desc">多维度智能优化</text>
              <view class="beauty-tags">
                <view class="beauty-tag">💡 亮度</view>
                <view class="beauty-tag">🌓 对比度</view>
                <view class="beauty-tag">🎨 饱和度</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 为什么选择我们 -->
    <view class="advantage-section">
      <view class="section-title-box">
        <view class="section-icon">🎯</view>
        <text class="section-title">为什么选择我们</text>
      </view>
      
      <view class="advantage-cards">
        <view class="advantage-card card-1">
          <view class="advantage-card-bg"></view>
          <text class="advantage-icon">⚡</text>
          <text class="advantage-title">极速生成</text>
          <text class="advantage-text">AI智能处理\n3秒完成制作</text>
        </view>

        <view class="advantage-card card-2">
          <view class="advantage-card-bg"></view>
          <text class="advantage-icon">🎯</text>
          <text class="advantage-title">精准识别</text>
          <text class="advantage-text">深度学习算法\n抠图更精确</text>
        </view>

        <view class="advantage-card card-3">
          <view class="advantage-card-bg"></view>
          <text class="advantage-icon">💎</text>
          <text class="advantage-title">高清输出</text>
          <text class="advantage-text">300DPI\n打印级分辨率</text>
        </view>
      </view>
    </view>

    <!-- 底部悬浮按钮 -->
    <view class="float-button-area">
      <button class="make-button" @tap="goToMake">
        <view class="button-shine"></view>
        <text class="button-text">开始制作证件照</text>
        <text class="button-arrow">→</text>
      </button>
    </view>
  </view>
</template>

<script>
import { login } from '@/utils/auth.js';

export default {
  data() {
    return {}
  },
  methods: {
    async goToMake() {
      const token = uni.getStorageSync('token');
      if (!token) {
        try {
          await login();
        } catch (e) {
          return; // Login failed, don't proceed
        }
      }
      uni.switchTab({
        url: '/pages/make/make'
      })
    },
    showFeatureDetail(type) {
      const featureInfo = {
        background: '支持红、蓝、白、灰等多种背景色，一键智能更换',
        size: '包含一寸、二寸、小一寸、大一寸等常用尺寸',
        beauty: '美白美颜：支持亮度、对比度、饱和度调节',
        watermark: '个性水印：自定义文字内容、间距、大小',
        other: '其他设置：精确控制KB大小、智能调整面部比例'
      }
      
      uni.showToast({
        title: featureInfo[type] || '敬请期待',
        icon: 'none',
        duration: 2500
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f7fb;
  padding-bottom: 140rpx;
}

.header-banner {
  position: relative;
  height: 360rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  padding: 50rpx 40rpx 30rpx;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 300rpx;
  height: 300rpx;
  top: -80rpx;
  right: -80rpx;
  animation: float 6s ease-in-out infinite;
}

.circle-2 {
  width: 200rpx;
  height: 200rpx;
  bottom: -60rpx;
  left: -60rpx;
  animation: float 8s ease-in-out infinite;
}

.circle-3 {
  width: 150rpx;
  height: 150rpx;
  top: 40%;
  left: 30%;
  animation: float 7s ease-in-out infinite;
}

.header-content {
  position: relative;
  z-index: 2;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
  text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 32rpx;
  line-height: 1.5;
}

.header-tags {
  display: flex;
  gap: 16rpx;
}

.header-tag {
  padding: 10rpx 20rpx;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10rpx);
  border-radius: 30rpx;
  font-size: 22rpx;
  color: #ffffff;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20rpx) rotate(10deg);
  }
}

.features-container {
  position: relative;
  margin: -60rpx 30rpx 40rpx;
  padding: 40rpx 32rpx;
  background: #ffffff;
  border-radius: 32rpx;
  box-shadow: 0 12rpx 48rpx rgba(0, 0, 0, 0.08);
}

.section-title-box {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
}

.section-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.section-title {
  font-size: 38rpx;
  font-weight: bold;
  color: #1a1a1a;
}

.waterfall-wrapper {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.feature-item {
  position: relative;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.feature-item:active {
  transform: scale(0.97);
}

.feature-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.08;
}

.bg-1 { background: linear-gradient(135deg, #ff6b6b 0%, #ffd89b 100%); }
.bg-2 { background: linear-gradient(135deg, #5e72e4 0%, #a8edea 100%); }
.bg-3 { background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%); }
.bg-4 { background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%); }
.bg-5 { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); }

.feature-content {
  position: relative;
  z-index: 2;
  padding: 28rpx 24rpx;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.feature-icon {
  font-size: 44rpx;
  margin-bottom: 12rpx;
}

.feature-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 8rpx;
}

.feature-desc {
  font-size: 22rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 4rpx;
}

.color-dots {
  display: flex;
  gap: 12rpx;
  margin-top: 12rpx;
}

.dot {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.dot-red { background: #ff4444; }
.dot-blue { background: #438cef; }
.dot-white { background: #ffffff; border: 2rpx solid #e0e0e0; }
.dot-gray { background: #9e9e9e; }

.size-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 12rpx;
}

.size-tag {
  padding: 5rpx 12rpx;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 12rpx;
  font-size: 20rpx;
  color: #667eea;
  border: 1rpx solid #667eea30;
}

.beauty-tags {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  margin-top: 12rpx;
}

.beauty-tag {
  padding: 6rpx 12rpx;
  background: linear-gradient(135deg, #fbc2eb15 0%, #a6c1ee15 100%);
  border-radius: 12rpx;
  font-size: 20rpx;
  color: #9b59b6;
  border: 1rpx solid #9b59b630;
  display: flex;
  align-items: center;
}

.watermark-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 12rpx;
}

.watermark-tag {
  padding: 6rpx 12rpx;
  background: linear-gradient(135deg, #a1c4fd15 0%, #c2e9fb15 100%);
  border-radius: 12rpx;
  font-size: 20rpx;
  color: #3498db;
  border: 1rpx solid #3498db30;
  display: flex;
  align-items: center;
}

.other-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 12rpx;
}

.other-tag {
  padding: 6rpx 12rpx;
  background: linear-gradient(135deg, #ffecd215 0%, #fcb69f15 100%);
  border-radius: 12rpx;
  font-size: 20rpx;
  color: #e67e22;
  border: 1rpx solid #e67e2230;
  display: flex;
  align-items: center;
}

.advantage-section {
  padding: 0 30rpx 40rpx;
}

.advantage-cards {
  display: flex;
  gap: 20rpx;
  justify-content: space-between;
}

.advantage-card {
  position: relative;
  flex: 1;
  padding: 36rpx 20rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.advantage-card-bg {
  position: absolute;
  bottom: -50rpx;
  right: -50rpx;
  width: 150rpx;
  height: 150rpx;
  border-radius: 50%;
  opacity: 0.08;
}

.card-1 .advantage-card-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-2 .advantage-card-bg {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.card-3 .advantage-card-bg {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.advantage-icon {
  font-size: 56rpx;
  margin-bottom: 16rpx;
  position: relative;
  z-index: 2;
}

.advantage-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 12rpx;
  position: relative;
  z-index: 2;
}

.advantage-text {
  font-size: 22rpx;
  color: #666;
  line-height: 1.6;
  position: relative;
  z-index: 2;
  white-space: pre-line;
}

.float-button-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx 40rpx;
  background: linear-gradient(to top, rgba(245, 247, 251, 1) 70%, rgba(245, 247, 251, 0));
  z-index: 100;
}

.make-button {
  position: relative;
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 40rpx rgba(102, 126, 234, 0.4);
  border: none;
  overflow: hidden;
}

.make-button:active {
  transform: scale(0.98);
}

.button-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine 3s infinite;
}

.button-text {
  font-size: 34rpx;
  font-weight: bold;
  color: #ffffff;
  margin-right: 12rpx;
  position: relative;
  z-index: 2;
}

.button-arrow {
  font-size: 34rpx;
  color: #ffffff;
  font-weight: bold;
  position: relative;
  z-index: 2;
  animation: arrow-move 1s infinite;
}

@keyframes shine {
  0% {
    transform: translateX(-100%) translateY(-100%);
  }
  100% {
    transform: translateX(100%) translateY(100%);
  }
}

@keyframes arrow-move {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(8rpx);
  }
}
</style>
