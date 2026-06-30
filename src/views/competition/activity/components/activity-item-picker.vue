<!-- 从设项管理选择设项 -->
<template>
  <div class="activity-item-picker">
    <div class="picker-toolbar">
      <el-button type="primary" :disabled="disabled" @click="openPicker">从设项库选择</el-button>
    </div>

    <el-table :data="selectedItems" border size="small" class="picker-table">
      <el-table-column prop="itemName" label="设项名称" min-width="120" />
      <el-table-column prop="project" label="关联体育项目" min-width="110" />
      <el-table-column prop="matchForm" label="比赛形式" width="90" align="center" />
      <el-table-column prop="scoreType" label="成绩类型" width="100" align="center" />
      <el-table-column prop="awardCountText" label="奖项数量" width="100" align="center" />
      <el-table-column prop="qualification" label="参赛要求" min-width="120" show-overflow-tooltip />
      <el-table-column prop="applicableRegion" label="适用区域" min-width="120" show-overflow-tooltip />
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <ele-dot
            v-if="row.status === 1"
            text="启用"
            type="success"
            size="8px"
            :ripple="false"
          />
          <ele-dot v-else text="停用" type="danger" size="8px" :ripple="false" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="72" align="center" fixed="right">
        <template #default="{ row }">
          <el-link
            type="danger"
            underline="never"
            :disabled="disabled || isLocked(row.itemId)"
            @click="removeItem(row.itemId)"
          >
            移除
          </el-link>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="!selectedItems.length" class="empty-state">暂未选择设项</div>

    <ele-modal v-model="visible" title="从设项库选择设项" :width="1080" @closed="resetPicker">
      <el-form label-width="72px" @submit.prevent="">
        <el-row :gutter="12">
          <el-col :sm="8" :xs="24">
            <el-form-item label="设项名称">
              <el-input v-model.trim="keyword" clearable placeholder="模糊搜索" />
            </el-form-item>
          </el-col>
          <el-col :sm="8" :xs="24">
            <el-form-item label-width="0">
              <el-button type="primary" @click="filterItems">查询</el-button>
              <el-button @click="resetFilter">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-table
        ref="tableRef"
        :data="filteredItems"
        border
        size="small"
        max-height="360"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="48" align="center" :selectable="isSelectable" />
        <el-table-column label="设项名称" min-width="120">
          <template #default="{ row }">
            <el-tooltip
              v-if="row.status !== 1"
              content="该设项已停用，不可选择"
              placement="top"
            >
              <span class="item-name-disabled">{{ row.itemName }}</span>
            </el-tooltip>
            <span v-else>{{ row.itemName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="project" label="关联体育项目" min-width="110" />
        <el-table-column prop="matchForm" label="比赛形式" width="90" align="center" />
        <el-table-column prop="scoreType" label="成绩类型" width="100" align="center" />
        <el-table-column prop="awardCountText" label="奖项数量" width="100" align="center" />
        <el-table-column prop="qualification" label="参赛要求" min-width="120" show-overflow-tooltip />
        <el-table-column prop="applicableRegion" label="适用区域" min-width="120" show-overflow-tooltip />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <ele-dot
              v-if="row.status === 1"
              text="启用"
              type="success"
              size="8px"
              :ripple="false"
            />
            <ele-dot v-else text="停用" type="danger" size="8px" :ripple="false" />
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="confirmPick">确定</el-button>
      </template>
    </ele-modal>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import { EleMessage } from 'ele-admin-plus';
  import { findEventItem } from '@/views/event-item/data.js';
  import {
    getActivityLinkedItems,
    getAllEventItemsForPicker,
    getSelectableEventItems
  } from '../data.js';
  import { isItemApplicableToActivityCoverage } from '../scope-utils.js';

  const props = defineProps({
    modelValue: { type: Array, default: () => [] },
    coverage: { type: Object, default: () => ({}) },
    lockedItemIds: { type: Array, default: () => [] },
    disabled: Boolean,
    /** 不按适用区域限制设项选择 */
    ignoreCoverage: Boolean
  });

  const emit = defineEmits(['update:modelValue']);

  const visible = ref(false);
  const keyword = ref('');
  const tableRef = ref(null);
  const tempSelection = ref([]);
  const activeKeyword = ref('');

  const selectedItems = computed(() => getActivityLinkedItems(props.modelValue));

  const sourceItems = computed(() =>
    props.ignoreCoverage ? getAllEventItemsForPicker() : getSelectableEventItems()
  );

  const filteredItems = computed(() => {
    let list = sourceItems.value;
    if (activeKeyword.value) {
      list = list.filter((d) => d.itemName.includes(activeKeyword.value));
    }
    return list;
  });

  const isLocked = (itemId) => props.lockedItemIds.includes(itemId);

  const isItemApplicable = (row) => {
    if (props.ignoreCoverage) {
      return true;
    }
    return isItemApplicableToActivityCoverage(findEventItem(row.itemId), props.coverage);
  };

  const isSelectable = (row) => {
    if (row.status !== 1) {
      return false;
    }
    if (props.modelValue.includes(row.itemId)) {
      return false;
    }
    return isItemApplicable(row);
  };

  const openPicker = () => {
    visible.value = true;
    resetFilter();
  };

  const filterItems = () => {
    activeKeyword.value = keyword.value;
  };

  const resetFilter = () => {
    keyword.value = '';
    activeKeyword.value = '';
  };

  const resetPicker = () => {
    tempSelection.value = [];
    resetFilter();
  };

  const handleSelectionChange = (rows) => {
    tempSelection.value = rows;
  };

  const confirmPick = () => {
    if (!tempSelection.value.length) {
      EleMessage.warning({ message: '请至少选择一个设项', plain: true });
      return;
    }
    const next = [...props.modelValue];
    tempSelection.value.forEach((row) => {
      if (row.status === 1 && !next.includes(row.itemId)) {
        next.push(row.itemId);
      }
    });
    emit('update:modelValue', next);
    visible.value = false;
  };

  const removeItem = (itemId) => {
    if (isLocked(itemId)) {
      EleMessage.error({
        message: '该设项已被下属比赛使用，不允许从活动设项范围中移除。',
        plain: true
      });
      return;
    }
    emit(
      'update:modelValue',
      props.modelValue.filter((id) => id !== itemId)
    );
  };
</script>

<style scoped lang="scss">
  .picker-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
  }

  .empty-state {
    margin-top: 8px;
    padding: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
  }

  .item-name-disabled {
    color: var(--el-text-color-placeholder);
    cursor: not-allowed;
  }
</style>
