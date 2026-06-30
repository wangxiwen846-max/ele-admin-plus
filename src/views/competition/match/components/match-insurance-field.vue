<!-- 比赛整体保险设置 -->
<template>
  <el-row :gutter="20">
    <el-col :sm="12" :xs="24">
      <el-form-item label="是否需要保险">
        <el-switch
          :model-value="config.required"
          :disabled="disabled"
          @change="updateRequired"
        />
      </el-form-item>
    </el-col>
    <template v-if="config.required">
      <el-col :xs="24">
        <el-form-item label="保险方式" required>
          <el-radio-group
            :model-value="config.method"
            :disabled="disabled"
            @change="updateField('method', $event)"
          >
            <el-radio v-for="opt in INSURANCE_METHOD_OPTIONS" :key="opt" :value="opt">
              {{ opt }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :xs="24">
        <el-form-item label="保险方案说明">
          <el-input
            :model-value="config.description"
            type="textarea"
            :rows="3"
            placeholder="非必填"
            :disabled="disabled"
            @update:model-value="updateField('description', $event)"
          />
        </el-form-item>
      </el-col>
      <el-col :xs="24">
        <attachment-table
          title="保险附件"
          :list="config.attachments"
          :disabled="disabled"
          compact
          @add="handleAttachmentAdd"
          @remove="handleAttachmentRemove"
        />
      </el-col>
    </template>
  </el-row>
</template>

<script setup>
  import { computed } from 'vue';
  import AttachmentTable from '@/views/event-item/components/attachment-table.vue';
  import { createDefaultInsuranceSetting } from '@/views/event-item/data.js';
  import { clone, INSURANCE_METHOD_OPTIONS } from '../data.js';

  const props = defineProps({
    modelValue: { type: Object, default: () => createDefaultInsuranceSetting() },
    disabled: Boolean
  });

  const emit = defineEmits(['update:modelValue']);

  const config = computed(() => ({
    ...createDefaultInsuranceSetting(),
    ...props.modelValue
  }));

  const emitConfig = (next) => {
    emit('update:modelValue', clone(next));
  };

  const updateField = (field, value) => {
    emitConfig({ ...config.value, [field]: value });
  };

  const updateRequired = (value) => {
    const next = { ...config.value, required: value };
    if (!value) {
      next.method = '统一购买';
    }
    emitConfig(next);
  };

  const handleAttachmentAdd = (file) => {
    emitConfig({
      ...config.value,
      attachments: [...(config.value.attachments ?? []), file]
    });
  };

  const handleAttachmentRemove = (row) => {
    emitConfig({
      ...config.value,
      attachments: (config.value.attachments ?? []).filter((d) => d.id !== row.id)
    });
  };
</script>
