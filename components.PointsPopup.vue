<template>
	<view class="popup-mask" :class="{ 'show': visible }" @click="handleClose" v-if="mounted">
		<view class="popup-content" :class="{ 'show': visible }" @click.stop>
			<view class="popup-header">
				<text class="title">积分明细</text>
				<text class="iconfont icon-close close-btn" @click="handleClose"></text>
			</view>
			
			<view class="points-summary">
				<view class="label">当前积分</view>
				<view class="value">{{ currentPoint }}</view>
			</view>

			<scroll-view scroll-y class="history-list-scroll" @scrolltolower="loadMore">
				<view class="history-list">
					<view v-for="(item, index) in historyList" :key="index" class="history-item">
						<view class="item-left">
							<view class="change-type">{{ item.changeType }}</view>
							<view class="time">{{ item.time }}</view>
						</view>
						<view class="item-right">
							<view class="amount" :class="{ 'positive': item.changeAmount > 0 }">
								{{ item.changeAmount > 0 ? '+' : '' }}{{ item.changeAmount }}
							</view>
							<view class="balance">余额: {{ item.totalPoint }}</view>
						</view>
					</view>

					<view class="load-more">
						<text v-if="loading">加载中...</text>
						<text v-else-if="!hasMore">没有更多了</text>
						<text v-else @click="loadMore">点击加载更多</text>
					</view>

					<view class="empty-state" v-if="historyList.length === 0 && !loading">
						<image class="empty-img" src="/static/score.png" mode="aspectFit"></image>
						<text class="empty-text">暂无积分记录</text>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		watch,
		onMounted
	} from 'vue';

	const props = defineProps({
		visible: {
			type: Boolean,
			default: false
		}
	});

	const emit = defineEmits(['close']);

	const app = getApp().globalData || getApp();
	const baseUrl = app.url;

	const historyList = ref([]);
	const currentPoint = ref(0);
	const pageNum = ref(1);
	const pageSize = ref(20);
	const hasMore = ref(true);
	const loading = ref(false);
	const mounted = ref(false);

	watch(() => props.visible, (newVal) => {
		if (newVal) {
			mounted.value = true;
			// Reset and fetch when opened
			pageNum.value = 1;
			hasMore.value = true;
			historyList.value = [];
			
			// Get current point from cache or props if needed, here we read cache as in original
			const userInfo = uni.getStorageSync('userInfo_cache');
			if (userInfo && userInfo.points !== undefined) {
				currentPoint.value = userInfo.points;
			}
			
			fetchHistory();
		} else {
			// Optional: delay unmount for animation
			setTimeout(() => {
				mounted.value = false;
			}, 300);
		}
	});

	const handleClose = () => {
		emit('close');
	};

	const fetchHistory = () => {
		if (loading.value) return;
		loading.value = true;

		uni.request({
			url: baseUrl + '/user/point/history',
			method: 'POST',
			header: {
				'token': uni.getStorageSync('token')
			},
			data: {
				pageNum: pageNum.value,
				pageSize: pageSize.value,
				needCount: true
			},
			success: (res) => {
				if (res.data.code === 200) {
					const data = res.data.data;
					if (pageNum.value === 1) {
						historyList.value = data.list || [];
					} else {
						historyList.value = [...historyList.value, ...(data.list || [])];
					}
					hasMore.value = data.hasMore;
				} else {
					uni.showToast({
						title: res.data.message || '加载失败',
						icon: 'none'
					});
				}
			},
			fail: () => {
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				});
			},
			complete: () => {
				loading.value = false;
			}
		});
	};

	const loadMore = () => {
		if (hasMore.value && !loading.value) {
			pageNum.value++;
			fetchHistory();
		}
	};
</script>

<style lang="scss" scoped>
	.popup-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(5px);
		z-index: 999;
		opacity: 0;
		transition: opacity 0.3s;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;

		&.show {
			opacity: 1;
		}
	}

	.popup-content {
		background: #ffffff;
		border-radius: 32rpx 32rpx 0 0;
		height: 75vh;
		transform: translateY(100%);
		transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
		display: flex;
		flex-direction: column;
		padding-bottom: env(safe-area-inset-bottom);

		&.show {
			transform: translateY(0);
		}
	}

	.popup-header {
		padding: 30rpx 40rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1rpx solid #f5f5f5;

		.title {
			font-size: 34rpx;
			font-weight: bold;
			color: #333;
		}

		.close-btn {
			font-size: 40rpx;
			color: #999;
			padding: 10rpx;
			margin: -10rpx;
		}
	}
	
	.points-summary {
		padding: 30rpx 40rpx;
		background: linear-gradient(135deg, #F9F9FF 0%, #F0EFFF 100%);
		margin: 20rpx 30rpx 0;
		border-radius: 20rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		.label {
			font-size: 28rpx;
			color: #666;
		}
		
		.value {
			font-size: 48rpx;
			font-weight: bold;
			color: #8280FF;
			font-family: 'DIN Alternate', 'Inter', sans-serif;
		}
	}

	.history-list-scroll {
		flex: 1;
		height: 0; // Important for flex scroll
		padding: 20rpx 30rpx;
		box-sizing: border-box;
	}

	.history-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx 0;
		border-bottom: 1rpx solid #f5f5f5;

		&:last-child {
			border-bottom: none;
		}

		.item-left {
			.change-type {
				font-size: 30rpx;
				color: #333;
				font-weight: 500;
				margin-bottom: 8rpx;
			}

			.time {
				font-size: 24rpx;
				color: #999;
			}
		}

		.item-right {
			text-align: right;

			.amount {
				font-size: 34rpx;
				font-weight: 600;
				color: #333;
				margin-bottom: 4rpx;

				&.positive {
					color: #FF4D4F;
				}
			}

			.balance {
				font-size: 22rpx;
				color: #999;
			}
		}
	}

	.load-more {
		text-align: center;
		padding: 30rpx 0;
		font-size: 24rpx;
		color: #999;
	}

	.empty-state {
		padding: 100rpx 0;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;

		.empty-img {
			width: 240rpx;
			height: 240rpx;
			margin-bottom: 20rpx;
		}

		.empty-text {
			font-size: 28rpx;
			color: #999;
		}
	}
</style>
