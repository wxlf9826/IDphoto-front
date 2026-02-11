<template>
	<view class="option-grid">
		<view v-for="item in displaySizes" :key="item.name" class="option-card"
			:class="{ active: modelValue?.name === item.name && !isCustomSelected }" @click="onSelect(item, false)">
			<view class="card-inner">
				<text class="size-name">{{ item.name }}</text>
				<text class="size-detail">{{ item.px }}</text>
			</view>
		</view>

		<view class="option-card more-btn" :class="{ active: isCustomSelected }" @click="loadMoreData">
			<view class="card-inner">
				<text class="size-name">更多尺寸</text>
				<text class="size-detail selected-tag" v-if="isCustomSelected">已选: {{ modelValue?.name }}</text>
				<text class="size-detail" v-else>点击获取全部</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { computed } from 'vue';

	const props = defineProps(['modelValue', 'isCustomSelected', 'remoteSizes']);
	// 定义一个 'open-modal' 事件，用来向上传递数据
	const emit = defineEmits(['update:modelValue', 'update:isCustomSelected', 'open-modal']);

	const staticSizes = [{
			name: '小一寸',
			px: '260×378 px',
			widthPx: 260,
			heightPx: 378
		},
		{
			name: '大一寸',
			px: '390×567 px',
			widthPx: 390,
			heightPx: 567
		},
		{
			name: '小二寸',
			px: '413×480 px',
			widthPx: 413,
			heightPx: 480
		}
	];

	// 优先使用父组件传来的远程数据的前 3 个，否则使用本地写死的
	const displaySizes = computed(() => {
		if (props.remoteSizes && props.remoteSizes.length > 0) {
			return props.remoteSizes.slice(0, 3);
		}
		return staticSizes;
	});

	const loadMoreData = () => {
		// 如果父组件已经预取了数据，直接打开弹窗
		if (props.remoteSizes && props.remoteSizes.length > 0) {
			emit('open-modal', props.remoteSizes);
		} else {
			// 如果由于各种原因（如异步延迟）还没拿到，再请求一次也没关系，或者直接用本地数据
			emit('open-modal', staticSizes);
		}
	};

	const onSelect = (item, isCustom) => {
		emit('update:modelValue', item);
		emit('update:isCustomSelected', isCustom);
	};
</script>

<style lang="scss" scoped>
	/* [此处保留之前的 .option-grid 样式] */
	.option-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20rpx;

		.option-card {
			height: 120rpx;
			background: #F7FAFC;
			border-radius: 24rpx;
			border: 3rpx solid transparent;

			&.active {
				background: #EEEDFF;
				border-color: #8280FF;

				.size-name {
					color: #8280FF;
				}
			}

			&.more-btn {
				border: 2rpx dashed #CBD5E0;
			}

			.card-inner {
				padding: 0 30rpx;
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: center;

				.size-name {
					font-size: 28rpx;
					font-weight: bold;
				}

				.size-detail {
					font-size: 22rpx;
					color: #A0AEC0;
				}

				.selected-tag {
					color: #8280FF;
					font-size: 18rpx;
					font-weight: bold;
				}
			}
		}
	}
</style>
