<template>
	<view class="color-module">
		<view class="section-group">
			<text class="label">背景颜色</text>
			<view class="color-grid">
				<view v-for="item in staticColors" :key="item.color" class="color-box"
					:style="{ backgroundColor: item.color }" :class="{ active: modelValue === item.color }"
					@click="$emit('update:modelValue', item.color)">
					<text class="check-icon" v-if="modelValue === item.color">✓</text>
				</view>
			</view>
		</view>

		<view class="section-group">
			<text class="label">渲染方式</text>
			<view class="mode-selector">
				<view v-for="mode in modes" :key="mode.value" class="mode-btn"
					:class="{ active: renderMode === mode.value }" @click="$emit('update:renderMode', mode.value)">
					{{ mode.label }}
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	const props = defineProps(['modelValue', 'renderMode']);
	const emit = defineEmits(['update:modelValue', 'update:renderMode']);

	const staticColors = [{
			color: '#FFFFFF'
		}, {
			color: '#438EDB'
		}, {
			color: '#FF0000'
		}, {
			color: '#000000'
		},
		{
			color: '#001F3F'
		}, {
			color: '#CCCCCC'
		}, {
			color: '#FFD700'
		}, {
			color: '#4CAF50'
		}
	];

	const modes = [{
			label: '纯色',
			value: 'pure'
		},
		{
			label: '上下',
			value: 'updown'
		},
		{
			label: '中心',
			value: 'center'
		}
	];
</script>

<style lang="scss" scoped>
	.color-module {

		/* 整体减小内边距 */
		.section-group {
			margin-bottom: 16rpx;

			&:last-child {
				margin-bottom: 0;
			}
		}

		.label {
			font-size: 22rpx;
			color: #a0aec0;
			margin-bottom: 10rpx;
			display: block;
		}

		.color-grid {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 12rpx;
			/* 减小间距 */

			.color-box {
				height: 60rpx;
				/* 固定较小的高度，不再随宽度撑大过多 */
				border-radius: 10rpx;
				border: 1rpx solid #edf2f7;
				display: flex;
				align-items: center;
				justify-content: center;

				&.active {
					border: 4rpx solid #8280ff;
				}

				.check-icon {
					color: #fff;
					font-size: 28rpx;
					text-shadow: 0 0 4rpx rgba(0, 0, 0, 0.4);
				}
			}
		}

		.mode-selector {
			display: flex;
			gap: 12rpx;

			.mode-btn {
				flex: 1;
				height: 56rpx;
				/* 压缩渲染方式按钮高度 */
				line-height: 56rpx;
				text-align: center;
				background: #f7fafc;
				border-radius: 10rpx;
				font-size: 22rpx;
				color: #4a5568;

				&.active {
					background: #8280ff;
					color: #fff;
				}
			}
		}
	}
</style>
