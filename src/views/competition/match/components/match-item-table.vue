<!-- 比赛设项选择表格 -->
<template>
  <div class="match-item-table">
    <div class="picker-toolbar">
      <el-button type="primary" :disabled="disabled || !activityId" @click="openPicker">
        选择设项
      </el-button>
    </div>

    <el-table :data="selectedItems" border size="small" class="picker-table">
      <el-table-column prop="itemName" label="设项名称" min-width="120" />
      <el-table-column prop="project" label="关联体育项目" min-width="140" show-overflow-tooltip />
      <el-table-column prop="matchForm" label="比赛形式" width="88" align="center" />
      <el-table-column prop="scoreType" label="成绩类型" width="96" align="center" />
      <el-table-column label="成绩规则" min-width="120" show-overflow-tooltip>
        <template #default="{ row }">{{ row.scoreRule || '-' }}</template>
      </el-table-column>
      <el-table-column label="计分规则" min-width="100" show-overflow-tooltip>
        <template #default="{ row }">{{ row.scoringRule || '未启用' }}</template>
      </el-table-column>
      <el-table-column label="奖项设置" min-width="110" show-overflow-tooltip>
        <template #default="{ row }">{{ row.awardSummary || '暂无奖项' }}</template>
      </el-table-column>
      <el-table-column label="参赛要求" min-width="120" show-overflow-tooltip>
        <template #default="{ row }">{{ row.qualification || '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <el-link type="primary" underline="never" @click="openEdit(row)">修改</el-link>
          <el-divider direction="vertical" />
          <el-link
            type="danger"
            underline="never"
            :disabled="disabled"
            @click="removeItem(row.itemId)"
          >
            移除
          </el-link>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="!selectedItems.length" class="empty-state">
      <div class="empty-text">请从活动设项范围中选择至少一个设项</div>
      <el-button type="primary" link :disabled="disabled || !activityId" @click="openPicker">
        选择设项
      </el-button>
    </div>

    <ele-modal v-model="visible" title="从活动设项范围选择" :width="960" @closed="resetPicker">
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
        row-key="itemId"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="46" align="center" :selectable="isSelectable" />
        <el-table-column prop="itemName" label="设项名称" min-width="120" />
        <el-table-column prop="project" label="关联体育项目" min-width="140" />
        <el-table-column prop="scoreType" label="成绩类型" width="100" align="center" />
        <el-table-column prop="scoreRule" label="成绩规则" min-width="110" show-overflow-tooltip />
        <el-table-column prop="scoringRule" label="计分规则" min-width="100" show-overflow-tooltip />
        <el-table-column prop="qualification" label="参赛要求" min-width="120" show-overflow-tooltip />
        <el-table-column prop="awardSummary" label="奖项设置" min-width="120" show-overflow-tooltip />
      </el-table>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="confirmPicker">确定</el-button>
      </template>
    </ele-modal>

    <match-item-edit-dialog
      v-if="editVisible"
      :item-id="editItemId"
      :meta-config="editMetaConfig"
      :award-config="editAwardConfig"
      @closed="editVisible = false"
      @save="handleEditSave"
    />
  </div>
</template>

