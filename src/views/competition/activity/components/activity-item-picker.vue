<!-- 从设项管理选择设项 -->
<template>
  <div class="activity-item-picker">
    <div class="picker-toolbar">
      <div>
        <div class="picker-desc">
          从设项管理 / 设项库中选择当前活动可使用的设项，不在此处维护设项本身。已被下属比赛使用的设项不可移除。
        </div>
      </div>
      <el-button type="primary" :disabled="disabled" @click="openPicker">
        从设项库选择
      </el-button>
    </div>

    <el-table :data="selectedItems" border size="small" class="picker-table">
      <el-table-column prop="itemName" label="设项名称" min-width="120" />
      <el-table-column prop="project" label="关联项目" min-width="110" />
      <el-table-column prop="scoreType" label="成绩类型" width="110" align="center" />
      <el-table-column prop="scoreRule" label="成绩规则" min-width="120" show-overflow-tooltip />
      <el-table-column prop="scoringRule" label="计分规则" min-width="120" show-overflow-tooltip />
      <el-table-column
        prop="registrationSetting"
        label="报名设置"
        min-width="130"
        show-overflow-tooltip
      />
      <el-table-column prop="qualification" label="参赛要求" min-width="120" show-overflow-tooltip />
      <el-table-column label="启用状态" width="88" align="center">
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
    <div v-if="!selectedItems.length" class="empty-state">
      <div class="empty-text">
        暂未选择活动设项，请从设项库选择当前活动可使用的设项。赛事活动下发布比赛时，只能从已选择的设项范围中选择。
      </div>
      <el-button type="primary" link :disabled="disabled" @click="openPicker">
        从设项库选择
      </el-button>
    </div>

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
        <el-table-column prop="itemName" label="设项名称" min-width="120" />
        <el-table-column prop="project" label="关联项目" min-width="100" />
        <el-table-column prop="scoreType" label="成绩类型" width="110" align="center" />
        <el-table-column prop="scoreRule" label="成绩规则" min-width="120" show-overflow-tooltip />
        <el-table-column prop="scoringRule" label="计分规则" min-width="120" show-overflow-tooltip />
        <el-table-column
          prop="registrationSetting"
          label="报名设置"
          min-width="130"
          show-overflow-tooltip
        />
        <el-table-column prop="qualification" label="参赛要求" min-width="120" show-overflow-tooltip />
        <el-table-column label="启用状态" width="88" align="center">
          <template #default>
            <ele-dot text="启用" type="success" size="8px" :ripple="false" />
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
  import { getActivityLinkedItems, getSelectableEventItems } from '../data.js';

  const props = defineProps({
    modelValue: { type: Array, default: () => [] },
    lockedItemIds: { type: Array, default: () => [] },
    disabled: Boolean
  });

  const emit = defineEmits(['update:modelValue']);

  const visible = ref(false);
  const keyword = ref('');
  const tableRef = ref(null);
  const tempSelection = ref([]);
  const activeKeyword = ref('');

  const selectedItems = computed(() => getActivityLinkedItems(props.modelValue));

  const filteredItems = computed(() => {
    let list = getSelectableEventItems();
    if (activeKeyword.value) {
      list = list.filter((d) => d.itemName.includes(activeKeyword.value));
    }
    return list;
  });

  const isLocked = (itemId) => props.lockedItemIds.includes(itemId);
  const isSelectable = (row) => !props.modelValue.includes(row.itemId);

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
      if (!next.includes(row.itemId)) {
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
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 10px;
  }

  .picker-desc {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
  }

  .empty-state {
    margin-top: 8px;
    padding: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
  }

  .empty-text {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.6;
    margin-bottom: 6px;
  }
</style>
