<!-- 每日积分赛参与记录弹窗（主内容区域内居中） -->
<template>
  <content-modal
    :model-value="visible"
    :title="modalTitle"
    width="1080px"
    :z-index="20"
    @update:model-value="emit('update:visible', $event)"
  >
    <template v-if="detail">
      <template v-if="view === 'summary'">
        <div class="block-title">基础信息</div>
        <el-descriptions :column="3" border size="small" class="mb-16">
          <el-descriptions-item label="赛事活动">{{ detail.activityName }}</el-descriptions-item>
          <el-descriptions-item label="赛段">{{ detail.stageName }}</el-descriptions-item>
          <el-descriptions-item label="比赛类型">{{ detail.matchTypeLabel }}</el-descriptions-item>
          <el-descriptions-item label="比赛名称">{{ detail.matchName }}</el-descriptions-item>
          <el-descriptions-item label="统计周期" :span="2">{{ detail.period }}</el-descriptions-item>
          <el-descriptions-item label="保险类型">{{ detail.insuranceType }}</el-descriptions-item>
          <el-descriptions-item label="保险方式">{{ detail.insuranceMethod }}</el-descriptions-item>
          <el-descriptions-item label="保险方案">{{ detail.insurancePlan }}</el-descriptions-item>
        </el-descriptions>

        <div class="stat-row">
          <div v-for="stat in statCards" :key="stat.label" class="stat-item">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ stat.value }}</div>
          </div>
        </div>

        <div class="block-title-row">
          <div class="block-title">学生积分汇总</div>
          <div>
            <el-button size="small" @click="exportRecord">导出记录</el-button>
          </div>
        </div>

        <el-form :inline="true" class="filter-row" @submit.prevent="">
          <el-form-item label="学生姓名">
            <el-input v-model.trim="filters.name" clearable placeholder="模糊搜索" style="width: 130px" />
          </el-form-item>
          <el-form-item label="学校">
            <el-select
              v-model="filters.school"
              clearable
              placeholder="全部"
              style="width: 140px"
              @change="handleSchoolChange"
            >
              <el-option v-for="item in schoolOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="年级">
            <el-select
              v-model="filters.grade"
              clearable
              placeholder="全部"
              style="width: 120px"
              :disabled="!filters.school"
              @change="handleGradeChange"
            >
              <el-option v-for="item in gradeOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="班级">
            <el-select
              v-model="filters.className"
              clearable
              placeholder="全部"
              style="width: 120px"
              :disabled="!filters.school || !filters.grade"
            >
              <el-option v-for="item in classOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="积分来源">
            <el-select v-model="filters.source" clearable placeholder="全部" style="width: 130px">
              <el-option v-for="item in DAILY_POINT_SOURCES" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="保险状态">
            <el-select v-model="filters.insuranceStatus" clearable placeholder="全部" style="width: 120px">
              <el-option v-for="opt in statusOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
          </el-form-item>
        </el-form>

        <div class="table-wrap">
          <el-table :data="filteredStudents" border size="small" max-height="380">
            <el-table-column prop="studentName" label="学生姓名" width="100" fixed="left" />
            <el-table-column prop="school" label="学校" min-width="130" show-overflow-tooltip />
            <el-table-column prop="gradeClass" label="年级班级" width="120" />
            <el-table-column prop="totalPoints" label="累计积分" width="90" align="center" />
            <el-table-column prop="latestPoints" label="今日积分" width="110" align="center" />
            <el-table-column prop="latestTime" label="最近积分时间" width="150" align="center" />
            <el-table-column label="保险状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="statusTag(row.insuranceStatus)" size="small" effect="plain">
                  {{ row.insuranceStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="center" fixed="right">
              <template #default="{ row }">
                <el-link type="primary" underline="never" @click="viewPointDetail(row)">查看积分明细</el-link>
                <el-divider direction="vertical" />
                <el-link type="primary" underline="never" @click="openInsurance({ scope: 'student', student: row, fromDaily: true })">
                  查看保险
                </el-link>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>

      <!-- 积分明细 -->
      <template v-else>
        <div class="roster-head">
          <el-button link type="primary" @click="view = 'summary'">返回汇总列表</el-button>
          <span class="roster-title">{{ currentStudent?.studentName }} - 积分明细</span>
        </div>
        <div class="table-wrap">
          <el-table :data="currentStudent?.details || []" border size="small">
            <el-table-column prop="time" label="获得时间" width="160" />
            <el-table-column prop="source" label="积分来源" width="120" align="center" />
            <el-table-column prop="points" label="获得积分" width="90" align="center" />
            <el-table-column prop="relation" label="关联记录" min-width="160" show-overflow-tooltip />
            <el-table-column prop="remark" label="备注" min-width="120">
              <template #default="{ row }">{{ row.remark || '-' }}</template>
            </el-table-column>
          </el-table>
        </div>
      </template>
    </template>

    <template #footer>
      <el-button @click="emit('update:visible', false)">关闭</el-button>
    </template>
  </content-modal>
</template>

<script setup>
  import { computed, reactive, ref, watch } from 'vue';
  import { EleMessage } from 'ele-admin-plus';
  import ContentModal from './content-modal.vue';
  import {
    DAILY_POINT_SOURCES,
    getDailyRecordClassOptions,
    getDailyRecordDetail,
    getDailyRecordGradeOptions,
    getDailyRecordSchoolOptions,
    REGISTRATION_INSURANCE_STATUS_OPTIONS
  } from '../data.js';

  const props = defineProps({
    visible: Boolean,
    matchId: { type: [String, Number], default: '' }
  });

  const emit = defineEmits(['update:visible', 'view-insurance']);

  const detail = ref(null);
  const view = ref('summary');
  const currentStudent = ref(null);
  const statusOptions = REGISTRATION_INSURANCE_STATUS_OPTIONS;
  const filters = reactive({ name: '', school: '', grade: '', className: '', source: '', insuranceStatus: '' });

  const schoolOptions = computed(() => getDailyRecordSchoolOptions(props.matchId));
  const gradeOptions = computed(() => getDailyRecordGradeOptions(props.matchId, filters.school));
  const classOptions = computed(() =>
    getDailyRecordClassOptions(props.matchId, filters.school, filters.grade)
  );

  const modalTitle = computed(() =>
    detail.value?.matchName ? `参与记录 - ${detail.value.matchName}` : '每日积分赛参与记录'
  );

  const statCards = computed(() => {
    const s = detail.value?.stats || {};
    return [
      { label: '参与学生数', value: s.studentCount ?? 0 },
      { label: '参与学校数', value: s.schoolCount ?? 0 },
      { label: '积分记录数', value: s.recordCount ?? 0 },
      { label: '累计积分', value: s.totalPoints ?? 0 },
      { label: '已参保人数', value: s.insuredCount ?? 0 },
      { label: '待参保人数', value: s.pendingCount ?? 0 },
      { label: '异常人数', value: s.exceptionCount ?? 0 }
    ];
  });

  const filteredStudents = computed(() => {
    let list = detail.value?.students || [];
    if (filters.name) {
      list = list.filter((row) => row.studentName.includes(filters.name));
    }
    if (filters.school) {
      list = list.filter((row) => row.school === filters.school);
    }
    if (filters.grade) {
      list = list.filter((row) => row.grade === filters.grade);
    }
    if (filters.className) {
      list = list.filter((row) => row.className === filters.className);
    }
    if (filters.insuranceStatus) {
      list = list.filter((row) => row.insuranceStatus === filters.insuranceStatus);
    }
    if (filters.source) {
      list = list.filter((row) => row.details.some((d) => d.source === filters.source));
    }
    return list;
  });

  watch(
    () => props.visible,
    (value) => {
      if (value && props.matchId) {
        view.value = 'summary';
        currentStudent.value = null;
        Object.assign(filters, {
          name: '',
          school: '',
          grade: '',
          className: '',
          source: '',
          insuranceStatus: ''
        });
        detail.value = getDailyRecordDetail(props.matchId);
      }
    }
  );

  const handleSchoolChange = () => {
    filters.grade = '';
    filters.className = '';
  };

  const handleGradeChange = () => {
    filters.className = '';
  };

  const statusTag = (status) => {
    const map = { 已参保: 'success', 待参保: 'info' };
    return map[status] || 'info';
  };

  const viewPointDetail = (row) => {
    currentStudent.value = row;
    view.value = 'detail';
  };

  const openInsurance = (context) => {
    emit('view-insurance', { matchId: props.matchId, ...context });
  };

  const exportRecord = () => {
    EleMessage.success({ message: '积分记录已生成导出任务。', plain: true });
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
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }

  .stat-item {
    padding: 10px 12px;
    background: var(--el-fill-color-light);
    border-radius: 6px;
  }

  .stat-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .stat-value {
    margin-top: 6px;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .filter-row {
    margin-bottom: 8px;
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

  .table-wrap {
    width: 100%;
    overflow-x: auto;
  }

  @media (max-width: 992px) {
    .stat-row {
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>
