<!-- 角色选择下拉框 -->
<template>
  <el-select
    multiple
    clearable
    :model-value="roleIds"
    :placeholder="placeholder"
    class="ele-fluid"
    @update:modelValue="updateValue"
  >
    <el-option
      v-for="item in data"
      :key="item.roleId"
      :value="item.roleId"
      :label="item.roleName"
    />
  </el-select>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { EleMessage } from 'ele-admin-plus';
  import { listRoles } from '@/api/system/role';

  const props = defineProps({
    /** 选中的角色 */
    modelValue: Array,
    /** 提示文本 */
    placeholder: {
      type: String,
      default: '请选择角色'
    }
  });

  const emit = defineEmits(['update:modelValue']);

  /** 选中的角色id */
  const roleIds = computed(() => props.modelValue?.map?.((d) => d.roleId));

  /** 角色数据 */
  const data = ref([]);

  /** 更新选中数据 */
  const updateValue = (value) => {
    emit(
      'update:modelValue',
      value.map((v) => ({ roleId: v }))
    );
  };

  /** 获取角色数据 */
  listRoles()
    .then((list) => {
      data.value = list;
    })
    .catch((e) => {
      EleMessage.error({ message: e.message, plain: true });
    });
</script>
