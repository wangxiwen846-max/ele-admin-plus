<!-- 比赛发布/编辑表单 -->
<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="128px"
    class="match-form"
    @submit.prevent=""
  >
    <el-alert
      v-if="mode === 'copy'"
      title="复制比赛：请重新确认所属活动、赛段、比赛类型及时间配置后发布。"
      type="info"
      show-icon
      :closable="false"
      style="margin-bottom: 14px"
    />

    <!-- 基础信息 -->
    <div v-show="showStep1" class="form-section step-section-card">
      <div class="section-head">
        <div class="section-title">基础信息</div>
      </div>
      <div class="section-body">
        <el-row :gutter="20">
          <el-col :sm="12" :xs="24">
            <el-form-item label="所属活动" prop="activityId">
              <el-select
                v-model="form.activityId"
                filterable
                placeholder="请选择活动"
                class="ele-fluid"
                :disabled="isEdit"
                @change="handleActivityChange"
              >
                <el-option
                  v-for="item in activityOptions"
                  :key="item.activityId"
                  :label="item.activityName"
                  :value="item.activityId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="所属赛段" prop="stageId">
              <el-select
                v-model="form.stageId"
                placeholder="请先选择活动"
                class="ele-fluid"
                :disabled="!form.activityId || isEdit"
                @change="handleStageChange"
              >
                <el-option
                  v-for="item in stageOptions"
                  :key="item.stageId"
                  :label="formatStageOptionLabel(item)"
                  :value="item.stageId"
                />
              </el-select>
              <div v-if="form.activityId && !stageOptions.length" class="field-hint field-hint--warn">
                当前活动暂无可用赛段，请先在活动管理中配置赛段。
              </div>
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="比赛类型" prop="matchType">
              <div class="match-type-field">
                <el-cascader
                  v-model="matchTypeCascaderValue"
                  :options="matchTypeCascaderOptions"
                  :props="matchTypeCascaderProps"
                  :disabled="isEdit || !form.stageId"
                  placeholder="请选择比赛类型"
                  class="match-type-cascader"
                />
                <div v-if="matchTypeHint" class="field-hint">{{ matchTypeHint }}</div>
              </div>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="比赛名称" prop="matchName">
              <el-input v-model.trim="form.matchName" :maxlength="80" placeholder="请输入本场比赛名称" />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="开展形式">
              <el-select v-model="form.deliveryForm" clearable placeholder="非必填" class="ele-fluid">
                <el-option v-for="opt in DELIVERY_FORM_OPTIONS" :key="opt" :label="opt" :value="opt" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="比赛说明">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="3"
                :maxlength="500"
                placeholder="简要说明本场比赛内容"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 时间设置 -->
    <div v-show="showStep1" class="form-section step-section-card">
      <div class="section-head">
        <div class="section-title">时间设置</div>
        <div class="section-desc">比赛时间须在所属赛段时间范围内</div>
      </div>
      <div class="section-body">
        <el-row :gutter="20">
          <el-col :sm="12" :xs="24">
            <el-form-item label="比赛开始时间" prop="startTime">
              <el-date-picker
                v-model="form.startTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm"
                placeholder="请选择"
                class="ele-fluid"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="比赛结束时间" prop="endTime">
              <el-date-picker
                v-model="form.endTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm"
                placeholder="请选择"
                class="ele-fluid"
              />
            </el-form-item>
          </el-col>
          <template v-if="isClass">
            <el-col :sm="12" :xs="24">
              <el-form-item label="报名开始时间" prop="regStartTime">
                <el-date-picker
                  v-model="form.regStartTime"
                  type="datetime"
                  value-format="YYYY-MM-DD HH:mm"
                  placeholder="请选择"
                  class="ele-fluid"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="报名截止时间" prop="regEndTime">
                <el-date-picker
                  v-model="form.regEndTime"
                  type="datetime"
                  value-format="YYYY-MM-DD HH:mm"
                  placeholder="请选择"
                  class="ele-fluid"
                />
              </el-form-item>
            </el-col>
          </template>
        </el-row>
      </div>
    </div>

    <!-- 参赛范围 -->
    <div v-show="showStep1" class="form-section step-section-card">
      <div class="section-head">
        <div class="section-title">参赛范围</div>
      </div>
      <div class="section-body">
        <match-scope-field
          v-model="form.scope"
          :activity-id="form.activityId"
          :stage-id="form.stageId"
        />
      </div>
    </div>

    <!-- 传统赛：比赛设项 -->
    <div v-if="isClass" v-show="showStep2" class="form-section step-section-card">
      <div class="section-head">
        <div class="section-title">比赛设项</div>
      </div>
      <div class="section-body">
        <match-item-table
          v-model="form.itemIds"
          v-model:item-award-config="form.itemAwardConfig"
          v-model:item-meta-config="form.itemMetaConfig"
          v-model:item-score-config="form.itemScoreConfig"
          :activity-id="form.activityId"
        />
      </div>
    </div>

    <!-- 传统赛：报名设置 -->
    <div v-if="isClass" v-show="showStep2" class="form-section step-section-card">
      <div class="section-head">
        <div class="section-title">报名设置</div>
      </div>
      <div class="section-body">
        <match-registration-field
          v-model="form.matchRegistration"
          :item-ids="form.itemIds"
        />
      </div>
    </div>

    <!-- 传统赛：保险设置 -->
    <div v-if="isClass" v-show="showStep2" class="form-section step-section-card">
      <div class="section-head">
        <div class="section-title">保险设置</div>
      </div>
      <div class="section-body">
        <match-insurance-field
          v-model="form.matchInsurance"
          :match-type="form.matchType"
          :start-time="form.startTime"
        />
      </div>
    </div>

    <!-- 传统赛：成绩设置 -->
    <div v-if="isClass" v-show="showStep2" class="form-section step-section-card">
      <div class="section-head">
        <div class="section-title">成绩设置</div>
      </div>
      <div class="section-body">
        <el-table :data="scoreRows" border size="small">
          <el-table-column prop="itemName" label="设项名称" min-width="120" fixed="left" />
          <el-table-column label="成绩提交人" min-width="170">
            <template #default="{ row }">
              <el-checkbox-group
                :model-value="row.submitters"
                @change="(val) => updateScoreConfig(row.itemId, 'submitters', val)"
              >
                <el-checkbox
                  v-for="opt in CLASS_SCORE_SUBMITTER_OPTIONS"
                  :key="opt"
                  :value="opt"
                  :label="opt"
                />
              </el-checkbox-group>
            </template>
          </el-table-column>
          <el-table-column label="成绩采集方式" min-width="190">
            <template #default="{ row }">
              <el-checkbox-group
                :model-value="row.collectMethods"
                @change="(val) => updateScoreConfig(row.itemId, 'collectMethods', val)"
              >
                <el-checkbox
                  v-for="opt in CLASS_SCORE_COLLECT_OPTIONS"
                  :key="opt"
                  :value="opt"
                  :label="opt"
                />
              </el-checkbox-group>
            </template>
          </el-table-column>
          <el-table-column label="提交开始时间" width="180">
            <template #default="{ row }">
              <el-date-picker
                :model-value="row.submitStartTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm"
                placeholder="可选"
                clearable
                class="ele-fluid"
                @update:model-value="(val) => updateScoreConfig(row.itemId, 'submitStartTime', val)"
              />
            </template>
          </el-table-column>
          <el-table-column label="提交截止时间" width="180">
            <template #default="{ row }">
              <el-date-picker
                :model-value="row.submitEndTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm"
                placeholder="可选"
                clearable
                class="ele-fluid"
                @update:model-value="(val) => updateScoreConfig(row.itemId, 'submitEndTime', val)"
              />
            </template>
          </el-table-column>
          <el-table-column label="重复提交规则" width="180">
            <template #default>重复提交时按最新成绩计算</template>
          </el-table-column>
          <el-table-column label="成绩提交说明" min-width="180">
            <template #default="{ row }">
              <el-input
                :model-value="row.remark"
                type="textarea"
                :rows="2"
                placeholder="非必填"
                @update:model-value="(val) => updateScoreConfig(row.itemId, 'remark', val)"
              />
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!scoreRows.length" class="empty-tip">请先在比赛设项中选择设项</div>
      </div>
    </div>

    <!-- 每日积分赛专属 -->
    <div v-if="isDaily" v-show="showStep2" class="form-section form-section--last step-section-card step-section-card--last">
      <div class="section-head">
        <div class="section-title">内容配置</div>
      </div>
      <div class="section-body">
        <match-form-daily-sections
          v-model:data-sources="form.dataSources"
          v-model:points-rules="form.pointsRules"
          v-model:daily-insurance="form.dailyInsurance"
          v-model:daily-awards="form.dailyAwards"
          :match-start-time="form.startTime"
          :attachments="form.attachments"
          @update:attachments="(val) => (form.attachments = val)"
        />
      </div>
    </div>

    <!-- 附件（传统赛） -->
    <div v-if="isClass" v-show="showStep2" class="form-section form-section--last step-section-card step-section-card--last">
      <div class="section-head">
        <div class="section-title">附件</div>
      </div>
      <div class="section-body">
        <attachment-table
          title="比赛附件"
          :list="form.attachments"
          @add="handleAttachmentAdd"
          @remove="handleAttachmentRemove"
        />
      </div>
    </div>
  </el-form>
