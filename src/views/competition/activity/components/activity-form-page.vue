<!-- 活动新建 / 编辑 / 复制 独立页面 -->
<template>
  <div class="form-page activity-form-page step-form-page">
    <div class="step-form-header">
      <div class="step-form-header-inner">
        <div class="step-form-title">{{ pageTitle }}</div>
        <el-steps :active="currentStep - 1" align-center finish-status="success" class="step-form-steps">
          <el-step title="基础信息" />
          <el-step title="范围与赛段配置" />
          <el-step title="确认提交" />
        </el-steps>
      </div>
    </div>

    <div ref="contentRef" class="step-form-content">
      <div class="step-form-main">
        <activity-form
          v-show="currentStep < 3"
          ref="formRef"
          :data="data"
          :activity-id="activityId"
          :mode="mode"
          :step="currentStep"
          @done="handleDone"
          @fail="handleFail"
        />
        <activity-form-confirm v-if="currentStep === 3" :form="formData" />
      </div>
    </div>

    <div class="step-form-footer">
      <div class="step-form-footer-inner">
        <el-button v-if="currentStep > 1" @click="handlePrev">上一步</el-button>
        <el-button @click="goBack">取消</el-button>
        <el-button v-if="currentStep < 3" type="primary" @click="handleNext">下一步</el-button>
        <el-button
          v-if="currentStep === 3"
          type="primary"
          :loading="saving"
          @click="handleSubmit"
        >
          {{ submitLabel }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, nextTick, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { EleMessage } from 'ele-admin-plus';
  import { usePageTab } from '@/utils/use-page-tab';
  import ActivityForm from './activity-form.vue';
  import ActivityFormConfirm from './activity-form-confirm.vue';

  const props = defineProps({
    data: Object,
    activityId: [Number, String],
    mode: {
      type: String,
      default: 'add'
    }
  });

  const router = useRouter();
  const { routeTabKey, removePageTab } = usePageTab();
  const formRef = ref(null);
  const contentRef = ref(null);
  const currentStep = ref(1);
  const saving = ref(false);

  const scrollToTop = () => {
    nextTick(() => {
      contentRef.value?.scrollTo?.({ top: 0, behavior: 'auto' });
    });
  };

  const pageTitle = computed(() => {
    if (props.mode === 'edit') {
      return '编辑活动';
    }
    if (props.mode === 'copy') {
      return '复制活动';
    }
    return '新建活动';
  });

  const submitLabel = computed(() => (props.mode === 'edit' ? '保存修改' : '发布活动'));

  const formData = computed(() => formRef.value?.getForm?.() ?? props.data ?? {});

  const goBack = () => {
    removePageTab({ key: routeTabKey, active: routeTabKey });
    router.push('/competition/activity');
  };

  const handlePrev = () => {
    currentStep.value -= 1;
    scrollToTop();
  };

  const handleNext = async () => {
    const result = await formRef.value?.validateStep?.(currentStep.value);
    if (result && !result.valid) {
      EleMessage.error({
        message: result.message || '请完善当前步骤配置',
        plain: true
      });
      return;
    }
    currentStep.value += 1;
    scrollToTop();
  };

  const handleSubmit = () => {
    saving.value = true;
    formRef.value?.submit?.();
  };

  const handleDone = () => {
    saving.value = false;
    goBack();
  };

  const handleFail = (payload) => {
    saving.value = false;
    const step = payload?.step ?? 1;
    if (currentStep.value === 3 && step < 3) {
      currentStep.value = step;
      scrollToTop();
      nextTick(() => {
        formRef.value?.validateStep?.(step);
      });
    }
  };
</script>

