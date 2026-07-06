<!-- 活动新建/编辑表单（供大弹窗内嵌） -->
<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="118px"
    class="activity-form"
    @submit.prevent=""
  >
    <el-alert
      v-if="showStep1 && mode === 'copy'"
      title="复制活动：活动规程文本和附件需重新填写，活动时间和赛段时间建议重新选择。"
      type="info"
      show-icon
      :closable="false"
      style="margin-bottom: 14px"
    />

    <div v-show="showStep1" class="form-section step-section-card">
      <div class="section-head">
        <div class="section-title">基础信息</div>
      </div>
      <div class="section-body">
        <el-row :gutter="20">
          <el-col :sm="mode === 'add' ? 24 : 16" :xs="24">
            <el-form-item label="活动名称" prop="activityName">
              <el-input
                v-model.trim="form.activityName"
                :disabled="nameDisabled"
                :maxlength="80"
                placeholder="请输入赛事活动完整名称"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="mode !== 'add'" :sm="8" :xs="24">
            <el-form-item label="活动状态">
              <el-tag :type="statusTagType" size="small" effect="plain">{{ activityStatus }}</el-tag>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="活动开始时间" prop="startTime">
              <el-date-picker
                v-model="form.startTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择开始日期"
                class="ele-fluid"
                :disabled="timeDisabled"
                :disabled-date="disabledStartDate"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="活动结束时间" prop="endTime">
              <el-date-picker
                v-model="form.endTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择结束日期"
                class="ele-fluid"
                :disabled="timeDisabled"
                :disabled-date="disabledEndDate"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="活动封面">
              <image-upload
                v-model="form.cover"
                :limit="1"
                :disabled="coverDisabled"
                list-type="picture-card"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="活动简介">
              <el-input
                v-model="form.introduction"
                type="textarea"
                :rows="4"
                :maxlength="500"
                :disabled="introDisabled"
                placeholder="简要介绍活动背景、目标和整体内容"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </div>

    <div v-show="showStep1" class="form-section step-section-card">
      <div class="section-head">
        <div class="section-title">组织信息</div>
      </div>
      <div class="section-body">
        <el-row :gutter="20">
          <el-col :xs="24">
            <el-form-item label="指导单位">
              <unit-tag-select
                v-model="form.guidingUnits"
                :disabled="orgDisabled"
                placeholder="请输入指导单位，多个单位换行填写"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="主办单位">
              <unit-tag-select
                v-model="form.hostUnits"
                :disabled="orgDisabled"
                placeholder="请输入主办单位，多个单位换行填写"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="承办单位">
              <unit-tag-select
                v-model="form.organizerUnits"
                :disabled="orgDisabled"
                placeholder="请输入承办单位，多个单位换行填写"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="协办单位">
              <unit-tag-select
                v-model="form.coOrganizerUnits"
                :disabled="orgDisabled"
                placeholder="请输入协办单位，多个单位换行填写"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="运营服务单位">
              <unit-tag-select
                v-model="form.operationServiceUnits"
                :disabled="orgDisabled"
                placeholder="请输入运营服务单位，多个单位换行填写"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="支持单位">
              <unit-tag-select
                v-model="form.supportUnits"
                :disabled="orgDisabled"
                placeholder="请输入支持单位，多个单位换行填写"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="大赛总裁判长">
              <el-input
                v-model.trim="form.chiefReferee"
                :disabled="orgDisabled"
                :maxlength="30"
                placeholder="填写整个赛事活动的总裁判长"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="组委会成员">
              <committee-member-list
                v-model="form.committeeMembers"
                :disabled="orgDisabled"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </div>

    <div v-show="showStep1" class="form-section step-section-card">
      <div class="section-head">
        <div class="section-title">活动规程</div>
      </div>
      <div class="section-body">
        <el-form-item label="活动规程">
          <regulation-field
            :text="form.regulationText"
            :attachments="form.regulationAttachments"
            :disabled="regulationDisabled"
            @update:text="form.regulationText = $event"
            @add="handleRegulationAdd"
            @remove="handleRegulationRemove"
          />
        </el-form-item>
      </div>
    </div>

    <div v-show="showStep2" class="form-section step-section-card">
      <div class="section-head">
        <div class="section-title">{{ mode === 'add' ? '参赛范围' : '赛段与范围配置' }}</div>
      </div>
      <div class="section-body">
        <scope-summary-field
          v-model="form.coverage"
          :stages="form.stages"
          disabled
          fixed-national
        />
      </div>
    </div>

    <div v-show="showStep2" class="form-section step-section-card">
      <div class="section-head">
        <div class="section-title">赛段管理</div>
      </div>
      <div class="section-body">
        <stage-card-list
          v-model:stages="form.stages"
          :disabled="stageDisabled"
          :activity-start-time="form.startTime"
          :activity-end-time="form.endTime"
        />
      </div>
    </div>

    <div v-show="showStep2" class="form-section step-section-card">
      <div class="section-head">
        <div class="section-title">活动设项范围</div>
      </div>
      <div class="section-body">
        <activity-item-picker
          v-model="form.itemIds"
          :coverage="form.coverage"
          :locked-item-ids="lockedItemIds"
          :disabled="itemDisabled"
          :ignore-coverage="true"
        />
      </div>
    </div>

    <div v-show="showStep2" class="form-section form-section--last step-section-card step-section-card--last">
      <div class="section-head">
        <div class="section-title">附件</div>
      </div>
      <div class="section-body">
        <attachment-table
          title="活动附件"
          :list="form.attachments"
          :disabled="attachmentDisabled"
          compact
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
  import ImageUpload from '@/components/ImageUpload/index.vue';
  import AttachmentTable from '@/views/event-item/components/attachment-table.vue';
  import RegulationField from './regulation-field.vue';
  import UnitTagSelect from './unit-tag-select.vue';
  import CommitteeMemberList from './committee-member-list.vue';
  import ActivityItemPicker from './activity-item-picker.vue';
  import ScopeSummaryField from './scope-summary-field.vue';
  import StageCardList from './stage-card-list.vue';
  import {
    clone,
    getActivityStatus,
    getEditMode,
    getStatusTagType,
    getTodayStart,
    getUsedItemIds,
    isActivityStartBeforeToday,
    resolveActivityErrorStep,
    saveActivity,
    validateActivityForm
  } from '../data.js';

  const props = defineProps({
    data: Object,
    activityId: [Number, String],
    mode: {
      type: String,
      default: 'add'
    },
    step: { type: Number, default: null }
  });

  const emit = defineEmits(['done', 'fail']);

  const formRef = ref(null);
  const form = ref(clone(props.data ?? {}));

  const showStep1 = computed(() => props.step == null || props.step === 1);
  const showStep2 = computed(() => props.step == null || props.step === 2);
  const isEditPage = computed(() => props.mode === 'edit');
  const useSimplifiedLayout = computed(() => ['add', 'copy', 'edit'].includes(props.mode));
  const activityStatus = computed(() => getActivityStatus(form.value));
  const statusTagType = computed(() => getStatusTagType(activityStatus.value));

  const validationContext = computed(() => ({
    matchCount: props.data?.matchCount,
    matches: props.data?.matches ?? []
  }));

  const editMode = computed(() => {
    if (!isEditPage.value) {
      return 'full';
    }
    return getEditMode({ ...form.value, matchCount: props.data?.matchCount });
  });

  const nameDisabled = computed(
    () => !isEditPage.value && !['full', 'cautious'].includes(editMode.value)
  );
  const coverDisabled = computed(
    () => !isEditPage.value && !['full', 'cautious'].includes(editMode.value)
  );
  const introDisabled = computed(() => !isEditPage.value && editMode.value === 'readonly');
  const regulationDisabled = computed(() => !isEditPage.value && editMode.value === 'readonly');
  const orgDisabled = computed(() => !isEditPage.value && editMode.value === 'readonly');
  const attachmentDisabled = computed(() => !isEditPage.value && editMode.value === 'readonly');
  const timeDisabled = computed(
    () => !isEditPage.value && !['full', 'cautious'].includes(editMode.value)
  );
  const stageDisabled = computed(
    () => !isEditPage.value && !['full', 'cautious'].includes(editMode.value)
  );
  const itemDisabled = computed(
    () => !isEditPage.value && !['full', 'cautious'].includes(editMode.value)
  );

  const lockedItemIds = computed(() =>
    getUsedItemIds({
      matchCount: props.data?.matchCount,
      matches: props.data?.matches
    })
  );

  const validationOptions = computed(() => ({
    simplified: useSimplifiedLayout.value,
    allowExistingPastStart: isEditPage.value,
    originalStartTime: props.data?.startTime
  }));

  const rules = {
    activityName: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
    startTime: [
      { required: true, message: '请选择活动开始时间', trigger: 'change' },
      {
        validator: (_rule, value, callback) => {
          if (value && isActivityStartBeforeToday(value)) {
            if (isEditPage.value && value === props.data?.startTime) {
              callback();
              return;
            }
            callback(new Error('活动开始时间不能早于今天'));
            return;
          }
          callback();
        },
        trigger: 'change'
      }
    ],
    endTime: [
      { required: true, message: '请选择活动结束时间', trigger: 'change' },
      {
        validator: (_rule, value, callback) => {
          if (value && form.value.startTime && value <= form.value.startTime) {
            callback(new Error('活动结束时间必须晚于活动开始时间'));
            return;
          }
          callback();
        },
        trigger: 'change'
      }
    ]
  };

  const disabledStartDate = (date) => {
    const todayStart = getTodayStart().getTime();
    if (date.getTime() < todayStart) {
      return true;
    }
    if (form.value.endTime) {
      return date.getTime() > new Date(`${form.value.endTime}T23:59:59`).getTime();
    }
    return false;
  };

  const disabledEndDate = (date) => {
    if (!form.value.startTime) {
      return false;
    }
    return date.getTime() <= new Date(`${form.value.startTime}T00:00:00`).getTime();
  };

  watch(
    () => props.data,
    (value) => {
      if (value) {
        form.value = clone(value);
        if (!form.value.attachments) {
          form.value.attachments = [];
        }
        if (!form.value.regulationText) {
          form.value.regulationText = '';
        }
        if (!form.value.committeeMembers) {
          form.value.committeeMembers = [];
        }
      }
    },
    { immediate: true, deep: true }
  );

  const handleRegulationAdd = (file) => {
    if (!form.value.regulationAttachments) {
      form.value.regulationAttachments = [];
    }
    form.value.regulationAttachments.push(file);
  };

  const handleRegulationRemove = (row) => {
    const index = form.value.regulationAttachments.findIndex((d) => d.id === row.id);
    if (index !== -1) {
      form.value.regulationAttachments.splice(index, 1);
    }
  };

  const handleAttachmentAdd = (file) => {
    if (!form.value.attachments) {
      form.value.attachments = [];
    }
    form.value.attachments.push(file);
  };

  const handleAttachmentRemove = (row) => {
    const index = form.value.attachments.findIndex((d) => d.id === row.id);
    if (index !== -1) {
      form.value.attachments.splice(index, 1);
    }
  };

  const submit = async () => {
    if (editMode.value === 'readonly') {
      EleMessage.warning({ message: '已结束活动不允许编辑', plain: true });
      emit('fail', { step: 1 });
      return;
    }
    const valid = await formRef.value?.validate?.().catch(() => false);
    if (!valid) {
      emit('fail', { step: 1, message: '请完善基础信息' });
      return;
    }
    const errors = validateActivityForm(form.value, validationContext.value, validationOptions.value);
    if (errors.length) {
      const step = resolveActivityErrorStep(errors[0]);
      EleMessage.error({ message: errors[0], plain: true });
      emit('fail', { step, message: errors[0] });
      return;
    }
    if (editMode.value === 'cautious' && isEditPage.value) {
      try {
        await ElMessageBox.confirm(
          '活动已关联比赛，修改活动时间、覆盖范围、赛段或设项范围可能影响已有比赛，是否继续保存？',
          '保存确认',
          { type: 'warning', draggable: true }
        );
      } catch {
        emit('fail', { step: 2 });
        return;
      }
    }
    saveActivity(form.value, props.activityId);
    EleMessage.success({
      message: isEditPage.value ? '活动修改成功' : '活动发布成功',
      plain: true
    });
    emit('done');
  };

  const validateStep = async (stepNum) => {
    if (stepNum === 1) {
      try {
        await formRef.value?.validateField?.(['activityName', 'startTime', 'endTime']);
      } catch {
        return { valid: false, step: 1, message: '请完善基础信息' };
      }
      const errors = validateActivityForm(form.value, validationContext.value, {
        ...validationOptions.value,
        step: 1
      });
      if (errors.length) {
        return { valid: false, step: 1, message: errors[0] };
      }
      return { valid: true };
    }
    if (stepNum === 2) {
      const errors = validateActivityForm(form.value, validationContext.value, {
        ...validationOptions.value,
        step: 2
      });
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
  .activity-form {
    max-width: none;
  }

  .form-tip {
    width: 100%;
    margin-top: 4px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 1.5;

    &--inline {
      width: auto;
      margin-top: 0;
      margin-left: 8px;
    }
  }
</style>
