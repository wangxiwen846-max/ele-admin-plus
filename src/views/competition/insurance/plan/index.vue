<!-- 保险管理 / 保险方案 -->
<template>
  <ele-page>
    <ele-card :body-style="{ paddingBottom: '2px' }">
      <el-form label-width="96px" @keyup.enter="handleSearch" @submit.prevent="">
        <el-row :gutter="8">
          <el-col :lg="8" :md="12" :xs="24">
            <el-form-item label="方案名称">
              <el-input v-model.trim="query.planName" clearable placeholder="支持模糊搜索" />
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :xs="24">
            <el-form-item label="保险公司">
              <el-input v-model.trim="query.company" clearable placeholder="支持模糊搜索" />
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :xs="24">
            <el-form-item label="适用赛段">
              <el-select v-model="query.stage" clearable placeholder="请选择" class="ele-fluid">
                <el-option label="校园行" value="校园行" />
                <el-option label="全国总决赛" value="全国总决赛" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :xs="24">
            <el-form-item label="比赛类型">
              <match-type-cascader v-model="query.matchType" class="ele-fluid" />
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :xs="24">
            <el-form-item label="收费方式">
              <el-select v-model="query.chargeMethod" clearable placeholder="请选择" class="ele-fluid">
                <el-option label="按学期" value="按学期" />
                <el-option label="按比赛" value="按比赛" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :xs="24">
            <el-form-item label="状态">
              <el-select v-model="query.status" clearable placeholder="请选择" class="ele-fluid">
                <el-option label="启用" value="启用" />
                <el-option label="停用" value="停用" />
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
        row-key="planId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        :toolbar="{ theme: 'default' }"
        cache-key="CompetitionInsurancePlanTable"
      >
        <template #toolbar>
          <el-button type="primary" :icon="PlusOutlined" class="ele-btn-icon" @click="openEdit()">
            新增方案
          </el-button>
        </template>
        <template #stages="{ row }">{{ row.stages.join('、') }}</template>
        <template #matchTypes="{ row }">{{ formatMatchTypesList(row.matchTypes, '、') }}</template>
        <template #schoolYearSemester="{ row }">{{ formatPlanSchoolYearSemester(row) }}</template>
        <template #premium="{ row }">¥{{ row.premium }}</template>
        <template #insuredAmount="{ row }">¥{{ row.insuredAmount }}</template>
        <template #status="{ row }">
          <el-tag :type="row.status === '启用' ? 'success' : 'info'" size="small" effect="plain">
            {{ row.status }}
          </el-tag>
        </template>
        <template #action="{ row }">
          <el-link type="primary" underline="never" @click="openEdit(row)">编辑</el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" underline="never" @click="openDetail(row)">查看</el-link>
        </template>
      </ele-pro-table>
    </ele-card>

    <el-dialog
      v-model="editVisible"
      :title="editForm.planId ? '编辑保险方案' : '新增保险方案'"
      width="760px"
      destroy-on-close
      draggable
    >
      <el-form :model="editForm" label-width="120px">
        <el-row :gutter="16">
          <el-col :sm="12" :xs="24">
            <el-form-item label="方案名称" required>
              <el-input v-model.trim="editForm.planName" />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="保险公司" required>
              <el-input v-model.trim="editForm.company" />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="适用赛段" required>
              <el-select v-model="editForm.stages" multiple class="ele-fluid">
                <el-option label="校园行" value="校园行" />
                <el-option label="全国总决赛" value="全国总决赛" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="适用比赛类型" required>
              <match-type-cascader v-model="editForm.matchTypes" multiple class="ele-fluid" />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="收费方式" required>
              <el-radio-group v-model="editForm.chargeMethod" @change="handleChargeMethodChange">
                <el-radio value="按学期">按学期</el-radio>
                <el-radio value="按比赛">按比赛</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="状态">
              <el-radio-group v-model="editForm.status">
                <el-radio value="启用">启用</el-radio>
                <el-radio value="停用">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="保费" required>
              <el-input-number v-model="editForm.premium" :min="0" class="ele-fluid" />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="保额" required>
              <el-input-number v-model="editForm.insuredAmount" :min="0" class="ele-fluid" />
            </el-form-item>
          </el-col>
          <template v-if="editForm.chargeMethod === '按学期'">
            <el-col :sm="12" :xs="24">
              <el-form-item label="学年" required>
                <el-input v-model.trim="editForm.schoolYear" placeholder="如 2026-2027" />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="学期" required>
                <el-select v-model="editForm.semester" class="ele-fluid">
                  <el-option label="第一学期" value="第一学期" />
                  <el-option label="第二学期" value="第二学期" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="保障开始日期" required>
                <el-date-picker
                  v-model="editForm.startDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  class="ele-fluid"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="保障结束日期" required>
                <el-date-picker
                  v-model="editForm.endDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  class="ele-fluid"
                />
              </el-form-item>
            </el-col>
          </template>
          <el-col :xs="24">
            <el-form-item label="保障说明">
              <el-input v-model.trim="editForm.description" type="textarea" :rows="3" />
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="条款附件">
              <attachment-table
                title="条款附件"
                :list="editForm.attachments"
                compact
                @add="handleAttachmentAdd"
                @remove="handleAttachmentRemove"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="保险方案详情" width="680px" destroy-on-close draggable>
      <el-descriptions v-if="current" :column="2" border size="small">
        <el-descriptions-item label="方案名称">{{ current.planName }}</el-descriptions-item>
        <el-descriptions-item label="保险公司">{{ current.company }}</el-descriptions-item>
        <el-descriptions-item label="适用赛段">{{ current.stages.join('、') }}</el-descriptions-item>
        <el-descriptions-item label="比赛类型">
          {{ formatMatchTypesList(current.matchTypes, '、') }}
        </el-descriptions-item>
        <el-descriptions-item label="收费方式">{{ current.chargeMethod }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ current.status }}</el-descriptions-item>
        <el-descriptions-item v-if="current.chargeMethod === '按学期'" label="学年学期">
          {{ formatPlanSchoolYearSemester(current) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="current.chargeMethod === '按学期'" label="保障周期">
          {{ current.startDate }} 至 {{ current.endDate }}
        </el-descriptions-item>
        <el-descriptions-item label="保费">¥{{ current.premium }}</el-descriptions-item>
        <el-descriptions-item label="保额">¥{{ current.insuredAmount }}</el-descriptions-item>
        <el-descriptions-item label="保障说明" :span="2">{{ current.description || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="条款附件" :span="2">{{ current.attachmentName || '未上传' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </ele-page>
</template>

<script setup>
  import { reactive, ref } from 'vue';
  import { EleMessage } from 'ele-admin-plus';
  import { PlusOutlined } from '@/components/icons';
  import AttachmentTable from '@/views/event-item/components/attachment-table.vue';
  import MatchTypeCascader from '@/views/competition/components/match-type-cascader.vue';
  import {
    clone,
    formatMatchTypesList,
    formatPlanSchoolYearSemester,
    insuranceStore,
    saveInsurancePlan
  } from '../data.js';
  import { normalizeMatchTypeLeaves } from '@/views/competition/match-type.js';

  defineOptions({ name: 'CompetitionInsurancePlan' });
  const tableRef = ref(null);
  const editVisible = ref(false);
  const detailVisible = ref(false);
  const current = ref(null);
  const query = reactive({ planName: '', company: '', stage: '', matchType: '', chargeMethod: '', status: '' });
  const editForm = reactive(createEmptyForm());

  const columns = ref([
    { prop: 'planName', label: '方案名称', minWidth: 180, fixed: 'left' },
    { prop: 'company', label: '保险公司', minWidth: 120 },
    { columnKey: 'stages', label: '适用赛段', minWidth: 120, slot: 'stages' },
    { columnKey: 'matchTypes', label: '适用比赛类型', minWidth: 180, slot: 'matchTypes' },
    { prop: 'chargeMethod', label: '收费方式', width: 100, align: 'center' },
    {
      columnKey: 'schoolYearSemester',
      label: '学年学期',
      width: 150,
      align: 'center',
      slot: 'schoolYearSemester'
    },
    { prop: 'premium', label: '保费', width: 90, align: 'center', slot: 'premium' },
    { prop: 'insuredAmount', label: '保额', width: 110, align: 'center', slot: 'insuredAmount' },
    { prop: 'status', label: '状态', width: 90, align: 'center', slot: 'status' },
    { prop: 'updateTime', label: '更新时间', width: 150, align: 'center' },
    { columnKey: 'action', label: '操作', width: 120, align: 'center', slot: 'action', fixed: 'right' }
  ]);

  function createEmptyForm() {
    return {
      planId: '',
      planName: '',
      company: '',
      stages: ['校园行'],
      matchTypes: [],
      chargeMethod: '按学期',
      schoolYear: '',
      semester: '第一学期',
      startDate: '',
      endDate: '',
      premium: 0,
      insuredAmount: 0,
      description: '',
      attachmentName: '',
      attachments: [],
      status: '启用'
    };
  }

  function inferAttachmentType(name = '') {
    const ext = name.split('.').pop()?.toUpperCase() || '文件';
    if (['DOC', 'DOCX'].includes(ext)) {
      return 'Word';
    }
    if (['XLS', 'XLSX'].includes(ext)) {
      return 'Excel';
    }
    if (['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'].includes(ext)) {
      return '图片';
    }
    return ext;
  }

  function buildPlanAttachments(row = {}) {
    if (row.attachments?.length) {
      return clone(row.attachments);
    }
    if (row.attachmentName) {
      return [
        {
          id: `file_${row.planId || Date.now()}`,
          name: row.attachmentName,
          type: inferAttachmentType(row.attachmentName),
          uploadTime: row.updateTime || '-'
        }
      ];
    }
    return [];
  }

  const handleAttachmentAdd = (file) => {
    editForm.attachments = [...(editForm.attachments ?? []), file];
  };

  const handleAttachmentRemove = (file) => {
    editForm.attachments = (editForm.attachments ?? []).filter((item) => item.id !== file.id);
  };

  const datasource = ({ pages }) => {
    let list = insuranceStore.plans;
    if (query.planName) list = list.filter((row) => row.planName.includes(query.planName));
    if (query.company) list = list.filter((row) => row.company.includes(query.company));
    if (query.stage) list = list.filter((row) => row.stages.includes(query.stage));
    if (query.matchType) {
      list = list.filter((row) =>
        normalizeMatchTypeLeaves(row.matchTypes).includes(query.matchType)
      );
    }
    if (query.chargeMethod) list = list.filter((row) => row.chargeMethod === query.chargeMethod);
    if (query.status) list = list.filter((row) => row.status === query.status);
    const { page = 1, limit = 10 } = pages || {};
    return Promise.resolve({ list: list.slice((page - 1) * limit, page * limit), count: list.length });
  };

  const handleSearch = () => tableRef.value?.reload?.({ page: 1 });
  const resetSearch = () => {
    Object.assign(query, { planName: '', company: '', stage: '', matchType: '', chargeMethod: '', status: '' });
    handleSearch();
  };

  const handleChargeMethodChange = (value) => {
    if (value !== '按学期') {
      editForm.schoolYear = '';
      editForm.semester = '第一学期';
      editForm.startDate = '';
      editForm.endDate = '';
    }
  };

  const openEdit = (row) => {
    Object.assign(editForm, row ? clone(row) : createEmptyForm());
    editForm.matchTypes = normalizeMatchTypeLeaves(editForm.matchTypes ?? []);
    editForm.attachments = row ? buildPlanAttachments(row) : [];
    editVisible.value = true;
  };

  const openDetail = (row) => {
    current.value = row;
    detailVisible.value = true;
  };

  const submitEdit = () => {
    if (!editForm.planName || !editForm.company || !editForm.stages.length || !editForm.matchTypes.length) {
      EleMessage.error({ message: '请完善必填项', plain: true });
      return;
    }
    if (editForm.chargeMethod === '按学期') {
      if (!editForm.schoolYear || !editForm.startDate || !editForm.endDate) {
        EleMessage.error({ message: '请完善学年、学期和保障周期', plain: true });
        return;
      }
    }
    editForm.attachmentName = editForm.attachments?.[0]?.name || '';
    saveInsurancePlan(editForm);
    editVisible.value = false;
    tableRef.value?.reload?.();
    EleMessage.success({ message: '保险方案已保存', plain: true });
  };
</script>
