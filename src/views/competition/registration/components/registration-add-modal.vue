<!-- 新增报名弹窗 -->
<template>
  <el-dialog
    :model-value="visible"
    title="新增报名"
    width="920px"
    append-to-body
    destroy-on-close
    class="registration-add-dialog"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form :model="form" label-width="96px">
      <el-row :gutter="16">
        <el-col :sm="12" :xs="24">
          <el-form-item label="比赛名称" required>
            <el-select
              v-model="form.matchId"
              filterable
              placeholder="请选择比赛"
              class="ele-fluid"
              :disabled="!!lockedMatchId"
              @change="handleMatchChange"
            >
              <el-option
                v-for="match in registerableMatches"
                :key="match.matchId"
                :label="match.matchName"
                :value="match.matchId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="设项名称" required>
            <el-select
              v-model="form.itemId"
              placeholder="请选择设项"
              class="ele-fluid"
              :disabled="!form.matchId"
              @change="handleItemChange"
            >
              <el-option
                v-for="item in itemOptions"
                :key="item.itemId"
                :label="item.itemName"
                :value="item.itemId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="比赛形式">
            <span class="readonly-text">{{ selectedItem?.matchForm || '选择设项后自动带出' }}</span>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 个人报名 -->
      <template v-if="selectedItem?.matchForm === '个人'">
        <el-form-item label="选择学生" required>
          <el-button type="primary" plain @click="openPicker('personal')">选择学生</el-button>
          <span class="field-tip">已选 {{ selectedStudents.length }} 人</span>
        </el-form-item>
        <el-form-item label="已选学生">
          <div class="table-wrap">
            <el-table :data="selectedStudents" border size="small" empty-text="请从学生库选择学生">
              <el-table-column prop="name" label="学生姓名" width="100" />
              <el-table-column prop="idNo" label="证件号" min-width="160" show-overflow-tooltip />
              <el-table-column prop="school" label="学校" min-width="130" show-overflow-tooltip />
              <el-table-column prop="gradeClass" label="年级班级" width="120" />
              <el-table-column prop="gender" label="性别" width="70" align="center" />
              <el-table-column label="操作" width="80" align="center" fixed="right">
                <template #default="{ row }">
                  <el-link type="danger" underline="never" @click="removeStudent(row.studentId)">移除</el-link>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>
      </template>

      <!-- 团体报名 -->
      <template v-else-if="selectedItem?.matchForm === '团体'">
        <el-row :gutter="16">
          <el-col :sm="12" :xs="24">
            <el-form-item label="团队名称" required>
              <el-input v-model.trim="form.teamName" placeholder="请输入团队名称" />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="所属学校" required>
              <el-input v-model.trim="form.school" placeholder="请输入所属学校" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="团队成员" required>
          <el-button type="primary" plain @click="openPicker('team')">添加成员</el-button>
          <span class="field-tip">至少 1 人，已选 {{ selectedStudents.length }} 人</span>
        </el-form-item>
        <el-form-item label="成员列表">
          <div class="table-wrap">
            <el-table :data="selectedStudents" border size="small" empty-text="请从学生库添加成员">
              <el-table-column prop="name" label="学生姓名" width="100" />
              <el-table-column prop="idNo" label="证件号" min-width="160" show-overflow-tooltip />
              <el-table-column prop="gender" label="性别" width="70" align="center" />
              <el-table-column prop="school" label="学校" min-width="130" show-overflow-tooltip />
              <el-table-column prop="gradeClass" label="年级班级" width="120" />
              <el-table-column label="操作" width="80" align="center" fixed="right">
                <template #default="{ row }">
                  <el-link type="danger" underline="never" @click="removeStudent(row.studentId)">移除</el-link>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>
      </template>

      <el-form-item label="备注">
        <el-input v-model.trim="form.remark" type="textarea" :rows="2" placeholder="选填" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="submit">确认提交</el-button>
    </template>

    <student-picker-modal
      v-model:visible="pickerVisible"
      :exclude-ids="selectedIds"
      @confirm="handlePicked"
    />
  </el-dialog>
