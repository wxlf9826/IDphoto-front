<template>
	<scroll-view scroll-y class="selector-scroll">
		<view class="container">
			<!-- 主开关卡片 -->
			<view class="card main-switch-card">
				<view class="card-header">
					<view class="header-left">
						<text class="title">防盗水印</text>
						<text class="subtitle">Anti-theft Watermark</text>
					</view>
					<switch :checked="localValue.enable" @change="updateValue('enable', $event.detail.value)"
						color="#8280FF" style="transform:scale(0.9)" />
				</view>
			</view>

			<view class="card params-card" v-if="localValue.enable">
				<!-- 文本输入 -->
				<view class="param-group">
					<text class="group-label">水印内容</text>
					<view class="input-wrapper">
						<input class="custom-input" type="text" :value="localValue.text" placeholder="请输入水印文字"
							placeholder-class="placeholder" @input="updateValue('text', $event.detail.value)" />
					</view>
				</view>

				<!-- 颜色选择 -->
				<view class="param-group">
					<text class="group-label">文字颜色</text>
					<view class="color-row">
						<view v-for="c in presetColors" :key="c" class="color-dot" :style="{ background: c }"
							:class="{ active: localValue.color === c, white: c === '#FFFFFF' }"
							@click="updateValue('color', c)">
							<view class="check" v-if="localValue.color === c"></view>
						</view>
					</view>
				</view>

				<!-- 滑块参数 -->
				<view class="param-item">
					<view class="label-row">
						<text class="label">字号</text>
						<text class="value-display">{{ localValue.size }}</text>
					</view>
					<slider class="custom-slider" :value="localValue.size" :min="10" :max="100" :step="1"
						activeColor="#8280FF" backgroundColor="#F0F2F5" block-size="20" block-color="#FFFFFF"
						@change="updateValue('size', $event.detail.value)" @changing="updateValue('size', $event.detail.value)" />
				</view>

				<view class="param-item">
					<view class="label-row">
						<text class="label">透明度</text>
						<text class="value-display">{{ localValue.opacity }}</text>
					</view>
					<slider class="custom-slider" :value="localValue.opacity" :min="0" :max="1" :step="0.01"
						activeColor="#8280FF" backgroundColor="#F0F2F5" block-size="20" block-color="#FFFFFF"
						@change="updateValue('opacity', $event.detail.value)" @changing="updateValue('opacity', $event.detail.value)" />
				</view>

				<view class="param-item">
					<view class="label-row">
						<text class="label">角度</text>
						<text class="value-display">{{ localValue.angle }}</text>
					</view>
					<slider class="custom-slider" :value="localValue.angle" :min="0" :max="360" :step="1"
						activeColor="#8280FF" backgroundColor="#F0F2F5" block-size="20" block-color="#FFFFFF"
						@change="updateValue('angle', $event.detail.value)" @changing="updateValue('angle', $event.detail.value)" />
				</view>
				
				<view class="param-item">
					<view class="label-row">
						<text class="label">间距</text>
						<text class="value-display">{{ localValue.spacing }}</text>
					</view>
					<slider class="custom-slider" :value="localValue.spacing" :min="10" :max="200" :step="1"
						activeColor="#8280FF" backgroundColor="#F0F2F5" block-size="20" block-color="#FFFFFF"
						@change="updateValue('spacing', $event.detail.value)" @changing="updateValue('spacing', $event.detail.value)" />
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
	const presetColors = ['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#CCCCCC'];

	// Local state to handle input synchronization issues
	const localValue = ref({ ...props.modelValue });

	// Sync local values when props change
	watch(() => props.modelValue, (newVal) => {
		localValue.value = { ...newVal };
	}, { deep: true });

	const updateValue = (key, value) => {
		let finalValue = value;
		
		if (key === 'enable') {
			finalValue = !!value;
		} else if (key === 'text' || key === 'color') {
			finalValue = value;
		} else {
			// Type conversion if from input
			if (typeof finalValue === 'string') {
				finalValue = finalValue === '' ? 0 : Number(finalValue);
			}
			
			// Precision and Clamping handling
			switch(key) {
				case 'size':
					finalValue = Math.min(Math.max(Math.round(finalValue), 10), 100);
					break;
				case 'opacity':
					finalValue = Math.min(Math.max(Number(finalValue), 0), 1);
					finalValue = Number(finalValue.toFixed(2));
					break;
				case 'angle':
					finalValue = Math.min(Math.max(Math.round(finalValue), 0), 360);
					break;
				case 'spacing':
					finalValue = Math.min(Math.max(Math.round(finalValue), 10), 200);
					break;
			}
		}
		
		// Update local state first
		// Trick to force input update if the value didn't change from Vue's perspective
		if (localValue.value[key] === finalValue && (key !== 'enable' && key !== 'text' && key !== 'color')) {
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
						box-shadow: none;
		border: 1rpx solid rgba(0, 0, 0, 0.03);
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
		.param-group {
			margin-bottom: 40rpx;

			.group-label {
				font-size: 28rpx;
				font-weight: bold;
				color: #2D3748;
				margin-bottom: 20rpx;
				display: block;
			}

			.input-wrapper {
				background: #F7FAFC;
				border-radius: 16rpx;
				padding: 20rpx;
				border: 2rpx solid transparent;
				transition: all 0.3s;

				&:focus-within {
					background: #FFF;
					border-color: #8280FF;
					box-shadow: 0 0 0 4rpx rgba(130, 128, 255, 0.1);
				}

				.custom-input {
					font-size: 30rpx;
					color: #2D3748;
					height: 40rpx;
					min-height: 40rpx;
				}

				.placeholder {
					color: #CBD5E0;
				}
			}

			.color-row {
				display: flex;
				gap: 24rpx;

				.color-dot {
					width: 64rpx;
					height: 64rpx;
					border-radius: 50%;
					border: 2rpx solid rgba(0, 0, 0, 0.05);
					position: relative;
					transition: all 0.2s;
					display: flex;
					align-items: center;
					justify-content: center;

					&.white {
						background: #fff;
						border: 2rpx solid #E2E8F0;
					}

					&.active {
						transform: scale(1.1);
						border: 4rpx solid #8280FF;
						box-shadow: none;
					}

					.check {
						width: 16rpx;
						height: 16rpx;
						background: #fff;
						border-radius: 50%;
						box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
					}
				}
			}
		}

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
			}
		}
	}
</style>
