<!-- 单位标签录入（el-select 可创建多选） -->
<template>
  <el-select
    :model-value="modelValue"
    multiple
    filterable
    allow-create
    default-first-option
    collapse-tags
    collapse-tags-tooltip
    :disabled="disabled"
    :placeholder="placeholder"
    class="ele-fluid unit-tag-select"
    @update:model-value="handleChange"
  >
    <el-option v-for="item in modelValue" :key="item" :label="item" :value="item" />
  </el-select>
</template>

<script setup>
  defineProps({
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

  const handleChange = (value) => {
    const next = (value ?? [])
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
