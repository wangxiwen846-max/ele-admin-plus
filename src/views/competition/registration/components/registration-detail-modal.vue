<!-- 参赛名单详情弹窗（主内容区域内居中） -->
<template>
  <content-modal
    :model-value="visible"
    :title="modalTitle"
    width="1080px"
    :z-index="20"
    @update:model-value="emit('update:visible', $event)"
  >
    <template v-if="detail">
      <!-- 主视图 -->
      <template v-if="view === 'main'">
        <div class="block-title">比赛基础信息</div>
        <el-descriptions :column="3" border size="small" class="mb-16">
          <el-descriptions-item label="赛事活动">{{ detail.activityName }}</el-descriptions-item>
          <el-descriptions-item label="赛段">{{ detail.stageName }}</el-descriptions-item>
          <el-descriptions-item label="比赛类型">{{ detail.matchTypeLabel }}</el-descriptions-item>
          <el-descriptions-item label="比赛名称">{{ detail.matchName }}</el-descriptions-item>
          <el-descriptions-item label="比赛时间" :span="2">
            {{ detail.startTime }} 至 {{ detail.endTime }}
          </el-descriptions-item>
          <el-descriptions-item label="报名方式">{{ detail.reportMethod }}</el-descriptions-item>
          <el-descriptions-item label="保险类型">{{ detail.insuranceType }}</el-descriptions-item>
          <el-descriptions-item label="保险方式">{{ detail.insuranceMethod }}</el-descriptions-item>
          <el-descriptions-item label="保险方案" :span="3">{{ detail.insurancePlan }}</el-descriptions-item>
        </el-descriptions>

        <div class="stat-row">
          <div v-for="stat in statCards" :key="stat.label" class="stat-item">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ stat.value }}</div>
          </div>
        </div>

        <div class="block-title-row">
          <div class="block-title">设项报名统计</div>
          <div>
            <el-button size="small" :icon="PlusOutlined" @click="openAdd()">新增报名</el-button>
            <el-button size="small" @click="openImport()">导入名单</el-button>
            <el-button size="small" @click="openInsurance({ scope: 'match' })">查看保险</el-button>
          </div>
        </div>
        <div class="table-wrap">
          <el-table :data="detail.itemStats" border size="small">
            <el-table-column prop="itemName" label="设项名称" min-width="120" fixed="left" />
            <el-table-column prop="project" label="参赛项目" min-width="120" />
            <el-table-column prop="matchForm" label="比赛形式" width="90" align="center" />
            <el-table-column
              v-if="showParticipantCountColumn"
              prop="participantCount"
              label="报名人数"
              width="90"
              align="center"
            />
            <el-table-column v-if="showTeamCountColumn" label="团队数" width="80" align="center">
              <template #default="{ row }">{{ formatItemTeamStat(row, 'teamCount') }}</template>
            </el-table-column>
            <el-table-column v-if="showMemberCountColumn" label="成员人数" width="90" align="center">
              <template #default="{ row }">{{ formatItemTeamStat(row, 'memberCount') }}</template>
            </el-table-column>
            <el-table-column v-if="showInsuredCountColumn" label="已参保人数" width="100" align="center">
              <template #default="{ row }">{{ formatItemTeamStat(row, 'insuredCount') }}</template>
            </el-table-column>
            <el-table-column label="保险状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="statusTag(row.insuranceStatus)" size="small" effect="plain">
                  {{ row.insuranceStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="scoreStatus" label="成绩状态" width="90" align="center" />
            <el-table-column label="操作" width="240" align="center" fixed="right">
              <template #default="{ row }">
                <el-link type="primary" underline="never" @click="openAdd(row)">新增报名</el-link>
                <el-divider direction="vertical" />
                <el-link type="primary" underline="never" @click="openImport(row)">导入名单</el-link>
                <el-divider direction="vertical" />
                <el-link type="primary" underline="never" @click="openRoster(row)">查看名单</el-link>
                <el-divider direction="vertical" />
                <el-link type="primary" underline="never" @click="openInsurance({ scope: 'item', itemId: row.itemId })">
                  查看保险
                </el-link>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>

      <!-- 名单明细视图 -->
      <template v-else-if="view === 'roster'">
        <div class="roster-head">
          <el-button link type="primary" @click="backToMain">返回设项统计</el-button>
          <span class="roster-title">{{ currentItem?.itemName }}（{{ currentItem?.matchForm }}）</span>
        </div>
        <!-- 个人名单 -->
        <div v-if="currentItem?.matchForm === '个人'" class="table-wrap">
          <el-table :data="personalRows" border size="small">
            <el-table-column prop="itemName" label="设项名称" min-width="120" fixed="left" />
            <el-table-column :label="'参赛项目'" min-width="110">
              <template #default>{{ currentItem?.project || '-' }}</template>
            </el-table-column>
            <el-table-column label="比赛形式" width="90" align="center">
              <template #default>个人</template>
            </el-table-column>
            <el-table-column prop="studentName" label="学生姓名" width="100" />
            <el-table-column prop="school" label="学校" min-width="130" show-overflow-tooltip />
            <el-table-column prop="gradeClass" label="年级班级" width="120" />
            <el-table-column label="保险状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="statusTag(row.insuranceStatus)" size="small" effect="plain">
                  {{ row.insuranceStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="scoreStatus" label="成绩状态" width="90" align="center" />
            <el-table-column label="操作" width="220" align="center" fixed="right">
              <template #default="{ row }">
                <el-link type="primary" underline="never" @click="viewStudent(row)">查看详情</el-link>
                <el-divider direction="vertical" />
                <el-link type="primary" underline="never" @click="openInsurance({ scope: 'student', student: row })">
                  查看保险
                </el-link>
                <el-divider direction="vertical" />
                <el-link type="danger" underline="never" @click="removePersonal(row)">移除</el-link>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!-- 团体名单 -->
        <div v-else class="table-wrap">
          <el-table :data="teamRows" border size="small">
            <el-table-column prop="itemName" label="设项名称" min-width="120" fixed="left" />
            <el-table-column :label="'参赛项目'" min-width="110">
              <template #default>{{ currentItem?.project || '-' }}</template>
            </el-table-column>
            <el-table-column label="比赛形式" width="90" align="center">
              <template #default>团体</template>
            </el-table-column>
            <el-table-column prop="teamName" label="团队名称" min-width="140" />
            <el-table-column prop="school" label="学校" min-width="130" show-overflow-tooltip />
            <el-table-column prop="memberCount" label="成员人数" width="90" align="center" />
            <el-table-column prop="insuredCount" label="已参保人数" width="100" align="center" />
            <el-table-column label="保险状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="statusTag(row.insuranceStatus)" size="small" effect="plain">
                  {{ row.insuranceStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="scoreStatus" label="成绩状态" width="90" align="center" />
            <el-table-column label="操作" width="280" align="center" fixed="right">
              <template #default="{ row }">
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
            </el-table-column>
          </el-table>
        </div>
      </template>

      <!-- 团队成员明细视图 -->
      <template v-else-if="view === 'members'">
        <div class="roster-head">
          <el-button link type="primary" @click="view = 'roster'">返回团队列表</el-button>
          <span class="roster-summary">
            <span>当前团队：{{ currentTeam?.teamName }}</span>
            <span>所属学校：{{ currentTeam?.school }}</span>
            <span>成员人数：{{ currentTeam?.members?.length || 0 }}</span>
          </span>
        </div>
        <div class="table-wrap">
          <el-table :data="currentTeam?.members || []" border size="small">
            <el-table-column prop="name" label="学生姓名" width="100" fixed="left" />
            <el-table-column prop="idNo" label="证件号" min-width="160" show-overflow-tooltip />
            <el-table-column prop="gender" label="性别" width="70" align="center" />
            <el-table-column prop="school" label="学校" min-width="130" show-overflow-tooltip />
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
            <el-table-column label="操作" width="100" align="center" fixed="right">
              <template #default="{ row }">
                <el-link type="primary" underline="never" @click="openInsurance({ scope: 'member', student: row })">
                  查看保险
                </el-link>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
    </template>

    <template #footer>
      <el-button @click="emit('update:visible', false)">关闭</el-button>
    </template>

    <!-- 学生详情小弹窗 -->
    <el-dialog v-model="studentVisible" title="学生详情" width="560px" append-to-body>
      <el-descriptions v-if="currentStudent" :column="2" border size="small">
        <el-descriptions-item label="学生姓名">{{ currentStudent.studentName }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ currentStudent.gender || '-' }}</el-descriptions-item>
        <el-descriptions-item label="证件号">{{ currentStudent.idNo }}</el-descriptions-item>
        <el-descriptions-item label="学校">{{ currentStudent.school }}</el-descriptions-item>
        <el-descriptions-item label="年级班级">{{ currentStudent.gradeClass }}</el-descriptions-item>
        <el-descriptions-item label="保险状态">{{ currentStudent.insuranceStatus }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <registration-add-modal
      v-model:visible="addVisible"
      :match-id="matchId"
      :item-id="addItemId"
      @done="reloadDetail"
    />
    <registration-import-modal
      v-model:visible="importVisible"
      :match-id="matchId"
      :item-id="importItemId"
      @done="reloadDetail"
    />
    <student-picker-modal
      v-model:visible="editMemberVisible"
      :exclude-ids="[]"
      @confirm="handleEditMembers"
    />
  </content-modal>
</template>

<script setup>
  import { computed, ref, watch } from 'vue';
  import { EleMessage } from 'ele-admin-plus';
  import { ElMessageBox } from 'element-plus';
  import { PlusOutlined } from '@/components/icons';
  import ContentModal from './content-modal.vue';
  import RegistrationAddModal from './registration-add-modal.vue';
  import RegistrationImportModal from './registration-import-modal.vue';
  import StudentPickerModal from './student-picker-modal.vue';
  import {
    getPersonalEntriesByItem,
    getMatchItemFormLayout,
    getRegistrationDetail,
    getTeamEntriesByItem,
    removePersonalEntry,
    removeTeamEntry,
    updateTeamMembers
  } from '../data.js';

  const props = defineProps({
    visible: Boolean,
    matchId: { type: [String, Number], default: '' }
  });

  const emit = defineEmits(['update:visible', 'done', 'view-insurance']);

  const detail = ref(null);
  const view = ref('main');
  const currentItem = ref(null);
  const currentTeam = ref(null);
  const currentStudent = ref(null);
  const studentVisible = ref(false);
  const addVisible = ref(false);
  const importVisible = ref(false);
  const addItemId = ref('');
  const importItemId = ref('');
  const editMemberVisible = ref(false);
  const editingTeamId = ref('');
  const rosterVersion = ref(0);

  const modalTitle = computed(() => {
    const name = detail.value?.matchName ? `参赛名单 - ${detail.value.matchName}` : '参赛名单详情';
    return name;
  });

  const statCards = computed(() => {
    const d = detail.value || {};
    return [
      { label: '设项数量', value: d.itemCount ?? 0 },
      { label: '参赛人数', value: d.participantCount ?? 0 },
      { label: '团队数', value: d.teamCount || '-' },
      { label: '已参保人数', value: d.insuredCount ?? 0 },
      { label: '待参保人数', value: d.pendingCount ?? 0 },
      { label: '异常人数', value: d.exceptionCount ?? 0 }
    ];
  });

  /** personal-only | team-only | mixed */
  const itemStatsLayout = computed(() => getMatchItemFormLayout(props.matchId));

  const showParticipantCountColumn = computed(() => itemStatsLayout.value !== 'team-only');
  const showTeamCountColumn = computed(() => itemStatsLayout.value !== 'personal-only');
  const showMemberCountColumn = computed(() => itemStatsLayout.value !== 'personal-only');
  const showInsuredCountColumn = computed(() => itemStatsLayout.value !== 'personal-only');

  const formatItemTeamStat = (row, field) => {
    if (itemStatsLayout.value === 'mixed' && row.matchForm === '个人') {
      return '-';
    }
    const value = row[field];
    return value === 0 || value ? value : '-';
  };

  const personalRows = computed(() => {
    void rosterVersion.value;
    return currentItem.value ? getPersonalEntriesByItem(props.matchId, currentItem.value.itemId) : [];
  });

  const teamRows = computed(() => {
    void rosterVersion.value;
    return currentItem.value ? getTeamEntriesByItem(props.matchId, currentItem.value.itemId) : [];
  });

  const reloadDetail = () => {
    detail.value = getRegistrationDetail(props.matchId);
    rosterVersion.value += 1;
    if (currentTeam.value) {
      currentTeam.value =
        getTeamEntriesByItem(props.matchId, currentItem.value?.itemId).find(
          (t) => t.teamId === currentTeam.value.teamId
        ) || currentTeam.value;
    }
    emit('done');
  };

  watch(
    () => props.visible,
    (value) => {
      if (value && props.matchId) {
        view.value = 'main';
        currentItem.value = null;
        currentTeam.value = null;
        reloadDetail();
      }
    }
  );

  const statusTag = (status) => {
    const map = { 已参保: 'success', 部分参保: 'warning', 待参保: 'info', 异常: 'danger' };
    return map[status] || 'info';
  };

  const backToMain = () => {
    view.value = 'main';
    currentItem.value = null;
  };

  const openAdd = (row) => {
    addItemId.value = row?.itemId || currentItem.value?.itemId || '';
    addVisible.value = true;
  };

  const openImport = (row) => {
    importItemId.value = row?.itemId || currentItem.value?.itemId || '';
    importVisible.value = true;
  };

  const openRoster = (row) => {
    currentItem.value = row;
    view.value = 'roster';
  };

  const openInsurance = (context) => {
    emit('view-insurance', { matchId: props.matchId, ...context });
  };

  const viewStudent = (row) => {
    currentStudent.value = row;
    studentVisible.value = true;
  };

  const removePersonal = (row) => {
    ElMessageBox.confirm(`确定移除 ${row.studentName} 的报名？`, '移除报名', { type: 'warning' })
      .then(() => {
        removePersonalEntry(row.entryId);
        reloadDetail();
        EleMessage.success({ message: '已移除', plain: true });
      })
      .catch(() => {});
  };

  const removeTeam = (row) => {
    ElMessageBox.confirm(`确定移除团队 ${row.teamName}？`, '移除团队', { type: 'warning' })
      .then(() => {
        removeTeamEntry(row.teamId);
        reloadDetail();
        EleMessage.success({ message: '已移除', plain: true });
      })
      .catch(() => {});
  };

  const viewMembers = (row) => {
    currentTeam.value = row;
    view.value = 'members';
  };

  const editMembers = (row) => {
    editingTeamId.value = row.teamId;
    editMemberVisible.value = true;
  };

  const handleEditMembers = (students) => {
    updateTeamMembers(editingTeamId.value, students.map((s) => s.studentId));
    reloadDetail();
    EleMessage.success({ message: '团队成员已更新', plain: true });
  };
</script>

<style scoped lang="scss">
  .mb-16 {
    margin-bottom: 16px;
  }

  .block-title {
    margin-bottom: 12px;
    padding-left: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    border-left: 3px solid var(--el-color-primary);
  }

  .block-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 4px 0 12px;

    .block-title {
      margin-bottom: 0;
    }
  }

  .stat-row {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .stat-item {
    padding: 12px 14px;
    background: var(--el-fill-color-light);
    border-radius: 6px;
  }

  .stat-label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .stat-value {
    margin-top: 6px;
    font-size: 22px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .roster-head {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
  }

  .roster-title {
    font-size: 14px;
    font-weight: 600;
  }

  .roster-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  .table-wrap {
    width: 100%;
    overflow-x: auto;
  }

  @media (max-width: 768px) {
    .stat-row {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
