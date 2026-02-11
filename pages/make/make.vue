<template>
	<view class="make-container">
		<view class="preview-section">
			<view class="photo-card" @click="chooseImage">
				<image v-if="sourceImage" :src="sourceImage" mode="aspectFit" class="main-photo" />
				<view v-else class="upload-placeholder">
					<view class="plus-icon">
						<view class="line-h"></view>
						<view class="line-v"></view>
					</view>
					<text>点击上传照片</text>
				</view>
			</view>

			<view class="light-tip">
				<view class="dot"></view>
				<text>照片已锁定，点击可更换</text>
			</view>
		</view>

		<view class="config-section">
			<view class="module-header">
				<view class="title-left">
					<view class="title-row">
						<text class="title">{{ modules[currentStep].title }}</text>
						<text class="subtitle">{{ modules[currentStep].enTitle }}</text>
					</view>
					<view class="custom-dots">
						<view v-for="(item, index) in modules" :key="index" class="dot-item"
							:class="{ active: currentStep === index }"></view>
					</view>
				</view>

				<view class="header-btns">
					<view class="reset-btn" @click="resetCurrentModule">
						<text>重置</text>
					</view>
					<view class="reset-all-btn" @click="resetAll">
						<text>全部重置</text>
					</view>
				</view>
			</view>

			<swiper class="config-swiper" :current="currentStep" @change="onSwiperChange">
				<swiper-item>
					<size-selector v-model="currentSize" :remoteSizes="remoteSizes" @open-modal="handleOpenSizeModal" />
				</swiper-item>

				<swiper-item>
					<color-selector v-model="currentBgColor" v-model:renderMode="renderMode" />
				</swiper-item>

				<swiper-item>
					<beauty-selector v-model="beautyConfig" />
				</swiper-item>

				<swiper-item>
					<watermark-selector v-model="watermarkConfig" />
				</swiper-item>

				<swiper-item>
					<other-selector v-model="otherConfig" />
				</swiper-item>
			</swiper>
		</view>

		<view class="bottom-bar">
			<view class="info-section" @click="showDetail = true">
				<view class="info-row">
					<text class="label">
						{{ getSelectedSummary() }}
					</text>
					<text class="arrow-up">▲</text>
				</view>
				<text class="cost">消耗 1 积分 (点击查看)</text>
			</view>
			<button class="action-btn" @click="startProcess">开始制作</button>
		</view>

		<view class="mask" v-if="showSizeModal" @click="showSizeModal = false">
			<view class="popup-panel" @click.stop>
				<view class="popup-header">
					<text>全部规格</text>
					<text class="close" @click="showSizeModal = false">✕</text>
				</view>
				<scroll-view scroll-y="true" class="list-scroll">
					<view v-for="(item, index) in remoteSizes" :key="index" class="size-item"
						@click="confirmRemoteSize(item)">
						<view>
							<view class="n">{{ item.name }}</view>
							<view class="p">{{ item.px }}</view>
						</view>
						<view class="radio" :class="{ checked: currentSize && currentSize.name === item.name }"></view>
					</view>
				</scroll-view>
			</view>
		</view>

		<view class="mask" v-if="showDetail" @click="showDetail = false">
			<view class="popup-panel" @click.stop>
				<view class="popup-header">确认已选参数</view>
				<view class="popup-content">
					<view class="param-item">
						<text class="p-label">尺寸规格</text>
						<text class="p-value">{{ currentSize ? currentSize.name : '未选择' }}</text>
					</view>
					<view class="param-item">
						<text class="p-label">背景颜色</text>
						<text class="p-value">{{ getBgName(currentBgColor) }}</text>
					</view>
					<view class="param-item">
						<text class="p-label">智能美颜</text>
						<text class="p-value">{{ beautyConfig.enable ? '已开启' : '未开启' }}</text>
					</view>
					<view class="param-item">
						<text class="p-label">防盗水印</text>
						<text class="p-value">{{ watermarkConfig.enable ? '已开启' : '未开启' }}</text>
					</view>
					<view class="param-item">
						<text class="p-label">渲染模式</text>
						<text class="p-value">{{ getModeLabel(renderMode) }}</text>
					</view>
				</view>
				<button class="confirm-btn" @click="showDetail = false">我知道了</button>
			</view>
		</view>

		<view class="result-mask" v-if="showResultModal" @tap.stop="showResultModal = false">
			<view class="result-card-popup" @tap.stop>
				<view class="popup-title">结果确认</view>

				<view class="result-preview-wrap">
					<image :src="resultImageUrl" mode="aspectFit" class="result-img" @tap="previewImage" />
					<view class="success-tag">生成成功</view>
				</view>

				<view class="result-tips">
					<text class="t-1">温馨提示</text>
					<text class="t-2">若无法直接保存，请长按图片通过预览保存。</text>
				</view>

				<view class="result-btns">
					<button class="btn-save" @tap="saveToAlbum">保存到相册</button>
					<button class="btn-back" @tap="showResultModal = false">返回修改</button>
				</view>
			</view>
		</view>
		
		<!-- 自定义加载动画 -->
		<!-- 制作中加载动画 -->
		<view class="custom-loading-mask premium-loading" v-if="isProcessing">
			<view class="loading-card shadow-glass">
				<view class="spinner-visual">
					<view class="orbit-container">
						<view class="orbit-path"></view>
						<view class="orbit-dot"></view>
					</view>
					<view class="core-glow"></view>
				</view>
				<view class="text-group">
					<text class="loading-text gradient-text">正在为您精心制作</text>
					<text class="loading-tip">AI 引擎正在生成完美证件照...</text>
				</view>
			</view>
		</view>

		<!-- 安全性检测加载动画 -->
		<view class="custom-loading-mask premium-loading" v-if="isCheckingSafety">
			<view class="loading-card shadow-glass">
				<view class="spinner-visual safety-theme">
					<view class="pulse-ring"></view>
					<view class="shield-icon">🛡️</view>
				</view>
				<view class="text-group">
					<text class="loading-text gradient-text">安全性检测中</text>
					<text class="loading-tip">为了您的照片安全，正在进行合规性验证</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import SizeSelector from './components/size-selector.vue';
	import ColorSelector from './components/color-selector.vue';
	import BeautySelector from './components/beauty-selector.vue';
	import WatermarkSelector from './components/watermark-selector.vue';
	import OtherSelector from './components/other-selector.vue';
	import {
		createPhotoApi,
		rewardPointsApi,
		getUserInfoApi,
		checkImageSafetyApi,
		getBgColorListApi,
		getSizeListApi
	} from '../../utils/api.js';
	import {
		login
	} from '../../utils/auth.js';

	// --- 1. 状态管理 (统一放在这里) ---
	const currentStep = ref(0);
	const sourceImage = ref('');
	const showDetail = ref(false);
	const showSizeModal = ref(false);
	const remoteSizes = ref([]);

	// 控制结果弹窗的状态
	const showResultModal = ref(false);
	const resultImageUrl = ref('');
	const isProcessing = ref(false); // 自定义加载状态
	const isCheckingSafety = ref(false); // 安全性检测状态
	let videoAd = null; // 激励视频广告实例

	// 默认值常量
	const DEFAULT_SIZE = {
		name: '小一寸',
		px: '260×378 px',
		widthPx: 260,
		heightPx: 378
	};
	const DEFAULT_BG_COLOR = '#FFFFFF';

	// 选中项 - 设置默认值
	const currentSize = ref({
		...DEFAULT_SIZE
	});
	/* ... no changes ... */
	const currentBgColor = ref(DEFAULT_BG_COLOR);
	const renderMode = ref('pure');

	const beautyConfig = ref({
		enable: false,
		whitening: 0,
		brightness: 0,
		contrast: 0,
		saturation: 0,
		sharpening: 0
	});

	const watermarkConfig = ref({
		enable: false,
		text: '仅供办理使用',
		color: '#000000',
		size: 40,
		opacity: 0.5,
		angle: 45,
		spacing: 20
	});

	const otherConfig = ref({
		enable: false,
		faceRatio: 0.20,
		topDistance: 0.12,
		kbEnable: false,
		kbSize: 50,
		dpiEnable: false,
		dpiValue: 300
	});

	// ... modules 和 bgOptions 保持不变 ...
	const modules = [{
		title: '选择规格',
		enTitle: 'SIZE'
	}, {
		title: '选择背景',
		enTitle: 'COLOR'
	}, {
		title: '智能美颜',
		enTitle: 'BEAUTY'
	}, {
		title: '防盗水印',
		enTitle: 'WATERMARK'
	}, {
		title: '其他设置',
		enTitle: 'OTHERS'
	}];
	const bgOptions = ref([]);

	const fetchBgColors = async () => {
		try {
			const data = await getBgColorListApi();
			// 映射字段名以适配现有逻辑
			bgOptions.value = data.map(item => ({
				name: item.name,
				color: item.colorValue
			}));
		} catch (error) {
			console.error('获取背景颜色失败:', error);
			// 降级方案：保留一些基础颜色或提示
			bgOptions.value = [{
				name: '白色',
				color: '#FFFFFF'
			}, {
				name: '蓝色',
				color: '#438EDB'
			}];
		}
	};

	onMounted(() => {
		fetchBgColors();
		fetchSizes();
	});

	const fetchSizes = async () => {
		try {
			const data = await getSizeListApi();
			remoteSizes.value = data.map(i => ({
				name: i.name,
				px: `${i.widthPx}×${i.heightPx} px`,
				widthPx: i.widthPx,
				heightPx: i.heightPx
			}));
		} catch (error) {
			console.error('获取尺寸列表失败:', error);
			// 兜底逻辑：remoteSizes 会由子组件的 staticSizes 提供
		}
	};

	const onSwiperChange = (e) => {
		currentStep.value = e.detail.current;
	};
	const chooseImage = () => {
		uni.chooseImage({
			count: 1,
			success: async (res) => {
				const tempFilePath = res.tempFilePaths[0];
				
				// 开启安全性检测 UI
				isCheckingSafety.value = true;
				try {
					// 调用实际后端安全性检测接口
					const safetyRes = await checkImageSafetyApi(tempFilePath);
					
					if (safetyRes.data && safetyRes.data.passed) {
						sourceImage.value = tempFilePath;
						uni.showToast({
							title: '检测通过',
							icon: 'success'
						});
					} else {
						uni.showModal({
							title: '安全提示',
							content: safetyRes.data.rejectReason || '图片内容不符合规范，请更换图片后重试',
							showCancel: false
						});
					}
				} catch (error) {
					console.error('安全检测失败:', error);
					uni.showToast({
						title: error.message || '检测失败，请重试',
						icon: 'none'
					});
				} finally {
					// 关闭安全性检测 UI
					isCheckingSafety.value = false;
				}
			}
		});
	};
	const handleOpenSizeModal = (data) => {
		remoteSizes.value = data;
		showSizeModal.value = true;
	};
	const confirmRemoteSize = (item) => {
		currentSize.value = item;
		showSizeModal.value = false;
	};
	const resetCurrentModule = () => {
		/* ...保持原样... */
	};
	const getBgName = (color) => {
		if (!color) return '未选择';
		const preset = bgOptions.value.find(i => i.color.toUpperCase() === color.toUpperCase());
		return preset ? preset.name : '自定义';
	};
	const getModeLabel = (mode) => {
		const map = {
			pure: '纯色',
			updown: '渐变',
			center: '中心'
		};
		return map[mode] || '纯色';
	};

	// 全部重置函数
	const resetAll = () => {
		uni.showModal({
			title: '确认重置',
			content: '将清空照片和所有参数设置，确定要重置吗?',
			success: (res) => {
				if (res.confirm) {
					// 清空图片
					sourceImage.value = '';
					// 重置所有参数到默认值
					currentSize.value = {
						...DEFAULT_SIZE
					};
					currentBgColor.value = DEFAULT_BG_COLOR;
					renderMode.value = 'pure';
					beautyConfig.value = {
						enable: false,
/* ... no changes ... */
						whitening: 0,
						brightness: 0,
						contrast: 0,
						saturation: 0,
						sharpening: 0
					};
					watermarkConfig.value = {
						enable: false,
						text: '仅供办理使用',
						color: '#000000',
						size: 40,
						opacity: 0.5,
						angle: 45,
						spacing: 20
					};
					otherConfig.value = {
						enable: false,
						faceRatio: 0.20,
						topDistance: 0.12,
						kbEnable: false,
						kbSize: 50,
						dpiEnable: false,
						dpiValue: 300
					};
					uni.showToast({
						title: '已重置',
						icon: 'success'
					});
				}
			}
		});
	};

	// --- 2. 核心制作逻辑 ---
	import {
		onShow
	} from '@dcloudio/uni-app';

	// 监听来自 History 页面“使用图片”的传值
	onShow(() => {
		const passedImage = uni.getStorageSync('make_source_image');
		if (passedImage) {
			sourceImage.value = passedImage;
			// 用完即焚，避免重复读取
			uni.removeStorageSync('make_source_image');
		}
	});

	const requestCreatePhoto = async (retry = false) => {
		isProcessing.value = true;
		try {
			const params = {
				sizeName: currentSize.value?.name,
				widthPx: currentSize.value?.widthPx,
				heightPx: currentSize.value?.heightPx,
				bgColor: currentBgColor.value,
				renderMode: renderMode.value,
				beautyConfig: beautyConfig.value,
				watermarkConfig: watermarkConfig.value,
				otherConfig: otherConfig.value,
				points: 1
			};

			const res = await createPhotoApi(sourceImage.value, params);

			// --- 逻辑成功区 ---
			isProcessing.value = false;
			resultImageUrl.value = res.data.imageUrl;
			showResultModal.value = true;
			// 制作成功后，让历史记录缓存失效 ---
			uni.removeStorageSync('history_cache_first_page');

			// 把图片映射缓存也清了
			uni.removeStorageSync('history_image_map');
		} catch (error) {
			// --- 逻辑失败区 (API 里的 reject 会掉到这里) ---
			
			// 401 token失效 处理逻辑
			if (error.code === 401 && !retry) {
				console.log('Token失效，尝试自动登录...');
				// 暂时隐藏制作中loading，因为login会有自己的loading
				isProcessing.value = false;
				try {
					await login();
					// 登录成功，重试一次
					requestCreatePhoto(true);
				} catch (e) {
					isProcessing.value = false;
					uni.showToast({
						title: '登录失败，请重新尝试',
						icon: 'none'
					});
				}
				return;
			}
			
			// 30003 积分不足 处理逻辑
			if (error.code === 30003) {
				isProcessing.value = false;
				showAdRewardModal();
				return;
			}

			isProcessing.value = false;
			console.log('制作失败详情:', error);
			let tip = error.message;

			uni.showToast({
				title: tip,
				icon: 'none',
				duration: 3000
			});
		}
	};
	
	const showAdRewardModal = () => {
		uni.showModal({
			title: '积分不足',
			content: '您的积分不足，观看广告可获取积分，是否前往观看？',
			success: (res) => {
				if (res.confirm) {
					loadAndShowAd();
				}
			}
		});
	};
	
	const handleAdClose = async (isEnded) => {
		if (isEnded) {
			const adUnitId = uni.getStorageSync('adUnitId');
			const isTestMode = !adUnitId || adUnitId === '-1';

			if (isTestMode) {
				// 测试模式：为了方便测试，前端直接调用加积分接口
				rewardPointsApi().then(() => {
					showSuccessModal();
				}).catch(err => {
					uni.showToast({
						title: '奖励发放失败',
						icon: 'none'
					});
				});
			} else {
				// 正式模式：服务端回调加积分，前端查询验证
				uni.showLoading({
					title: '正在核实奖励...'
				});
				
				// 轮询查询积分是否到账 (最多查5次，每次间隔1秒)
				let checkCount = 0;
				const maxChecks = 5;
				
				const checkPoints = async () => {
					try {
						const userInfo = await getUserInfoApi();
						// 假设制作需要1积分，只要有积分就认为到账了（这里简化判断，积分大于0即可）
						// 更严谨可以记录看广告前的积分做对比
						if (userInfo.points && userInfo.points > 0) {
							uni.hideLoading();
							showSuccessModal();
							return;
						}
						
						checkCount++;
						if (checkCount < maxChecks) {
							setTimeout(checkPoints, 1000);
						} else {
							uni.hideLoading();
							// 超时未查询到，但也可能到账了，提示用户重试
							uni.showModal({
								title: '提示',
								content: '奖励核实超时，请点击确认重试制作',
								success: (res) => {
									if (res.confirm) {
										requestCreatePhoto();
									}
								}
							});
						}
					} catch (e) {
						checkCount++;
						if (checkCount < maxChecks) {
							setTimeout(checkPoints, 1000);
						} else {
							uni.hideLoading();
							uni.showToast({
								title: '核实奖励失败，请重试',
								icon: 'none'
							});
						}
					}
				};
				
				checkPoints();
			}
		} else {
			// 播放中途退出
			uni.showToast({
				title: '观看完整广告才能获取积分哦',
				icon: 'none'
			});
		}
	};
	
	const showSuccessModal = () => {
		uni.showModal({
			title: '获取成功',
			content: '积分已到账，是否重新开始制作？',
			success: (res) => {
				if (res.confirm) {
					requestCreatePhoto();
				}
			}
		});
	};

	const loadAndShowAd = async () => {
		try {
			// 1. 获取广告配置 (改为从缓存获取)
			let adUnitId = uni.getStorageSync('adUnitId');

			// 如果没有配置，或者明确是 -1，都视为测试环境
			if (!adUnitId || adUnitId === '-1') {
				console.log('当前为测试广告模式 (adUnitId: ' + adUnitId + ')');
				uni.showModal({
					title: '测试广告模式',
					content: '当前环境未配置真实广告ID，模拟观看广告。\n点击【确定】模拟观看完成\n点击【取消】模拟中途退出',
					success: (res) => {
						handleAdClose(res.confirm);
					}
				});
				return;
			}

			uni.showLoading({
				title: '加载广告中...'
			});

			// 2. 创建或重用广告实例
			if (videoAd) {
				// 微信建议复用
			} else {
				if (uni.createRewardedVideoAd) {
					const token = uni.getStorageSync('token');
					videoAd = uni.createRewardedVideoAd({
						adUnitId: adUnitId,
						multiton: true, // 开启多例模式（可选，防止单例冲突）
						multitonSideVerificationOptions: {
							customData: token
						}
					});

					videoAd.onError((err) => {
						uni.hideLoading();
						console.error('广告加载失败', err);
						// 降级处理：如果真实广告加载失败，也允许测试通过（可选，这里先只提示）
						uni.showToast({
							title: '广告加载失败: ' + (err.errMsg || '未知错误'),
							icon: 'none'
						});
					});

					videoAd.onClose((status) => {
						// 兼容基础库版本差异
						const isEnded = (status && status.isEnded) || status === undefined;
						handleAdClose(isEnded);
					});
				} else {
					throw new Error('当前环境不支持激励视频广告');
				}
			}

			// 3. 展示广告
			videoAd.show().catch(() => {
				// 失败重试
				videoAd.load()
					.then(() => videoAd.show())
					.catch(err => {
						uni.hideLoading();
						console.error('广告展示失败', err);
						uni.showToast({
							title: '广告展示失败',
							icon: 'none'
						});
					});
			});
			uni.hideLoading();

		} catch (e) {
			uni.hideLoading();
			console.error(e);
			uni.showToast({
				title: '无法加载广告',
				icon: 'none'
			});
		}
	};

	const startProcess = async () => {
		if (!sourceImage.value) {
			return uni.showToast({
				title: '请上传照片',
				icon: 'none'
			});
		}

		const hasSize = !!currentSize.value;
		const hasBg = !!currentBgColor.value;
		const hasBeauty = !!beautyConfig.value.enable;
		const hasWatermark = !!watermarkConfig.value.enable;
		const hasOther = !!otherConfig.value.enable;

		if (!hasSize && !hasBg && !hasBeauty && !hasWatermark && !hasOther) {
			return uni.showToast({
				title: '请至少选择一种规格或效果',
				icon: 'none'
			});
		}

		uni.showModal({
			title: '提示',
			content: '制作证件照需要扣除 1 积分，是否继续？',
			success: async (modalRes) => {
				if (modalRes.confirm) {
					requestCreatePhoto();
				}
			}
		});
	};

	const previewImage = () => {
		uni.previewImage({
			urls: [resultImageUrl.value]
		});
	};

	const saveToAlbum = () => {
		uni.showLoading({
			title: '正在下载...',
			mask: true
		});
		uni.downloadFile({
			url: resultImageUrl.value, // 修正这里的变量名
			success: (res) => {
				if (res.statusCode === 200) {
					uni.saveImageToPhotosAlbum({
						filePath: res.tempFilePath,
						success: () => {
							uni.hideLoading();
							uni.showToast({
								title: '已保存到相册',
								icon: 'success'
							});
						},
						fail: (err) => {
							uni.hideLoading();
							if (err.errMsg.includes('auth')) {
								uni.showModal({
									title: '提示',
									content: '请在设置中开启相册权限',
									success: (mRes) => {
										if (mRes.confirm) uni.openSetting();
									}
								});
							} else {
								uni.showToast({
									title: '保存失败',
									icon: 'none'
								});
							}
						}
					});
				} else {
					uni.hideLoading();
					uni.showToast({
						title: '下载失败',
						icon: 'none'
					});
				}
			},
			fail: () => {
				uni.hideLoading();
				uni.showToast({
					title: '下载错误',
					icon: 'none'
				});
			}
		});
	};

	const getSelectedSummary = () => {
		const parts = [];
		parts.push(currentSize.value ? currentSize.value.name : '-');
		parts.push(getBgName(currentBgColor.value));
		if (beautyConfig.value.enable) parts.push('美颜');
		if (watermarkConfig.value.enable) parts.push('水印');
		if (otherConfig.value.enable) parts.push('其他');
		return parts.join(' / ');
	};
