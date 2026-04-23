<!-- 体测记录 作废弹窗 -->
<template>
  <ele-modal
    form
    :width="520"
    title="作废体测记录"
    :loading="loading"
    v-bind="modalProps"
  >
    <ele-alert
      type="warning"
      show-icon
      :closable="false"
      style="margin-bottom: 16px"
    >
      <template #title>
        记录作废后将不再参与统计，学生可通过补测方式重新录入数据。
      </template>
    </ele-alert>

    <el-descriptions :column="1" border size="default" class="info-desc">
      <el-descriptions-item label="学生姓名">
        {{ data.studentName }}
        <span class="desc-extra">学号 {{ data.studentNo }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="年级班级">
        {{ data.grade }} · {{ data.className }}
      </el-descriptions-item>
      <el-descriptions-item label="方案名称">
        {{ data.planName }}
      </el-descriptions-item>
      <el-descriptions-item label="测试日期">
        {{ data.testDate }}
      </el-descriptions-item>
    </el-descriptions>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      @submit.prevent=""
    >
      <el-form-item label="作废原因" prop="reason">
        <el-input
          v-model.trim="form.reason"
          type="textarea"
          :rows="3"
          :maxlength="200"
          show-word-limit
          placeholder="请输入作废原因，例如：设备故障、数据异常等"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="danger" :loading="loading" @click="confirm">
        确认作废
      </el-button>
    </template>
  </ele-modal>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { EleMessage, useModal } from 'ele-admin-plus';
  import { recordStore } from '@/views/fitness/data.js';

  const props = defineProps({ data: { type: Object, required: true } });
  const emit = defineEmits(['done']);

  const { modalProps, closeModal } = useModal();

  const loading = ref(false);
  const formRef = ref(null);

  const form = reactive({ reason: '' });

  const rules = reactive({
    reason: [
      { required: true, message: '请输入作废原因', trigger: 'blur' },
      { min: 2, message: '作废原因至少 2 个字符', trigger: 'blur' }
    ]
  });

  const handleCancel = () => closeModal();

  const confirm = () => {
    formRef.value?.validate?.((valid) => {
      if (!valid) return;
      loading.value = true;
      setTimeout(() => {
        const target = recordStore.list.find(
          (d) => d.recordId === props.data.recordId
        );
        if (target) {
          target.status = 'invalid';
          target.invalidReason = form.reason;
          target.updateTime = formatNow();
          target.updateBy = '体测管理员';
        }
        loading.value = false;
        EleMessage.success({ message: '已作废', plain: true });
        emit('done');
        closeModal();
      }, 300);
    });
  };

  function formatNow() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
</script>

<style lang="scss" scoped>
  .info-desc {
    margin-bottom: 16px;
    :deep(.el-descriptions__label) {
      width: 96px;
    }
  }
  .desc-extra {
    margin-left: 12px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }
</style>
