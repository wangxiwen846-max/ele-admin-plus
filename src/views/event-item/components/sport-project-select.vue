<!-- 关联体育项目 - 级联多选（可选一级或下级项目） -->
<template>
  <el-cascader
    :model-value="selectedPaths"
    :options="SPORT_PROJECT_CASCADER_OPTIONS"
    :props="cascaderProps"
    :disabled="disabled"
    placeholder="请选择体育项目"
    clearable
    filterable
    collapse-tags
    collapse-tags-tooltip
    class="ele-fluid sport-project-select"
    @update:model-value="handleChange"
  />
</template>

<script setup>
  import { computed } from 'vue';
  import {
    SPORT_PROJECT_CASCADER_OPTIONS,
    cascaderPathsFromSports,
    sportsFromCascaderPaths
  } from '@/views/event-item/data.js';

  const props = defineProps({
    modelValue: { type: Array, default: () => [] },
    disabled: Boolean
  });

  const emit = defineEmits(['update:modelValue']);

  const cascaderProps = {
    multiple: true,
    checkStrictly: true,
    emitPath: true,
    value: 'value',
    label: 'label',
    children: 'children'
  };

  const selectedPaths = computed(() => cascaderPathsFromSports(props.modelValue));

  const handleChange = (paths) => {
    emit('update:modelValue', sportsFromCascaderPaths(paths ?? []));
  };
</script>
