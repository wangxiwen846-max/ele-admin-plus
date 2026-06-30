<!-- 单位多行录入 -->
<template>
  <el-input
    :model-value="inputValue"
    type="textarea"
    :rows="3"
    :disabled="disabled"
    :placeholder="placeholder"
    class="ele-fluid unit-tag-select"
    @update:model-value="handleChange"
  />
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    modelValue: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: '输入后回车添加'
    },
    disabled: Boolean
  });

  const emit = defineEmits(['update:modelValue']);

  const inputValue = computed(() => (props.modelValue ?? []).join('\n'));

  const handleChange = (value) => {
    const next = String(value ?? '')
      .split(/\r?\n/)
      .map((item) => String(item).trim())
      .filter(Boolean);
    emit('update:modelValue', [...new Set(next)]);
  };
</script>

<style scoped lang="scss">
  .unit-tag-select {
    width: 100%;
  }
</style>
