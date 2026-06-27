<!-- 详情表格长文本省略展示 -->
<template>
  <el-tooltip
    v-if="displayText && displayText !== '-' && isOverflow"
    :content="displayText"
    placement="top"
    :show-after="300"
  >
    <span class="detail-text-cell detail-text-cell--ellipsis">{{ truncatedText }}</span>
  </el-tooltip>
  <span v-else class="detail-text-cell">{{ displayText }}</span>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    text: {
      type: [String, Number],
      default: ''
    },
    maxLength: {
      type: Number,
      default: 24
    }
  });

  const displayText = computed(() => {
    const value = props.text == null ? '' : String(props.text).trim();
    return value || '-';
  });

  const isOverflow = computed(
    () => displayText.value !== '-' && displayText.value.length > props.maxLength
  );

  const truncatedText = computed(() => {
    if (!isOverflow.value) {
      return displayText.value;
    }
    return `${displayText.value.slice(0, props.maxLength)}...`;
  });
</script>

<style scoped lang="scss">
  .detail-text-cell {
    display: inline-block;
    max-width: 100%;
    font-size: 13px;
    line-height: 1.5;
    color: var(--el-text-color-regular);

    &--ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: bottom;
    }
  }
</style>
