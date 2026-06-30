<!-- 每日积分赛专属配置 -->
<template>
  <div class="daily-sections">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="参与方式：无需报名，参赛范围内学生自动参与积分统计。"
      class="participation-tip"
    />

    <!-- 评分规则（只读） -->
    <div class="sub-block">
      <div class="sub-title">评分规则</div>
      <el-descriptions :column="2" size="small" border class="readonly-desc">
        <el-descriptions-item label="评分规则">{{ SCORING_PLAN_NAME }}</el-descriptions-item>
        <el-descriptions-item label="规则版本">
          {{ SCORING_PLAN_NAME }} {{ SCORING_PLAN_VERSION }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ SCORING_PLAN_UPDATED_AT }}</el-descriptions-item>
        <el-descriptions-item label="规则状态">系统预置，不支持本场比赛修改核心评分规则</el-descriptions-item>
        <el-descriptions-item label="权重配置">支持按数据来源配置权重</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 数据来源摘要表 -->
    <div class="sub-block">
      <div class="sub-title-row">
        <div class="sub-title">数据来源</div>
        <el-button type="primary" link @click="openWeightDrawer">配置权重</el-button>
      </div>
      <el-table :data="dataSources" border size="small" class="source-table">
        <el-table-column prop="sourceType" label="数据来源" width="130" fixed="left" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'" size="small" effect="plain">
              {{ row.enabled ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提交 / 采集角色" min-width="140">
          <template #default="{ row }">
            <span class="summary-text">{{ row.roleSummary || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="采集方式" min-width="130">
          <template #default="{ row }">
            <span class="summary-text">{{ row.methodSummary || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="计入口径" min-width="150">
          <template #default="{ row }">
            <span class="summary-text">{{ row.countInCaliber || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="归属日期" width="96">
          <template #default="{ row }">
            <span class="summary-text">{{ row.belongDate || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="权重" width="72" align="center">
          <template #default="{ row }">{{ formatSourceWeight(row) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template #default="{ row }">
            <el-link type="primary" underline="never" @click="openSourceConfig(row)">配置</el-link>
          </template>
        </el-table-column>
      </el-table>
      <div class="weight-hint" :class="{ 'weight-hint--error': weightTotal !== 100 }">
        {{ weightTotalHint }}
      </div>
    </div>

    <!-- 积分生成规则 -->
    <div class="sub-block">
      <div class="sub-title">积分生成规则</div>
      <el-row :gutter="16">
        <el-col :sm="12" :xs="24">
          <el-form-item label="日积分生成">
            <span class="readonly-text">固定开启</span>
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="日积分生成时间">
            <span class="readonly-text">每日 22:00</span>
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="数据截止时间">
            <span class="readonly-text">每日 21:30</span>
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="是否允许补交补算">
            <div class="switch-with-tip">
              <el-switch v-model="pointsRules.allowLateRecalculate" @change="handleLateRecalculateChange" />
              <span class="inline-hint">开启后，提交数据时可选择历史日期，系统按规则进行补交补算。</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <!-- 默认折叠 -->
    <el-collapse v-model="collapsedActive" class="daily-collapse">
      <el-collapse-item title="保险设置" name="insurance">
        <el-row :gutter="16">
          <el-col :sm="12" :xs="24">
            <el-form-item label="是否需要保险">
              <el-switch v-model="dailyInsurance.required" />
            </el-form-item>
          </el-col>
          <el-col v-if="dailyInsurance.required" :sm="12" :xs="24">
            <el-form-item label="保险方式">
              <el-radio-group v-model="dailyInsurance.method">
                <el-radio v-for="opt in INSURANCE_METHOD_OPTIONS" :key="opt" :value="opt">{{ opt }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="dailyInsurance.required" :xs="24">
            <el-form-item label="保险方案说明">
              <el-input v-model="dailyInsurance.description" type="textarea" :rows="3" />
            </el-form-item>
          </el-col>
          <el-col v-if="dailyInsurance.required" :xs="24">
            <el-form-item label="保险附件">
              <attachment-table
                title="保险材料"
                :list="dailyInsurance.attachments"
                compact
                @add="(f) => dailyInsurance.attachments.push(f)"
                @remove="(r) => (dailyInsurance.attachments = dailyInsurance.attachments.filter((d) => d.id !== r.id))"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-collapse-item>

      <el-collapse-item title="附件" name="attachments">
        <attachment-table
          title="比赛附件"
          :list="attachments"
          @add="(f) => emit('update:attachments', [...attachments, f])"
          @remove="(r) => emit('update:attachments', attachments.filter((d) => d.id !== r.id))"
        />
      </el-collapse-item>
    </el-collapse>

    <!-- 数据来源配置弹窗 -->
    <el-dialog
      v-model="sourceConfigVisible"
      :title="sourceConfigTitle"
      width="620px"
      destroy-on-close
      draggable
    >
      <template v-if="sourceConfigDraft">
        <el-form label-width="128px">
          <el-form-item label="是否启用">
            <el-switch v-model="sourceConfigDraft.enabled" />
          </el-form-item>
          <el-form-item label="提交 / 采集角色">
            <el-checkbox-group v-model="sourceConfigDraft.submitRoles">
              <el-checkbox
                v-for="opt in getSourceRoleOptions(sourceConfigDraft.sourceType)"
                :key="opt"
                :value="opt"
                :label="opt"
              />
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="采集方式">
            <el-checkbox-group v-model="sourceConfigDraft.collectMethods">
              <el-checkbox
                v-for="opt in getSourceCollectMethodOptions(sourceConfigDraft.sourceType)"
                :key="opt"
                :value="opt"
                :label="opt"
              />
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="计入口径">
            <el-checkbox-group v-model="sourceConfigDraft.countInCalibers">
              <el-checkbox
                v-for="opt in getSourceCaliberOptions(sourceConfigDraft.sourceType)"
                :key="opt"
                :value="opt"
                :label="opt"
              />
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="归属日期">
            <span class="readonly-text">{{ sourceConfigDraft.belongDate }}</span>
          </el-form-item>
          <el-form-item label="权重比例">
            <el-input-number
              v-model="sourceConfigDraft.weight"
              :min="0"
              :max="100"
              :disabled="!sourceConfigDraft.enabled"
              controls-position="right"
              class="ele-fluid"
            />
          </el-form-item>
          <el-form-item label="是否需要证明材料">
            <el-switch v-model="sourceConfigDraft.proofRequired" />
          </el-form-item>
          <el-form-item label="说明">
            <el-input v-model="sourceConfigDraft.remark" type="textarea" :rows="2" placeholder="非必填" />
          </el-form-item>
          <el-form-item v-if="sourceConfigDraft.sourceType === 'AI运动'" label=" ">
            <div class="section-hint">
              AI运动产生的数据计入每日积分；如果同一条记录已作为体育作业完成依据，不允许在同一维度重复计分。
            </div>
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button @click="sourceConfigVisible = false">取消</el-button>
        <el-button type="primary" @click="applySourceConfig">确定</el-button>
      </template>
    </el-dialog>

    <!-- 权重配置弹窗 -->
    <el-dialog
      v-model="weightDrawerVisible"
      title="配置数据来源权重"
      width="620px"
      destroy-on-close
      draggable
    >
      <div class="weight-drawer-toolbar">
        <el-button size="small" @click="handleAverageWeights">一键平均分配</el-button>
        <el-button size="small" @click="handleRestoreWeights">恢复系统默认权重</el-button>
      </div>
      <el-table :data="weightDraft" border size="small">
        <el-table-column prop="sourceType" label="数据来源" min-width="130" />
        <el-table-column label="是否启用" width="88" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'" size="small" effect="plain">
              {{ row.enabled ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="权重比例" width="130">
          <template #default="{ row }">
            <el-input-number
              v-model="row.weight"
              :min="0"
              :max="100"
              :disabled="!row.enabled"
              controls-position="right"
              class="ele-fluid"
            />
          </template>
        </el-table-column>
        <el-table-column label="权重说明" min-width="120">
          <template #default="{ row }">
            <el-input v-model="row.weightRemark" size="small" placeholder="非必填" :disabled="!row.enabled" />
          </template>
        </el-table-column>
      </el-table>
      <div class="weight-hint" :class="{ 'weight-hint--error': draftWeightTotal !== 100 }">
        {{ draftWeightHint }}
      </div>
      <template #footer>
        <el-button @click="weightDrawerVisible = false">取消</el-button>
        <el-button type="primary" @click="applyWeightDraft">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { computed, ref, watch } from 'vue';
  import { EleMessage } from 'ele-admin-plus';
  import AttachmentTable from '@/views/event-item/components/attachment-table.vue';
  import {
    averageEnabledSourceWeights,
    clone,
    computeEnabledWeightTotal,
    formatSourceWeight,
    formatWeightTotalHint,
    getDataSourceRulePreset,
    getSourceCaliberOptions,
    getSourceCollectMethodOptions,
    getSourceRoleOptions,
    INSURANCE_METHOD_OPTIONS,
    normalizeDataSources,
    normalizePointsRules,
    restoreDefaultSourceWeights,
    SCORING_PLAN_NAME,
    SCORING_PLAN_UPDATED_AT,
    SCORING_PLAN_VERSION,
    syncDataSourceSummaries
  } from '../data.js';

  const props = defineProps({
    attachments: {
      type: Array,
      default: () => []
    }
  });

  const emit = defineEmits(['update:attachments']);

  const dataSources = defineModel('dataSources', { type: Array, default: () => [] });
  const pointsRules = defineModel('pointsRules', { type: Object, default: () => ({}) });
  const dailyInsurance = defineModel('dailyInsurance', { type: Object, default: () => ({}) });

  const collapsedActive = ref([]);
  const sourceConfigVisible = ref(false);
  const sourceConfigDraft = ref(null);
  const weightDrawerVisible = ref(false);
  const weightDraft = ref([]);

  watch(
    () => pointsRules.value,
    (value) => {
      const normalized = normalizePointsRules(value ?? {});
      if (JSON.stringify(normalized) !== JSON.stringify(value)) {
        pointsRules.value = normalized;
      }
    },
    { immediate: true, deep: true }
  );

  watch(
    dataSources,
    (value) => {
      const normalized = normalizeDataSources(value ?? []);
      if (JSON.stringify(normalized) !== JSON.stringify(value)) {
        dataSources.value = normalized;
      }
    },
    { immediate: true, deep: true }
  );

  const weightTotal = computed(() => computeEnabledWeightTotal(dataSources.value));
  const weightTotalHint = computed(() => formatWeightTotalHint(dataSources.value));
  const draftWeightTotal = computed(() => computeEnabledWeightTotal(weightDraft.value));
  const draftWeightHint = computed(() => formatWeightTotalHint(weightDraft.value));

  const sourceConfigTitle = computed(() =>
    sourceConfigDraft.value ? `配置：${sourceConfigDraft.value.sourceType}` : '配置数据来源'
  );

  const openSourceConfig = (row) => {
    sourceConfigDraft.value = clone(syncDataSourceSummaries(row));
    sourceConfigVisible.value = true;
  };

  const handleLateRecalculateChange = (enabled) => {
    pointsRules.value.allowLateRecalculate = enabled;
    pointsRules.value.allowLateSubmit = enabled;
    pointsRules.value.allowRecalculate = enabled;
    pointsRules.value.lateSubmitDeadline = '';
    pointsRules.value.recalculateScope = '';
    pointsRules.value.recalculateRemark = '';
  };

  const applySourceConfig = () => {
    const preset = getDataSourceRulePreset(sourceConfigDraft.value.sourceType);
    const draft = syncDataSourceSummaries({
      ...sourceConfigDraft.value,
      belongDate: preset.belongDate,
      weight:
        sourceConfigDraft.value.enabled && sourceConfigDraft.value.countInPoints !== false
          ? Number(sourceConfigDraft.value.weight) || 0
          : 0
    });
    if (draft.enabled) {
      if (!draft.submitRoles?.length) {
        EleMessage.error({ message: '请至少选择一种提交/采集角色', plain: true });
        return;
      }
      if (!draft.collectMethods?.length) {
        EleMessage.error({ message: '请至少选择一种采集方式', plain: true });
        return;
      }
      if (!draft.countInCalibers?.length) {
        EleMessage.error({ message: '请至少选择一种计入口径', plain: true });
        return;
      }
    }
    const index = dataSources.value.findIndex((d) => d.sourceType === draft.sourceType);
    if (index !== -1) {
      const next = [...dataSources.value];
      next[index] = draft;
      dataSources.value = next;
    }
    sourceConfigVisible.value = false;
    if (weightTotal.value !== 100) {
      EleMessage.warning({
        message: '数据来源配置已更新，请确认权重合计是否为 100%。',
        plain: true
      });
    }
  };

  const openWeightDrawer = () => {
    weightDraft.value = clone(normalizeDataSources(dataSources.value));
    weightDrawerVisible.value = true;
  };

  const handleAverageWeights = () => {
    weightDraft.value = averageEnabledSourceWeights(weightDraft.value);
  };

  const handleRestoreWeights = () => {
    weightDraft.value = restoreDefaultSourceWeights(weightDraft.value);
  };

  const applyWeightDraft = () => {
    if (draftWeightTotal.value !== 100) {
      EleMessage.error({ message: draftWeightHint.value.replace('。', ''), plain: true });
      return;
    }
    const weightMap = new Map(weightDraft.value.map((d) => [d.sourceType, d]));
    dataSources.value = normalizeDataSources(dataSources.value).map((d) => {
      const draft = weightMap.get(d.sourceType);
      if (!draft) {
        return d;
      }
      return syncDataSourceSummaries({
        ...d,
        weight: draft.enabled ? Number(draft.weight) || 0 : 0,
        weightRemark: draft.weightRemark || ''
      });
    });
    weightDrawerVisible.value = false;
  };
</script>

<style scoped lang="scss">
  .daily-sections {
    padding-bottom: 24px;

    .participation-tip {
      margin-bottom: 16px;
    }

    .sub-block {
      margin-bottom: 16px;
      padding: 16px;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;

      &:last-of-type {
        margin-bottom: 0;
      }
    }

    .sub-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .sub-title,
    .config-group-title {
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .sub-title-row .sub-title {
      margin-bottom: 0;
    }

    .config-group-title {
      margin-top: 4px;
      padding-left: 8px;
      border-left: 2px solid var(--el-color-primary-light-5);
    }

    .readonly-desc {
      width: 100%;
    }

    .section-hint {
      margin-top: 8px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      line-height: 1.6;

      &--top {
        margin-top: 0;
        margin-bottom: 12px;
      }

      &--compact {
        margin-top: 0;
      }
    }

    .award-link-hint {
      margin-bottom: 10px;
    }

    .summary-text,
    .readonly-text {
      font-size: 13px;
      color: var(--el-text-color-regular);
    }

    .switch-with-tip {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .inline-hint {
      font-size: 12px;
      line-height: 1.5;
      color: var(--el-text-color-secondary);
    }

    .source-table {
      width: 100%;
    }

    .weight-hint {
      margin-top: 10px;
      font-size: 12px;
      color: var(--el-text-color-secondary);

      &--error {
        color: var(--el-color-danger);
      }
    }

    .award-remark {
      margin-top: 12px;
    }

    .daily-collapse {
      border: none;
      padding: 0 16px 16px;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;

      :deep(.el-collapse-item__header) {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        border-bottom: 1px solid var(--el-border-color-extra-light);
      }

      :deep(.el-collapse-item__wrap) {
        border-bottom: none;
      }

      :deep(.el-collapse-item__content) {
        padding: 16px 0 4px;
      }
    }

    .weight-drawer-toolbar {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
  }
</style>
