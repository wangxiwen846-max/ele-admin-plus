<!-- 新增报名弹窗 -->
<template>
  <el-dialog
    :model-value="visible"
    title="新增报名"
    width="960px"
    append-to-body
    destroy-on-close
    class="registration-add-dialog"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form :model="form" label-width="96px">
      <!-- 步骤一：选择比赛与设项 -->
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
      </el-row>

      <!-- 自动带出的比赛与设项信息 -->
      <el-descriptions v-if="matchInfo" :column="3" border size="small" class="auto-info">
        <el-descriptions-item label="赛事活动">{{ matchInfo.activityName }}</el-descriptions-item>
        <el-descriptions-item label="赛段">{{ matchInfo.stageName }}</el-descriptions-item>
        <el-descriptions-item label="比赛类型">{{ matchInfo.matchTypeLabel }}</el-descriptions-item>
        <el-descriptions-item label="比赛名称">{{ matchInfo.matchName }}</el-descriptions-item>
        <el-descriptions-item label="比赛时间" :span="2">{{ matchInfo.matchTime }}</el-descriptions-item>
        <template v-if="itemInfo">
          <el-descriptions-item label="设项名称">{{ itemInfo.itemName }}</el-descriptions-item>
          <el-descriptions-item label="参赛项目">{{ itemInfo.project }}</el-descriptions-item>
          <el-descriptions-item label="比赛形式">{{ itemInfo.matchForm }}</el-descriptions-item>
        </template>
      </el-descriptions>

      <!-- 个人报名 -->
      <template v-if="itemInfo?.matchForm === '个人'">
        <el-form-item label="选择学生" required>
          <el-button type="primary" plain @click="openPicker({ type: 'personal' })">选择学生</el-button>
          <span class="field-tip">已选 {{ personalStudents.length }} 人</span>
        </el-form-item>
        <el-form-item label="已选学生">
          <div class="table-wrap">
            <el-table :data="personalStudents" border size="small" :empty-text="emptyStudentText">
              <el-table-column label="参赛编号" width="110" align="center">
                <template #default="{ row }">{{ displayStudentParticipantNumber(row.studentId) }}</template>
              </el-table-column>
              <el-table-column prop="name" label="学生姓名" width="100" />
              <el-table-column prop="school" label="学校" min-width="130" show-overflow-tooltip />
              <el-table-column prop="grade" label="年级" width="90" align="center" />
              <el-table-column prop="className" label="班级" width="90" align="center" />
              <el-table-column prop="classNo" label="班内序号" width="90" align="center" />
              <el-table-column prop="gender" label="性别" width="70" align="center" />
              <el-table-column label="操作" width="80" align="center" fixed="right">
                <template #default="{ row }">
                  <el-link type="danger" underline="never" @click="removePersonalStudent(row.studentId)">
                    移除
                  </el-link>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model.trim="form.remark" type="textarea" :rows="2" placeholder="选填" />
        </el-form-item>
      </template>

      <!-- 团体报名（支持多个队伍） -->
      <template v-else-if="itemInfo?.matchForm === '团体'">
        <el-form-item label="团队报名">
          <el-button type="primary" plain :icon="PlusOutlined" @click="addTeam">添加队伍</el-button>
          <span class="field-tip">共 {{ teams.length }} 支队伍</span>
        </el-form-item>
        <div v-for="(team, index) in teams" :key="team.key" class="team-card">
          <div class="team-card-header">
            <span class="team-card-title">队伍 {{ index + 1 }}</span>
            <div class="team-card-ops">
              <el-link type="primary" underline="never" @click="team.expanded = !team.expanded">
                {{ team.expanded ? '收起' : '展开' }}
              </el-link>
              <el-link type="danger" underline="never" @click="removeTeam(index)">删除队伍</el-link>
            </div>
          </div>
          <template v-if="team.expanded">
            <el-row :gutter="16">
              <el-col :sm="12" :xs="24">
                <el-form-item label="队伍名称" required>
                  <el-input v-model.trim="team.teamName" placeholder="请输入队伍名称" />
                </el-form-item>
              </el-col>
              <el-col :sm="12" :xs="24">
                <el-form-item label="所属学校" required>
                  <el-select
                    v-model="team.school"
                    filterable
                    placeholder="请选择所属学校"
                    class="ele-fluid"
                  >
                    <el-option v-for="s in scopeSchoolOptions" :key="s" :label="s" :value="s" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="团队成员" required>
              <el-button type="primary" plain @click="openPicker({ type: 'team', key: team.key })">
                添加成员
              </el-button>
              <span class="field-tip">至少 1 人，已选 {{ team.members.length }} 人</span>
            </el-form-item>
            <el-form-item label="成员列表">
              <div class="table-wrap">
                <el-table :data="team.members" border size="small" :empty-text="emptyStudentText">
                  <el-table-column label="参赛编号" width="110" align="center">
                    <template #default="{ row }">{{ displayStudentParticipantNumber(row.studentId) }}</template>
                  </el-table-column>
                  <el-table-column prop="name" label="成员姓名" width="100" />
                  <el-table-column prop="school" label="学校" min-width="130" show-overflow-tooltip />
                  <el-table-column prop="grade" label="年级" width="90" align="center" />
                  <el-table-column prop="className" label="班级" width="90" align="center" />
                  <el-table-column prop="classNo" label="班内序号" width="90" align="center" />
                  <el-table-column prop="gender" label="性别" width="70" align="center" />
                  <el-table-column label="操作" width="80" align="center" fixed="right">
                    <template #default="{ row }">
                      <el-link
                        type="danger"
                        underline="never"
                        @click="removeTeamMember(team.key, row.studentId)"
                      >
                        移除
                      </el-link>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model.trim="team.remark" type="textarea" :rows="2" placeholder="选填" />
            </el-form-item>
          </template>
        </div>
      </template>
    </el-form>

    <template #footer>
      <el-button @click="emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="submit">确认提交</el-button>
    </template>

    <student-picker-modal
      v-model:visible="pickerVisible"
      :match-id="form.matchId"
      :exclude-ids="pickerExcludeIds"
      @confirm="handlePicked"
    />
  </el-dialog>
