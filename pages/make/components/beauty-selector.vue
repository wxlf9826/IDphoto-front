<template>
	<scroll-view scroll-y class="selector-scroll">
		<view class="container">
			<!--主要开关卡片 -->
			<view class="card main-switch-card">
				<view class="card-header">
					<view class="header-left">
						<text class="title">智能美颜</text>
						<text class="subtitle">AI Smart Beauty</text>
					</view>
					<switch :checked="localValue.enable" @change="updateValue('enable', $event.detail.value)"
						color="#8280FF" style="transform:scale(0.9)" />
				</view>
			</view>

			<!-- 参数控制区 -->
			<view class="card params-card" v-if="localValue.enable">
				<view class="param-item">
					<view class="label-row">
						<text class="label">美白</text>
						<text class="value-display">{{ localValue.whitening }}</text>
					</view>
					<slider class="custom-slider" :value="localValue.whitening" :min="0" :max="15" :step="1"
						activeColor="#8280FF" backgroundColor="#F0F2F5" block-size="20" block-color="#FFFFFF"
						@change="updateValue('whitening', $event.detail.value)" @changing="updateValue('whitening', $event.detail.value)" />
				</view>

				<view class="param-item">
					<view class="label-row">
						<text class="label">亮度</text>
						<text class="value-display">{{ localValue.brightness }}</text>
					</view>
					<slider class="custom-slider" :value="localValue.brightness" :min="-5" :max="25" :step="1"
						activeColor="#8280FF" backgroundColor="#F0F2F5" block-size="20" block-color="#FFFFFF"
						@change="updateValue('brightness', $event.detail.value)" @changing="updateValue('brightness', $event.detail.value)" />
				</view>

				<view class="param-item">
					<view class="label-row">
						<text class="label">对比度</text>
						<text class="value-display">{{ localValue.contrast }}</text>
					</view>
					<slider class="custom-slider" :value="localValue.contrast" :min="-10" :max="50" :step="1"
						activeColor="#8280FF" backgroundColor="#F0F2F5" block-size="20" block-color="#FFFFFF"
						@change="updateValue('contrast', $event.detail.value)" @changing="updateValue('contrast', $event.detail.value)" />
				</view>

				<view class="param-item">
					<view class="label-row">
						<text class="label">饱和度</text>
						<text class="value-display">{{ localValue.saturation }}</text>
					</view>
					<slider class="custom-slider" :value="localValue.saturation" :min="-10" :max="50" :step="1"
						activeColor="#8280FF" backgroundColor="#F0F2F5" block-size="20" block-color="#FFFFFF"
						@change="updateValue('saturation', $event.detail.value)" @changing="updateValue('saturation', $event.detail.value)" />
				</view>

				<view class="param-item">
					<view class="label-row">
						<text class="label">锐化</text>
						<text class="value-display">{{ localValue.sharpening }}</text>
					</view>
					<slider class="custom-slider" :value="localValue.sharpening" :min="0" :max="5" :step="1"
						activeColor="#8280FF" backgroundColor="#F0F2F5" block-size="20" block-color="#FFFFFF"
						@change="updateValue('sharpening', $event.detail.value)" @changing="updateValue('sharpening', $event.detail.value)" />
				</view>
			</view>
		</view>
		<view style="height: 60rpx;"></view>
	</scroll-view>
</template>

<script setup>
	import {
		ref,
		watch,
		nextTick
	} from 'vue';

	const props = defineProps({
		modelValue: {
			type: Object,
			default: () => ({})
		}
	});

	const emit = defineEmits(['update:modelValue']);

	// Local state to handle input synchronization issues
	const localValue = ref({ ...props.modelValue });

	// Sync local values when props change (e.g. from parent or reset)
	watch(() => props.modelValue, (newVal) => {
		localValue.value = { ...newVal };
	}, { deep: true });

	const updateValue = (key, value) => {
		let finalValue = value;
		
		// Handle specific precision and clamping based on key
		// Ranges must match the slider min/max
		if (key === 'enable') {
			finalValue = !!value;
		} else {
			if (typeof finalValue === 'string') {
				finalValue = finalValue === '' ? 0 : Number(finalValue);
			}
			
			switch(key) {
				case 'whitening':
					finalValue = Math.min(Math.max(Math.round(finalValue), 0), 15);
					break;
				case 'brightness':
					finalValue = Math.min(Math.max(Math.round(finalValue), -5), 25);
					break;
				case 'contrast':
					finalValue = Math.min(Math.max(Math.round(finalValue), -10), 50);
					break;
				case 'saturation':
					finalValue = Math.min(Math.max(Math.round(finalValue), -10), 50);
					break;
				case 'sharpening':
					finalValue = Math.min(Math.max(Math.round(finalValue), 0), 5);
					break;
			}
		}

		// Update local state first
		// Trick to force input update if the value didn't change from Vue's perspective
		if (localValue.value[key] === finalValue && key !== 'enable') {
			localValue.value[key] = undefined; 
			nextTick(() => {
				localValue.value[key] = finalValue;
			});
		} else {
			localValue.value[key] = finalValue;
		}
		
		const newVal = {
			...props.modelValue,
			[key]: finalValue
		};
		emit('update:modelValue', newVal);
	};
</script>

<style lang="scss" scoped>
	.selector-scroll {
		height: 100%;
		width: 100%;
	}

	.container {
		padding: 10rpx 4rpx;
	}

	.card {
		background: #FFFFFF;
		/* 强制白色背景 */
		border-radius: 24rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		/* box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03); */
		border: 1rpx solid #F0F2F5;
	}

	.main-switch-card {
		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;

			.header-left {
				display: flex;
				flex-direction: column;

				.title {
					font-size: 32rpx;
					font-weight: 800;
					color: #2D3748;
					margin-bottom: 6rpx;
				}

				.subtitle {
					font-size: 22rpx;
					color: #A0AEC0;
					letter-spacing: 1rpx;
				}
			}
		}
	}

	.params-card {
		.param-item {
			margin-bottom: 36rpx;

			&:last-child {
				margin-bottom: 0;
			}

			.label-row {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 16rpx;

				.label {
					font-size: 28rpx;
					font-weight: 600;
					color: #4A5568;
				}

				.value-display {
					font-size: 26rpx;
					font-weight: bold;
					color: #8280FF;
					background: rgba(130, 128, 255, 0.1);
					padding: 4rpx 12rpx;
					border-radius: 100rpx;
					min-width: 60rpx;
					text-align: center;
				}
			}

			.custom-slider {
				margin: 0;
				/* 消除默认margin */
			}
		}
	}
</style>
