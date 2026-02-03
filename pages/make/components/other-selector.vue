<template>
	<scroll-view scroll-y class="selector-scroll">
		<view class="container">
			<!--主要开关卡片 -->
			<view class="card main-switch-card">
				<view class="card-header">
					<view class="header-left">
						<text class="title">其他设置</text>
						<text class="subtitle">Other Settings</text>
					</view>
					<switch :checked="localValue.enable" @change="updateValue('enable', $event.detail.value)"
						color="#8280FF" style="transform:scale(0.9)" />
				</view>
			</view>

			<!-- 参数控制区 -->
			<view class="card params-card" v-if="localValue.enable">
				
				<!-- 面部比例 -->
				<view class="param-item">
					<view class="label-row">
						<text class="label">面部比例</text>
						<text class="value-display">{{ localValue.faceRatio }}</text>
					</view>
					<slider class="custom-slider" :value="localValue.faceRatio" :min="0.10" :max="0.50" :step="0.01"
						activeColor="#8280FF" backgroundColor="#F0F2F5" block-size="20" block-color="#FFFFFF"
						@change="updateValue('faceRatio', $event.detail.value)" @changing="updateValue('faceRatio', $event.detail.value)" />
				</view>

				<!-- 头距顶距离 -->
				<view class="param-item">
					<view class="label-row">
						<text class="label">头距顶距离</text>
						<text class="value-display">{{ localValue.topDistance }}</text>
					</view>
					<slider class="custom-slider" :value="localValue.topDistance" :min="0.02" :max="0.50" :step="0.01"
						activeColor="#8280FF" backgroundColor="#F0F2F5" block-size="20" block-color="#FFFFFF"
						@change="updateValue('topDistance', $event.detail.value)" @changing="updateValue('topDistance', $event.detail.value)" />
				</view>

				<!-- KB大小设置 -->
				<view class="param-item">
					<view class="label-row toggle-row">
						<view class="label-group">
							<text class="label">设置KB大小</text>
							<switch :checked="localValue.kbEnable" @change="updateValue('kbEnable', $event.detail.value)" 
								color="#8280FF" style="transform:scale(0.7)" />
						</view>
						<text class="value-display" v-if="localValue.kbEnable">{{ localValue.kbSize }}</text>
					</view>
					<slider v-if="localValue.kbEnable" class="custom-slider" :value="localValue.kbSize" :min="10" :max="1000" :step="10"
						activeColor="#8280FF" backgroundColor="#F0F2F5" block-size="20" block-color="#FFFFFF"
						@change="updateValue('kbSize', $event.detail.value)" @changing="updateValue('kbSize', $event.detail.value)" />
				</view>

				<!-- DPI设置 -->
				<view class="param-item">
					<view class="label-row toggle-row">
						<view class="label-group">
							<text class="label">设置DPI大小</text>
							<switch :checked="localValue.dpiEnable" @change="updateValue('dpiEnable', $event.detail.value)" 
								color="#8280FF" style="transform:scale(0.7)" />
						</view>
						<text class="value-display" v-if="localValue.dpiEnable">{{ localValue.dpiValue }}</text>
					</view>
					<slider v-if="localValue.dpiEnable" class="custom-slider" :value="localValue.dpiValue" :min="72" :max="600" :step="1"
						activeColor="#8280FF" backgroundColor="#F0F2F5" block-size="20" block-color="#FFFFFF"
						@change="updateValue('dpiValue', $event.detail.value)" @changing="updateValue('dpiValue', $event.detail.value)" />
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

	const localValue = ref({ ...props.modelValue });

	watch(() => props.modelValue, (newVal) => {
		localValue.value = { ...newVal };
	}, { deep: true });

	const updateValue = (key, value) => {
		let finalValue = value;
		
		// Boolean handling
		if (['enable', 'kbEnable', 'dpiEnable'].includes(key)) {
			finalValue = !!value;
		} else {
			if (typeof finalValue === 'string') {
				finalValue = finalValue === '' ? 0 : Number(finalValue);
			}
			
			// Range Clamping
			switch(key) {
				case 'faceRatio':
					finalValue = parseFloat(Math.min(Math.max(finalValue, 0.10), 0.50).toFixed(2));
					break;
				case 'topDistance':
					finalValue = parseFloat(Math.min(Math.max(finalValue, 0.02), 0.50).toFixed(2));
					break;
				case 'kbSize':
					finalValue = Math.min(Math.max(Math.round(finalValue), 10), 1000);
					break;
				case 'dpiValue':
					finalValue = Math.min(Math.max(Math.round(finalValue), 72), 600);
					break;
			}
		}

		// Update local state first with nextTick trick to force UI update if needed
		if (localValue.value[key] === finalValue && !['enable', 'kbEnable', 'dpiEnable'].includes(key)) {
			// Trigger re-render if value "bounced" back visually
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
		border-radius: 24rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
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
				
				&.toggle-row {
					.label-group {
						display: flex;
						align-items: center;
						gap: 20rpx;
					}
				}

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
