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
      v-if="mode === 'copy'"
      title="复制活动：活动规程文本和附件需重新填写，活动时间和赛段时间建议重新选择。"
      type="info"
      show-icon
      :closable="false"
      style="margin-bottom: 14px"
    />
    <el-alert
      v-else-if="editMode === 'limited'"
      title="活动进行中，仅允许编辑活动介绍、活动规程、附件和组织信息等说明类内容。"
      type="warning"
      show-icon
      :closable="false"
      style="margin-bottom: 14px"
    />
    <el-alert
      v-else-if="editMode === 'cautious'"
      title="活动已关联比赛，修改活动时间、活动覆盖范围、赛段或活动设项范围时请谨慎操作。"
      type="warning"
      show-icon
      :closable="false"
      style="margin-bottom: 14px"
    />

    <div class="form-section">
      <div class="section-head">
        <div class="section-title">活动基础信息</div>
        <div class="section-desc">维护活动名称、封面、介绍与活动规程</div>
      </div>
      <div class="section-body">
        <el-row :gutter="16">
          <el-col :xs="24">
            <el-form-item label="活动名称" prop="activityName">
              <el-input
                v-model.trim="form.activityName"
                :disabled="nameDisabled"
                :maxlength="80"
                placeholder="请输入赛事活动完整名称"
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
            <el-form-item label="活动介绍">
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
          <el-col :xs="24">
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
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="form-section">
      <div class="section-head">
        <div class="section-title">组织信息</div>
        <div class="section-desc">维护指导、主办、承办、协办、支持单位及组委会信息</div>
      </div>
      <div class="section-body">
        <div class="org-subsection">
          <div class="org-subtitle">单位信息</div>
          <el-row :gutter="16">
            <el-col :sm="12" :xs="24">
              <el-form-item label="指导单位">
                <unit-tag-select
                  v-model="form.guidingUnits"
                  :disabled="orgDisabled"
                  placeholder="输入指导单位，回车添加"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="主办单位">
                <unit-tag-select
                  v-model="form.hostUnits"
                  :disabled="orgDisabled"
                  placeholder="输入主办单位，回车添加"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="承办单位">
                <unit-tag-select
                  v-model="form.organizerUnits"
                  :disabled="orgDisabled"
                  placeholder="输入承办单位，回车添加"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="协办单位">
                <unit-tag-select
                  v-model="form.coOrganizerUnits"
                  :disabled="orgDisabled"
                  placeholder="输入协办单位，回车添加"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="支持单位">
                <unit-tag-select
                  v-model="form.supportUnits"
                  :disabled="orgDisabled"
                  placeholder="输入支持单位，回车添加"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="org-subsection org-subsection--last">
          <div class="org-subtitle">组委会信息</div>
          <el-row :gutter="16">
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
              <el-form-item label=" " class="committee-form-item">
                <committee-member-list
                  v-model="form.committeeMembers"
                  :disabled="orgDisabled"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>

    <div class="form-section">
      <div class="section-head">
        <div class="section-title">活动时间</div>
        <div class="section-desc">活动时间应覆盖下方赛段的比赛日期区间</div>
      </div>
      <div class="section-body">
        <el-row :gutter="16">
          <el-col :sm="12" :xs="24">
            <el-form-item label="活动开始时间" prop="startTime">
              <el-date-picker
                v-model="form.startTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择"
                class="ele-fluid"
                :disabled="timeDisabled"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="活动结束时间" prop="endTime">
              <el-date-picker
                v-model="form.endTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择"
                class="ele-fluid"
                :disabled="timeDisabled"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="form-section">
      <div class="section-head">
        <div class="section-title">活动覆盖范围</div>
        <div class="section-desc">活动层面的最大覆盖范围，赛段参赛范围不能超出此范围</div>
      </div>
      <div class="section-body">
        <scope-summary-field v-model="form.coverage" :disabled="scopeDisabled" />
      </div>
    </div>

    <div class="form-section">
      <div class="section-head">
        <div class="section-title">赛段管理</div>
        <div class="section-desc">配置赛段比赛日期区间、参赛范围、参赛门槛与赛段裁判长</div>
      </div>
      <div class="section-body">
        <stage-card-list
          v-model:stages="form.stages"
          :parent-scope="form.coverage"
          :disabled="stageDisabled"
        />
      </div>
    </div>

    <div class="form-section">
      <div class="section-head">
        <div class="section-title">活动设项范围</div>
        <div class="section-desc">从设项管理模块选择当前活动可使用的设项</div>
      </div>
      <div class="section-body">
        <activity-item-picker
          v-model="form.itemIds"
          :locked-item-ids="lockedItemIds"
          :disabled="itemDisabled"
        />
      </div>
    </div>

    <div class="form-section form-section--last">
      <div class="section-head">
        <div class="section-title">附件</div>
        <div class="section-desc">可上传活动通知、保险说明、补充材料等，不作为系统规则判断依据</div>
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
        <div class="form-tip">
          活动规程为活动基础信息中的单独字段；附件为其他补充材料。附件中的保险说明不作为最终保险规则，最终规则以后续发布比赛时确认的保险方案为准。
        </div>
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
    getEditMode,
    getUsedItemIds,
    saveActivity,
    validateActivityForm
  } from '../data.js';

  const props = defineProps({
    data: Object,
    activityId: [Number, String],
    mode: {
      type: String,
      default: 'add'
    }
  });

  const emit = defineEmits(['done', 'fail']);

  const formRef = ref(null);
  const form = ref(clone(props.data ?? {}));

  const editMode = computed(() =>
    getEditMode({ ...form.value, matchCount: props.data?.matchCount })
  );

  const nameDisabled = computed(() => !['full', 'cautious'].includes(editMode.value));
  const coverDisabled = computed(() => !['full', 'cautious'].includes(editMode.value));
  const introDisabled = computed(() => editMode.value === 'readonly');
  const regulationDisabled = computed(() => editMode.value === 'readonly');
  const orgDisabled = computed(() => editMode.value === 'readonly');
  const attachmentDisabled = computed(() => editMode.value === 'readonly');
  const timeDisabled = computed(() => !['full', 'cautious'].includes(editMode.value));
  const stageDisabled = computed(() => !['full', 'cautious'].includes(editMode.value));
  const scopeDisabled = computed(() => !['full', 'cautious'].includes(editMode.value));
  const itemDisabled = computed(() => !['full', 'cautious'].includes(editMode.value));

  const lockedItemIds = computed(() =>
    getUsedItemIds({
      matchCount: props.data?.matchCount,
      matches: props.data?.matches
    })
  );

  const rules = {
    activityName: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
    startTime: [{ required: true, message: '请选择活动开始时间', trigger: 'change' }],
    endTime: [{ required: true, message: '请选择活动结束时间', trigger: 'change' }]
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
    { deep: true }
  );

  const handleRegulationAdd = (file) => {
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
      emit('fail');
      return;
    }
    const valid = await formRef.value?.validate?.().catch(() => false);
    if (!valid) {
      emit('fail');
      return;
    }
    const errors = validateActivityForm(form.value, {
      matchCount: props.data?.matchCount,
      matches: props.data?.matches
    });
    if (errors.length) {
      EleMessage.error({ message: errors[0], plain: true });
      emit('fail');
      return;
    }
    if (editMode.value === 'cautious') {
      try {
        await ElMessageBox.confirm(
          '活动已关联比赛，修改活动时间、覆盖范围、赛段或设项范围可能影响已有比赛，是否继续保存？',
          '保存确认',
          { type: 'warning', draggable: true }
        );
      } catch {
        emit('fail');
        return;
      }
    }
    saveActivity(form.value, props.activityId);
    EleMessage.success({ message: '保存成功，活动已生效', plain: true });
    emit('done');
  };

  defineExpose({ submit });
</script>

<style scoped lang="scss">
  .activity-form {
    max-width: none;
  }

  .form-section {
    margin-bottom: 10px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;

    &--last {
      margin-bottom: 0;
    }
  }

  .section-head {
    padding: 12px 16px 0;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1.4;
    padding-left: 8px;
    border-left: 3px solid var(--el-color-primary);
  }

  .section-desc {
    margin: 4px 0 0 11px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.4;
  }

  .section-body {
    padding: 10px 16px 4px;
    border-top: 1px solid var(--el-border-color-extra-light);
    margin-top: 10px;
  }

  .form-tip {
    width: 100%;
    margin-top: 4px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 1.5;
  }

  .org-subsection {
    margin-bottom: 12px;
    padding-bottom: 4px;
    border-bottom: 1px dashed var(--el-border-color-extra-light);

    &--last {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
  }

  .org-subtitle {
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .committee-form-item {
    margin-bottom: 0;

    :deep(.el-form-item__label) {
      padding: 0;
    }
  }
</style>
