<!-- 每日积分赛覆盖学生名单 -->
<template>
  <ele-modal
    v-model="visible"
    :width="'86%'"
    :title="modalTitle"
    :body-style="{ padding: '0' }"
    @closed="$emit('closed')"
  >
    <div v-if="match" class="participant-scroll">
      <div class="overview-card">
        <el-row :gutter="12">
          <el-col :md="6" :sm="12" :xs="12">
            <div class="stat-item">
              <div class="stat-label">覆盖学生数</div>
              <div class="stat-value">{{ stats.covered }}</div>
            </div>
          </el-col>
          <el-col :md="6" :sm="12" :xs="12">
            <div class="stat-item">
              <div class="stat-label">已产生积分学生数</div>
              <div class="stat-value">{{ stats.scored }}</div>
            </div>
          </el-col>
          <el-col :md="6" :sm="12" :xs="12">
            <div class="stat-item">
              <div class="stat-label">未产生积分学生数</div>
              <div class="stat-value">{{ stats.unscored }}</div>
            </div>
          </el-col>
          <el-col :md="6" :sm="12" :xs="12">
            <div class="stat-item">
              <div class="stat-label">参与方式</div>
              <div class="stat-value stat-value--sm">无需报名，自动参与</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="filter-bar">
        <el-select v-model="filters.school" clearable placeholder="学校" style="width: 160px">
          <el-option v-for="opt in schoolOptions" :key="opt" :label="opt" :value="opt" />
        </el-select>
        <el-select v-model="filters.grade" clearable placeholder="年级" style="width: 120px">
          <el-option v-for="opt in gradeOptions" :key="opt" :label="opt" :value="opt" />
        </el-select>
        <el-select v-model="filters.className" clearable placeholder="班级" style="width: 120px">
          <el-option v-for="opt in classOptions" :key="opt" :label="opt" :value="opt" />
        </el-select>
        <el-input v-model="filters.keyword" clearable placeholder="搜索学生姓名" style="width: 180px" />
      </div>

      <el-table :data="filteredRows" border size="small">
        <el-table-column prop="studentName" label="学生姓名" width="100" fixed="left" />
        <el-table-column prop="school" label="学校" min-width="140" show-overflow-tooltip />
        <el-table-column label="年级班级" min-width="120">
          <template #default="{ row }">{{ row.grade }}{{ row.className }}</template>
        </el-table-column>
        <el-table-column prop="participationStatus" label="参与状态" width="100" align="center" />
        <el-table-column prop="scoreStatus" label="是否产生积分" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.hasScore ? 'success' : 'info'" size="small" effect="plain">
              {{ row.scoreStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dailyPoints" label="日积分" width="88" align="center" />
        <el-table-column prop="weeklyPoints" label="周积分" width="88" align="center" />
        <el-table-column prop="stagePoints" label="阶段累计积分" width="116" align="center" />
        <el-table-column prop="lastScoreDate" label="最近积分日期" width="120" align="center" />
        <el-table-column label="操作" width="88" align="center" fixed="right">
          <template #default>
            <el-link type="primary" underline="never">查看明细</el-link>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </ele-modal>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import { isDailyMatch } from '../data.js';

  const props = defineProps({
    match: {
      type: Object,
      required: true
    }
  });

  defineEmits(['closed']);

  const visible = ref(true);
  const filters = ref({
    school: '',
    grade: '',
    className: '',
    keyword: ''
  });

  const modalTitle = computed(() =>
    isDailyMatch(props.match) ? '覆盖学生名单' : '参赛名单'
  );

  const mockRows = computed(() => {
    const covered = props.match?.personCount || 3200;
    const sampleCount = Math.min(covered, 8);
    const schools = ['海淀区第一小学', '海淀区第二小学', '海淀区第三小学'];
    const grades = ['一年级', '二年级', '三年级'];
    const classes = ['1班', '2班', '3班'];
    return Array.from({ length: sampleCount }, (_, index) => {
      const hasScore = index < Math.floor(sampleCount * 0.75);
      return {
        id: index + 1,
        studentName: `学生${index + 1}`,
        school: schools[index % schools.length],
        grade: grades[index % grades.length],
        className: classes[index % classes.length],
        participationStatus: '自动参与',
        hasScore,
        scoreStatus: hasScore ? '已产生' : '未产生',
        dailyPoints: hasScore ? 85 + (index % 10) : 0,
        weeklyPoints: hasScore ? 420 + index * 5 : 0,
        stagePoints: hasScore ? 1680 + index * 20 : 0,
        lastScoreDate: hasScore ? '2026-06-28' : '-'
      };
    });
  });

  const stats = computed(() => {
    const covered = props.match?.personCount || mockRows.value.length || 0;
    const scored = mockRows.value.filter((d) => d.hasScore).length;
    const scale = covered > mockRows.value.length ? Math.round(covered * 0.72) : scored;
    return {
      covered,
      scored: scale,
      unscored: Math.max(covered - scale, 0)
    };
  });

  const schoolOptions = computed(() => [...new Set(mockRows.value.map((d) => d.school))]);
  const gradeOptions = computed(() => [...new Set(mockRows.value.map((d) => d.grade))]);
  const classOptions = computed(() => [...new Set(mockRows.value.map((d) => d.className))]);

  const filteredRows = computed(() =>
    mockRows.value.filter((row) => {
      if (filters.value.school && row.school !== filters.value.school) {
        return false;
      }
      if (filters.value.grade && row.grade !== filters.value.grade) {
        return false;
      }
      if (filters.value.className && row.className !== filters.value.className) {
        return false;
      }
      if (filters.value.keyword && !row.studentName.includes(filters.value.keyword.trim())) {
        return false;
      }
      return true;
    })
  );
</script>

<style scoped lang="scss">
  .participant-scroll {
    max-height: calc(72vh - 8px);
    overflow-y: auto;
    padding: 14px 20px;
  }

  .overview-card {
    margin-bottom: 14px;
    padding: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
  }

  .stat-item {
    padding: 10px;
    background: var(--el-bg-color);
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

    &--sm {
      font-size: 14px;
      font-weight: 500;
    }
  }

  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 12px;
  }
</style>
