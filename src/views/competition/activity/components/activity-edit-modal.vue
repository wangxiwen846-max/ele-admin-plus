<!-- 活动新增 / 编辑 / 复制 大弹窗 -->
<template>
  <ele-modal
    form
    :width="'86%'"
    :title="modalTitle"
    :loading="saving"
    :body-style="{ padding: '0' }"
    class="activity-edit-modal"
    v-bind="modalProps"
  >
    <div class="modal-body-scroll">
      <activity-form
        ref="formRef"
        :data="data"
        :activity-id="activityId"
        :mode="mode"
        @done="handleDone"
        @fail="saving = false"
      />
    </div>
    <template #footer>
      <div class="modal-footer-bar">
        <el-button @click="closeModal">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </template>
  </ele-modal>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import { useModal } from 'ele-admin-plus';
  import ActivityForm from './activity-form.vue';

  const props = defineProps({
    data: Object,
    activityId: [Number, String],
    mode: {
      type: String,
      default: 'add'
    }
  });
  const emit = defineEmits(['done']);

  const { modalProps, closeModal } = useModal();
  const formRef = ref(null);
  const saving = ref(false);

  const modalTitle = computed(() => {
    if (props.mode === 'edit') {
      return '编辑活动';
    }
    if (props.mode === 'copy') {
      return '复制活动';
    }
    return '新建活动';
  });

  const handleSave = () => {
    saving.value = true;
    formRef.value?.submit?.();
  };

  const handleDone = () => {
    saving.value = false;
    emit('done');
    closeModal();
  };
</script>

<style lang="scss" scoped>
  .modal-body-scroll {
    max-height: calc(72vh - 8px);
    overflow-y: auto;
    padding: 14px 20px 6px;
  }

  .modal-footer-bar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding-top: 12px;
    margin-top: -4px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
</style>