<script setup>
  import { computed, nextTick, ref, watch } from 'vue';
  import MatchItemEditDialog from './match-item-edit-dialog.vue';
  import { getSelectableMatchItems, mapMatchItemRow, buildMatchConfigsForItems } from '../data.js';

  const props = defineProps({
    modelValue: {
      type: Array,
      default: () => []
    },
    itemAwardConfig: {
      type: Object,
      default: () => ({})
    },
    itemMetaConfig: {
      type: Object,
      default: () => ({})
    },
    itemScoreConfig: {
      type: Object,
      default: () => ({})
    },
    activityId: [Number, String],
    disabled: Boolean
  });

  const emit = defineEmits([
    'update:modelValue',
    'update:itemAwardConfig',
    'update:itemMetaConfig',
    'update:itemScoreConfig'
  ]);

  const visible = ref(false);
  const keyword = ref('');
  const filterKeyword = ref('');
  const tableRef = ref(null);
  const pickerSelection = ref([]);

  const editVisible = ref(false);
  const editItemId = ref(null);
  const editMetaConfig = ref({});
  const editAwardConfig = ref({});

  const availableItems = computed(() =>
    props.activityId ? getSelectableMatchItems(props.activityId) : []
  );

  const filteredItems = computed(() => {
    const kw = filterKeyword.value.trim();
    if (!kw) {
      return availableItems.value;
    }
    return availableItems.value.filter((d) => d.itemName.includes(kw));
  });

  const selectedItems = computed(() => {
    const match = {
      itemIds: props.modelValue,
      itemAwardConfig: props.itemAwardConfig,
      itemMetaConfig: props.itemMetaConfig,
      itemScoreConfig: props.itemScoreConfig
    };
    return (props.modelValue ?? []).map((id) => mapMatchItemRow(match, id)).filter(Boolean);
  });

  const syncItemConfigs = (ids) => {
    const configs = buildMatchConfigsForItems(
      {
        itemAwardConfig: props.itemAwardConfig,
        itemMetaConfig: props.itemMetaConfig,
        itemScoreConfig: props.itemScoreConfig
      },
      ids
    );
    emit('update:itemAwardConfig', configs.itemAwardConfig);
    emit('update:itemMetaConfig', configs.itemMetaConfig);
    emit('update:itemScoreConfig', configs.itemScoreConfig);
  };

  const isSelectable = (row) => row.status === 1;

  const openPicker = () => {
    visible.value = true;
    nextTick(() => {
      tableRef.value?.clearSelection?.();
      const selectedSet = new Set(props.modelValue ?? []);
      filteredItems.value.forEach((row) => {
        if (selectedSet.has(row.itemId)) {
          tableRef.value?.toggleRowSelection?.(row, true);
        }
      });
    });
  };

  const resetPicker = () => {
    keyword.value = '';
    filterKeyword.value = '';
    pickerSelection.value = [];
  };

  const filterItems = () => {
    filterKeyword.value = keyword.value;
  };

  const resetFilter = () => {
    keyword.value = '';
    filterKeyword.value = '';
  };

  const handleSelectionChange = (rows) => {
    pickerSelection.value = rows;
  };

  const confirmPicker = () => {
    const ids = pickerSelection.value.map((d) => d.itemId);
    emit('update:modelValue', ids);
    syncItemConfigs(ids);
    visible.value = false;
  };

  const removeItem = (itemId) => {
    const ids = (props.modelValue ?? []).filter((id) => id !== itemId);
    emit('update:modelValue', ids);
    syncItemConfigs(ids);
  };

  const openEdit = (row) => {
    editItemId.value = row.itemId;
    editMetaConfig.value = props.itemMetaConfig?.[String(row.itemId)] ?? row.metaConfig ?? {};
    editAwardConfig.value = props.itemAwardConfig?.[String(row.itemId)] ?? row.awardConfig ?? {};
    editVisible.value = true;
  };

  const handleEditSave = ({ metaConfig, awardConfig }) => {
    const key = String(editItemId.value);
    emit('update:itemMetaConfig', {
      ...(props.itemMetaConfig ?? {}),
      [key]: metaConfig
    });
    emit('update:itemAwardConfig', {
      ...(props.itemAwardConfig ?? {}),
      [key]: awardConfig
    });
    editVisible.value = false;
  };

  watch(
    () => props.activityId,
    () => {
      emit('update:modelValue', []);
      emit('update:itemAwardConfig', {});
      emit('update:itemMetaConfig', {});
      emit('update:itemScoreConfig', {});
    }
  );
</script>

<style scoped lang="scss">
  .match-item-table {
    width: 100%;
  }

  .picker-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
  }

  .empty-state {
    margin-top: 12px;
    text-align: center;
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }

  .empty-text {
    margin-bottom: 6px;
  }
</style>
