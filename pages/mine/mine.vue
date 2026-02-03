<template>
	<view class="container">
		<!-- 顶部用户信息卡片 -->
		<view class="user-card">
			<view class="user-info-wrap">
				<image class="avatar" :src="userInfo.avatarUrl || defaultAvatar" mode="aspectFill"></image>
				<view class="info-box">
					<text class="nickname">{{ userInfo.nickName || '用户已登录' }}</text>
					<text class="register-date" v-if="userInfo.createTime">注册时间：{{ userInfo.createTime }}</text>
					<text class="register-date" v-else></text>
				</view>
			</view>
			
			<!-- 积分钱包条 -->
			<view class="points-wallet" @click="goToPointHistory">
				<view class="wallet-left">
					<view class="point-icon-wrap">
						<text class="iconfont icon-point"></text>
					</view>
					<text class="wallet-label">我的积分</text>
				</view>
				<view class="wallet-right">
					<text class="wallet-value">{{ userInfo.points !== null && userInfo.points !== undefined ? userInfo.points : '-' }}</text>
					<text class="iconfont icon-arrow-right arrow"></text>
				</view>
			</view>
		</view>

		<!-- 菜单列表卡片 -->
		<view class="menu-card">


			<view class="menu-item" @click="contactSupport">
				<view class="item-left">
					<text class="iconfont icon-service item-icon"></text>
					<text class="menu-label">联系客服</text>
				</view>
				<text class="iconfont icon-arrow-right arrow"></text>
			</view>

			<view class="divider"></view>

			<view class="menu-item" @click="aboutUs">
				<view class="item-left">
					<text class="iconfont icon-info item-icon"></text>
					<text class="menu-label">关于我们</text>
				</view>
				<text class="iconfont icon-arrow-right arrow"></text>
			</view>

			<view class="divider"></view>

			<view class="menu-item" @click="showModifyInfo">
				<view class="item-left">
					<text class="iconfont icon-edit item-icon"></text>
					<text class="menu-label">修改信息</text>
				</view>
				<text class="iconfont icon-arrow-right arrow"></text>
			</view>

			<view class="divider"></view>

			<view class="menu-item" @click="goToPointHistory">
				<view class="item-left">
					<text class="iconfont icon-history item-icon"></text>
					<text class="menu-label">积分详情</text>
				</view>
				<text class="iconfont icon-arrow-right arrow"></text>
			</view>
		</view>

		<!-- 退出登录按钮 -->
		<view class="action-section">
			<button class="logout-btn" @click="logout">退出登录</button>
		</view>

		<!-- 修改信息弹窗 -->
		<view class="profile-mask" v-if="showProfile" @click="handleMaskClick">
			<view class="profile-panel" :class="{ 'show': showProfile }" @click.stop>
				<view class="panel-header">
					<text>修改个人资料</text>
				</view>

				<view class="panel-body">
					<button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
						<image :src="tempAvatarUrl || userInfo.avatarUrl || defaultAvatar" class="avatar-img"></image>
						<view class="avatar-tip">点击修改头像</view>
					</button>

					<view class="input-group">
						<text class="label">昵称</text>
						<input type="nickname" class="nickname-input" placeholder="请输入昵称" v-model="nickname"
							@blur="onNicknameBlur" />
					</view>

					<button class="submit-btn" @click="saveProfile">保存修改</button>
				</view>
			</view>
		</view>
	</view>
	
	<!-- 积分详情弹窗 -->
	<PointsPopup :visible="showPointsPopup" @close="closePointsPopup" />
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import PointsPopup from '@/components/PointsPopup.vue';
	import {
		onShow
	} from '@dcloudio/uni-app';
	import {
		login,
	} from '@/utils/auth.js';
	import {
		getUserInfoApi
	} from '@/utils/api.js';

	const app = getApp().globalData || getApp();
	const baseUrl = app.url;

	const CACHE_KEY = 'userInfo_cache';
	const TIME_KEY = 'last_fetch_time';
	const EXPIRE_TIME = 5 * 60 * 1000;

	// 1. 初始化逻辑
	const localData = uni.getStorageSync(CACHE_KEY);
	const userInfo = ref(localData || {});
	const defaultAvatar =
		'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

	onShow(async () => {
		const token = uni.getStorageSync('token');
		if (!token) {
			try {
				await login();
			} catch (e) {
				return;
			}
		}

		// 1. 每次进入页面时，实时读取最新的缓存
		const currentCache = uni.getStorageSync(CACHE_KEY);
		const lastFetch = uni.getStorageSync(TIME_KEY) || 0;
		const now = Date.now();

		// 2. 只有在【没有缓存】或者【缓存过期】时才请求后端
		if (!currentCache || (now - lastFetch > EXPIRE_TIME)) {
			fetchUserInfo();
		} else {
			// 3. 如果缓存有效，确保 UI 上的 userInfo 是最新的缓存内容
			userInfo.value = currentCache;
		}
	});

	// 从后端获取最新信息
	const fetchUserInfo = async () => {
		try {
			const serverData = await getUserInfoApi();
			console.log('User info data:', serverData);
			
			// --- 关键点：如果 S3 图片地址存在，则执行本地存储逻辑 ---
			if (serverData.avatarUrl && serverData.avatarUrl.startsWith('http')) {
				saveAvatarLocally(serverData);
			} else {
				updateFinalData(serverData);
			}
		} catch (error) {
			console.error('Fetch user info error:', error);
			if (error && error.code === 401) {
				clearAllCache();
				uni.reLaunch({
					url: '/pages/index/index'
				});
			} else {
				// Handle other errors or silent fail as in original code
			}
		}
	};

	// --- 新增：手动将图片存入手机文件系统 ---
	const saveAvatarLocally = (serverData) => {
		uni.downloadFile({
			url: serverData.avatarUrl,
			success: (downloadRes) => {
				if (downloadRes.statusCode === 200) {
					// 使用 saveFile 将临时文件变为永久本地文件
					uni.saveFile({
						tempFilePath: downloadRes.tempFilePath,
						success: (saveRes) => {
							// saveRes.savedFilePath 是手机本地路径 (如: wxfile://store_xxx.jpg)
							serverData.avatarUrl = saveRes.savedFilePath;
							updateFinalData(serverData);
						},
						fail: (err) => {
							console.error('Save file failed:', err);
							// 保存失败则依然用 URL
							updateFinalData(serverData);
						}
					});
				} else {
					console.error('Download failed with status:', downloadRes.statusCode);
					// 下载失败（如404/403），直接使用原URL
					updateFinalData(serverData);
				}
			},
			fail: (err) => {
				console.error('Download network error:', err);
				updateFinalData(serverData);
			}
		});
	};

	// 统一更新数据和缓存
	const updateFinalData = (data) => {
		userInfo.value = data;
		uni.setStorageSync(CACHE_KEY, data);
		uni.setStorageSync(TIME_KEY, Date.now());
	};

	const clearAllCache = () => {
		// 如果有本地存储的图片路径，退出时也可以考虑清理，但通常保留即可
		uni.removeStorageSync('token');
		uni.removeStorageSync(CACHE_KEY);
		uni.removeStorageSync(TIME_KEY);
	};

	const logout = () => {
		uni.showModal({
			title: '提示',
			content: '确定要退出登录吗？',
			confirmColor: '#FF4D4F',
			success: (res) => {
				if (res.confirm) {
					clearAllCache();
					uni.reLaunch({
						url: '/pages/index/index'
					});
				}
			}
		});
	};

	const contactSupport = () => {
		uni.showToast({
			title: '功能开发中',
			icon: 'none'
		});
	};

	const aboutUs = () => {
		uni.showToast({
			title: '免费证件照',
			icon: 'none'
		});
	};

	// 修改信息相关逻辑
	const showProfile = ref(false);
	const nickname = ref('');
	const tempAvatarUrl = ref('');

	const showModifyInfo = () => {
		// 初始化昵称为当前用户昵称
		nickname.value = userInfo.value.nickName || '';
		tempAvatarUrl.value = '';
		showProfile.value = true;
	};

	const onChooseAvatar = (e) => {
		tempAvatarUrl.value = e.detail.avatarUrl;
	};

	const onNicknameBlur = (e) => {
		nickname.value = e.detail.value;
	};

	const saveProfile = () => {
		// 判断头像是否被修改:如果是微信默认的 https 链接,则不作为文件上传
		const hasNewAvatar = tempAvatarUrl.value && tempAvatarUrl.value.includes('tmp');

		uni.showLoading({
			title: '保存中...',
			mask: true
		});

		if (hasNewAvatar) {
			// 情况 A:用户选了新头像,走 uploadFile
			uni.uploadFile({
				url: baseUrl + '/user/info/update',
				filePath: tempAvatarUrl.value,
				name: 'file',
				header: {
					'token': uni.getStorageSync('token')
				},
				formData: {
					'nickName': nickname.value || ''
				},
				success: (res) => handleSuccess(res.data),
				fail: () => uni.showToast({
					title: '网络失败',
					icon: 'none'
				}),
				complete: () => uni.hideLoading()
			});
		} else {
			// 情况 B:用户没改头像(或不填),走普通的 request
			uni.request({
				url: baseUrl + '/user/info/update',
				method: 'POST',
				header: {
					'token': uni.getStorageSync('token'),
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: {
					'nickName': nickname.value || ''
				},
				success: (res) => handleSuccess(res.data),
				fail: () => uni.showToast({
					title: '网络失败',
					icon: 'none'
				}),
				complete: () => uni.hideLoading()
			});
		}
	};

	const handleSuccess = (data) => {
		// uploadFile 返回的是字符串,request 返回的是对象,统一处理
		const res = typeof data === 'string' ? JSON.parse(data) : data;
		if (res.code === 200) {
			uni.showToast({
				title: '保存成功'
			});
			showProfile.value = false;
			// 刷新用户信息
			setTimeout(() => {
				// 清除缓存并重新获取
				uni.removeStorageSync(CACHE_KEY);
				uni.removeStorageSync(TIME_KEY);
				fetchUserInfo();
			}, 500);
		} else {
			uni.showModal({
				title: '提示',
				content: res.message || '操作失败',
				showCancel: false
			});
		}
	};

	const showPointsPopup = ref(false);

	const goToPointHistory = () => {
		showPointsPopup.value = true;
	};
	
	const closePointsPopup = () => {
		showPointsPopup.value = false;
	};

	const handleMaskClick = () => {
		showProfile.value = false;
	};
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #F8F9FB;
		padding: 30rpx;
		box-sizing: border-box;
	}

	.user-card {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 40rpx 30rpx 30rpx;
		display: flex;
		flex-direction: column;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		margin-bottom: 30rpx;

		.user-info-wrap {
			display: flex;
			align-items: center;
			margin-bottom: 40rpx;
			padding: 0 10rpx;

			.avatar {
				width: 120rpx;
				height: 120rpx;
				border-radius: 60rpx;
				background-color: #f0f0f0;
				border: 4rpx solid #fff;
				box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
			}

			.info-box {
				margin-left: 30rpx;
				display: flex;
				flex-direction: column;

				.nickname {
					font-size: 38rpx;
					font-weight: 600;
					color: #333;
					margin-bottom: 12rpx;
					max-width: 400rpx;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.register-date {
					font-size: 24rpx;
					color: #999;
				}
			}
		}

		.points-wallet {
			background: linear-gradient(135deg, #F9F9FF 0%, #F0EFFF 100%);
			border-radius: 20rpx;
			padding: 24rpx 30rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border: 1rpx solid rgba(130, 128, 255, 0.1);

			&:active {
				opacity: 0.8;
				background: #F0EFFF;
			}

			.wallet-left {
				display: flex;
				align-items: center;

				.point-icon-wrap {
					width: 48rpx;
					height: 48rpx;
					background: #8280FF;
					border-radius: 12rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-right: 16rpx;

					.icon-point {
						color: #fff;
						font-size: 28rpx;
					}
				}

				.wallet-label {
					font-size: 28rpx;
					color: #333;
					font-weight: 500;
				}
			}

			.wallet-right {
				display: flex;
				align-items: center;

				.wallet-value {
					font-size: 40rpx;
					font-weight: 700;
					color: #8280FF;
					margin-right: 12rpx;
					font-family: 'DIN Alternate', 'Inter', sans-serif;
				}

				.arrow {
					font-size: 24rpx;
					color: #BDBDBD;
				}
			}
		}
	}

	.menu-card {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 0 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		margin-bottom: 40rpx;

		.menu-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 36rpx 0;

			&:active {
				opacity: 0.7;
			}

			.item-left {
				display: flex;
				align-items: center;

				.menu-label {
					font-size: 30rpx;
					color: #333;
				}
			}

			.menu-value {
				font-size: 28rpx;
				color: #999;
				font-family: monospace;
			}

			.arrow {
				font-size: 32rpx;
				color: #ccc;
			}
		}

		.divider {
			height: 1rpx;
			background-color: #f5f5f5;
			width: 100%;
		}
	}

	.action-section {
		margin-top: 60rpx;
		padding: 0 20rpx;

		.logout-btn {
			width: 100%;
			height: 90rpx;
			line-height: 90rpx;
			background: #ffffff;
			color: #ff4d4f;
			font-size: 32rpx;
			border-radius: 45rpx;
			border: 2rpx solid #ffe5e5;
			font-weight: 500;

			&:after {
				border: none;
			}

			&:active {
				background: #fff0f0;
			}
		}
	}

	/* 资料完善弹窗样式 */
	.profile-mask {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		z-index: 10;
		display: flex;
		align-items: flex-end;
	}

	.profile-panel {
		width: 100%;
		background: #fff;
		border-radius: 32rpx 32rpx 0 0;
		padding: 40rpx;
		transform: translateY(100%);
		transition: transform 0.3s;
	}

	.profile-panel.show {
		transform: translateY(0);
	}

	.panel-header {
		text-align: center;
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 40rpx;
	}

	.avatar-wrapper {
		background: none;
		padding: 0;
		width: 160rpx;
		height: 160rpx;
		margin: 0 auto 40rpx;
		border-radius: 80rpx;
		border: none;
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		border-radius: 80rpx;
		background: #f0f0f0;
	}

	.avatar-tip {
		font-size: 24rpx;
		color: #999;
		margin-top: 10rpx;
	}

	.input-group {
		display: flex;
		align-items: center;
		padding: 30rpx 0;
		border-bottom: 1rpx solid #eee;
		margin-bottom: 60rpx;
	}

	.label {
		width: 100rpx;
		font-size: 30rpx;
		color: #333;
	}

	.nickname-input {
		flex: 1;
		font-size: 30rpx;
	}

	.submit-btn {
		background: #8280FF;
		color: #fff;
		border-radius: 44rpx;
		height: 88rpx;
		line-height: 88rpx;
	}
</style>