</template>

<script setup>
  import { computed, reactive, ref, watch } from 'vue';
  import { EleMessage } from 'ele-admin-plus';
  import { ElMessageBox } from 'element-plus';
  import { PlusOutlined } from '@/components/icons';
  import StudentPickerModal from './student-picker-modal.vue';
  import {
    addPersonalEntries,
    addTeamEntry,
    formatParticipantNumberDisplay,
    getItemAutoInfo,
    getItemOptionsByMatch,
    getMatchAutoInfo,
    getRegisterableMatches,
    getScopeSchoolOptions,
    getStudentParticipantNumberInMatch,
    isTeamNameRegisteredInItem
  } from '../data.js';

  const props = defineProps({
    visible: Boolean,
    matchId: { type: [String, Number], default: '' },
    itemId: { type: [String, Number], default: '' }
  });

  const emit = defineEmits(['update:visible', 'done']);

  const lockedMatchId = computed(() => props.matchId || '');
  const registerableMatches = computed(() => getRegisterableMatches());
  const scopeSchoolOptions = getScopeSchoolOptions();
  const form = reactive(createEmptyForm());
  const personalStudents = ref([]);
  const teams = ref([]);
  const pickerVisible = ref(false);
  const pickerTarget = ref({ type: 'personal' });

  const emptyStudentText = '当前权限范围内暂无可报名学生，请检查学校、年级、班级或数据权限。';

  const itemOptions = computed(() => (form.matchId ? getItemOptionsByMatch(form.matchId) : []));
  const matchInfo = computed(() => (form.matchId ? getMatchAutoInfo(form.matchId) : null));
  const itemInfo = computed(() =>
    form.matchId && form.itemId ? getItemAutoInfo(form.matchId, form.itemId) : null
  );

  const pickerExcludeIds = computed(() => {
    if (pickerTarget.value.type === 'personal') {
      return personalStudents.value.map((s) => s.studentId);
    }
    // 团队报名：排除所有队伍已选成员，成员不可跨队重复
    return teams.value.flatMap((team) => team.members.map((m) => m.studentId));
  });

  const displayStudentParticipantNumber = (studentId) =>
    formatParticipantNumberDisplay(getStudentParticipantNumberInMatch(form.matchId, studentId));

  function createEmptyForm() {
    return { matchId: '', itemId: '', remark: '' };
  }

  function createTeam() {
    return {
      key: `team_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      teamName: '',
      school: '',
      remark: '',
      members: [],
      expanded: true
    };
  }

  const resetSelections = () => {
    personalStudents.value = [];
    teams.value = [];
  };

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
      resetSelections();
    }
  );

  // 设项为团体时，保证至少存在一个队伍卡片
  watch(
    () => itemInfo.value?.matchForm,
    (matchForm) => {
      if (matchForm === '团体' && !teams.value.length) {
        teams.value = [createTeam()];
      }
    }
  );

  const handleMatchChange = () => {
    form.itemId = '';
    resetSelections();
  };

  const handleItemChange = () => {
    resetSelections();
    if (itemInfo.value?.matchForm === '团体') {
      teams.value = [createTeam()];
    }
  };

  const openPicker = (target) => {
    pickerTarget.value = target;
    pickerVisible.value = true;
  };

  const handlePicked = (students) => {
    if (pickerTarget.value.type === 'personal') {
      const map = new Map(personalStudents.value.map((s) => [s.studentId, s]));
      students.forEach((s) => map.set(s.studentId, s));
      personalStudents.value = [...map.values()];
      return;
    }
    const team = teams.value.find((item) => item.key === pickerTarget.value.key);
    if (!team) {
      return;
    }
    const map = new Map(team.members.map((s) => [s.studentId, s]));
    students.forEach((s) => map.set(s.studentId, s));
    team.members = [...map.values()];
  };

  const removePersonalStudent = (studentId) => {
    personalStudents.value = personalStudents.value.filter((s) => s.studentId !== studentId);
  };

  const addTeam = () => {
    teams.value.push(createTeam());
  };

  const removeTeam = (index) => {
    if (teams.value.length <= 1) {
      EleMessage.warning({ message: '至少保留一支队伍', plain: true });
      return;
    }
    ElMessageBox.confirm('确认删除该队伍及其已选成员吗？', '删除队伍', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消'
    })
      .then(() => {
        teams.value.splice(index, 1);
      })
      .catch(() => {});
  };

  const removeTeamMember = (teamKey, studentId) => {
    const team = teams.value.find((item) => item.key === teamKey);
    if (team) {
      team.members = team.members.filter((s) => s.studentId !== studentId);
    }
  };

  const submitPersonal = () => {
    if (!personalStudents.value.length) {
      EleMessage.error({ message: '请至少选择 1 名学生', plain: true });
      return false;
    }
    const { added, duplicated } = addPersonalEntries({
      matchId: form.matchId,
      itemId: form.itemId,
      studentIds: personalStudents.value.map((s) => s.studentId),
      remark: form.remark
    });
    if (duplicated.length) {
      EleMessage.warning({
        message: `${duplicated.join('、')} 已在该设项报名，已自动跳过；新增 ${added.length} 人。`,
        plain: true
      });
    }
    return !(!added.length && duplicated.length);
  };

  const submitTeams = () => {
    if (!teams.value.length) {
      EleMessage.error({ message: '请至少添加一支队伍', plain: true });
      return false;
    }
    const nameSet = new Set();
    for (const [index, team] of teams.value.entries()) {
      if (!team.teamName || !team.school) {
        EleMessage.error({ message: `第 ${index + 1} 支队伍请填写队伍名称和所属学校`, plain: true });
        return false;
      }
      if (!team.members.length) {
        EleMessage.error({ message: `第 ${index + 1} 支队伍请至少添加 1 名成员`, plain: true });
        return false;
      }
      if (nameSet.has(team.teamName)) {
        EleMessage.error({ message: `队伍名称「${team.teamName}」重复`, plain: true });
        return false;
      }
      if (isTeamNameRegisteredInItem(form.matchId, form.itemId, team.teamName)) {
        EleMessage.error({ message: `队伍名称「${team.teamName}」在当前设项下已存在`, plain: true });
        return false;
      }
      nameSet.add(team.teamName);
    }
    teams.value.forEach((team) => {
      addTeamEntry({
        matchId: form.matchId,
        itemId: form.itemId,
        teamName: team.teamName,
        school: team.school,
        memberIds: team.members.map((m) => m.studentId),
        remark: team.remark
      });
    });
    return true;
  };

  const submit = () => {
    if (!form.matchId || !form.itemId || !itemInfo.value) {
      EleMessage.error({ message: '请选择比赛和设项', plain: true });
      return;
    }
    const ok = itemInfo.value.matchForm === '团体' ? submitTeams() : submitPersonal();
    if (!ok) {
      return;
    }
    emit('update:visible', false);
    emit('done');
    EleMessage.success({ message: '报名已保存，保险状态将按学生逐人生成或匹配。', plain: true });
  };
</script>

<style scoped lang="scss">
  .auto-info {
    margin-bottom: 16px;
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

  .team-card {
    margin-bottom: 16px;
    padding: 12px 16px;
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
  }

  .team-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .team-card-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .team-card-ops {
    display: flex;
    gap: 12px;
  }
</style>
