<!-- 体测记录 批量导入（三步流程）-->
<template>
  <ele-modal
    :width="1080"
    title="批量导入体测记录"
    :footer="false"
    v-bind="modalProps"
    :style="{ '--ele-modal-body-padding': '24px' }"
  >
    <el-steps :active="step" finish-status="success" class="import-steps">
      <el-step title="导入参数" description="选择导入条件" />
      <el-step title="上传文件" description="上传 Excel 模板" />
      <el-step title="校验结果" description="修改 / 重新校验 / 确认导入" />
    </el-steps>

    <!-- Step 1: 导入参数 -->
    <div v-show="step === 0" class="step-body">
      <el-form
        ref="paramFormRef"
        :model="params"
        :rules="paramRules"
        label-width="96px"
        @submit.prevent=""
      >
        <el-row :gutter="16">
          <el-col :sm="12" :xs="24">
            <el-form-item label="学校" prop="school">
              <el-select
                v-model="params.school"
                placeholder="请选择学校"
                class="ele-fluid"
              >
                <el-option
                  v-for="opt in SCHOOL_OPTIONS"
                  :key="opt"
                  :label="opt"
                  :value="opt"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="学年" prop="schoolYear">
              <el-select
                v-model="params.schoolYear"
                placeholder="请选择学年"
                class="ele-fluid"
              >
                <el-option
                  v-for="opt in SCHOOL_YEAR_OPTIONS"
                  :key="opt"
                  :label="opt"
                  :value="opt"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="学期" prop="term">
              <el-select
                v-model="params.term"
                placeholder="请选择学期"
                class="ele-fluid"
              >
                <el-option
                  v-for="opt in TERM_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="学段" prop="stage">
              <el-select
                v-model="params.stage"
                placeholder="请选择学段"
                class="ele-fluid"
                @change="handleStageChange"
              >
                <el-option
                  v-for="opt in STAGE_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="年级" prop="grade">
              <el-select
                v-model="params.grade"
                placeholder="请选择年级"
                :disabled="!params.stage"
                class="ele-fluid"
              >
                <el-option
                  v-for="g in gradeOptions"
                  :key="g"
                  :label="g"
                  :value="g"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="班级">
              <el-select
                v-model="params.className"
                placeholder="可选，不填则按全年级"
                clearable
                class="ele-fluid"
              >
                <el-option
                  v-for="c in CLASS_OPTIONS"
                  :key="c"
                  :label="c"
                  :value="c"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="体测方案" prop="planId">
              <el-select
                v-model="params.planId"
                placeholder="请选择体测方案"
                class="ele-fluid"
              >
                <el-option
                  v-for="p in availablePlans"
                  :key="p.planId"
                  :label="p.planName"
                  :value="p.planId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="测试日期" prop="testDate">
              <el-date-picker
                v-model="params.testDate"
                value-format="YYYY-MM-DD"
                placeholder="请选择测试日期"
                class="ele-fluid"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="记录类型" prop="recordType">
              <el-radio-group v-model="params.recordType">
                <el-radio value="normal">正常</el-radio>
                <el-radio value="makeup">补测</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div class="template-block">
        <div class="template-title">
          <el-icon><FileOutlined /></el-icon>
          <span>模板填写说明</span>
        </div>
        <ul class="template-tips">
          <li>请下载模板并按表头提示填写，学号为 1-99 的整数。</li>
          <li>年龄字段无需填写，系统将根据学段与年级自动带出。</li>
          <li>必填项目若缺失将在校验结果中标记为“失败”。</li>
        </ul>
        <el-button
          :icon="DownloadOutlined"
          class="ele-btn-icon"
          @click="handleDownloadTemplate"
        >
          下载模板
        </el-button>
      </div>
    </div>

    <!-- Step 2: 上传文件 -->
    <div v-show="step === 1" class="step-body">
      <div class="upload-area">
        <div v-if="!fileName" class="upload-placeholder">
          <el-icon :size="32" color="var(--el-color-primary)">
            <CloudUploadOutlined />
          </el-icon>
          <div class="upload-text">点击按钮上传 Excel 文件</div>
          <div class="upload-hint">
            支持 .xlsx / .xls 格式，文件大小不超过 5MB
          </div>
          <el-button
            type="primary"
            :icon="UploadOutlined"
            class="ele-btn-icon"
            style="margin-top: 16px"
            @click="handleSelectFile"
          >
            选择文件
          </el-button>
        </div>
        <div v-else class="upload-file">
          <div class="upload-file-info">
            <el-icon :size="22" color="var(--el-color-success)">
              <CheckCircleOutlined />
            </el-icon>
            <div style="margin-left: 10px">
              <div class="upload-file-name">{{ fileName }}</div>
              <div class="upload-file-hint">
                已上传 · 点击“重新上传”可更换文件
              </div>
            </div>
          </div>
          <el-button
            size="small"
            :icon="ReloadOutlined"
            @click="handleSelectFile"
          >
            重新上传
          </el-button>
        </div>
      </div>
    </div>

    <!-- Step 3: 校验结果 -->
    <div v-show="step === 2" class="step-body">
      <!-- 全局参数卡片（只读，提示用户） -->
      <div class="global-params">
        <div class="global-params-title">
          <el-icon><InfoCircleFilled /></el-icon>
          <span>本次导入全局参数（不支持逐条修改）</span>
        </div>
        <div class="global-params-grid">
          <div class="global-param-item">
            <span class="label">学校：</span>
            <span class="value">{{ params.school }}</span>
          </div>
          <div class="global-param-item">
            <span class="label">学年：</span>
            <span class="value">{{ params.schoolYear }}</span>
          </div>
          <div class="global-param-item">
            <span class="label">学期：</span>
            <span class="value">{{ termLabel }}</span>
          </div>
          <div class="global-param-item">
            <span class="label">学段：</span>
            <span class="value">{{ stageLabel }}</span>
          </div>
          <div class="global-param-item">
            <span class="label">年级：</span>
            <span class="value">{{ params.grade }}</span>
          </div>
          <div class="global-param-item">
            <span class="label">体测方案：</span>
            <span class="value">{{ planName }}</span>
          </div>
          <div class="global-param-item">
            <span class="label">记录类型：</span>
            <span class="value">{{ recordTypeLabel }}</span>
          </div>
        </div>
      </div>

      <!-- 统计汇总 -->
      <div class="result-summary">
        <div class="summary-item summary-total">
          <div class="summary-count">{{ rows.length }}</div>
          <div class="summary-label">总条数</div>
        </div>
        <div class="summary-item summary-success">
          <div class="summary-count">{{ successCount }}</div>
          <div class="summary-label">成功</div>
        </div>
        <div class="summary-item summary-fail">
          <div class="summary-count">{{ failCount }}</div>
          <div class="summary-label">失败</div>
        </div>
        <div class="summary-item summary-pending">
          <div class="summary-count">{{ pendingCount }}</div>
          <div class="summary-label">待确认</div>
        </div>
      </div>

      <!-- 提示区：三态 -->
      <ele-alert
        v-if="dirty"
        type="warning"
        show-icon
        :closable="false"
        style="margin-bottom: 12px"
      >
        <template #title>
          已修改 {{ dirtyCount }} 条数据，请点击
          <b>重新校验</b> 后再进行导入。
        </template>
      </ele-alert>
      <ele-alert
        v-else-if="failCount > 0"
        type="error"
        show-icon
        :closable="false"
        style="margin-bottom: 12px"
      >
        <template #title>
          有 {{ failCount }} 条数据校验失败，请点击“修改”按钮修正后重新校验，失败条数为 0 才能确认导入。
        </template>
      </ele-alert>
      <ele-alert
        v-else
        type="success"
        show-icon
        :closable="false"
        style="margin-bottom: 12px"
      >
        <template #title>
          数据校验通过，共 {{ successCount + pendingCount }} 条数据可导入
          <span v-if="pendingCount">
            （其中 {{ pendingCount }} 条为待确认，导入后请及时复核）
          </span>
          。
        </template>
      </ele-alert>

      <el-tabs v-model="resultTab" class="result-tabs">
        <el-tab-pane name="all">
          <template #label>全部 ({{ rows.length }})</template>
        </el-tab-pane>
        <el-tab-pane name="success">
          <template #label>
            <span style="color: var(--el-color-success)">
              成功 ({{ successCount }})
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="fail">
          <template #label>
            <span style="color: var(--el-color-danger)">
              失败 ({{ failCount }})
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="pending">
          <template #label>
            <span style="color: var(--el-color-warning)">
              待确认 ({{ pendingCount }})
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <el-table
        :data="filteredRows"
        border
        size="default"
        class="result-table"
        max-height="340"
      >
        <el-table-column
          label="行号"
          prop="row"
          width="64"
          align="center"
          fixed="left"
        />
        <el-table-column label="状态" width="88" align="center" fixed="left">
          <template #default="{ row }">
            <el-tag
              v-if="row.result === 'success'"
              type="success"
              size="small"
              :disable-transitions="true"
            >
              成功
            </el-tag>
            <el-tag
              v-else-if="row.result === 'fail'"
              type="danger"
              size="small"
              :disable-transitions="true"
            >
              失败
            </el-tag>
            <el-tag
              v-else
              type="warning"
              size="small"
              :disable-transitions="true"
            >
              待确认
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="学号"
          prop="studentNo"
          width="80"
          align="center"
        />
        <el-table-column label="学生姓名" prop="studentName" width="110" />
        <el-table-column label="性别" width="70" align="center">
          <template #default="{ row }">
            {{ row.sex === 'male' ? '男' : row.sex === 'female' ? '女' : '-' }}
          </template>
        </el-table-column>
        <el-table-column
          label="测试日期"
          prop="testDate"
          width="120"
          align="center"
        />
        <el-table-column label="已填项目" width="90" align="center">
          <template #default="{ row }">
            {{ enteredItemCount(row) }} / {{ applicableItems.length }}
          </template>
        </el-table-column>
        <el-table-column label="问题说明" min-width="240">
          <template #default="{ row }">
            <div
              v-if="!row.issues || !row.issues.length"
              style="color: var(--el-text-color-placeholder)"
            >
              数据校验通过
            </div>
            <ul v-else class="issue-list">
              <li
                v-for="(it, idx) in row.issues"
                :key="idx"
                :class="['issue-item', 'issue-' + it.level]"
              >
                <el-tag
                  :type="it.level === 'error' ? 'danger' : 'warning'"
                  size="small"
                  :disable-transitions="true"
                  effect="light"
                  class="issue-field"
                >
                  {{ it.field }}
                </el-tag>
                <span class="issue-msg">{{ it.message }}</span>
              </li>
            </ul>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="120"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              :icon="EditOutlined"
              @click="handleEditRow(row)"
            >
              修改
            </el-button>
            <el-button
              v-if="row.result === 'fail'"
              type="danger"
              size="small"
              link
              :icon="DeleteOutlined"
              @click="handleRemoveRow(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Footer -->
    <div class="step-footer">
      <div class="step-footer-left">
        <el-button v-if="step > 0" @click="prevStep">上一步</el-button>
        <el-button
          v-if="step === 2"
          :icon="DownloadOutlined"
          @click="exportResult"
        >
          导出校验结果
        </el-button>
      </div>
      <div class="step-footer-right">
        <el-button @click="handleCancel">取消</el-button>
        <el-button v-if="step === 0" type="primary" @click="nextFromStep0">
          下一步
        </el-button>
        <el-button
          v-else-if="step === 1"
          type="primary"
          :disabled="!fileName"
          @click="nextFromStep1"
        >
          下一步
        </el-button>
        <template v-else>
          <el-button
            type="warning"
            :icon="ReloadOutlined"
            :loading="revalidating"
            :disabled="!dirty"
            @click="revalidate"
          >
            重新校验{{ dirty ? `（${dirtyCount}）` : '' }}
          </el-button>
          <el-tooltip
            :disabled="!confirmDisabledReason"
            :content="confirmDisabledReason"
            placement="top"
          >
            <span>
              <el-button
                type="primary"
                :disabled="!!confirmDisabledReason"
                :loading="confirmLoading"
                @click="confirmImport"
              >
                确认导入
              </el-button>
            </span>
          </el-tooltip>
        </template>
      </div>
    </div>

    <!-- 内嵌修改弹窗（支持学号 / 学生姓名 / 性别 / 测试日期 / 体测项目成绩 / 备注） -->
    <el-dialog
      v-model="editDialogVisible"
      title="修改导入数据"
      width="680px"
      append-to-body
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        v-if="editingRow"
        ref="editFormRef"
        :model="editingRow"
        label-width="100px"
        @submit.prevent=""
      >
        <el-divider content-position="left" class="section-divider">
          基本信息
        </el-divider>
        <el-row :gutter="16">
          <el-col :sm="12" :xs="24">
            <el-form-item label="学号" required>
              <el-input-number
                v-model="editingRow.studentNo"
                :min="1"
                :max="99"
                :controls="false"
                placeholder="请输入 1-99 的整数"
                class="ele-fluid"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="学生姓名" required>
              <el-input
                v-model.trim="editingRow.studentName"
                placeholder="请输入学生姓名"
                :maxlength="20"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="性别" required>
              <el-radio-group v-model="editingRow.sex">
                <el-radio value="male">男</el-radio>
                <el-radio value="female">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="测试日期" required>
              <el-date-picker
                v-model="editingRow.testDate"
                value-format="YYYY-MM-DD"
                placeholder="请选择测试日期"
                class="ele-fluid"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left" class="section-divider">
          体测项目成绩
        </el-divider>
        <el-row :gutter="16">
          <el-col
            v-for="item in applicableItems"
            :key="item.code"
            :sm="12"
            :xs="24"
          >
            <el-form-item
              :label="item.name"
              :class="['edit-item', { 'is-required': item.required }]"
            >
              <el-input
                v-model="editingRow.scores[item.code]"
                :placeholder="`请输入 ${item.name}`"
              >
                <template #append>{{ item.unit }}</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left" class="section-divider">
          备注
        </el-divider>
        <el-form-item label="备注">
          <el-input
            type="textarea"
            :rows="2"
            :maxlength="200"
            v-model="editingRow.remark"
            placeholder="请输入备注（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存修改</el-button>
      </template>
    </el-dialog>
  </ele-modal>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue';
  import { EleMessage, useModal } from 'ele-admin-plus';
  import { ElMessageBox } from 'element-plus';
  import {
    FileOutlined,
    CloudUploadOutlined,
    CheckCircleOutlined,
    DownloadOutlined,
    UploadOutlined,
    ReloadOutlined,
    EditOutlined,
    DeleteOutlined,
    InfoCircleFilled
  } from '@/components/icons';
  import {
    SCHOOL_OPTIONS,
    SCHOOL_YEAR_OPTIONS,
    TERM_OPTIONS,
    STAGE_OPTIONS,
    GRADE_OPTIONS,
    CLASS_OPTIONS,
    planStore,
    recordStore,
    getStageLabel,
    getTermLabel,
    getRecordTypeLabel
  } from '@/views/fitness/data.js';

  const emit = defineEmits(['done']);

  const { modalProps, closeModal } = useModal();

  const step = ref(0);
  const paramFormRef = ref(null);
  const fileName = ref('');
  const confirmLoading = ref(false);
  const revalidating = ref(false);
  const resultTab = ref('all');

  const params = reactive({
    school: '',
    schoolYear: '2025-2026',
    term: 'fall',
    stage: '',
    grade: '',
    className: '',
    planId: '',
    testDate: '',
    recordType: 'normal'
  });

  const paramRules = {
    school: [{ required: true, message: '请选择学校', trigger: 'change' }],
    schoolYear: [
      { required: true, message: '请选择学年', trigger: 'change' }
    ],
    term: [{ required: true, message: '请选择学期', trigger: 'change' }],
    stage: [{ required: true, message: '请选择学段', trigger: 'change' }],
    grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
    planId: [
      { required: true, message: '请选择体测方案', trigger: 'change' }
    ],
    testDate: [
      { required: true, message: '请选择测试日期', trigger: 'change' }
    ],
    recordType: [
      { required: true, message: '请选择记录类型', trigger: 'change' }
    ]
  };

  const gradeOptions = computed(() => GRADE_OPTIONS[params.stage] ?? []);
  const availablePlans = computed(() => {
    if (!params.stage) return planStore.list.filter((d) => d.status === 1);
    return planStore.list.filter(
      (d) => d.status === 1 && d.stage === params.stage
    );
  });

  /** 全局参数显示名 */
  const stageLabel = computed(() => getStageLabel(params.stage));
  const termLabel = computed(() => getTermLabel(params.term));
  const recordTypeLabel = computed(() => getRecordTypeLabel(params.recordType));
  const currentPlan = computed(() =>
    planStore.list.find((p) => p.planId === params.planId)
  );
  const planName = computed(() => currentPlan.value?.planName ?? '-');

  /** 根据方案得到所有启用项目（不分性别时用通用项） */
  const applicableItems = computed(() => {
    if (!currentPlan.value) return [];
    return (currentPlan.value.items || [])
      .filter((d) => d.enabled)
      .slice()
      .sort((a, b) => a.sort - b.sort);
  });

  const handleStageChange = () => {
    params.grade = '';
    params.planId = '';
  };

  /** 所有校验数据行（全部统一放在 rows 里） */
  const rows = ref([]);
  /** dirty 标记：至少有一条数据被修改但未重新校验 */
  const dirty = ref(false);
  const dirtyCount = computed(
    () => rows.value.filter((r) => r._dirty).length
  );

  const successCount = computed(
    () => rows.value.filter((r) => r.result === 'success').length
  );
  const failCount = computed(
    () => rows.value.filter((r) => r.result === 'fail').length
  );
  const pendingCount = computed(
    () => rows.value.filter((r) => r.result === 'pending').length
  );

  const filteredRows = computed(() => {
    if (resultTab.value === 'success')
      return rows.value.filter((d) => d.result === 'success');
    if (resultTab.value === 'fail')
      return rows.value.filter((d) => d.result === 'fail');
    if (resultTab.value === 'pending')
      return rows.value.filter((d) => d.result === 'pending');
    return rows.value;
  });

  const confirmDisabledReason = computed(() => {
    if (dirty.value) return '存在已修改但未重新校验的数据，请先点击“重新校验”';
    if (failCount.value > 0)
      return `仍有 ${failCount.value} 条失败数据，请先修改后重新校验`;
    return '';
  });

  const handleCancel = () => closeModal();

  const prevStep = () => {
    if (step.value > 0) step.value -= 1;
  };

  const nextFromStep0 = () => {
    paramFormRef.value?.validate?.((valid) => {
      if (!valid) return;
      step.value = 1;
    });
  };

  const handleSelectFile = () => {
    // 模拟选择文件
    fileName.value = `体测数据_${params.schoolYear || ''}.xlsx`;
    EleMessage.success({ message: '文件上传成功', plain: true });
  };

  const handleDownloadTemplate = () => {
    EleMessage.success({ message: '模板已开始下载', plain: true });
  };

  const nextFromStep1 = () => {
    if (!fileName.value) return;
    generateMockRows();
    validateAllRows();
    step.value = 2;
    resultTab.value = 'all';
  };

  const enteredItemCount = (row) => {
    if (!row?.scores) return 0;
    return applicableItems.value.filter((it) => {
      const v = row.scores[it.code];
      return v !== '' && v != null && !Number.isNaN(Number(v)) && Number(v) > 0;
    }).length;
  };

  /** 构造一行的随机成绩（部分项缺失用以模拟失败/待确认） */
  function mockScoreValue(code) {
    switch (code) {
      case 'height':
        return (140 + Math.floor(Math.random() * 40)).toFixed(1);
      case 'weight':
        return (35 + Math.floor(Math.random() * 30)).toFixed(1);
      case 'vitalCapacity':
        return String(1800 + Math.floor(Math.random() * 1800));
      case 'sprint50':
        return (8 + Math.random() * 3).toFixed(1);
      case 'sitAndReach':
        return (5 + Math.random() * 12).toFixed(1);
      case 'ropeSkipping1Min':
        return String(80 + Math.floor(Math.random() * 80));
      case 'sitUp1Min':
        return String(20 + Math.floor(Math.random() * 30));
      case 'shuttleRun50x8':
        return (90 + Math.random() * 30).toFixed(1);
      case 'longJump':
        return String(140 + Math.floor(Math.random() * 60));
      case 'pullUp':
        return String(Math.floor(Math.random() * 15));
      case 'run800':
      case 'run1000':
        return String(210 + Math.floor(Math.random() * 80));
      default:
        return '';
    }
  }

  /** 生成 10 条演示数据，其中插入几条问题行 */
  function generateMockRows() {
    const mockNames = [
      '林可心',
      '苏梓轩',
      '韩雨泽',
      '蒋子墨',
      '范晓彤',
      '唐俊熙',
      '谢雨萱',
      '田一鸣',
      '石浩然',
      '魏若曦'
    ];
    const sexes = ['male', 'female'];
    const testDate = params.testDate;
    rows.value = mockNames.map((name, i) => {
      const scores = {};
      applicableItems.value.forEach((it) => {
        scores[it.code] = mockScoreValue(it.code);
      });
      const row = {
        row: i + 2, // Excel 表头占 1 行
        studentNo: i + 10,
        studentName: name,
        sex: sexes[i % 2],
        testDate,
        scores,
        remark: '',
        result: 'success',
        issues: [],
        _dirty: false
      };
      // 插入问题行
      if (i === 2) {
        row.studentNo = 150; // 超出 1-99
      } else if (i === 5) {
        const firstRequired = applicableItems.value.find((d) => d.required);
        if (firstRequired) row.scores[firstRequired.code] = '';
      } else if (i === 7) {
        // 体重异常大
        if (row.scores.weight) row.scores.weight = '145';
      } else if (i === 8) {
        row.studentName = ''; // 姓名缺失
      }
      return row;
    });
  }

  /** 校验单行 */
  function validateRow(row) {
    const issues = [];
    // 学号
    if (
      row.studentNo == null ||
      row.studentNo === '' ||
      Number.isNaN(Number(row.studentNo))
    ) {
      issues.push({
        field: '学号',
        message: '学号未填写',
        level: 'error'
      });
    } else if (
      Number(row.studentNo) < 1 ||
      Number(row.studentNo) > 99 ||
      !Number.isInteger(Number(row.studentNo))
    ) {
      issues.push({
        field: '学号',
        message: '学号须为 1-99 的整数',
        level: 'error'
      });
    }
    // 姓名
    if (!row.studentName || !String(row.studentName).trim()) {
      issues.push({
        field: '学生姓名',
        message: '学生姓名未填写',
        level: 'error'
      });
    }
    // 性别
    if (!row.sex) {
      issues.push({ field: '性别', message: '性别未填写', level: 'error' });
    }
    // 测试日期
    if (!row.testDate) {
      issues.push({
        field: '测试日期',
        message: '测试日期未填写',
        level: 'error'
      });
    }
    // 必填项目
    applicableItems.value.forEach((it) => {
      if (!it.required) return;
      // 性别过滤
      if (it.gender === 'male' && row.sex !== 'male') return;
      if (it.gender === 'female' && row.sex !== 'female') return;
      const v = row.scores?.[it.code];
      if (v === '' || v == null || Number.isNaN(Number(v))) {
        issues.push({
          field: it.name,
          message: `必填项 ${it.name} 未填写`,
          level: 'error'
        });
      }
    });
    // 合理范围（仅标记 warning）
    const weight = Number(row.scores?.weight);
    if (weight && (weight < 15 || weight > 120)) {
      issues.push({
        field: '体重',
        message: '体重数值异常（超出合理范围 15-120kg）',
        level: 'warning'
      });
    }
    const height = Number(row.scores?.height);
    if (height && (height < 80 || height > 220)) {
      issues.push({
        field: '身高',
        message: '身高数值异常（超出合理范围 80-220cm）',
        level: 'warning'
      });
    }
    row.issues = issues;
    if (issues.some((d) => d.level === 'error')) row.result = 'fail';
    else if (issues.some((d) => d.level === 'warning')) row.result = 'pending';
    else row.result = 'success';
  }

  /** 批量校验所有行 */
  function validateAllRows() {
    rows.value.forEach(validateRow);
    rows.value.forEach((r) => (r._dirty = false));
    dirty.value = false;
  }

  /** 重新校验（仅对修改过的行，或全部） */
  const revalidate = () => {
    revalidating.value = true;
    setTimeout(() => {
      rows.value.forEach((r) => {
        if (r._dirty) validateRow(r);
        r._dirty = false;
      });
      dirty.value = false;
      revalidating.value = false;
      const msg =
        failCount.value === 0
          ? `校验通过，${successCount.value + pendingCount.value} 条数据可导入`
          : `仍有 ${failCount.value} 条失败数据，请继续修改`;
      EleMessage[failCount.value === 0 ? 'success' : 'warning']({
        message: msg,
        plain: true
      });
    }, 400);
  };

  /** 删除一行（仅允许删除失败行，相当于“忽略此条”） */
  const handleRemoveRow = (row) => {
    ElMessageBox.confirm(
      '确定要忽略此条数据？忽略后该条数据将不会被导入。',
      '提示',
      { type: 'warning' }
    )
      .then(() => {
        const idx = rows.value.indexOf(row);
        if (idx > -1) rows.value.splice(idx, 1);
        // 重排行号保持原样，不重新编号
        EleMessage.success({ message: '已忽略此条数据', plain: true });
      })
      .catch(() => {});
  };

  /** 内嵌修改弹窗 */
  const editDialogVisible = ref(false);
  const editFormRef = ref(null);
  const editingRow = ref(null);
  const editingOriginal = ref(null);

  const handleEditRow = (row) => {
    editingOriginal.value = row;
    // 深拷贝到编辑态，保存时回写
    editingRow.value = reactive({
      ...row,
      scores: { ...row.scores }
    });
    // 确保所有项目 code 都有初始值
    applicableItems.value.forEach((it) => {
      if (editingRow.value.scores[it.code] == null) {
        editingRow.value.scores[it.code] = '';
      }
    });
    editDialogVisible.value = true;
  };

  const saveEdit = () => {
    if (!editingRow.value || !editingOriginal.value) return;
    const r = editingOriginal.value;
    r.studentNo = editingRow.value.studentNo;
    r.studentName = editingRow.value.studentName;
    r.sex = editingRow.value.sex;
    r.testDate = editingRow.value.testDate;
    r.remark = editingRow.value.remark;
    r.scores = { ...editingRow.value.scores };
    r._dirty = true;
    dirty.value = true;
    editDialogVisible.value = false;
    EleMessage.success({
      message: '已保存修改，请点击“重新校验”更新校验结果',
      plain: true
    });
  };

  const exportResult = () => {
    EleMessage.success({ message: '校验结果导出成功', plain: true });
  };

  const confirmImport = () => {
    if (confirmDisabledReason.value) return;
    confirmLoading.value = true;
    setTimeout(() => {
      const now = formatNow();
      const plan = currentPlan.value;
      rows.value
        .filter((d) => d.result !== 'fail')
        .forEach((item) => {
          recordStore.list.unshift({
            recordId: recordStore.nextId++,
            studentName: item.studentName,
            studentNo: item.studentNo,
            sex: item.sex,
            sexName: item.sex === 'male' ? '男' : '女',
            age: null,
            school: params.school,
            stage: params.stage,
            grade: params.grade,
            className: params.className || '1班',
            planId: params.planId,
            planName: plan?.planName,
            testDate: item.testDate,
            schoolYear: params.schoolYear,
            term: params.term,
            recordType: params.recordType,
            status: 'valid',
            remark: item.remark || '批量导入',
            scores: { ...item.scores },
            bmi: calcBMI(item.scores.height, item.scores.weight),
            totalScore: '',
            grade_level: '',
            createBy: '体测管理员',
            createTime: now,
            updateBy: '体测管理员',
            updateTime: now,
            invalidReason: ''
          });
        });
      confirmLoading.value = false;
      EleMessage.success({
        message: `导入成功，共 ${successCount.value + pendingCount.value} 条记录`,
        plain: true
      });
      emit('done');
      closeModal();
    }, 600);
  };

  function calcBMI(h, w) {
    const hNum = parseFloat(h);
    const wNum = parseFloat(w);
    if (!hNum || !wNum) return '';
    return (wNum / Math.pow(hNum / 100, 2)).toFixed(1);
  }

  function formatNow() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