</template>

<script setup>
  import { computed, ref, watch } from 'vue';
  import { ElMessageBox } from 'element-plus';
  import { EleMessage } from 'ele-admin-plus';
  import AttachmentTable from '@/views/event-item/components/attachment-table.vue';
  import MatchScopeField from './match-scope-field.vue';
  import MatchItemTable from './match-item-table.vue';
  import MatchRegistrationField from './match-registration-field.vue';
  import MatchInsuranceField from './match-insurance-field.vue';
  import MatchFormDailySections from './match-form-daily-sections.vue';
  import {
    createDefaultMatch,
    createDefaultMatchScope,
    createDefaultDataSources,
    createDefaultItemScoreSetting,
    createDefaultMatchRegistration,
    createDefaultInsuranceSetting,
    clone,
    getActivityOptions,
    getStageOptions,
    saveMatch,
    validateMatchForm,
    resolveMatchErrorStep,
    mapMatchItemRow,
    buildMatchTypeCascaderOptions,
    getMatchTypeOptionsForStage,
    getMatchTypeStageHint,
    DELIVERY_FORM_OPTIONS,
    CLASS_SCORE_COLLECT_OPTIONS,
    CLASS_SCORE_SUBMITTER_OPTIONS,
    isClassMatch,
    isDailyMatch,
    MATCH_TYPE_CLASS,
    MATCH_TYPE_DAILY,
    MATCH_TYPE_FINAL,
    MATCH_TYPE_REGION,
    normalizeMatchTypeLeaf,
    normalizePointsRules
  } from '../data.js';
  import {
    MATCH_TYPE_CAMPUS_TOP,
    MATCH_TYPE_FINAL as FINAL_TOP,
    MATCH_TYPE_REGION as REGION_TOP
  } from '@/views/competition/match-type.js';

  const props = defineProps({
    data: Object,
    matchId: [Number, String],
    mode: { type: String, default: 'add' },
    step: { type: Number, default: null }
  });

  const emit = defineEmits(['done', 'fail']);

  const formRef = ref(null);
  const form = ref(createDefaultMatch(props.data));
  const matchTypeCascaderProps = {
    emitPath: true,
    value: 'value',
    label: 'label',
    children: 'children'
  };

  const isEdit = computed(() => props.mode === 'edit');
  const isClass = computed(() => isClassMatch(form.value));
  const isDaily = computed(() => isDailyMatch(form.value));
  const showStep1 = computed(() => props.step == null || props.step === 1);
  const showStep2 = computed(() => props.step == null || props.step === 2);

  const activityOptions = computed(() => getActivityOptions());
  const stageOptions = computed(() =>
    form.value.activityId ? getStageOptions(form.value.activityId) : []
  );
  const currentStage = computed(() =>
    stageOptions.value.find((d) => d.stageId === form.value.stageId)
  );
  const matchTypeOptions = computed(() => getMatchTypeOptionsForStage(currentStage.value ?? {}));
  const matchTypeCascaderOptions = computed(() =>
    buildMatchTypeCascaderOptions(matchTypeOptions.value)
  );
  const matchTypeCascaderValue = computed({
    get() {
      const type = normalizeMatchTypeLeaf(form.value.matchType);
      if ([MATCH_TYPE_DAILY, MATCH_TYPE_CLASS].includes(type)) {
        return [MATCH_TYPE_CAMPUS_TOP, type];
      }
      if (type === MATCH_TYPE_REGION) {
        return [MATCH_TYPE_REGION];
      }
      if (type === MATCH_TYPE_FINAL) {
        return [MATCH_TYPE_FINAL];
      }
      return [];
    },
    set(value) {
      const selected = value?.[value.length - 1] ?? '';
      const type =
        selected === REGION_TOP
          ? MATCH_TYPE_REGION
          : selected === FINAL_TOP
            ? MATCH_TYPE_FINAL
            : selected;
      form.value.matchType = type;
      handleMatchTypeChange(type);
    }
  });
  const matchTypeHint = computed(() => getMatchTypeStageHint(currentStage.value ?? {}));

  const formatStageOptionLabel = (stage) => {
    if (!stage?.startTime || !stage?.endTime) {
      return stage.stageName;
    }
    const start = stage.startTime.slice(0, 7).replace('-', '.');
    const end = stage.endTime.slice(0, 7).replace('-', '.');
    return `${stage.stageName}（${start} - ${end}）`;
  };

  const rules = computed(() => {
    const base = {
      activityId: [{ required: true, message: '请选择所属活动', trigger: 'change' }],
      stageId: [{ required: true, message: '请选择所属赛段', trigger: 'change' }],
      matchType: [{ required: true, message: '请选择比赛类型', trigger: 'change' }],
      matchName: [{ required: true, message: '请填写比赛名称', trigger: 'blur' }],
      startTime: [{ required: true, message: '请选择比赛开始时间', trigger: 'change' }],
      endTime: [{ required: true, message: '请选择比赛结束时间', trigger: 'change' }]
    };
    if (isClass.value) {
      base.regStartTime = [{ required: true, message: '请选择报名开始时间', trigger: 'change' }];
      base.regEndTime = [{ required: true, message: '请选择报名截止时间', trigger: 'change' }];
    }
    return base;
  });

  const scoreRows = computed(() =>
    (form.value.itemIds ?? []).map((id) => {
      const row = mapMatchItemRow(form.value, id);
      const config =
        form.value.itemScoreConfig?.[String(id)] ??
        form.value.classScoreSetting ??
        createDefaultItemScoreSetting();
      return {
        itemId: id,
        itemName: row?.itemName ?? '-',
        ...config
      };
    })
  );

  const updateScoreConfig = (itemId, field, value) => {
    const key = String(itemId);
    const current =
      form.value.itemScoreConfig?.[key] ??
      form.value.classScoreSetting ??
      createDefaultItemScoreSetting();
    form.value.itemScoreConfig = {
      ...(form.value.itemScoreConfig ?? {}),
      [key]: {
        ...clone(current),
        [field]: value,
        allowResubmit: true,
        resubmitRule: '按最新成绩计算'
      }
    };
  };

  const handleActivityChange = () => {
    form.value.stageId = '';
    form.value.matchType = '';
    form.value.itemIds = [];
    form.value.itemAwardConfig = {};
    form.value.itemMetaConfig = {};
    form.value.itemScoreConfig = {};
    form.value.matchRegistration = createDefaultMatchRegistration();
    form.value.matchInsurance = createDefaultInsuranceSetting();
    form.value.scope = createDefaultMatchScope();
  };

  const handleStageChange = () => {
    const previousType = form.value.matchType;
    form.value.scope = createDefaultMatchScope();
    const allowed = getMatchTypeOptionsForStage(currentStage.value ?? {});
    if (previousType && !allowed.includes(previousType)) {
      form.value.matchType = '';
      EleMessage.warning({
        message: '当前比赛类型不适用于所选赛段，请重新选择比赛类型。',
        plain: true
      });
    }
  };

  const handleMatchTypeChange = (type) => {
    if (type === MATCH_TYPE_DAILY) {
      form.value.itemIds = [];
      form.value.itemAwardConfig = {};
      form.value.itemMetaConfig = {};
      form.value.itemScoreConfig = {};
      form.value.matchRegistration = createDefaultMatchRegistration();
      form.value.matchInsurance = createDefaultInsuranceSetting();
      form.value.regStartTime = '';
      form.value.regEndTime = '';
      form.value.dataSources = createDefaultDataSources();
      form.value.pointsRules = normalizePointsRules();
      form.value.scoringPlan = { name: '每日综合评分体系', version: '1.0' };
      form.value.rankingRules = {
        targets: ['学生'],
        periods: ['日榜', '周榜', '阶段榜'],
        basis: '系统积分',
        tieRule: '并列名次',
        displayScopes: ['学生端', '教师端', '管理端'],
        description: ''
      };
    } else if (isClassMatch({ matchType: type })) {
      form.value.itemIds = [];
      form.value.itemAwardConfig = {};
      form.value.itemMetaConfig = {};
      form.value.itemScoreConfig = {};
      form.value.matchRegistration = createDefaultMatchRegistration();
      form.value.matchInsurance = createDefaultInsuranceSetting();
    }
  };

  watch(
    () => props.data,
    (value) => {
      form.value = createDefaultMatch(value);
    },
    { immediate: true }
  );

  const handleAttachmentAdd = (file) => {
    form.value.attachments = [...(form.value.attachments ?? []), file];
  };

  const handleAttachmentRemove = (row) => {
    form.value.attachments = (form.value.attachments ?? []).filter((d) => d.id !== row.id);
  };

  const parseDateTime = (value) => {
    if (!value) {
      return null;
    }
    const date = new Date(value.replace(' ', 'T'));
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const getScoreTimeWarnings = () => {
    if (!isClass.value || !form.value.startTime || !form.value.endTime) {
      return [];
    }
    const matchStart = parseDateTime(form.value.startTime);
    const matchEnd = parseDateTime(form.value.endTime);
    if (!matchStart || !matchEnd) {
      return [];
    }
    return scoreRows.value
      .filter((row) => {
        const start = parseDateTime(row.submitStartTime);
        const end = parseDateTime(row.submitEndTime);
        return (start && start < matchStart) || (end && end > matchEnd);
      })
      .map((row) => row.itemName);
  };

  const submit = async () => {
    try {
      await formRef.value?.validate?.();
    } catch {
      emit('fail', { step: 1, message: '请完善基础信息' });
      return;
    }
    const errors = validateMatchForm(form.value);
    if (errors.length) {
      const step = resolveMatchErrorStep(errors[0]);
      EleMessage.error({ message: errors[0], plain: true });
      emit('fail', { step, message: errors[0] });
      return;
    }
    const scoreTimeWarnings = getScoreTimeWarnings();
    if (scoreTimeWarnings.length) {
      try {
        await ElMessageBox.confirm(
          `以下设项的成绩提交时间超出比赛时间范围：${scoreTimeWarnings.join('、')}。是否继续发布？`,
          '成绩提交时间提示',
          { type: 'warning', draggable: true }
        );
      } catch {
        emit('fail', { step: 2 });
        return;
      }
    }
    const saved = saveMatch(form.value, props.matchId);
    if (!saved) {
      EleMessage.error({ message: '保存失败', plain: true });
      emit('fail', { step: 2 });
      return;
    }
    EleMessage.success({
      message: props.mode === 'edit' ? '比赛已保存' : '比赛已发布',
      plain: true
    });
    emit('done');
  };

  const validateStep = async (stepNum) => {
    if (stepNum === 1) {
      try {
        const fields = ['activityId', 'stageId', 'matchType', 'matchName', 'startTime', 'endTime'];
        if (isClass.value) {
          fields.push('regStartTime', 'regEndTime');
        }
        await formRef.value?.validateField?.(fields);
      } catch {
        return { valid: false, step: 1, message: '请完善基础信息' };
      }
      const errors = validateMatchForm(form.value, { step: 1 });
      if (errors.length) {
        return { valid: false, step: 1, message: errors[0] };
      }
      return { valid: true };
    }
    if (stepNum === 2) {
      const errors = validateMatchForm(form.value, { step: 2 });
      if (errors.length) {
        return { valid: false, step: 2, message: errors[0] };
      }
      return { valid: true };
    }
    return { valid: true };
  };

  defineExpose({ submit, validateStep, getForm: () => form.value });
</script>

<style scoped lang="scss">
  .match-form {
    .form-section {
      margin-bottom: 12px;

      &--last {
        margin-bottom: 0;
      }
    }

    .empty-tip,
    .readonly-text,
    .field-hint {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }

    .field-hint {
      margin-top: 6px;
      line-height: 1.5;

      &--warn {
        color: var(--el-color-warning);
      }
    }

    .empty-tip {
      margin-top: 8px;
    }

    .match-type-field {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .match-type-cascader {
      width: 260px;
    }
  }
</style>
