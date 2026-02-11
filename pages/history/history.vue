<template>
	<view class="container">
		<view class="login-prompt" v-if="!isLoggedIn">
			<text class="prompt-text">登录后查看历史记录</text>
			<button class="login-btn" @click="goToLogin">立即登录</button>
		</view>

		<view class="history-list" v-else-if="historyList && historyList.length > 0">
			<view v-for="(group, gIndex) in historyList" :key="group.date" class="date-group fade-in-up"
				:style="{ animationDelay: `${gIndex * 0.05}s` }">
				<view class="date-header">
					<text class="date-text">{{ group.date }}</text>
				</view>

				<view class="history-item" v-for="item in group.detailList" :key="item.id">
					<view class="item-content">
						<image :src="item.localPath || item.imageUrl" mode="aspectFill" class="item-img"
							@click.stop="handleView(item)"></image>

						<view class="item-main">
							<view class="info-top">
								<text class="item-title">证件照</text>
								<view class="status-tag">
									<text class="iconfont icon-check-circle"></text>
									<text>制作成功</text>
								</view>
							</view>

							<view class="info-meta">
								<text class="meta-txt">生成于 {{ extractTime(item.createTime) || '刚刚' }}</text>
							</view>

							<view class="action-bar">
								<view class="icon-btn delete-btn" @click.stop="tryDelete(item)">
									<text class="btn-txt">删除</text>
								</view>
								<view class="right-actions">
									<view class="icon-btn params-btn" @click.stop="handleViewParams(item)">
										<text class="btn-txt">参数</text>
									</view>
									<view class="icon-btn view-btn" @click.stop="handleView(item)">
										<text class="btn-txt">预览</text>
									</view>
									<view class="icon-btn use-btn" @click.stop="handleUse(item)">
										<text class="btn-txt">再做一张</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view class="load-status">
				<view v-if="loading && pageNum > 1" class="loading-box">
					<view class="spinner-small"></view>
					<text>正在加载...</text>
				</view>
				<view v-if="!hasMore && rawList.length > 0" class="no-more">
					<text>— 已经到底啦 —</text>
				</view>
			</view>
		</view>

		<view class="empty-state" v-else-if="!loading && isLoggedIn">
			<image src="/static/empty.png" mode="aspectFit" class="empty-img"></image>
			<text class="empty-text">暂无制作历史</text>
			<button class="make-btn" @click="goToMake">去制作</button>
		</view>

		<view class="loading-state" v-if="loading && pageNum === 1 && rawList.length === 0">
			<view class="spinner"></view>
			<text>加载中...</text>
		</view>

		<view class="result-mask" v-if="showResultModal" @tap.stop="showResultModal = false">
			<view class="result-card-popup" @tap.stop>
				<view class="popup-title">照片预览</view>
				<view class="result-preview-wrap">
					<image :src="currentViewImage" mode="aspectFit" class="result-img" @tap="previewImage" />
				</view>
				<view class="result-tips">
					<text class="t-1">温馨提示</text>
					<text class="t-2">若无法直接保存，请长按图片通过预览保存。</text>
				</view>
				<view class="result-btns">
					<button class="btn-save" @tap="saveToAlbum">保存到相册</button>
					<button class="btn-back" @tap="showResultModal = false">关闭</button>
				</view>
			</view>
		</view>

		<view class="mask" v-if="showParamsModal" @click="showParamsModal = false">
			<view class="popup-panel" @click.stop>
				<view class="popup-header">
					<text class="title">制作参数详情</text>
					<text class="close" @click="showParamsModal = false">✕</text>
				</view>

				<view class="popup-content" v-if="currentParams">
					<view class="param-item">
						<text class="p-label">尺寸规格</text>
						<view class="p-right">
							<text class="p-value">{{ currentParams.sizeName || '-' }}</text>
							<text class="p-sub" v-if="currentParams.widthPx && currentParams.heightPx">
								{{ currentParams.widthPx }}x{{ currentParams.heightPx }}px
							</text>
						</view>
					</view>

					<view class="param-item">
						<text class="p-label">背景颜色</text>
						<view class="p-right">
							<text class="p-value">{{ getBgName(currentParams.bgColor) }}</text>
						</view>
					</view>

					<view class="param-item">
						<text class="p-label">渲染模式</text>
						<text class="p-value">{{ getModeLabel(currentParams.renderMode) }}</text>
					</view>

					<view class="param-item">
						<text class="p-label">智能美颜</text>
						<view class="p-right">
							<text class="p-value">{{ currentParams.beautyConfig?.enable ? '已开启' : '未开启' }}</text>
							<view class="p-sub-grid" v-if="currentParams.beautyConfig?.enable">
								<text>美白: {{currentParams.beautyConfig.whitening}}</text>
								<text>磨皮: {{currentParams.beautyConfig.sharpening}}</text>
								<text>亮度: {{currentParams.beautyConfig.brightness}}</text>
								<text>对比度: {{currentParams.beautyConfig.contrast}}</text>
								<text>饱和度: {{currentParams.beautyConfig.saturation}}</text>
							</view>
						</view>
					</view>

					<view class="param-item">
						<text class="p-label">防盗水印</text>
						<view class="p-right">
							<text class="p-value">{{ currentParams.watermarkConfig?.enable ? '已开启' : '未开启' }}</text>
							<view class="p-sub-grid" v-if="currentParams.watermarkConfig?.enable">
								<text class="full-row">内容: {{ currentParams.watermarkConfig.text }}</text>
								<text>颜色: {{ currentParams.watermarkConfig.color }}</text>
								<text>字号: {{ currentParams.watermarkConfig.size }}</text>
								<text>透明度: {{ currentParams.watermarkConfig.opacity }}</text>
								<text>角度: {{ currentParams.watermarkConfig.angle }}°</text>
								<text>间距: {{ currentParams.watermarkConfig.spacing }}</text>
							</view>
						</view>
					</view>

					<view class="param-item">
						<text class="p-label">其他设置</text>
						<view class="p-right">
							<text class="p-value">{{ currentParams.otherConfig?.enable ? '已开启' : '未开启' }}</text>
							<view class="p-sub-grid" v-if="currentParams.otherConfig?.enable">
								<text>人脸比例: {{ currentParams.otherConfig.faceRatio }}</text>
								<text>头顶距离: {{ currentParams.otherConfig.topDistance }}</text>
								<text>KB限制: {{ currentParams.otherConfig.kbEnable ? currentParams.otherConfig.kbSize + 'KB' : '不限制' }}</text>
								<text>DPI: {{ currentParams.otherConfig.dpiEnable ? currentParams.otherConfig.dpiValue : '默认' }}</text>
							</view>
						</view>
					</view>
				</view>
				<button class="confirm-btn" @click="showParamsModal = false">我知道了</button>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import {
		onShow,
		onReachBottom,
		onPullDownRefresh
	} from '@dcloudio/uni-app';
	import {
		login
	} from '@/utils/auth.js';
	import {
		getBgColorListApi
	} from '@/utils/api.js';

	const app = getApp().globalData || getApp();
	const baseUrl = app.url;

	const goToLogin = async () => {
		try {
			await login();
			checkLoginAndInit(true);
		} catch (e) {
			console.error('Login failed', e);
		}
	};
	// 缓存 Key
	const HISTORY_CACHE_KEY = 'history_cache_first_page';
	const IMAGE_MAP_KEY = 'history_image_map';

	// 分页状态
	const pageNum = ref(1);
	const pageSize = ref(10);
	const hasMore = ref(true);
	const loading = ref(false);
	const isLoggedIn = ref(false);

	// 数据
	const rawList = ref([]);
	const historyList = computed(() => {
		const groups = [];
		rawList.value.forEach(item => {
			const dateStr = item.date || '未知日期';
			let group = groups.find(g => g.date === dateStr);
			if (!group) {
				group = {
					date: dateStr,
					detailList: []
				};
				groups.push(group);
			}
			if (!group.detailList.some(d => d.id === item.id)) {
				group.detailList.push(item);
			}
		});
		return groups.sort((a, b) => new Date(b.date) - new Date(a.date));
	});

	// 弹窗
	const showResultModal = ref(false);
	const currentViewImage = ref('');
	const showParamsModal = ref(false);
	const currentParams = ref(null);

	const bgOptions = ref([]);

	const fetchBgColors = async () => {
		try {
			const data = await getBgColorListApi();
			bgOptions.value = data.map(item => ({
				name: item.name,
				color: item.colorValue
			}));
		} catch (error) {
			console.error('获取颜色列表失败:', error);
			bgOptions.value = [{
				name: '白色',
				color: '#FFFFFF'
			}, {
				name: '蓝色',
				color: '#438EDB'
			}];
		}
	};

	onShow(() => {
		checkLoginAndInit();
		fetchBgColors();
	});

	onReachBottom(() => {
		if (hasMore.value && !loading.value) {
			fetchHistory();
		}
	});

	onPullDownRefresh(() => {
		checkLoginAndInit(true);
		uni.stopPullDownRefresh();
	});

	const checkLoginAndInit = (isRefresh = false) => {
		const token = uni.getStorageSync('token');
		if (!token) {
			isLoggedIn.value = false;
			return;
		}
		isLoggedIn.value = true;

		if (isRefresh) {
			resetAndFetch();
			return;
		}

		const cache = uni.getStorageSync(HISTORY_CACHE_KEY);
		// 如果缓存不存在（说明在制作页被删除了），或者 rawList 是空的
		if (!cache || rawList.value.length === 0) {
			resetAndFetch();
		}
	};

	const resetAndFetch = () => {
		pageNum.value = 1;
		hasMore.value = true;
		fetchHistory();
	};

	const fetchHistory = () => {
		if (loading.value) return;
		loading.value = true;

		uni.request({
			url: baseUrl + '/user/history',
			method: 'POST',
			header: {
				'token': uni.getStorageSync('token'),
				'Content-Type': 'application/json'
			},
			data: {
				pageNum: pageNum.value,
				pageSize: pageSize.value
			},
			success: (res) => {
				if (res.data.code === 200) {
					const {
						list,
						hasMore: more
					} = res.data.data;
					if (pageNum.value === 1) {
						rawList.value = list;
						saveFirstPageCache(list);
					} else {
						const filtered = list.filter(item => !rawList.value.some(r => r.id === item.id));
						rawList.value = [...rawList.value, ...filtered];
					}
					hasMore.value = more;
					if (more) pageNum.value++;
					cacheImagesLocally(list);
				}
			},
			complete: () => {
				loading.value = false;
			}
		});
	};

	const saveFirstPageCache = (list) => {
		const endOfDay = new Date(new Date().setHours(23, 59, 59, 999)).getTime();
		uni.setStorageSync(HISTORY_CACHE_KEY, {
			list,
			expire: endOfDay
		});
	};

	const cacheImagesLocally = (list) => {
		const map = uni.getStorageSync(IMAGE_MAP_KEY) || {};
		list.forEach(item => {
			const url = item.imageUrl;
			if (url && !map[url]) {
				uni.downloadFile({
					url: url,
					success: (res) => {
						if (res.statusCode === 200) {
							uni.saveFile({
								tempFilePath: res.tempFilePath,
								success: (saveRes) => {
									map[url] = saveRes.savedFilePath;
									uni.setStorageSync(IMAGE_MAP_KEY, map);
									item.localPath = saveRes.savedFilePath;
								}
							});
						}
					}
				});
			} else if (url) {
				item.localPath = map[url];
			}
		});
	};

	const tryDelete = (item) => {
		uni.showModal({
			title: '确认删除',
			content: '删除后无法恢复，确定要删除这条记录吗？',
			confirmColor: '#FF4D4F',
			success: (res) => {
				if (res.confirm) {
					uni.showLoading({
						title: '删除中'
					});
					uni.request({
						url: baseUrl + '/user/history/delete',
						method: 'GET',
						header: {
							'token': uni.getStorageSync('token')
						},
						data: {
							historyId: item.id
						},
						success: (res) => {
							if (res.data.code === 200) {
								rawList.value = rawList.value.filter(i => i.id !== item.id);
								saveFirstPageCache(rawList.value.slice(0, pageSize.value));
								uni.showToast({
									title: '删除成功'
								});
							}
						},
						complete: () => uni.hideLoading()
					});
				}
			}
		});
	};

	const handleViewParams = (item) => {
		try {
			// 直接构造参数对象，解析 JSON 字符串
			currentParams.value = {
				sizeName: item.sizeName,
				widthPx: item.widthPx,
				heightPx: item.heightPx,
				bgColor: item.bgColor,
				renderMode: item.renderMode,
				beautyConfig: typeof item.beautyConfig === 'string' ? JSON.parse(item.beautyConfig) : item.beautyConfig,
				watermarkConfig: typeof item.watermarkConfig === 'string' ? JSON.parse(item.watermarkConfig) : item.watermarkConfig,
				otherConfig: typeof item.otherConfig === 'string' ? JSON.parse(item.otherConfig) : item.otherConfig
			};
			showParamsModal.value = true;
		} catch (e) {
			console.error('Parse params error:', e);
			uni.showToast({
				title: '参数解析异常',
				icon: 'none'
			});
		}
	};

	const handleView = (item) => {
		currentViewImage.value = item.localPath || item.imageUrl;
		showResultModal.value = true;
	};

	const handleUse = (item) => {
		uni.setStorageSync('make_source_image', item.localPath || item.imageUrl);
		uni.switchTab({
			url: '/pages/make/make'
		});
	};

	const saveToAlbum = () => {
		uni.showLoading({
			title: '正在保存...',
			mask: true
		});
		uni.downloadFile({
			url: currentViewImage.value,
			success: (res) => {
				uni.saveImageToPhotosAlbum({
					filePath: res.tempFilePath,
					success: () => uni.showToast({
						title: '已保存到相册',
						icon: 'success'
					}),
					complete: () => uni.hideLoading()
				});
			}
		});
	};

	const previewImage = () => uni.previewImage({
		urls: [currentViewImage.value]
	});
	const extractTime = (timeStr) => timeStr ? timeStr.split(' ')[1] : '';
	const getBgName = (color) => bgOptions.value.find(i => i.color.toUpperCase() === color?.toUpperCase())?.name || '自定义';
	const getModeLabel = (mode) => ({
		solid: '纯色',
		linear: '渐变',
		radial: '中心'
	} [mode] || '纯色');
	const goToMake = () => uni.switchTab({
		url: '/pages/make/make'
	});
