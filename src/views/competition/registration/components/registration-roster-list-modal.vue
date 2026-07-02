<!-- 参赛名单明细弹窗（统一名单表格） -->
<template>
  <content-modal
    :model-value="visible"
    :title="modalTitle"
    width="1120px"
    :z-index="zIndex"
    @update:model-value="emit('update:visible', $event)"
  >
    <template v-if="brief">
      <!-- 名单列表视图 -->
      <template v-if="view === 'list'">
        <div class="brief-bar">
          <div class="brief-info">
            <span>{{ brief.matchName }}</span>
            <el-divider direction="vertical" />
            <span>{{ brief.matchTypeLabel }}</span>
            <el-divider direction="vertical" />
            <span>{{ brief.startTime }} 至 {{ brief.endTime }}</span>
            <el-divider direction="vertical" />
            <span>{{ brief.insuranceType }}</span>
            <el-divider direction="vertical" />
            <span>{{ brief.insurancePlan }}</span>
            <el-divider direction="vertical" />
            <span>{{ brief.insuranceMethod }}</span>
          </div>
          <div class="brief-actions">
            <el-button size="small" type="primary" :icon="PlusOutlined" @click="openAdd()">新增报名</el-button>
            <el-button size="small" @click="openImport()">导入名单</el-button>
            <el-button size="small" @click="exportRoster">导出名单</el-button>
          </div>
        </div>

        <template v-if="!allRows.length">
          <el-empty description="当前比赛暂无参赛名单">
            <el-button type="primary" @click="openAdd()">新增报名</el-button>
            <el-button @click="openImport()">导入名单</el-button>
          </el-empty>
        </template>

        <template v-else>
          <el-form label-width="88px" class="filter-form" @submit.prevent="">
            <el-row :gutter="8">
              <el-col :lg="6" :md="8" :xs="24">
                <el-form-item label="设项名称">
                  <el-select v-model="filters.itemId" clearable filterable placeholder="全部" class="ele-fluid">
                    <el-option
                      v-for="item in itemOptions"
                      :key="item.itemId"
                      :label="item.itemName"
                      :value="item.itemId"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :lg="6" :md="8" :xs="24">
                <el-form-item label="学校">
                  <el-select v-model="filters.school" clearable filterable placeholder="全部" class="ele-fluid">
                    <el-option v-for="item in schoolOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :lg="6" :md="8" :xs="24">
                <el-form-item label="年级班级">
                  <el-cascader
                    v-model="filters.gradeClassPath"
                    :options="gradeClassOptions"
                    clearable
                    placeholder="全部"
                    class="ele-fluid"
                  />
                </el-form-item>
              </el-col>
              <el-col :lg="6" :md="8" :xs="24">
                <el-form-item label="学生/团队">
                  <el-input v-model.trim="filters.targetName" clearable placeholder="模糊搜索" />
                </el-form-item>
              </el-col>
              <el-col :lg="6" :md="8" :xs="24">
                <el-form-item label="保险状态">
                  <el-select v-model="filters.insuranceStatus" clearable placeholder="全部" class="ele-fluid">
                    <el-option v-for="opt in INSURANCE_STATUS_OPTIONS" :key="opt" :label="opt" :value="opt" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :lg="6" :md="8" :xs="24">
                <el-form-item label="成绩状态">
                  <el-select v-model="filters.scoreStatus" clearable placeholder="全部" class="ele-fluid">
                    <el-option v-for="opt in SCORE_STATUS_OPTIONS" :key="opt" :label="opt" :value="opt" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :lg="6" :md="8" :xs="24">
                <el-form-item label-width="16px">
                  <el-button type="primary" @click="applyFilter">查询</el-button>
                  <el-button @click="resetFilters">重置</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <div class="table-wrap">
            <el-table :data="filteredRows" border size="small" max-height="420">
              <el-table-column prop="itemName" label="设项名称" min-width="120" fixed="left" show-overflow-tooltip />
              <el-table-column prop="project" label="参赛项目" min-width="110" show-overflow-tooltip />
              <el-table-column prop="matchForm" label="比赛形式" width="90" align="center" />
              <el-table-column label="学生姓名 / 团队名称" min-width="130" show-overflow-tooltip>
                <template #default="{ row }">{{ row.targetName }}</template>
              </el-table-column>
              <el-table-column prop="school" label="学校" min-width="120" show-overflow-tooltip />
              <el-table-column label="年级班级" width="120" align="center">
                <template #default="{ row }">
                  {{ row.rowType === 'personal' ? row.gradeClassOrMemberCount : '-' }}
                </template>
              </el-table-column>
              <el-table-column v-if="showTeamStatColumns" label="成员人数" width="90" align="center">
                <template #default="{ row }">
                  {{ row.rowType === 'team' ? row.gradeClassOrMemberCount : '-' }}
                </template>
              </el-table-column>
              <el-table-column v-if="showTeamStatColumns" label="已参保人数" width="100" align="center">
                <template #default="{ row }">
                  {{ row.rowType === 'team' ? row.insuredCount : '-' }}
                </template>
              </el-table-column>
              <el-table-column label="保险状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="statusTag(row.insuranceStatus)" size="small" effect="plain">
                    {{ row.insuranceStatus }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="scoreStatus" label="成绩状态" width="90" align="center" />
              <el-table-column label="操作" width="260" align="center" fixed="right">
                <template #default="{ row }">
                  <template v-if="row.rowType === 'personal'">
                    <el-link type="primary" underline="never" @click="viewStudentDetail(row)">查看详情</el-link>
                    <el-divider direction="vertical" />
                    <el-link type="primary" underline="never" @click="openInsurance({ scope: 'student', student: row.raw })">
                      查看保险
                    </el-link>
                    <el-divider direction="vertical" />
                    <el-link type="danger" underline="never" @click="removePersonal(row)">移除</el-link>
                  </template>
                  <template v-else>
                    <el-link type="primary" underline="never" @click="viewMembers(row)">查看成员</el-link>
                    <el-divider direction="vertical" />
                    <el-link type="primary" underline="never" @click="editMembers(row)">编辑成员</el-link>
                    <el-divider direction="vertical" />
                    <el-link type="primary" underline="never" @click="openInsurance({ scope: 'team', teamId: row.teamId })">
                      查看保险
                    </el-link>
                    <el-divider direction="vertical" />
                    <el-link type="danger" underline="never" @click="removeTeam(row)">移除</el-link>
                  </template>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </template>

      <!-- 团队成员明细 -->
      <template v-else>
        <div class="member-head">
          <el-button link type="primary" @click="view = 'list'">返回名单列表</el-button>
          <span class="member-summary">
            <span>团队名称：{{ currentTeam?.teamName }}</span>
            <span>所属学校：{{ currentTeam?.school }}</span>
            <span>设项名称：{{ currentTeam?.itemName }}</span>
            <span>成员人数：{{ currentTeam?.members?.length || 0 }}</span>
            <span>已参保人数：{{ memberInsuredCount }}</span>
          </span>
        </div>
        <div class="table-wrap">
          <el-table :data="currentTeam?.members || []" border size="small" max-height="420">
            <el-table-column prop="name" label="学生姓名" width="100" fixed="left" />
            <el-table-column prop="idNo" label="证件号" min-width="160" show-overflow-tooltip />
            <el-table-column prop="gender" label="性别" width="70" align="center" />
            <el-table-column prop="school" label="学校" min-width="120" show-overflow-tooltip />
            <el-table-column prop="gradeClass" label="年级班级" width="120" />
            <el-table-column label="保险状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="statusTag(row.insuranceStatus)" size="small" effect="plain">
                  {{ row.insuranceStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="exceptionReason" label="异常原因" min-width="140">
              <template #default="{ row }">{{ row.exceptionReason || '-' }}</template>
            </el-table-column>
            <el-table-column label="操作" width="160" align="center" fixed="right">
              <template #default="{ row }">
                <el-link type="primary" underline="never" @click="openInsurance({ scope: 'member', student: row })">
                  查看保险
                </el-link>
                <el-divider direction="vertical" />
                <el-link type="danger" underline="never" @click="removeMember(row)">移除成员</el-link>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
    </template>

    <template #footer>
      <el-button @click="emit('update:visible', false)">关闭</el-button>
    </template>

    <registration-add-modal
      v-model:visible="addVisible"
      :match-id="matchId"
      :item-id="presetItemId"
      @done="reload"
    />
    <registration-import-modal
      v-model:visible="importVisible"
      :match-id="matchId"
      :item-id="presetItemId"
      @done="reload"
    />
    <registration-insurance-modal
      v-model:visible="insuranceVisible"
      :context="insuranceContext"
      :z-index="zIndex + 2"
    />
    <student-picker-modal
      v-model:visible="editMemberVisible"
      :exclude-ids="[]"
      @confirm="handleEditMembers"
    />
    <el-dialog v-model="studentVisible" title="学生报名详情" width="560px" append-to-body destroy-on-close>
      <el-descriptions v-if="currentStudent" :column="2" border size="small">
        <el-descriptions-item label="学生姓名">{{ currentStudent.studentName }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ currentStudent.gender || '-' }}</el-descriptions-item>
        <el-descriptions-item label="证件号">{{ currentStudent.idNo }}</el-descriptions-item>
        <el-descriptions-item label="学校">{{ currentStudent.school }}</el-descriptions-item>
        <el-descriptions-item label="年级班级">{{ currentStudent.gradeClass }}</el-descriptions-item>
        <el-descriptions-item label="设项名称">{{ currentStudent.itemName }}</el-descriptions-item>
        <el-descriptions-item label="保险状态">{{ currentStudent.insuranceStatus }}</el-descriptions-item>
        <el-descriptions-item label="成绩状态">{{ currentStudent.scoreStatus }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ currentStudent.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </content-modal>
</template>

<script setup>
  import { computed, reactive, ref, watch } from 'vue';
  import { EleMessage } from 'ele-admin-plus';
  import { ElMessageBox } from 'element-plus';
  import { PlusOutlined } from '@/components/icons';
  import { INSURANCE_STATUS_OPTIONS } from '@/views/competition/insurance/data.js';
  import ContentModal from './content-modal.vue';
  import RegistrationAddModal from './registration-add-modal.vue';
  import RegistrationImportModal from './registration-import-modal.vue';
  import RegistrationInsuranceModal from './registration-insurance-modal.vue';
  import StudentPickerModal from './student-picker-modal.vue';
  import {
    SCORE_STATUS_OPTIONS,
    filterMatchRosterRows,
    getGradeClassCascaderOptions,
    getItemOptionsByMatch,
    getMatchItemFormLayout,
    getMatchRosterBrief,
    getMatchRosterRows,
    getStudentSchoolOptions,
    getTeamEntriesByItem,
    removePersonalEntry,
    removeTeamEntry,
    removeTeamMember,
    updateTeamMembers
  } from '../data.js';

  const props = defineProps({
    visible: Boolean,
    matchId: { type: [String, Number], default: '' },
    zIndex: { type: Number, default: 22 }
  });

  const emit = defineEmits(['update:visible', 'done']);

  const view = ref('list');
  const brief = ref(null);
  const allRows = ref([]);
  const filteredRows = ref([]);
  const rosterVersion = ref(0);
  const currentTeam = ref(null);
  const currentStudent = ref(null);
  const addVisible = ref(false);
  const importVisible = ref(false);
  const insuranceVisible = ref(false);
  const studentVisible = ref(false);
  const editMemberVisible = ref(false);
  const presetItemId = ref('');
  const editingTeamId = ref('');
  const insuranceContext = ref({});

  const filters = reactive(createFilters());
  const schoolOptions = getStudentSchoolOptions();
  const gradeClassOptions = getGradeClassCascaderOptions();

  const itemOptions = computed(() => (props.matchId ? getItemOptionsByMatch(props.matchId) : []));

  const showTeamStatColumns = computed(
    () => getMatchItemFormLayout(props.matchId) !== 'personal-only'
  );

  const modalTitle = computed(() =>
    brief.value?.matchName ? `参赛名单 - ${brief.value.matchName}` : '参赛名单'
  );

  const memberInsuredCount = computed(
    () => currentTeam.value?.members?.filter((member) => member.insuranceStatus === '已参保').length || 0
  );

  function createFilters() {
    return {
      itemId: '',
      school: '',
      gradeClassPath: [],
      targetName: '',
      insuranceStatus: '',
      scoreStatus: ''
    };
  }

  const reload = () => {
    rosterVersion.value += 1;
    brief.value = getMatchRosterBrief(props.matchId);
    allRows.value = getMatchRosterRows(props.matchId);
    applyFilter();
    if (currentTeam.value) {
      const teams = getTeamEntriesByItem(props.matchId, currentTeam.value.itemId);
      currentTeam.value = teams.find((team) => team.teamId === currentTeam.value.teamId) || null;
      if (!currentTeam.value) {
        view.value = 'list';
      }
    }
    emit('done');
  };

  const applyFilter = () => {
    void rosterVersion.value;
    filteredRows.value = filterMatchRosterRows(allRows.value, filters);
  };

  const resetFilters = () => {
    Object.assign(filters, createFilters());
    applyFilter();
  };

  watch(
    () => props.visible,
    (value) => {
      if (value && props.matchId) {
        view.value = 'list';
        currentTeam.value = null;
        presetItemId.value = '';
        Object.assign(filters, createFilters());
        reload();
      }
    }
  );

  const statusTag = (status) => {
    const map = { 已参保: 'success', 部分参保: 'warning', 待参保: 'info', 异常: 'danger' };
    return map[status] || 'info';
  };

  const openAdd = (itemId = '') => {
    presetItemId.value = itemId;
    addVisible.value = true;
  };

  const openImport = (itemId = '') => {
    presetItemId.value = itemId;
    importVisible.value = true;
  };

  const exportRoster = () => {
    EleMessage.success({ message: `${brief.value?.matchName || ''}名单已生成导出任务。`, plain: true });
  };

  const openInsurance = (context) => {
    insuranceContext.value = { matchId: props.matchId, ...context };
    insuranceVisible.value = true;
  };

  const viewStudentDetail = (row) => {
    currentStudent.value = row.raw;
    studentVisible.value = true;
  };

  const viewMembers = (row) => {
    currentTeam.value = row.raw;
    view.value = 'members';
  };

  const editMembers = (row) => {
    editingTeamId.value = row.teamId;
    editMemberVisible.value = true;
  };

  const handleEditMembers = (students) => {
    updateTeamMembers(editingTeamId.value, students.map((student) => student.studentId));
    reload();
    EleMessage.success({ message: '团队成员已更新', plain: true });
  };

  const removePersonal = (row) => {
    ElMessageBox.confirm(`确定移除 ${row.targetName} 的报名？`, '移除报名', { type: 'warning' })
      .then(() => {
        removePersonalEntry(row.entryId);
        reload();
        EleMessage.success({ message: '已移除', plain: true });
      })
      .catch(() => {});
  };

  const removeTeam = (row) => {
    ElMessageBox.confirm(`确定移除团队 ${row.targetName}？`, '移除团队', { type: 'warning' })
      .then(() => {
        removeTeamEntry(row.teamId);
        reload();
        EleMessage.success({ message: '已移除', plain: true });
      })
      .catch(() => {});
  };

  const removeMember = (member) => {
    ElMessageBox.confirm(`确定移除成员 ${member.name}？`, '移除成员', { type: 'warning' })
      .then(() => {
        removeTeamMember(currentTeam.value.teamId, member.studentId);
        reload();
        EleMessage.success({ message: '成员已移除', plain: true });
      })
      .catch(() => {});
  };
</script>

<style scoped lang="scss">
  .brief-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
    padding: 12px 14px;
    background: var(--el-fill-color-light);
    border-radius: 6px;
  }

  .brief-info {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 0;
    align-items: center;
    font-size: 13px;
    color: var(--el-text-color-regular);
    line-height: 1.6;
  }

  .brief-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .filter-form {
    margin-bottom: 8px;
  }

  .table-wrap {
    width: 100%;
    overflow-x: auto;
  }

  .member-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 16px;
    margin-bottom: 12px;
  }

  .member-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 13px;
    color: var(--el-text-color-regular);
  }
</style>
