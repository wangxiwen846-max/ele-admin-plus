<!-- 保险管理 / 参保记录 -->
<template>
  <ele-page>
    <ele-card :body-style="{ paddingBottom: '2px' }">
      <el-form label-width="82px" @keyup.enter="handleSearch" @submit.prevent="">
        <el-row :gutter="8">
          <el-col :lg="8" :md="12" :xs="24">
            <el-form-item label="姓名">
              <el-input v-model.trim="query.studentName" clearable placeholder="支持模糊搜索" />
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :xs="24">
            <el-form-item label="学校">
              <el-select v-model="query.school" clearable filterable placeholder="请选择" class="ele-fluid">
                <el-option v-for="item in schoolOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :xs="24">
            <el-form-item label="年级班级">
              <el-cascader
                v-model="query.gradeClassPath"
                :options="gradeClassOptions"
                clearable
                placeholder="请选择"
                class="ele-fluid"
              />
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :xs="24">
            <el-form-item label="保险类型">
              <el-select v-model="query.insuranceType" clearable placeholder="请选择" class="ele-fluid">
                <el-option label="学期保险" value="学期保险" />
                <el-option label="单场比赛保险" value="单场比赛保险" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :xs="24">
            <el-form-item label="保险状态">
              <el-select v-model="query.status" clearable placeholder="请选择" class="ele-fluid">
                <el-option label="待参保" value="待参保" />
                <el-option label="已参保" value="已参保" />
                <el-option label="异常" value="异常" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :xs="24">
            <el-form-item label-width="16px">
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </ele-card>

    <ele-card :body-style="{ paddingBottom: '4px' }">
      <ele-pro-table
        ref="tableRef"
        row-key="recordId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        :toolbar="{ theme: 'default' }"
        cache-key="CompetitionInsuranceRecordTable"
      >
        <template #planName="{ row }">{{ getInsurancePlanName(row.planId) }}</template>
        <template #scope="{ row }">{{ row.insuranceType === '学期保险' ? row.schoolYearSemester : row.matchName }}</template>
        <template #status="{ row }">
          <el-tag :type="getStatusTag(row.status)" size="small" effect="plain">{{ row.status }}</el-tag>
        </template>
        <template #action="{ row }">
          <el-link type="primary" underline="never" @click="openDetail(row)">参保详情</el-link>
          <template v-if="row.status === '异常'">
            <el-divider direction="vertical" />
            <el-link type="primary" underline="never">处理异常</el-link>
          </template>
        </template>
      </ele-pro-table>
    </ele-card>

    <el-dialog v-model="detailVisible" title="参保详情" width="760px" destroy-on-close draggable>
      <template v-if="current">
        <div class="detail-block">
          <div class="block-title">学生信息</div>
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="姓名">{{ current.studentName }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ current.gender }}</el-descriptions-item>
            <el-descriptions-item label="证件号">{{ current.idNo }}</el-descriptions-item>
            <el-descriptions-item label="学校">{{ current.school }}</el-descriptions-item>
            <el-descriptions-item label="年级班级">{{ current.gradeClass }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="detail-block">
          <div class="block-title">保险信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="保险类型">{{ current.insuranceType }}</el-descriptions-item>
            <el-descriptions-item label="保险方案">{{ plan?.planName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="保险方式">{{ current.insuranceMethod || '-' }}</el-descriptions-item>
            <el-descriptions-item label="保费">¥{{ current.premium }}</el-descriptions-item>
            <el-descriptions-item label="保额">¥{{ plan?.insuredAmount || '-' }}</el-descriptions-item>
            <el-descriptions-item label="保险公司">{{ plan?.company || '-' }}</el-descriptions-item>
            <el-descriptions-item label="保险状态">{{ current.status }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="detail-block">
          <div class="block-title">关联信息</div>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item :label="current.insuranceType === '学期保险' ? '学年学期' : '比赛名称'">
              {{ current.insuranceType === '学期保险' ? current.schoolYearSemester : current.matchName }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="detail-block">
          <div class="block-title">异常信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="异常原因">{{ current.exceptionReason || '-' }}</el-descriptions-item>
            <el-descriptions-item label="处理状态">{{ current.handleStatus || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </template>
    </el-dialog>
  </ele-page>
</template>

<script setup>
  import { computed, reactive, ref } from 'vue';
  import {
    GRADE_CLASS_CASCADER_OPTIONS,
    findInsurancePlan,
    getInsurancePlanName,
    getSchoolFilterOptions,
    insuranceStore
  } from '../data.js';

  defineOptions({ name: 'CompetitionInsuranceRecord' });

  const tableRef = ref(null);
  const detailVisible = ref(false);
  const current = ref(null);
  const schoolOptions = computed(() => getSchoolFilterOptions());
  const gradeClassOptions = GRADE_CLASS_CASCADER_OPTIONS;
  const query = reactive({
    studentName: '',
    school: '',
    gradeClassPath: [],
    insuranceType: '',
    status: ''
  });
  const columns = ref([
    { prop: 'studentName', label: '学生姓名', width: 100, fixed: 'left' },
    { prop: 'idNo', label: '证件号', minWidth: 150 },
    { prop: 'school', label: '学校', minWidth: 120 },
    { prop: 'gradeClass', label: '年级班级', width: 120 },
    { prop: 'insuranceType', label: '保险类型', width: 120, align: 'center' },
    { columnKey: 'planName', label: '保险方案', minWidth: 170, slot: 'planName' },
    { prop: 'insuranceMethod', label: '保险方式', width: 100, align: 'center' },
    { columnKey: 'scope', label: '关联范围', minWidth: 160, slot: 'scope' },
    { prop: 'status', label: '保险状态', width: 100, align: 'center', slot: 'status' },
    { prop: 'exceptionReason', label: '异常原因', minWidth: 150 },
    { columnKey: 'action', label: '操作', width: 150, align: 'center', slot: 'action', fixed: 'right' }
  ]);

  const plan = computed(() => (current.value ? findInsurancePlan(current.value.planId) : null));

  const matchGradeClass = (row) => {
    if (!query.gradeClassPath?.length) {
      return true;
    }
    const [grade, clazz] = query.gradeClassPath;
    return row.gradeClass.includes(grade) && row.gradeClass.includes(clazz || grade);
  };

  const datasource = ({ pages }) => {
    let list = insuranceStore.records;
    if (query.studentName) list = list.filter((row) => row.studentName.includes(query.studentName));
    if (query.school) list = list.filter((row) => row.school === query.school);
    if (query.gradeClassPath?.length) list = list.filter(matchGradeClass);
    if (query.insuranceType) list = list.filter((row) => row.insuranceType === query.insuranceType);
    if (query.status) list = list.filter((row) => row.status === query.status);
    const { page = 1, limit = 10 } = pages || {};
    return Promise.resolve({ list: list.slice((page - 1) * limit, page * limit), count: list.length });
  };

  const getStatusTag = (status) => {
    const map = { 已参保: 'success', 待参保: 'info', 异常: 'danger' };
    return map[status] || 'info';
  };
  const handleSearch = () => tableRef.value?.reload?.({ page: 1 });
  const resetSearch = () => {
    Object.assign(query, {
      studentName: '',
      school: '',
      gradeClassPath: [],
      insuranceType: '',
      status: ''
    });
    handleSearch();
  };
  const openDetail = (row) => {
    current.value = row;
    detailVisible.value = true;
  };
</script>

<style scoped lang="scss">
  .detail-block {
    margin-bottom: 14px;
  }

  .block-title {
    margin-bottom: 10px;
    padding-left: 8px;
    font-size: 14px;
    font-weight: 600;
    border-left: 3px solid var(--el-color-primary);
  }
</style>
