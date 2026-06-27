<!-- 赛段卡片 + 折叠编辑区 -->
<template>
  <div class="stage-card-list">
    <div class="stage-toolbar">
      <el-button type="primary" :disabled="disabled" @click="addStage">新增赛段</el-button>
    </div>

    <div v-if="!stages.length" class="empty-tip">请至少配置一个赛段</div>

    <div
      v-for="(stage, index) in stages"
      :key="stage.stageId"
      class="stage-card"
      :class="{ 'stage-card--expanded': isExpanded(stage.stageId) }"
    >
      <div class="stage-card-header" @click="toggleExpand(stage.stageId)">
        <div class="stage-card-summary">
          <div class="summary-row summary-row--title">
            <span class="stage-name">{{ stage.stageName || '未命名赛段' }}</span>
            <ele-dot
              v-if="stage.enabled"
              text="启用"
              type="success"
              size="8px"
              :ripple="false"
            />
            <ele-dot v-else text="禁用" type="info" size="8px" :ripple="false" />
          </div>
          <div class="summary-row">
            <span class="summary-label">比赛日期：</span>
            <span>{{ formatStageDateRange(stage) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">参赛范围：</span>
            <span>{{ formatScopeDisplaySummary(stage.scope, { isStage: true, parentScope }) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">赛段裁判长：</span>
            <span>{{ stage.chiefReferee || '未填写' }}</span>
          </div>
        </div>
        <div class="stage-card-actions" @click.stop>
          <el-button link type="primary" @click="toggleExpand(stage.stageId)">
            {{ isExpanded(stage.stageId) ? '收起' : '展开' }}
          </el-button>
          <el-button
            link
            type="danger"
            :disabled="disabled || stages.length <= 1 || stage.matchCount > 0"
            @click="removeStage(index, stage)"
          >
            删除
          </el-button>
        </div>
      </div>

      <div v-show="isExpanded(stage.stageId)" class="stage-card-body">
        <el-row :gutter="16">
          <el-col :sm="12" :xs="24">
            <el-form-item label="赛段名称" :label-width="labelWidth" required>
              <el-input
                v-model.trim="stage.stageName"
                :disabled="disabled"
                placeholder="请输入赛段名称"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="启用状态" :label-width="labelWidth" required>
              <el-switch v-model="stage.enabled" :disabled="disabled" />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="比赛开始日期" :label-width="labelWidth" required>
              <el-date-picker
                v-model="stage.startTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择"
                class="ele-fluid"
                :disabled="disabled"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="比赛结束日期" :label-width="labelWidth" required>
              <el-date-picker
                v-model="stage.endTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择"
                class="ele-fluid"
                :disabled="disabled"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="参赛范围" :label-width="labelWidth">
              <div class="scope-config-row">
                <span class="scope-status">{{
                  formatScopeDisplaySummary(stage.scope, { isStage: true, parentScope })
                }}</span>
                <el-button
                  type="primary"
                  link
                  :disabled="disabled"
                  @click="openStageScope(index, stage)"
                >
                  配置
                </el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="参赛门槛" :label-width="labelWidth">
              <el-input
                v-model="stage.threshold"
                type="textarea"
                :rows="3"
                :disabled="disabled"
                placeholder="进入该赛段的条件"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="赛段裁判长" :label-width="labelWidth">
              <el-input
                v-model.trim="stage.chiefReferee"
                :disabled="disabled"
                placeholder="填写赛段裁判长"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="赛段说明" :label-width="labelWidth">
              <el-input
                v-model="stage.description"
                type="textarea"
                :rows="3"
                :disabled="disabled"
                placeholder="赛段规则或注意事项"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </div>

    <stage-scope-dialog
      v-model="stageScopeVisible"
      :scope="editingStageScope"
      :parent-scope="parentScope"
      :stage-match-count="editingStageMatchCount"
      @confirm="handleStageScopeConfirm"
    />
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { EleMessage } from 'ele-admin-plus';
  import StageScopeDialog from './stage-scope-dialog.vue';
  import {
    clone,
    createDefaultStage,
    createDefaultStageScope,
    formatScopeDisplaySummary,
    formatStageDateRange
  } from '../data.js';

  const props = defineProps({
    stages: {
      type: Array,
      default: () => []
    },
    parentScope: Object,
    disabled: Boolean,
    labelWidth: {
      type: String,
      default: '118px'
    }
  });

  const emit = defineEmits(['update:stages']);

  const expandedIds = ref(new Set());
  const stageScopeVisible = ref(false);
  const editingStageIndex = ref(-1);
  const editingStageScope = ref(createDefaultStageScope());
  const editingStageMatchCount = ref(0);

  const isExpanded = (stageId) => expandedIds.value.has(stageId);

  const toggleExpand = (stageId) => {
    const next = new Set(expandedIds.value);
    if (next.has(stageId)) {
      next.delete(stageId);
    } else {
      next.add(stageId);
    }
    expandedIds.value = next;
  };

  const addStage = () => {
    const stage = createDefaultStage();
    expandedIds.value = new Set([...expandedIds.value, stage.stageId]);
    emit('update:stages', [...props.stages, stage]);
  };

  const removeStage = (index, row) => {
    if (row.matchCount > 0) {
      EleMessage.error({ message: '已有关联比赛的赛段不允许删除', plain: true });
      return;
    }
    if (props.stages.length <= 1) {
      EleMessage.error({ message: '至少保留一个赛段', plain: true });
      return;
    }
    const next = [...props.stages];
    next.splice(index, 1);
    emit('update:stages', next);
  };

  const openStageScope = (index, row) => {
    editingStageIndex.value = index;
    editingStageScope.value = clone(row.scope ?? createDefaultStageScope());
    editingStageMatchCount.value = row.matchCount ?? 0;
    stageScopeVisible.value = true;
  };

  const handleStageScopeConfirm = (scope) => {
    if (editingStageIndex.value > -1) {
      const next = [...props.stages];
      next[editingStageIndex.value] = {
        ...next[editingStageIndex.value],
        scope
      };
      emit('update:stages', next);
    }
  };

  /** 新建赛段时默认展开第一张卡片 */
  const expandFirst = () => {
    if (props.stages.length && expandedIds.value.size === 0) {
      expandedIds.value = new Set([props.stages[0].stageId]);
    }
  };

  expandFirst();

  defineExpose({ expandFirst });
</script>

<style scoped lang="scss">
  .stage-toolbar {
    margin-bottom: 10px;
  }

  .empty-tip {
    margin-bottom: 10px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .stage-card {
    margin-bottom: 10px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    background: var(--el-bg-color);
    overflow: hidden;

    &--expanded {
      border-color: var(--el-color-primary-light-7);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .stage-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 14px;
    cursor: pointer;
    background: var(--el-fill-color-lighter);

    &:hover {
      background: var(--el-fill-color-light);
    }
  }

  .stage-card-summary {
    flex: 1;
    min-width: 0;
  }

  .summary-row {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    line-height: 1.6;

    &--title {
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
  }

  .stage-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .summary-label {
    flex-shrink: 0;
    color: var(--el-text-color-secondary);
  }

  .stage-card-actions {
    display: flex;
    flex-shrink: 0;
    gap: 4px;
  }

  .stage-card-body {
    padding: 14px 16px 4px;
    border-top: 1px solid var(--el-border-color-extra-light);
  }

  .scope-config-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  .scope-status {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
</style>
