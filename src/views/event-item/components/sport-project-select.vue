<!-- 关联体育项目 - 分组下拉选择器 -->
<template>
  <el-select
    :model-value="selectedKeys"
    multiple
    filterable
    clearable
    collapse-tags
    collapse-tags-tooltip
    :disabled="disabled"
    placeholder="搜索项目名称或一级项目"
    class="ele-fluid sport-project-select"
    :filter-method="handleFilter"
    @update:model-value="handleChange"
    @clear="handleFilter('')"
  >
    <el-option-group
      v-for="group in filteredGroups"
      :key="group.category"
      :label="group.category"
    >
      <el-option
        v-for="item in group.options"
        :key="getSportCatalogKey(item)"
        :label="formatSportOptionLabel(item)"
        :value="getSportCatalogKey(item)"
      />
    </el-option-group>
    <template #empty>
      <span class="empty-hint">未找到匹配的体育项目</span>
    </template>
  </el-select>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import {
    SPORT_PROJECT_CATALOG,
    SPORT_CATEGORY_OPTIONS,
    getSportCatalogKey,
    normalizeSportEntry,
    formatSportEntryDisplay
  } from '@/views/event-item/data.js';

  const props = defineProps({
    modelValue: { type: Array, default: () => [] },
    disabled: Boolean
  });

  const emit = defineEmits(['update:modelValue']);

  const filterKeyword = ref('');

  const selectedKeys = computed(() =>
    (props.modelValue ?? []).map((entry) => getSportCatalogKey(entry))
  );

  const formatSportOptionLabel = (item) => `${item.category} / ${item.name}`;

  const groupedCatalog = computed(() =>
    SPORT_CATEGORY_OPTIONS.map((category) => ({
      category,
      options: SPORT_PROJECT_CATALOG.filter((d) => d.category === category)
    })).filter((group) => group.options.length)
  );

  const filteredGroups = computed(() => {
    const kw = filterKeyword.value.trim().toLowerCase();
    if (!kw) {
      return groupedCatalog.value;
    }
    return groupedCatalog.value
      .map((group) => ({
        ...group,
        options: group.options.filter(
          (item) =>
            item.name.toLowerCase().includes(kw) ||
            item.category.toLowerCase().includes(kw)
        )
      }))
      .filter((group) => group.options.length);
  });

  const handleFilter = (query) => {
    filterKeyword.value = query ?? '';
  };

  const handleChange = (keys) => {
    const keyList = keys ?? [];
    const catalogMap = new Map(
      SPORT_PROJECT_CATALOG.map((item) => [getSportCatalogKey(item), item])
    );
    const next = keyList.map((key) => normalizeSportEntry(catalogMap.get(key) ?? key));
    emit('update:modelValue', next);
  };

  defineExpose({ formatSportEntryDisplay });
</script>

<style scoped lang="scss">
  .empty-hint {
    display: block;
    padding: 8px 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }
</style>