</template>

<script setup>
  import { computed, reactive, ref, watch } from 'vue';
  import { EleMessage } from 'ele-admin-plus';
  import StudentPickerModal from './student-picker-modal.vue';
  import {
    addPersonalEntries,
    addTeamEntry,
    getItemOptionsByMatch,
    getRegisterableMatches
  } from '../data.js';

  const props = defineProps({
    visible: Boolean,
    matchId: { type: [String, Number], default: '' },
    itemId: { type: [String, Number], default: '' }
  });

  const emit = defineEmits(['update:visible', 'done']);

  const lockedMatchId = computed(() => props.matchId || '');
  const registerableMatches = computed(() => getRegisterableMatches());
  const form = reactive(createEmptyForm());
  const selectedStudents = ref([]);
  const pickerVisible = ref(false);

  const itemOptions = computed(() => (form.matchId ? getItemOptionsByMatch(form.matchId) : []));
  const selectedItem = computed(() => itemOptions.value.find((item) => item.itemId === form.itemId));
  const selectedIds = computed(() => selectedStudents.value.map((s) => s.studentId));

  function createEmptyForm() {
    return { matchId: '', itemId: '', teamName: '', school: '', remark: '' };
  }

  watch(
    () => props.visible,
    (value) => {
      if (!value) {
        return;
      }
      Object.assign(form, createEmptyForm(), {
        matchId: props.matchId || '',
        itemId: props.itemId || ''
      });
      selectedStudents.value = [];
    }
  );

  const handleMatchChange = () => {
    form.itemId = '';
    selectedStudents.value = [];
  };

  const handleItemChange = () => {
    selectedStudents.value = [];
    form.teamName = '';
    form.school = '';
  };

  const openPicker = () => {
    pickerVisible.value = true;
  };

  const handlePicked = (students) => {
    const map = new Map(selectedStudents.value.map((s) => [s.studentId, s]));
    students.forEach((s) => map.set(s.studentId, s));
    selectedStudents.value = [...map.values()];
  };

  const removeStudent = (studentId) => {
    selectedStudents.value = selectedStudents.value.filter((s) => s.studentId !== studentId);
  };

  const submit = () => {
    if (!form.matchId || !form.itemId || !selectedItem.value) {
      EleMessage.error({ message: '请选择比赛和设项', plain: true });
      return;
    }
    if (!selectedStudents.value.length) {
      EleMessage.error({ message: '请至少选择 1 名学生', plain: true });
      return;
    }
    if (selectedItem.value.matchForm === '个人') {
      const { added, duplicated } = addPersonalEntries({
        matchId: form.matchId,
        itemId: form.itemId,
        studentIds: selectedIds.value,
        remark: form.remark
      });
      if (duplicated.length) {
        EleMessage.warning({
          message: `${duplicated.join('、')} 已在该设项报名，已自动跳过；新增 ${added.length} 人。`,
          plain: true
        });
      }
      if (!added.length && duplicated.length) {
        return;
      }
    } else {
      if (!form.teamName || !form.school) {
        EleMessage.error({ message: '请填写团队名称和所属学校', plain: true });
        return;
      }
      addTeamEntry({
        matchId: form.matchId,
        itemId: form.itemId,
        teamName: form.teamName,
        school: form.school,
        memberIds: selectedIds.value,
        remark: form.remark
      });
    }
    emit('update:visible', false);
    emit('done');
    EleMessage.success({ message: '报名已保存，保险状态将按学生逐人生成或匹配。', plain: true });
  };
</script>

<style scoped lang="scss">
  .readonly-text {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .field-tip {
    margin-left: 12px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .table-wrap {
    width: 100%;
    overflow-x: auto;
  }
</style>