</script>

<style lang="scss" scoped>
  .import-steps {
    padding: 0 24px 8px;
    margin-bottom: 24px;
  }
  .step-body {
    min-height: 320px;
    padding: 4px 4px 72px;
  }
  .template-block {
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    padding: 16px 20px;
    margin-top: 8px;

    .template-title {
      display: flex;
      align-items: center;
      font-weight: 600;
      color: var(--el-text-color-primary);
      font-size: 14px;
      margin-bottom: 8px;

      .el-icon {
        margin-right: 6px;
        color: var(--el-color-primary);
      }
    }
    .template-tips {
      color: var(--el-text-color-regular);
      font-size: 13px;
      line-height: 1.7;
      padding-left: 20px;
      margin: 4px 0 12px;

      li {
        list-style: disc;
      }
    }
  }

  .upload-area {
    border: 1px dashed var(--el-border-color);
    border-radius: 8px;
    padding: 40px 24px;
    background: var(--el-fill-color-blank);
    min-height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .upload-placeholder {
    text-align: center;
    .upload-text {
      margin-top: 10px;
      color: var(--el-text-color-primary);
      font-size: 15px;
      font-weight: 500;
    }
    .upload-hint {
      margin-top: 4px;
      color: var(--el-text-color-secondary);
      font-size: 13px;
    }
  }
  .upload-file {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: var(--el-fill-color-light);
    border-radius: 6px;
  }
  .upload-file-info {
    display: flex;
    align-items: center;
  }
  .upload-file-name {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  .upload-file-hint {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin-top: 2px;
  }

  /* 全局参数卡片 */
  .global-params {
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 16px;

    .global-params-title {
      display: flex;
      align-items: center;
      font-size: 13px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;

      .el-icon {
        margin-right: 6px;
        color: var(--el-color-primary);
      }
    }
    .global-params-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 6px 16px;
    }
    .global-param-item {
      font-size: 13px;
      line-height: 1.8;

      .label {
        color: var(--el-text-color-secondary);
      }
      .value {
        color: var(--el-text-color-primary);
        font-weight: 500;
      }
    }
  }

  .result-summary {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;

    .summary-item {
      flex: 1;
      padding: 16px 14px;
      border-radius: 6px;
      background: var(--el-fill-color-light);
      border: 1px solid var(--el-border-color-lighter);
      text-align: center;
    }
    .summary-count {
      font-size: 22px;
      font-weight: 700;
      line-height: 1;
    }
    .summary-label {
      margin-top: 6px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
    .summary-total .summary-count {
      color: var(--el-text-color-primary);
    }
    .summary-success .summary-count {
      color: var(--el-color-success);
    }
    .summary-fail .summary-count {
      color: var(--el-color-danger);
    }
    .summary-pending .summary-count {
      color: var(--el-color-warning);
    }
  }
  .result-tabs {
    margin-bottom: 4px;
  }
  .result-table {
    margin-top: 4px;
  }

  /* 问题说明列表 */
  .issue-list {
    list-style: none;
    padding: 0;
    margin: 0;
    line-height: 1.7;
  }
  .issue-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 2px;

    .issue-field {
      margin-right: 6px;
      flex-shrink: 0;
    }
    .issue-msg {
      color: var(--el-text-color-regular);
      font-size: 13px;
    }
    &.issue-warning .issue-msg {
      color: var(--el-color-warning);
    }
    &.issue-error .issue-msg {
      color: var(--el-color-danger);
    }
  }

  .step-footer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 12px 24px;
    background: var(--el-bg-color);
    border-top: 1px solid var(--el-border-color-lighter);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .step-footer-left,
  .step-footer-right {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  /* 内嵌编辑弹窗 - 项目必填星号 */
  .edit-item.is-required :deep(.el-form-item__label)::before {
    content: '*';
    color: var(--el-color-danger);
    margin-right: 4px;
    font-family: SimSun, sans-serif;
  }
  .section-divider {
    margin-top: 4px;
    margin-bottom: 18px;
    :deep(.el-divider__text) {
      font-weight: 600;
      background: var(--el-bg-color);
    }
  }
</style>
