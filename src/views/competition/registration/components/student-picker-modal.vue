<!-- 学生选择弹窗（居中，支持多选） -->
<template>
  <el-dialog
    :model-value="visible"
    title="选择学生"
    width="860px"
    append-to-body
    destroy-on-close
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form :inline="true" @submit.prevent="">
      <el-form-item label="学生姓名">
        <el-input v-model.trim="filters.name" clearable placeholder="支持模糊搜索" style="width: 140px" />
      </el-form-item>
      <el-form-item label="参赛编号">
        <el-input
          v-model.trim="filters.participantNumber"
          clearable
          placeholder="精准搜索"
          style="width: 140px"
          :disabled="!matchId"
        />
      </el-form-item>
      <el-form-item label="学校">
        <el-select v-model="filters.school" clearable filterable placeholder="全部" style="width: 150px">
          <el-option v-for="item in schoolOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="年级">
        <el-select v-model="filters.grade" clearable placeholder="全部" style="width: 120px">
          <el-option v-for="item in gradeOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="班级">
        <el-select v-model="filters.className" clearable placeholder="全部" style="width: 120px">
          <el-option v-for="item in classOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
    </el-form>
    <el-table
      ref="tableRef"
      :data="rows"
      border
      size="small"
      height="360"
      row-key="studentId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="46" :selectable="isSelectable" />
      <el-table-column prop="participantNumber" label="参赛编号" width="96" align="center" />
      <el-table-column prop="name" label="学生姓名" width="100" />
      <el-table-column prop="idNo" label="证件号" min-width="150" show-overflow-tooltip />
      <el-table-column prop="school" label="学校" min-width="130" show-overflow-tooltip />
      <el-table-column prop="gradeClass" label="年级班级" width="120" />
      <el-table-column prop="gender" label="性别" width="70" align="center" />
    </el-table>
    <template #footer>
      <el-button @click="emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="confirm">确认（已选 {{ selection.length }}）</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
  import { computed, reactive, ref, watch } from 'vue';
  import { EleMessage } from 'ele-admin-plus';
  import {
    getStudentGradeOptions,
    getStudentPickerRows,
    getStudentSchoolOptions
  } from '../data.js';

  const props = defineProps({
    visible: Boolean,
    matchId: { type: [String, Number], default: '' },
    excludeIds: { type: Array, default: () => [] }
  });

  const emit = defineEmits(['update:visible', 'confirm']);

  const tableRef = ref(null);
  const selection = ref([]);
  const filters = reactive({ school: '', grade: '', className: '', name: '', participantNumber: '' });
  const schoolOptions = getStudentSchoolOptions();
  const gradeOptions = getStudentGradeOptions();
  const classOptions = computed(() => {
    const list = getStudentPickerRows(props.matchId, {
      school: filters.school,
      grade: filters.grade
    });
    return [...new Set(list.map((item) => item.className))];
  });

  const rows = computed(() => getStudentPickerRows(props.matchId, filters));

  const isSelectable = (row) => !props.excludeIds.includes(row.studentId);

  const handleSelectionChange = (val) => {
    selection.value = val;
  };

  watch(
    () => props.visible,
    (value) => {
      if (value) {
        selection.value = [];
        Object.assign(filters, {
          school: '',
          grade: '',
          className: '',
          name: '',
          participantNumber: ''
        });
      }
    }
  );

  const confirm = () => {
    if (!selection.value.length) {
      EleMessage.error({ message: '请至少勾选 1 名学生', plain: true });
      return;
    }
    emit('confirm', [...selection.value]);
    emit('update:visible', false);
  };
</script>
