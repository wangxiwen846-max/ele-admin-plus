<!-- 班班赛 - 按设项保险设置 -->
<template>
  <div>
    <el-table :data="rows" border size="small">
      <el-table-column prop="itemName" label="设项名称" min-width="120" />
      <el-table-column label="是否需要保险" width="110" align="center">
        <template #default="{ row }">
          {{ row.required ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column label="保险方式" width="100" align="center">
        <template #default="{ row }">{{ row.required ? row.method || '统一购买' : '-' }}</template>
      </el-table-column>
      <el-table-column label="保险方案说明" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ row.description || '-' }}</template>
      </el-table-column>
      <el-table-column label="保险附件" width="90" align="center">
        <template #default="{ row }">{{ row.attachments?.length ?? 0 }} 个</template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center" fixed="right">
        <template #default="{ row }">
          <el-link type="primary" underline="never" @click="openEdit(row)">
            {{ disabled ? '查看' : '调整' }}
          </el-link>
        </template>
      </el-table-column>
    </el-table>

    <ele-modal v-model="visible" :title="disabled ? '查看保险设置' : '调整保险设置'" :width="640">
      <el-form v-if="editing" label-width="108px">
        <el-form-item label="设项名称">{{ editing.itemName }}</el-form-item>
        <el-form-item label="是否需要保险">
          <el-switch v-model="editing.required" :disabled="disabled" />
        </el-form-item>
        <template v-if="editing.required">
          <el-form-item label="保险方式">
            <el-radio-group v-model="editing.method" :disabled="disabled">
              <el-radio v-for="opt in INSURANCE_METHOD_OPTIONS" :key="opt" :value="opt">
                {{ opt }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="保险方案说明">
            <el-input
              v-model="editing.description"
              type="textarea"
              :rows="3"
              :disabled="disabled"
            />
          </el-form-item>
          <el-form-item label="保险附件">
            <attachment-table
              title="保险材料"
              :list="editing.attachments"
              :readonly="disabled"
              compact
              @add="handleAdd"
              @remove="handleRemove"
            />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">{{ disabled ? '关闭' : '取消' }}</el-button>
        <el-button v-if="!disabled" type="primary" @click="save">确定</el-button>
      </template>
    </ele-modal>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import AttachmentTable from '@/views/event-item/components/attachment-table.vue';
  import { createDefaultInsuranceSetting, findEventItem } from '@/views/event-item/data.js';
  import { clone, INSURANCE_METHOD_OPTIONS } from '../data.js';

  const props = defineProps({
    modelValue: { type: Object, default: () => ({}) },
    itemIds: { type: Array, default: () => [] },
    disabled: Boolean
  });

  const emit = defineEmits(['update:modelValue']);

  const visible = ref(false);
  const editing = ref(null);
  const editingId = ref(null);

  const rows = computed(() =>
    (props.itemIds ?? []).map((id) => {
      const key = String(id);
      const item = findEventItem(id);
      const config = props.modelValue?.[key] ?? createDefaultInsuranceSetting();
      return { itemId: id, itemName: item?.itemName || `设项${id}`, ...config };
    })
  );

  const openEdit = (row) => {
    editingId.value = row.itemId;
    editing.value = normalizeInsurance(clone(row));
    visible.value = true;
  };

  const handleAdd = (file) => {
    editing.value.attachments = [...(editing.value.attachments ?? []), file];
  };

  const handleRemove = (row) => {
    editing.value.attachments = (editing.value.attachments ?? []).filter((d) => d.id !== row.id);
  };

  const save = () => {
    const next = clone(props.modelValue ?? {});
    const { itemId, itemName, ...config } = normalizeInsurance(editing.value);
    next[String(itemId)] = clone(config);
    emit('update:modelValue', next);
    visible.value = false;
  };

  const normalizeInsurance = (config = {}) => {
    const next = clone(config);
    if (next.method === '赛事统一保险') {
      next.method = '统一购买';
    } else if (next.method === '参赛方自行购买') {
      next.method = '自行购买';
    } else if (next.method === '无需保险') {
      next.required = false;
      next.method = '统一购买';
    }
    if (!INSURANCE_METHOD_OPTIONS.includes(next.method)) {
      next.method = '统一购买';
    }
    if (!next.required) {
      next.method = '统一购买';
      next.description = '';
      next.attachments = [];
    }
    return next;
  };
</script>
