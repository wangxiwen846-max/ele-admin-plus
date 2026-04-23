<template>
  <ele-modal
    form
    :width="460"
    title="新建文件夹"
    v-model="visible"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.prevent=""
    >
      <el-form-item label="文件夹名称" prop="name">
        <el-input
          clearable
          :maxlength="20"
          v-model="form.name"
          placeholder="请输入文件夹名称"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="save">
        保存
      </el-button>
    </template>
  </ele-modal>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { EleMessage } from 'ele-admin-plus/es';
  import { useFormData } from '@/utils/use-form-data';
  import { addUserFile } from '@/api/system/user-file';

  const props = defineProps({
    /** 父级id */
    parentId: Number
  });

  const emit = defineEmits(['done']);

  /** 弹窗是否打开 */
  const visible = defineModel({ type: Boolean });

  /** 表单实例 */
  const formRef = ref(null);

  /** 提交状态 */
  const loading = ref(false);

  /** 表单数据 */
  const [form, resetFields] = useFormData({ name: '' });

  /** 表单验证规则 */
  const rules = reactive({
    name: [
      {
        required: true,
        message: '请输入文件夹名称',
        type: 'string',
        trigger: 'blur'
      }
    ]
  });

  /** 关闭弹窗 */
  const handleCancel = () => {
    visible.value = false;
  };

  /** 保存编辑 */
  const save = () => {
    formRef.value?.validate?.((valid) => {
      if (!valid) {
        return;
      }
      loading.value = true;
      addUserFile({
        ...form,
        parentId: props.parentId,
        isDirectory: 1
      })
        .then((msg) => {
          loading.value = false;
          EleMessage.success({ message: msg, plain: true });
          handleCancel();
          emit('done');
        })
        .catch((e) => {
          loading.value = false;
          EleMessage.error({ message: e.message, plain: true });
        });
    });
  };

  /** 弹窗关闭事件 */
  const handleClosed = () => {
    resetFields();
    formRef.value?.clearValidate?.();
  };
</script>