</script>

<style lang="scss" scoped>
	.make-container {
		height: 100vh;
		background-color: #f0f2f5;
		display: flex;
		flex-direction: column;
		overflow: hidden;

		.preview-section {
			flex: 1;
			/* 自动撑开，占据除配置区外的所有空间 */
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			padding-top: 20rpx;

			.photo-card {
				width: 400rpx;
				/* 进一步加大 */
				height: 560rpx;
				background: #fff;
				border-radius: 20rpx;
				box-shadow: 0 40rpx 80rpx rgba(0, 0, 0, 0.1);
				overflow: hidden;
				border: 8rpx solid #fff;

				.main-photo {
					width: 100%;
					height: 100%;
				}

				.upload-placeholder {
					height: 100%;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					color: #cbd5e0;

					.plus-icon {
						width: 90rpx;
						height: 90rpx;
						border: 4rpx dashed #e2e8f0;
						border-radius: 50%;
						position: relative;
						margin-bottom: 20rpx;

						.line-h,
						.line-v {
							position: absolute;
							background: #e2e8f0;
							top: 50%;
							left: 50%;
							transform: translate(-50%, -50%);
						}

						.line-h {
							width: 40rpx;
							height: 4rpx;
						}

						.line-v {
							width: 4rpx;
							height: 40rpx;
						}
					}
				}
			}

			.light-tip {
				margin-top: 40rpx;
				display: flex;
				align-items: center;
				background: rgba(255, 255, 255, 0.8);
				padding: 12rpx 32rpx;
				border-radius: 100rpx;

				.dot {
					width: 12rpx;
					height: 12rpx;
					background: #8280ff;
					border-radius: 50%;
					margin-right: 12rpx;
				}

				text {
					font-size: 24rpx;
					color: #718096;
					font-weight: 500;
				}
			}
		}

		.config-section {
			background: #fff;
			border-radius: 64rpx 64rpx 0 0;
			padding: 48rpx 56rpx 0;
			flex-shrink: 0;

			.module-header {
				display: flex;
				justify-content: space-between;
				align-items: flex-start;
				margin-bottom: 30rpx;

				.title-left {
					.title-row {
						display: flex;
						align-items: baseline;

						.title {
							font-size: 40rpx;
							font-weight: 800;
							color: #2d3748;
						}

						.subtitle {
							font-size: 24rpx;
							color: #cbd5e0;
							margin-left: 16rpx;
							letter-spacing: 2rpx;
						}
					}

					.custom-dots {
						display: flex;
						gap: 10rpx;
						margin-top: 16rpx;

						.dot-item {
							width: 12rpx;
							height: 12rpx;
							border-radius: 50%;
							background: #edf2f7;
							transition: all 0.3s;

							&.active {
								width: 36rpx;
								border-radius: 10rpx;
								background: #8280ff;
							}
						}
					}
				}

				.header-btns {
					display: flex;
					gap: 12rpx;
				}

				.reset-btn {
					background: #f0f0ff;
					color: #8280ff;
					padding: 10rpx 28rpx;
					border-radius: 100rpx;
					font-size: 26rpx;
					font-weight: bold;
				}

				.reset-all-btn {
					background: #fff0f0;
					color: #ff4d4f;
					padding: 10rpx 20rpx;
					border-radius: 100rpx;
					font-size: 26rpx;
					font-weight: bold;
				}
			}

			.config-swiper {
				height: 300rpx !important;
				/* 固定高度，确保颜色网格完全显示 */
			}
		}

		.bottom-bar {
			padding: 24rpx 56rpx calc(32rpx + env(safe-area-inset-bottom));
			background: #fff;
			display: flex;
			justify-content: space-between;
			align-items: center;
			box-shadow: 0 -12rpx 48rpx rgba(0, 0, 0, 0.06);
			position: relative;
			z-index: 100;

			.info-section {
				flex: 1;

				.info-row {
					display: flex;
					align-items: center;

					.label {
						font-size: 30rpx;
						font-weight: 800;
						color: #2d3748;
						max-width: 360rpx;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}

					.arrow-up {
						font-size: 20rpx;
						color: #cbd5e0;
						margin-left: 12rpx;
					}
				}

				.cost {
					font-size: 24rpx;
					color: #8280ff;
					margin-top: 6rpx;
					font-weight: 500;
				}
			}

			.action-btn {
				width: 224rpx;
				height: 88rpx;
				line-height: 88rpx;
				background: #2d3748;
				color: #fff;
				border-radius: 24rpx;
				font-size: 30rpx;
				font-weight: bold;
				margin: 0;
				box-shadow: 0 8rpx 20rpx rgba(45, 55, 72, 0.2);

				&:active {
					opacity: 0.8;
					transform: translateY(2rpx);
				}
			}
		}

		/* 通用弹窗组件 */
		.mask {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.6);
			z-index: 1000;
			display: flex;
			align-items: flex-end;
			backdrop-filter: blur(4rpx);

			.popup-panel {
				width: 100%;
				background: #fff;
				border-radius: 48rpx 48rpx 0 0;
				padding: 48rpx;

				.popup-header {
					font-size: 36rpx;
					font-weight: 800;
					text-align: center;
					margin-bottom: 48rpx;
					display: flex;
					justify-content: space-between;

					.close {
						color: #cbd5e0;
						font-size: 40rpx;
					}
				}

				.param-item {
					display: flex;
					justify-content: space-between;
					padding: 32rpx 0;
					border-bottom: 2rpx solid #f7fafc;

					.p-label {
						color: #718096;
						font-size: 30rpx;
					}

					.p-value {
						font-weight: 800;
						color: #2d3748;
						font-size: 30rpx;
					}
				}

				.confirm-btn {
					margin-top: 48rpx;
					background: #8280ff;
					color: #fff;
					border-radius: 24rpx;
					width: 100%;
					height: 100rpx;
					line-height: 100rpx;
					font-size: 32rpx;
					font-weight: bold;
				}

				.list-scroll {
					height: 50vh;

					.size-item {
						display: flex;
						justify-content: space-between;
						align-items: center;
						padding: 32rpx 0;
						border-bottom: 2rpx solid #f7fafc;

						.n {
							font-weight: 800;
							color: #2d3748;
							font-size: 30rpx;
						}

						.p {
							font-size: 24rpx;
							color: #a0aec0;
							margin-top: 4rpx;
						}

						.radio {
							width: 40rpx;
							height: 40rpx;
							border: 4rpx solid #edf2f7;
							border-radius: 50%;

							&.checked {
								background: #8280ff;
								border-color: #8280ff;
								position: relative;

								&::after {
									content: '';
									width: 16rpx;
									height: 16rpx;
									background: #fff;
									border-radius: 50%;
									position: absolute;
									top: 50%;
									left: 50%;
									transform: translate(-50%, -50%);
								}
							}
						}
					}
				}
			}
		}
	}

	/* 遮罩背景 */
	.result-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 2000;
		background: rgba(0, 0, 0, 0.4); // 半透明黑色
		backdrop-filter: blur(8px); // 背景模糊，让后面隐约可见
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 60rpx; // 左右留出空间
	}

	/* 弹出卡片主体 */
	.result-card-popup {
		width: 100%;
		background: #fff;
		border-radius: 40rpx;
		padding: 40rpx;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
		display: flex;
		flex-direction: column;
		align-items: center;

		.popup-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 30rpx;
		}

		.result-preview-wrap {
			width: 400rpx;
			height: 560rpx;
			position: relative;
			background: #f8f9fb;
			border-radius: 20rpx;
			overflow: hidden;
			border: 4rpx solid #eee;

			.result-img {
				width: 100%;
				height: 100%;
			}

			.success-tag {
				position: absolute;
				bottom: 20rpx;
				left: 50%;
				transform: translateX(-50%);
				background: #2D3748;
				color: #fff;
				padding: 8rpx 24rpx;
				border-radius: 100rpx;
				font-size: 22rpx;
			}
		}

		.result-tips {
			margin: 30rpx 0;
			text-align: center;

			.t-1 {
				display: block;
				color: #8280FF;
				font-size: 24rpx;
				font-weight: bold;
			}

			.t-2 {
				font-size: 22rpx;
				color: #999;
			}
		}

		.result-btns {
			width: 100%;
			display: flex;
			gap: 20rpx;

			button {
				flex: 1;
				height: 90rpx;
				line-height: 90rpx;
				font-size: 28rpx;
				border-radius: 20rpx;
				font-weight: bold;
			}

			.btn-save {
				background: #8280FF;
				color: #fff;
			}

			.btn-back {
				background: #f0f0f0;
				color: #666;
			}
		}
	}
	
	/* Premium 加载动画重构 */
	.custom-loading-mask.premium-loading {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9999;
		background: rgba(15, 23, 42, 0.4); // 更深邃的半透明蓝灰色
		display: flex;
		align-items: center;
		justify-content: center;
		animation: fadeInElite 0.5s ease-out;

		.loading-card {
			width: 600rpx;
			background: rgba(255, 255, 255, 0.72);
			backdrop-filter: blur(40rpx) saturate(180%);
			-webkit-backdrop-filter: blur(40rpx) saturate(180%);
			border-radius: 48rpx;
			padding: 64rpx 40rpx;
			border: 1px solid rgba(255, 255, 255, 0.4);
			display: flex;
			flex-direction: column;
			align-items: center;
			box-shadow: 0 40rpx 100rpx rgba(0, 0, 0, 0.12);

			.spinner-visual {
				width: 160rpx;
				height: 160rpx;
				position: relative;
				margin-bottom: 48rpx;
				display: flex;
				align-items: center;
				justify-content: center;

				/* 制作中专用动画：轨道转子 */
				.orbit-container {
					position: absolute;
					width: 100%;
					height: 100%;
					animation: rotate360 2s linear infinite;

					.orbit-path {
						position: absolute;
						width: 100%;
						height: 100%;
						border: 4rpx solid rgba(130, 128, 255, 0.1);
						border-radius: 50%;
					}

					.orbit-dot {
						position: absolute;
						top: -4rpx;
						left: 50%;
						width: 16rpx;
						height: 16rpx;
						background: #8280FF;
						border-radius: 50%;
						margin-left: -8rpx;
						box-shadow: 0 0 20rpx #8280FF;
					}
				}

				.core-glow {
					width: 80rpx;
					height: 80rpx;
					background: radial-gradient(circle, rgba(130, 128, 255, 0.2) 0%, rgba(130, 128, 255, 0) 70%);
					border-radius: 50%;
					animation: pulseGlow 2s ease-in-out infinite;
				}

				/* 安全检测专用动画：雷达脉冲 */
				&.safety-theme {
					.pulse-ring {
						position: absolute;
						width: 100%;
						height: 100%;
						border: 2rpx solid #8280FF;
						border-radius: 50%;
						animation: radarPulse 1.5s ease-out infinite;
					}

					.shield-icon {
						font-size: 64rpx;
						animation: floating 3s ease-in-out infinite;
					}
				}
			}

			.text-group {
				text-align: center;

				.loading-text {
					display: block;
					font-size: 36rpx;
					font-weight: 800;
					margin-bottom: 16rpx;
					letter-spacing: 2rpx;
				}

				.gradient-text {
					background: linear-gradient(135deg, #1e293b 0%, #8280FF 100%);
					-webkit-background-clip: text;
					background-clip: text;
					color: transparent;
				}

				.loading-tip {
					font-size: 24rpx;
					color: #64748b;
					font-weight: 500;
					line-height: 1.6;
				}
			}
		}
	}

	@keyframes rotate360 {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	@keyframes pulseGlow {
		0%, 100% { transform: scale(0.8); opacity: 0.5; }
		50% { transform: scale(1.2); opacity: 1; }
	}

	@keyframes radarPulse {
		0% { transform: scale(0.6); opacity: 1; border-width: 4rpx; }
		100% { transform: scale(1.4); opacity: 0; border-width: 1rpx; }
	}

	@keyframes floating {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10rpx); }
	}

	@keyframes fadeInElite {
		from { opacity: 0; backdrop-filter: blur(0); }
		to { opacity: 1; backdrop-filter: blur(40rpx); }
	}
</style>