</script>

<style lang="scss" scoped>
	/* 1. 基础布局及动画 (完全恢复) */
	.container {
		min-height: 100vh;
		background-color: #F5F7FA;
		padding: 32rpx;
		box-sizing: border-box;
	}

	.date-group {
		margin-bottom: 40rpx;
		opacity: 0;

		.date-header {
			margin-bottom: 24rpx;
			padding-left: 8rpx;

			.date-text {
				font-size: 32rpx;
				font-weight: 800;
				color: #1A202C;
				letter-spacing: 1rpx;
			}
		}
	}

	.fade-in-up {
		animation: fadeInUp 0.6s ease-out forwards;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20rpx);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* 2. 列表项样式 (完全恢复) */
	.history-item {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 24rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
		transition: all 0.2s;

		&:active {
			transform: scale(0.99);
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
		}

		.item-content {
			display: flex;

			.item-img {
				width: 140rpx;
				height: 180rpx;
				border-radius: 16rpx;
				background-color: #f0f0f0;
				margin-right: 24rpx;
				flex-shrink: 0;
				border: 1px solid #f0f0f0;
			}

			.item-main {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: space-between;

				.info-top {
					display: flex;
					justify-content: space-between;
					align-items: center;

					.item-title {
						font-size: 30rpx;
						font-weight: 700;
						color: #2D3748;
					}

					.status-tag {
						display: flex;
						align-items: center;
						background: #F0F9EB;
						padding: 4rpx 12rpx;
						border-radius: 100rpx;

						.iconfont {
							font-size: 20rpx;
							color: #67C23A;
							margin-right: 6rpx;
						}

						text {
							font-size: 20rpx;
							color: #67C23A;
							font-weight: 500;
						}
					}
				}

				.info-meta {
					margin-top: -20rpx;

					.meta-txt {
						font-size: 22rpx;
						color: #A0AEC0;
					}
				}

				.action-bar {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-top: 16rpx;

					.right-actions {
						display: flex;
						gap: 16rpx;
					}

					.icon-btn {
						height: 56rpx;
						padding: 0 24rpx;
						border-radius: 100rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 24rpx;
						font-weight: 600;

						&.delete-btn {
							background: #fff;
							border: 2rpx solid #FEE2E2;
							color: #F87171;
						}

						&.view-btn {
							background: #EDF2F7;
							color: #4A5568;
						}

						&.params-btn {
							background: #EBF8FF;
							color: #4299E1;
						}

						&.use-btn {
							background: #8280FF;
							color: #fff;
							box-shadow: 0 4rpx 12rpx rgba(130, 128, 255, 0.25);
						}
					}
				}
			}
		}
	}

	/* 3. 分页加载 UI */
	.load-status {
		padding: 40rpx 0 60rpx;
		text-align: center;

		.loading-box {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 12rpx;
			color: #A0AEC0;
			font-size: 24rpx;
		}

		.no-more {
			color: #CBD5E0;
			font-size: 24rpx;
		}
	}

	.spinner-small {
		width: 24rpx;
		height: 24rpx;
		border: 3rpx solid #E2E8F0;
		border-top-color: #8280FF;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	/* 4. 预览弹窗 (完全恢复原始效果) */
	.result-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 2000;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 60rpx;
		animation: fadeIn 0.3s ease-out;
	}

	.result-card-popup {
		width: 100%;
		background: #fff;
		border-radius: 40rpx;
		padding: 48rpx;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
		display: flex;
		flex-direction: column;
		align-items: center;
		animation: popUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

		.popup-title {
			font-size: 34rpx;
			font-weight: 800;
			color: #1A202C;
			margin-bottom: 40rpx;
		}

		.result-preview-wrap {
			width: 440rpx;
			height: 600rpx;
			background: #f8f9fb;
			border-radius: 24rpx;
			overflow: hidden;
			border: 4rpx solid #EDF2F7;
			box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);

			.result-img {
				width: 100%;
				height: 100%;
			}
		}

		.result-tips {
			margin: 40rpx 0;
			text-align: center;

			.t-1 {
				display: block;
				color: #8280FF;
				font-size: 26rpx;
				font-weight: 700;
				margin-bottom: 8rpx;
			}

			.t-2 {
				font-size: 22rpx;
				color: #A0AEC0;
			}
		}

		.result-btns {
			width: 100%;
			display: flex;
			gap: 24rpx;

			button {
				flex: 1;
				height: 96rpx;
				border-radius: 24rpx;
				font-weight: bold;
			}

			.btn-save {
				background: #2D3748;
				color: #fff;
			}

			.btn-back {
				background: #EDF2F7;
				color: #4A5568;
			}
		}
	}

	/* 5. 参数弹窗 Grid 布局 (完全恢复原始细节) */
	.mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 2000;
		display: flex;
		align-items: flex-end;
		backdrop-filter: blur(4rpx);

		.popup-panel {
			width: 100%;
			background: #fff;
			border-radius: 48rpx 48rpx 0 0;
			padding: 48rpx;
			animation: slideUp 0.3s ease-out;

			.popup-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 40rpx;

				.title {
					font-size: 34rpx;
					font-weight: 800;
					color: #1A202C;
				}

				.close {
					color: #CBD5E0;
					font-size: 40rpx;
					padding: 10rpx;
				}
			}

			.popup-content {
				max-height: 60vh;
				overflow-y: auto;

				.param-item {
					display: flex;
					justify-content: space-between;
					align-items: flex-start;
					padding: 24rpx 0;
					border-bottom: 2rpx solid #F7FAFC;

					.p-label {
						color: #718096;
						font-size: 28rpx;
						width: 160rpx;
						flex-shrink: 0;
					}

					.p-right {
						display: flex;
						flex-direction: column;
						align-items: flex-end;
					}

					.p-value {
						font-weight: 700;
						color: #2D3748;
						font-size: 28rpx;
						text-align: right;
					}

					.p-sub {
						font-size: 22rpx;
						color: #A0AEC0;
						margin-top: 4rpx;
					}

					.p-sub-grid {
						margin-top: 8rpx;
						display: grid;
						grid-template-columns: repeat(2, 1fr);
						gap: 4rpx 16rpx;
						width: 100%;

						text {
							font-size: 22rpx;
							color: #718096;
							text-align: right;
							white-space: nowrap;
						}

						.full-row {
							grid-column: span 2;
						}
					}
				}
			}

			.confirm-btn {
				margin-top: 48rpx;
				background: #8280FF;
				color: #fff;
				border-radius: 24rpx;
				height: 96rpx;
				font-weight: bold;
				margin-bottom: env(safe-area-inset-bottom);
			}
		}
	}

	/* 加载/空状态等 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 200rpx;

		.empty-img {
			width: 240rpx;
			height: 240rpx;
			margin-bottom: 32rpx;
		}

		.empty-text {
			color: #A0AEC0;
			margin-bottom: 48rpx;
		}

		.make-btn {
			width: 320rpx;
			height: 88rpx;
			background: #8280FF;
			color: #fff;
			border-radius: 44rpx;
		}
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60rpx;
		color: #A0AEC0;

		.spinner {
			width: 40rpx;
			height: 40rpx;
			border: 4rpx solid #E2E8F0;
			border-top-color: #8280FF;
			border-radius: 50%;
			animation: spin 0.8s linear infinite;
			margin-bottom: 16rpx;
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}

	@keyframes popUp {
		from {
			opacity: 0;
			transform: scale(0.9);
		}

		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}

		to {
			transform: translateY(0);
		}
	}

	.login-prompt {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 200rpx;

		.prompt-text {
			color: #A0AEC0;
			margin-bottom: 48rpx;
		}

		.login-btn {
			width: 320rpx;
			height: 88rpx;
			background: #8280FF;
			color: #fff;
			border-radius: 44rpx;
		}
	}
</style>
