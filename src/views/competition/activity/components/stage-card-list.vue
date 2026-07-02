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
            <span class="summary-label">赛段时间：</span>
            <span>{{ formatStageDateRange(stage) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">比赛类型：</span>
            <span class="summary-value">{{ formatStagePublishMatchTypes(stage) }}</span>
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
        <el-row :gutter="20">
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
            <el-form-item label="赛段开始时间" :label-width="labelWidth" required>
              <el-date-picker
                v-model="stage.startTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择"
                class="ele-fluid"
                :disabled="disabled"
                :disabled-date="(date) => disabledStageStartDate(date, stage)"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="赛段结束时间" :label-width="labelWidth" required>
              <el-date-picker
                v-model="stage.endTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择"
                class="ele-fluid"
                :disabled="disabled"
                :disabled-date="(date) => disabledStageEndDate(date, stage)"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item
              label="比赛类型"
              :label-width="labelWidth"
              required
              class="match-type-form-item"
            >
              <div class="match-type-field">
                <match-type-cascader
                  :model-value="stage.publishMatchTypes"
                  multiple
                  :disabled="disabled"
                  cascader-class="match-type-cascader"
                  @update:model-value="(value) => handleStageMatchTypesChange(stage, value)"
                />
              </div>
            </el-form-item>
          </el-col>
          <el-col :xs="24">
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
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue';
  import { ElMessageBox } from 'element-plus';
  import { EleMessage } from 'ele-admin-plus';
  import MatchTypeCascader from '@/views/competition/components/match-type-cascader.vue';
  import {
    createDefaultStage,
    formatStageDateRange,
    formatStagePublishMatchTypes,
    resolveStagePublishMatchTypes
  } from '../data.js';

  const props = defineProps({
    stages: {
      type: Array,
      default: () => []
    },
    disabled: Boolean,
    activityStartTime: String,
    activityEndTime: String,
    labelWidth: {
      type: String,
      default: '118px'
    }
  });

  const emit = defineEmits(['update:stages']);

  const expandedIds = ref(new Set());

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

  const ensurePublishTypes = (stage) => {
    if (!Array.isArray(stage.publishMatchTypes)) {
      stage.publishMatchTypes = resolveStagePublishMatchTypes(stage);
    }
  };

  const syncStages = () => {
    emit('update:stages', [...props.stages]);
  };

  const handleStageMatchTypesChange = (stage, types) => {
    ensurePublishTypes(stage);
    stage.publishMatchTypes = [...(types ?? [])];
    syncStages();
  };

  const addStage = () => {
    const stage = createDefaultStage();
    expandedIds.value = new Set([...expandedIds.value, stage.stageId]);
    emit('update:stages', [...props.stages, stage]);
  };

  const removeStage = async (index, row) => {
    if (row.matchCount > 0) {
      EleMessage.error({ message: '已有关联比赛的赛段不允许删除', plain: true });
      return;
    }
    if (props.stages.length <= 1) {
      EleMessage.error({ message: '至少保留一个赛段', plain: true });
      return;
    }
    const stageName = row.stageName?.trim() || '未命名赛段';
    try {
      await ElMessageBox.confirm(`确定删除赛段「${stageName}」吗？`, '删除赛段', {
        type: 'warning',
        draggable: true
      });
    } catch {
      return;
    }
    const next = [...props.stages];
    next.splice(index, 1);
    const nextExpanded = new Set(expandedIds.value);
    nextExpanded.delete(row.stageId);
    expandedIds.value = nextExpanded;
    emit('update:stages', next);
  };

  const disabledStageStartDate = (date, stage) => {
    const time = date.getTime();
    if (props.activityStartTime) {
      const activityStart = new Date(`${props.activityStartTime}T00:00:00`).getTime();
      if (time < activityStart) {
        return true;
      }
    }
    if (props.activityEndTime) {
      const activityEnd = new Date(`${props.activityEndTime}T23:59:59`).getTime();
      if (time > activityEnd) {
        return true;
      }
    }
    if (stage.endTime) {
      const stageEnd = new Date(`${stage.endTime}T23:59:59`).getTime();
      if (time > stageEnd) {
        return true;
      }
    }
    return false;
  };

  const disabledStageEndDate = (date, stage) => {
    const time = date.getTime();
    if (props.activityStartTime) {
      const activityStart = new Date(`${props.activityStartTime}T00:00:00`).getTime();
      if (time < activityStart) {
        return true;
      }
    }
    if (props.activityEndTime) {
      const activityEnd = new Date(`${props.activityEndTime}T23:59:59`).getTime();
      if (time > activityEnd) {
        return true;
      }
    }
    if (stage.startTime) {
      const stageStart = new Date(`${stage.startTime}T00:00:00`).getTime();
      if (time <= stageStart) {
        return true;
      }
    }
    return false;
  };

  const expandAll = () => {
    if (props.stages.length) {
      expandedIds.value = new Set(props.stages.map((d) => d.stageId));
    }
  };

  watch(
    () => props.stages,
    (list) => {
      list?.forEach((stage) => ensurePublishTypes(stage));
      if (list?.length && expandedIds.value.size === 0) {
        expandAll();
      }
    },
    { immediate: true }
  );

  defineExpose({ expandFirst: expandAll });
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
    padding: 12px 18px;
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
    padding: 16px 20px 6px;
    border-top: 1px solid var(--el-border-color-extra-light);
    overflow: hidden;

    :deep(.el-col) {
      min-width: 0;
    }

    :deep(.el-date-editor) {
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }
  }

  .summary-value {
    min-width: 0;
    word-break: break-all;
  }

  .match-type-form-item {
    margin-bottom: 18px;

    :deep(.el-form-item__content) {
      min-width: 0;
      line-height: normal;
    }
  }

  .match-type-field {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    min-width: 0;
  }

  .match-type-cascader {
    width: 100%;
    max-width: 420px;
  }
</style>
