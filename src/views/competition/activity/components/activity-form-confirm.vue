<!-- 活动配置确认摘要 -->
<template>
  <div class="activity-form-confirm">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="请确认以下活动配置无误后再保存。如需修改，请点击「上一步」返回对应步骤调整。"
      class="confirm-tip"
    />

    <div class="confirm-block">
      <div class="block-title">活动基础信息</div>
      <el-descriptions :column="2" size="small" border>
        <el-descriptions-item label="活动名称">{{ form.activityName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="活动状态">{{ activityStatus }}</el-descriptions-item>
        <el-descriptions-item label="活动时间" :span="2">{{ activityTimeText }}</el-descriptions-item>
        <el-descriptions-item label="活动简介" :span="2">{{ form.introduction || '未填写' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="confirm-block">
      <div class="block-title">组织信息</div>
      <el-descriptions :column="2" size="small" border>
        <el-descriptions-item label="指导单位">{{ guidingUnitsText }}</el-descriptions-item>
        <el-descriptions-item label="主办单位">{{ hostUnitsText }}</el-descriptions-item>
        <el-descriptions-item label="承办单位">{{ organizerUnitsText }}</el-descriptions-item>
        <el-descriptions-item label="协办单位">{{ coOrganizerUnitsText }}</el-descriptions-item>
        <el-descriptions-item label="运营服务单位">{{ operationServiceUnitsText }}</el-descriptions-item>
        <el-descriptions-item label="支持单位">{{ supportUnitsText }}</el-descriptions-item>
        <el-descriptions-item label="大赛总裁判长">{{ form.chiefReferee || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="组委会成员" :span="2">{{ committeeText }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="confirm-block">
      <div class="block-title">活动覆盖范围</div>
      <div class="summary-text">{{ coverageSummary }}</div>
    </div>

    <div class="confirm-block">
      <div class="block-title">赛段信息</div>
      <el-table v-if="form.stages?.length" :data="form.stages" border size="small">
        <el-table-column prop="stageName" label="赛段名称" min-width="120" />
        <el-table-column label="赛段时间" min-width="180">
          <template #default="{ row }">{{ formatStageDateRange(row) }}</template>
        </el-table-column>
        <el-table-column label="启用状态" width="90" align="center">
          <template #default="{ row }">{{ row.enabled ? '启用' : '禁用' }}</template>
        </el-table-column>
        <el-table-column prop="description" label="赛段说明" min-width="160" show-overflow-tooltip />
      </el-table>
      <div v-else class="empty-text">未配置赛段</div>
    </div>

    <div class="confirm-block">
      <div class="block-title">活动设项范围</div>
      <el-table v-if="linkedItems.length" :data="linkedItems" border size="small">
        <el-table-column prop="itemName" label="设项名称" min-width="120" />
        <el-table-column prop="project" label="关联项目" min-width="100" />
        <el-table-column prop="applicableRegion" label="适用区域" min-width="100" show-overflow-tooltip />
        <el-table-column prop="qualification" label="参赛要求" min-width="120" show-overflow-tooltip />
      </el-table>
      <div v-else class="empty-text">未选择设项</div>
    </div>

    <div class="confirm-block">
      <div class="block-title">活动规程摘要</div>
      <div class="summary-text pre-line">{{ regulationSummary }}</div>
    </div>

    <div class="confirm-block">
      <div class="block-title">附件信息</div>
      <div v-if="form.attachments?.length" class="summary-list">
        <div v-for="file in form.attachments" :key="file.id" class="summary-line">
          {{ file.name }}
        </div>
      </div>
      <div v-else class="empty-text">暂无附件</div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import {
    formatActivityTime,
    formatStageDateRange,
    formatUnits,
    getActivityLinkedItems,
    getActivityStatus
  } from '../data.js';

  const props = defineProps({
    form: {
      type: Object,
      required: true
    }
  });

  const activityStatus = computed(() => getActivityStatus(props.form));
  const activityTimeText = computed(() => formatActivityTime(props.form));
  const hostUnitsText = computed(() => formatUnits(props.form.hostUnits));
  const organizerUnitsText = computed(() => formatUnits(props.form.organizerUnits));
  const coOrganizerUnitsText = computed(() => formatUnits(props.form.coOrganizerUnits));
  const guidingUnitsText = computed(() => formatUnits(props.form.guidingUnits));
  const operationServiceUnitsText = computed(() => formatUnits(props.form.operationServiceUnits));
  const supportUnitsText = computed(() => formatUnits(props.form.supportUnits));
  const committeeText = computed(() => {
    const members = props.form.committeeMembers ?? [];
    if (!members.length) {
      return '未填写';
    }
    return members
      .map((m) => [m.name, m.position].filter(Boolean).join('-'))
      .filter(Boolean)
      .join('、');
  });
  const coverageSummary = computed(() => '全国范围');
  const linkedItems = computed(() => getActivityLinkedItems(props.form.itemIds ?? []));
  const regulationSummary = computed(() => {
    const raw = props.form.regulationText?.trim();
    const text = raw ? raw.replace(/<[^>]+>/g, '').trim() : '';
    if (text) {
      return text.length > 200 ? `${text.slice(0, 200)}…` : text;
    }
    const count = props.form.regulationAttachments?.length ?? 0;
    return count ? `已上传 ${count} 个规程附件` : '未填写';
  });
</script>

<style scoped lang="scss">
  .activity-form-confirm {
    padding-bottom: 8px;
  }

  .confirm-tip {
    margin-bottom: 16px;
  }

  .confirm-block {
    margin-bottom: 12px;
    padding: 12px 20px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
  }

  .block-title {
    margin-bottom: 10px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    padding-left: 8px;
    border-left: 3px solid var(--el-color-primary);
  }

  .summary-text,
  .empty-text {
    font-size: 13px;
    color: var(--el-text-color-regular);
    line-height: 1.6;
  }

  .pre-line {
    white-space: pre-wrap;
  }

  .summary-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .summary-line {
    font-size: 13px;
    color: var(--el-text-color-regular);
  }
</style>
