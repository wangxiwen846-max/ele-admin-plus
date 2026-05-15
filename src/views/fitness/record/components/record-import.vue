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
      <el-step title="基本信息" description="填写导入范围与方案" />
      <el-step title="上传文件" description="下载模板 / 上传 Excel" />
      <el-step title="校验结果" description="修改 / 重新校验 / 确认导入" />
    </el-steps>

    <!-- Step 1: 导入基本信息 -->
    <div v-show="step === 0" class="step-body">
      <!-- 角色切换（仅原型演示用） -->
      <el-alert type="info" :closable="false" show-icon style="margin-bottom: 16px">
        <template #title>
          <span>演示角色：</span>
          <el-radio-group v-model="role" size="small" style="margin-left: 8px" @change="handleRoleChange">
            <el-radio-button v-for="r in ROLE_OPTIONS" :key="r.value" :value="r.value">
              {{ r.label }}
            </el-radio-button>
          </el-radio-group>
        </template>
      </el-alert>

      <el-form
        ref="paramFormRef"
        :model="params"
        :rules="paramRules"
        label-width="110px"
        @submit.prevent=""
      >
        <el-row :gutter="16">
          <!-- 只读：所在单位（学校管理员/普通教师自动带出） -->
          <el-col v-if="role !== 'admin'" :sm="12" :xs="24">
            <el-form-item label="所在单位">
              <el-input :model-value="MOCK_SCHOOL_UNIT" readonly />
              <span class="auto-tag">自动带出</span>
            </el-form-item>
          </el-col>
          <!-- 可选：所在单位（admin） -->
          <el-col v-if="role === 'admin'" :sm="12" :xs="24">
            <el-form-item label="所在单位">
              <el-select
                v-model="params.unit"
                placeholder="请选择所在单位"
                clearable
                class="ele-fluid"
                @change="handleUnitChange"
              >
                <el-option v-for="opt in UNIT_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 只读：学校（普通教师自动带出） -->
          <el-col v-if="role === 'teacher'" :sm="12" :xs="24">
            <el-form-item label="学校">
              <el-input :model-value="MOCK_TEACHER_SCHOOL" readonly />
              <span class="auto-tag">自动带出</span>
            </el-form-item>
          </el-col>
          <!-- 可选：学校（school/admin） -->
          <el-col v-if="role !== 'teacher'" :sm="12" :xs="24">
            <el-form-item label="学校" prop="school">
              <el-select
                v-model="params.school"
                placeholder="请选择学校"
                class="ele-fluid"
                @change="handleSchoolChange"
              >
                <el-option
                  v-for="opt in filteredSchoolOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 只读：年级（普通教师自动带出） -->
          <el-col v-if="role === 'teacher'" :sm="12" :xs="24">
            <el-form-item label="年级">
              <el-input :model-value="MOCK_TEACHER_GRADE" readonly />
              <span class="auto-tag">自动带出</span>
            </el-form-item>
          </el-col>
          <!-- 可选：年级（school/admin） -->
          <el-col v-if="role !== 'teacher'" :sm="12" :xs="24">
            <el-form-item label="年级" prop="grade">
              <el-select
                v-model="params.grade"
                placeholder="请选择年级"
                class="ele-fluid"
                @change="handleGradeChange"
              >
                <el-option v-for="g in ALL_GRADES" :key="g" :label="g" :value="g" />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 班级（可选，不选则按全年级导入） -->
          <el-col :sm="12" :xs="24">
            <el-form-item label="班级">
              <el-select
                v-model="params.className"
                :placeholder="role === 'teacher' ? '默认带出，可不填' : '可选，不填则按全年级'"
                clearable
                class="ele-fluid"
              >
                <el-option v-for="c in CLASS_OPTIONS" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 体测方案 -->
          <el-col :sm="12" :xs="24">
            <el-form-item label="体测方案" prop="planId">
              <el-select
                v-model="params.planId"
                placeholder="请选择体测方案"
                class="ele-fluid"
                :disabled="noPlansAvailable"
              >
                <el-option
                  v-for="p in availablePlans"
                  :key="p.planId"
                  :label="p.planName"
                  :value="p.planId"
                />
              </el-select>
              <div v-if="noPlansAvailable" class="no-plan-tip">
                暂无可用体测方案，请先配置方案
              </div>
            </el-form-item>
          </el-col>

          <!-- 只读：方案适用期限（自动带出） -->
          <el-col :sm="12" :xs="24">
            <el-form-item label="方案适用期限">
              <el-input :model-value="planTimeLabel" placeholder="选择方案后自动带出" readonly />
            </el-form-item>
          </el-col>

          <!-- 测试日期 -->
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

          <!-- 记录类型 -->
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

      <!-- 模板说明 -->
      <div class="template-block">
        <div class="template-title">
          <el-icon><FileOutlined /></el-icon>
          <span>导入模板说明</span>
        </div>
        <ul class="template-tips">
          <li>
            请先填写以上基本信息，再点击"下载模板"获取本次专用 Excel 模板。
          </li>
          <li>
            模板字段根据所选体测方案动态生成，
            <b>{{ params.className ? '按班级导入：学号、学生姓名、体测项目成绩、备注。' : '按年级导入：班级、学号、学生姓名、体测项目成绩、备注。' }}</b>
          </li>
          <li>学号为 1-99 的整数；Excel 不需要填写学校、年级等基本信息字段。</li>
          <li>必填项目若缺失将在校验结果中标记为"失败"。</li>
        </ul>
        <el-tooltip
          :disabled="canDownloadTemplate"
          content="请先填写体测方案、测试日期、记录类型后再下载模板"
        >
          <span>
            <el-button
              :icon="DownloadOutlined"
              class="ele-btn-icon"
              :disabled="!canDownloadTemplate"
              @click="handleDownloadTemplate"
            >
              下载模板
            </el-button>
          </span>
        </el-tooltip>
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
          <div class="upload-hint">支持 .xlsx / .xls 格式，文件大小不超过 5MB</div>
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
              <div class="upload-file-hint">已上传 · 点击"重新上传"可更换文件</div>
            </div>
          </div>
          <el-button size="small" :icon="ReloadOutlined" @click="handleSelectFile">
            重新上传
          </el-button>
        </div>
      </div>
    </div>

    <!-- Step 3: 校验结果 -->
    <div v-show="step === 2" class="step-body">
      <!-- 全局参数（只读摘要） -->
      <div class="global-params">
        <div class="global-params-title">
          <el-icon><InfoCircleFilled /></el-icon>
          <span>本次导入全局参数（不支持逐条修改）</span>
        </div>
        <div class="global-params-grid">
          <div class="global-param-item">
            <span class="label">学校：</span>
            <span class="value">{{ effectiveSchool }}</span>
          </div>
          <div class="global-param-item">
            <span class="label">年级：</span>
            <span class="value">{{ effectiveGrade }}</span>
          </div>
          <div class="global-param-item" v-if="params.className">
            <span class="label">班级：</span>
            <span class="value">{{ params.className }}</span>
          </div>
          <div class="global-param-item">
            <span class="label">体测方案：</span>
            <span class="value">{{ planName }}</span>
          </div>
          <div class="global-param-item">
            <span class="label">方案适用时间：</span>
            <span class="value">{{ planTimeLabel }}</span>
          </div>
          <div class="global-param-item">
            <span class="label">测试日期：</span>
            <span class="value">{{ params.testDate }}</span>
          </div>
          <div class="global-param-item">
            <span class="label">记录类型：</span>
            <span class="value">{{ recordTypeLabel }}</span>
          </div>
          <div class="global-param-item">
            <span class="label">导入模式：</span>
            <span class="value">{{ params.className ? '按班级导入' : '按年级导入' }}</span>
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
        <div class="summary-item summary-confirmed">
          <div class="summary-count">{{ confirmedCount }}</div>
          <div class="summary-label">已确认</div>
        </div>
      </div>

      <!-- 提示区 -->
      <ele-alert v-if="dirty" type="warning" show-icon :closable="false" style="margin-bottom: 12px">
        <template #title>
          已修改 {{ dirtyCount }} 条数据，请点击<b>重新校验</b>后再进行导入。
        </template>
      </ele-alert>
      <ele-alert v-else-if="failCount > 0" type="error" show-icon :closable="false" style="margin-bottom: 12px">
        <template #title>
          有 {{ failCount }} 条数据校验失败，请点击"修改"按钮修正后重新校验，失败条数为 0 才能确认导入。
        </template>
      </ele-alert>
      <ele-alert v-else-if="pendingCount > 0" type="warning" show-icon :closable="false" style="margin-bottom: 12px">
        <template #title>
          有 {{ pendingCount }} 条数据存在异常提示（待确认），核对无误后请点击"确认无误"，或点击"修改"进行调整。
        </template>
        <template #default>
          <div style="margin-top: 4px">
            <el-button type="warning" size="small" :icon="CheckOutlined" @click="confirmAllPending">
              全部确认无误
            </el-button>
          </div>
        </template>
      </ele-alert>
      <ele-alert v-else type="success" show-icon :closable="false" style="margin-bottom: 12px">
        <template #title>
          数据校验通过，共 {{ successCount + confirmedCount }} 条数据可导入。
        </template>
      </ele-alert>

      <el-tabs v-model="resultTab" class="result-tabs">
        <el-tab-pane name="all"><template #label>全部 ({{ rows.length }})</template></el-tab-pane>
        <el-tab-pane name="success">
          <template #label><span style="color: var(--el-color-success)">成功 ({{ successCount }})</span></template>
        </el-tab-pane>
        <el-tab-pane name="fail">
          <template #label><span style="color: var(--el-color-danger)">失败 ({{ failCount }})</span></template>
        </el-tab-pane>
        <el-tab-pane name="pending">
          <template #label><span style="color: var(--el-color-warning)">待确认 ({{ pendingCount }})</span></template>
        </el-tab-pane>
        <el-tab-pane name="confirmed">
          <template #label><span style="color: var(--el-color-success)">已确认 ({{ confirmedCount }})</span></template>
        </el-tab-pane>
      </el-tabs>

      <el-table :data="filteredRows" border size="default" class="result-table" max-height="340">
        <el-table-column label="行号" prop="row" width="60" align="center" fixed="left" />
        <el-table-column label="状态" width="88" align="center" fixed="left">
          <template #default="{ row }">
            <el-tag v-if="row.result === 'success'" type="success" size="small" :disable-transitions="true">成功</el-tag>
            <el-tag v-else-if="row.result === 'fail'" type="danger" size="small" :disable-transitions="true">失败</el-tag>
            <el-tag v-else-if="row._confirmed" type="success" size="small" effect="plain" :disable-transitions="true">已确认</el-tag>
            <el-tag v-else type="warning" size="small" :disable-transitions="true">待确认</el-tag>
          </template>
        </el-table-column>
        <!-- 按年级导入时展示班级列 -->
        <el-table-column v-if="!params.className" label="班级" prop="className" width="90" align="center" />
        <el-table-column label="学号" prop="studentNo" width="72" align="center" />
        <el-table-column label="学生姓名" prop="studentName" width="110" />
        <el-table-column label="性别" width="70" align="center">
          <template #default="{ row }">
            {{ row.sex === 'male' ? '男' : row.sex === 'female' ? '女' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="已填项目" width="90" align="center">
          <template #default="{ row }">
            {{ enteredItemCount(row) }} / {{ applicableItems.length }}
          </template>
        </el-table-column>
        <el-table-column label="问题说明" min-width="240">
          <template #default="{ row }">
            <div v-if="!row.issues || !row.issues.length" style="color: var(--el-text-color-placeholder)">
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
        <el-table-column label="操作" width="190" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link :icon="EditOutlined" @click="handleEditRow(row)">
              修改
            </el-button>
            <el-button
              v-if="row.result === 'pending' && !row._confirmed"
              type="warning" size="small" link :icon="CheckOutlined"
              @click="handleConfirmRow(row)"
            >
              确认无误
            </el-button>
            <el-button
              v-else-if="row.result === 'pending' && row._confirmed"
              type="info" size="small" link :icon="UndoOutlined"
              @click="handleUnconfirmRow(row)"
            >
              撤销确认
            </el-button>
            <el-button
              v-if="row.result === 'fail'"
              type="danger" size="small" link :icon="DeleteOutlined"
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
        <el-button v-if="step === 2" :icon="DownloadOutlined" @click="exportResult">
          导出校验结果
        </el-button>
      </div>
      <div class="step-footer-right">
        <el-button @click="handleCancel">取消</el-button>
        <el-button v-if="step === 0" type="primary" @click="nextFromStep0">下一步</el-button>
        <el-button v-else-if="step === 1" type="primary" :disabled="!fileName" @click="nextFromStep1">
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
          <el-tooltip :disabled="!confirmDisabledReason" :content="confirmDisabledReason" placement="top">
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

    <!-- 内嵌修改弹窗 -->
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
        <el-divider content-position="left" class="section-divider">基本信息</el-divider>
        <el-row :gutter="16">
          <!-- 按年级导入时，班级可在线修改 -->
          <el-col v-if="!params.className" :sm="12" :xs="24">
            <el-form-item label="班级" required>
              <el-select v-model="editingRow.className" class="ele-fluid">
                <el-option v-for="c in CLASS_OPTIONS" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="学号" required>
              <el-input-number
                v-model="editingRow.studentNo"
                :min="1" :max="99" :controls="false"
                placeholder="请输入 1-99 的整数"
                class="ele-fluid"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="学生姓名" required>
              <el-input v-model.trim="editingRow.studentName" placeholder="请输入学生姓名" :maxlength="20" />
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

        <el-divider content-position="left" class="section-divider">体测项目成绩</el-divider>
        <el-row :gutter="16">
          <el-col v-for="item in applicableItems" :key="item.code" :sm="12" :xs="24">
            <el-form-item
              :label="item.name"
              :class="['edit-item', { 'is-required': item.required }]"
            >
              <el-input v-model="editingRow.scores[item.code]" :placeholder="`请输入 ${item.name}`">
                <template #append>{{ item.unit }}</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left" class="section-divider">备注</el-divider>
        <el-form-item label="备注">
          <el-input
            type="textarea" :rows="2" :maxlength="200"
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
    InfoCircleFilled,
    CheckOutlined,
    UndoOutlined
  } from '@/components/icons';
  import {
    ROLE_OPTIONS,
    UNIT_OPTIONS,
    SCHOOL_OPTIONS,
    CLASS_OPTIONS,
    GRADE_OPTIONS,
    planStore,
    recordStore,
    getStageLabel,
    getRecordTypeLabel,
    getSchoolInfo,
    matchPlans,
    formatPlanTime,
    currentRole
  } from '@/views/fitness/data.js';

  const emit = defineEmits(['done']);

  const { modalProps, closeModal } = useModal();

  const step = ref(0);
  const paramFormRef = ref(null);
  const fileName = ref('');
  const confirmLoading = ref(false);
  const revalidating = ref(false);
  const resultTab = ref('all');

  /** 演示角色 */
  const role = ref(currentRole.value);

  /** 所有年级平铺 */
  const ALL_GRADES = Object.values(GRADE_OPTIONS).flat();

  /** Mock：普通教师固定学校和年级 */
  const MOCK_TEACHER_SCHOOL = '阳光实验小学';
  const MOCK_TEACHER_GRADE  = '三年级';
  const MOCK_SCHOOL_UNIT    = '广东省广州市教育局';

  /** 根据年级推断学段 */
  function inferStageFromGrade(grade) {
    for (const [stage, grades] of Object.entries(GRADE_OPTIONS)) {
      if (grades.includes(grade)) return stage;
    }
    return '';
  }

  const params = reactive({
    unit: '',
    school: '',
    schoolRegion: '',
    schoolRegionLabel: '',
    stage: '',
    grade: '',
    className: '',
    planId: '',
    testDate: '',
    recordType: 'normal'
  });

  /** 学校列表：admin 时可按 unit 过滤 */
  const filteredSchoolOptions = computed(() => {
    if (role.value === 'admin' && params.unit) {
      return SCHOOL_OPTIONS.filter((s) => s.unit === params.unit);
    }
    return SCHOOL_OPTIONS;
  });

  /** 有效学校（普通教师用 Mock 值） */
  const effectiveSchool = computed(() =>
    role.value === 'teacher' ? MOCK_TEACHER_SCHOOL : params.school
  );

  /** 有效年级（普通教师用 Mock 值） */
  const effectiveGrade = computed(() =>
    role.value === 'teacher' ? MOCK_TEACHER_GRADE : params.grade
  );

  const stageLabel = computed(() => {
    const grade = effectiveGrade.value;
    if (!grade) return '';
    return getStageLabel(inferStageFromGrade(grade));
  });

  const paramRules = computed(() => {
    const rules = {
      planId: [{ required: true, message: '请选择体测方案', trigger: 'change' }],
      testDate: [{ required: true, message: '请选择测试日期', trigger: 'change' }],
      recordType: [{ required: true, message: '请选择记录类型', trigger: 'change' }]
    };
    if (role.value !== 'teacher') {
      rules.school = [{ required: true, message: '请选择学校', trigger: 'change' }];
      rules.grade  = [{ required: true, message: '请选择年级', trigger: 'change' }];
    }
    return rules;
  });

  /** 按地区+学段+年级匹配可用方案 */
  const availablePlans = computed(() => {
    const schoolInfo = role.value === 'teacher'
      ? getSchoolInfo(MOCK_TEACHER_SCHOOL)
      : getSchoolInfo(params.school);
    const grade = effectiveGrade.value;
    const stage = grade ? inferStageFromGrade(grade) : '';
    const { prioritized } = matchPlans({
      region: schoolInfo?.region || undefined,
      stage: stage || undefined,
      grade: grade || undefined
    });
    return prioritized;
  });

  const noPlansAvailable = computed(
    () => availablePlans.value.length === 0 && !!effectiveGrade.value
  );

  /** 全局参数展示 */
  const recordTypeLabel = computed(() => getRecordTypeLabel(params.recordType));
  const currentPlan = computed(() =>
    planStore.list.find((p) => p.planId === params.planId)
  );
  const planName     = computed(() => currentPlan.value?.planName ?? '-');
  const planTimeLabel = computed(() => currentPlan.value ? formatPlanTime(currentPlan.value) : '-');

  /** 模板下载条件：方案、测试日期、记录类型均已填 */
  const canDownloadTemplate = computed(
    () => !!params.planId && !!params.testDate && !!params.recordType
  );

  /** 方案适用项目（不分性别，用于模板字段和校验） */
  const applicableItems = computed(() => {
    if (!currentPlan.value) return [];
    return (currentPlan.value.items || [])
      .filter((d) => d.enabled)
      .slice()
      .sort((a, b) => a.sort - b.sort);
  });

  const handleUnitChange = () => {
    params.school = '';
    params.schoolRegion = '';
    params.schoolRegionLabel = '';
    params.planId = '';
  };

  const handleSchoolChange = (schoolName) => {
    const info = getSchoolInfo(schoolName);
    params.schoolRegion = info?.region ?? '';
    params.schoolRegionLabel = info?.regionLabel ?? '';
    params.planId = '';
  };

  const handleGradeChange = () => {
    params.planId = '';
  };

  const handleRoleChange = () => {
    params.unit = '';
    params.school = '';
    params.schoolRegion = '';
    params.schoolRegionLabel = '';
    params.grade = '';
    params.planId = '';
    params.className = '';
  };

  /** 校验行数据 */
  const rows = ref([]);
  const dirty = ref(false);
  const dirtyCount = computed(() => rows.value.filter((r) => r._dirty).length);

  const successCount  = computed(() => rows.value.filter((r) => r.result === 'success').length);
  const failCount     = computed(() => rows.value.filter((r) => r.result === 'fail').length);
  const pendingCount  = computed(() => rows.value.filter((r) => r.result === 'pending' && !r._confirmed).length);
  const confirmedCount = computed(() => rows.value.filter((r) => r.result === 'pending' && r._confirmed).length);

  const filteredRows = computed(() => {
    if (resultTab.value === 'success')   return rows.value.filter((d) => d.result === 'success');
    if (resultTab.value === 'fail')      return rows.value.filter((d) => d.result === 'fail');
    if (resultTab.value === 'pending')   return rows.value.filter((d) => d.result === 'pending' && !d._confirmed);
    if (resultTab.value === 'confirmed') return rows.value.filter((d) => d.result === 'pending' && d._confirmed);
    return rows.value;
  });

  const confirmDisabledReason = computed(() => {
    if (dirty.value) return '存在已修改但未重新校验的数据，请先点击"重新校验"';
    if (failCount.value > 0) return `仍有 ${failCount.value} 条失败数据，请先修改后重新校验`;
    if (pendingCount.value > 0) return `仍有 ${pendingCount.value} 条待确认数据，请逐条核对后点击"确认无误"`;
    return '';
  });

  const handleCancel = () => closeModal();
  const prevStep = () => { if (step.value > 0) step.value -= 1; };

  const nextFromStep0 = () => {
    paramFormRef.value?.validate?.((valid) => {
      if (!valid) return;
      step.value = 1;
    });
  };

  const handleSelectFile = () => {
    const grade = effectiveGrade.value || '';
    fileName.value = `体测数据_${grade}_${params.testDate || ''}.xlsx`;
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

  function mockScoreValue(code) {
    switch (code) {
      case 'height':        return (140 + Math.floor(Math.random() * 40)).toFixed(1);
      case 'weight':        return (35  + Math.floor(Math.random() * 30)).toFixed(1);
      case 'vitalCapacity': return String(1800 + Math.floor(Math.random() * 1800));
      case 'sprint50':      return (8   + Math.random() * 3).toFixed(1);
      case 'sitAndReach':   return (5   + Math.random() * 12).toFixed(1);
      case 'ropeSkipping1Min': return String(80 + Math.floor(Math.random() * 80));
      case 'sitUp1Min':     return String(20 + Math.floor(Math.random() * 30));
      case 'shuttleRun50x8': return (90 + Math.random() * 30).toFixed(1);
      case 'longJump':      return String(140 + Math.floor(Math.random() * 60));
      case 'pullUp':        return String(Math.floor(Math.random() * 15));
      case 'run800':
      case 'run1000':       return String(210 + Math.floor(Math.random() * 80));
      default:              return '';
    }
  }

  const CLASS_LIST = ['1班', '2班', '3班', '4班'];

  function generateMockRows() {
    const mockNames = ['林可心', '苏梓轩', '韩雨泽', '蒋子墨', '范晓彤', '唐俊熙', '谢若萱', '田一鸣', '石浩然', '魏若曦'];
    const sexes = ['male', 'female'];
    rows.value = mockNames.map((name, i) => {
      const scores = {};
      applicableItems.value.forEach((it) => { scores[it.code] = mockScoreValue(it.code); });
      const row = {
        row: i + 2,
        // 按年级导入时才有班级字段
        className: params.className || CLASS_LIST[i % CLASS_LIST.length],
        studentNo: i + 5,
        studentName: name,
        sex: sexes[i % 2],
        testDate: params.testDate,
        scores,
        remark: '',
        result: 'success',
        issues: [],
        _dirty: false,
        _confirmed: false
      };
      if (i === 2) { row.studentNo = 150; }
      else if (i === 5) {
        const firstRequired = applicableItems.value.find((d) => d.required);
        if (firstRequired) row.scores[firstRequired.code] = '';
      } else if (i === 7) {
        if (row.scores.weight) row.scores.weight = '145';
      } else if (i === 8) {
        row.studentName = '';
      }
      return row;
    });
  }

  function validateRow(row) {
    const issues = [];
    if (!params.className) {
      // 按年级导入：校验班级
      if (!row.className) {
        issues.push({ field: '班级', message: '班级未填写', level: 'error' });
      }
    }
    if (row.studentNo == null || row.studentNo === '' || Number.isNaN(Number(row.studentNo))) {
      issues.push({ field: '学号', message: '学号未填写', level: 'error' });
    } else if (Number(row.studentNo) < 1 || Number(row.studentNo) > 99 || !Number.isInteger(Number(row.studentNo))) {
      issues.push({ field: '学号', message: '学号须为 1-99 的整数', level: 'error' });
    }
    if (!row.studentName || !String(row.studentName).trim()) {
      issues.push({ field: '学生姓名', message: '学生姓名未填写', level: 'error' });
    }
    if (!row.sex) {
      issues.push({ field: '性别', message: '性别未填写', level: 'error' });
    }
    if (!row.testDate) {
      issues.push({ field: '测试日期', message: '测试日期未填写', level: 'error' });
    }
    applicableItems.value.forEach((it) => {
      if (!it.required) return;
      const v = row.scores?.[it.code];
      const applicable =
        it.gender === 'all' ||
        (it.gender === 'male'   && row.sex === 'male') ||
        (it.gender === 'female' && row.sex === 'female');
      if (!applicable) return;
      if (v === '' || v == null) {
        issues.push({ field: it.name, message: `${it.name}未填写`, level: 'error' });
        return;
      }
      const num = Number(v);
      if (Number.isNaN(num) || num <= 0) {
        issues.push({ field: it.name, message: `${it.name}数据无效`, level: 'error' });
        return;
      }
      if (it.code === 'weight' && num > 120) {
        issues.push({ field: it.name, message: `体重 ${num}kg 异常偏高，请核实`, level: 'warning' });
      }
      if (it.code === 'height' && num > 200) {
        issues.push({ field: it.name, message: `身高 ${num}cm 异常偏高，请核实`, level: 'warning' });
      }
    });
    const hasError   = issues.some((i) => i.level === 'error');
    const hasWarning = issues.some((i) => i.level === 'warning');
    row.issues = issues;
    row.result = hasError ? 'fail' : hasWarning ? 'pending' : 'success';
  }

  function validateAllRows() {
    rows.value.forEach((r) => validateRow(r));
  }

  const revalidate = () => {
    revalidating.value = true;
    setTimeout(() => {
      rows.value.forEach((r) => { if (r._dirty) validateRow(r); r._dirty = false; });
      dirty.value = false;
      revalidating.value = false;
      let msg, type = 'success';
      if (failCount.value > 0) { msg = `仍有 ${failCount.value} 条失败数据，请继续修改`; type = 'warning'; }
      else if (pendingCount.value > 0) { msg = `失败 0 条，存在 ${pendingCount.value} 条待确认数据，请逐条确认后再导入`; type = 'warning'; }
      else { msg = `校验通过，${successCount.value + confirmedCount.value} 条数据可导入`; }
      EleMessage[type]({ message: msg, plain: true });
    }, 400);
  };

  const handleConfirmRow = (row) => {
    row._confirmed = true;
    EleMessage.success({ message: `已确认第 ${row.row} 行数据`, plain: true });
  };

  const handleUnconfirmRow = (row) => {
    row._confirmed = false;
    EleMessage.info({ message: `已撤销第 ${row.row} 行的确认状态`, plain: true });
  };

  const confirmAllPending = () => {
    const targets = rows.value.filter((r) => r.result === 'pending' && !r._confirmed);
    if (!targets.length) { EleMessage.info({ message: '当前没有待确认的数据', plain: true }); return; }
    ElMessageBox.confirm(
      `共 ${targets.length} 条待确认数据，确认全部已核对无误并允许导入？`,
      '批量确认',
      { type: 'warning' }
    ).then(() => {
      targets.forEach((r) => (r._confirmed = true));
      EleMessage.success({ message: `已确认 ${targets.length} 条数据`, plain: true });
    }).catch(() => {});
  };

  const handleRemoveRow = (row) => {
    ElMessageBox.confirm('确定要忽略此条数据？忽略后该条数据将不会被导入。', '提示', { type: 'warning' })
      .then(() => {
        const idx = rows.value.indexOf(row);
        if (idx > -1) rows.value.splice(idx, 1);
        EleMessage.success({ message: '已忽略此条数据', plain: true });
      }).catch(() => {});
  };

  const editDialogVisible = ref(false);
  const editFormRef = ref(null);
  const editingRow = ref(null);
  const editingOriginal = ref(null);

  const handleEditRow = (row) => {
    editingOriginal.value = row;
    editingRow.value = reactive({ ...row, scores: { ...row.scores } });
    applicableItems.value.forEach((it) => {
      if (editingRow.value.scores[it.code] == null) editingRow.value.scores[it.code] = '';
    });
    editDialogVisible.value = true;
  };

  const saveEdit = () => {
    if (!editingRow.value || !editingOriginal.value) return;
    const r = editingOriginal.value;
    if (!params.className) r.className = editingRow.value.className;
    r.studentNo   = editingRow.value.studentNo;
    r.studentName = editingRow.value.studentName;
    r.sex         = editingRow.value.sex;
    r.testDate    = editingRow.value.testDate;
    r.remark      = editingRow.value.remark;
    r.scores      = { ...editingRow.value.scores };
    r._dirty      = true;
    r._confirmed  = false;
    dirty.value   = true;
    editDialogVisible.value = false;
    EleMessage.success({ message: '已保存修改，请点击"重新校验"更新校验结果', plain: true });
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
          const school = effectiveSchool.value;
          const schoolInfo = getSchoolInfo(school);
          const grade  = effectiveGrade.value;
          recordStore.list.unshift({
            recordId: recordStore.nextId++,
            studentName: item.studentName,
            studentNo: item.studentNo,
            sex: item.sex,
            sexName: item.sex === 'male' ? '男' : '女',
            age: null,
            school,
            stage: inferStageFromGrade(grade),
            grade,
            className: params.className || item.className || '1班',
            planId: params.planId,
            planName: plan?.planName,
            testDate: item.testDate,
            schoolYear: plan?.timeType === 'specific' ? plan.schoolYear : '2025-2026',
            term: plan?.timeType === 'specific' ? plan.term : 'fall',
            recordType: params.recordType,
            status: 'valid',
            remark: item.remark || '批量导入',
            scores: { ...item.scores },
            bmi: calcBMI(item.scores.height, item.scores.weight),
            totalScore: '', grade_level: '',
            createBy: '体测管理员', createTime: now,
            updateBy: '体测管理员', updateTime: now,
            invalidReason: ''
          });
        });
      confirmLoading.value = false;
      EleMessage.success({
        message: `导入成功，共 ${successCount.value + confirmedCount.value} 条记录`,
        plain: true
      });
      emit('done');
      closeModal();
    }, 600);
  };

  function calcBMI(h, w) {
    const hNum = parseFloat(h), wNum = parseFloat(w);
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
  .no-plan-tip {
    font-size: 12px;
    color: var(--el-color-warning);
    margin-top: 4px;
    line-height: 1.4;
  }
  .auto-tag {
    font-size: 12px;
    color: var(--el-color-info);
    margin-left: 8px;
    background: var(--el-fill-color-light);
    padding: 1px 6px;
    border-radius: 4px;
  }
  .step-body {
    min-height: 200px;
  }
  .template-block {
    margin-top: 20px;
    padding: 16px;
    background: var(--el-fill-color-light);
    border-radius: 6px;
    border: 1px solid var(--el-border-color-lighter);
  }
  .template-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    margin-bottom: 10px;
    color: var(--el-text-color-primary);
  }
  .template-tips {
    margin: 0 0 14px 16px;
    padding: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    line-height: 1.8;
  }
  .upload-area {
    min-height: 200px;
    border: 1.5px dashed var(--el-border-color);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .upload-placeholder {
    text-align: center;
    padding: 32px;
  }
  .upload-text {
    margin-top: 12px;
    font-size: 15px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
  .upload-hint {
    margin-top: 4px;
    font-size: 13px;
    color: var(--el-text-color-placeholder);
  }
  .upload-file {
    width: 100%;
    padding: 20px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .upload-file-info {
    display: flex;
    align-items: center;
  }
  .upload-file-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
  .upload-file-hint {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    margin-top: 2px;
  }
  .global-params {
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 16px;
  }
  .global-params-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 10px;
    font-size: 13px;
  }
  .global-params-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 24px;
  }
  .global-param-item {
    font-size: 13px;
    white-space: nowrap;
  }
  .global-param-item .label {
    color: var(--el-text-color-secondary);
  }
  .global-param-item .value {
    color: var(--el-text-color-primary);
    font-weight: 500;
  }
  .result-summary {
    display: flex;
    gap: 12px;
    margin-bottom: 14px;
  }
  .summary-item {
    flex: 1;
    text-align: center;
    padding: 12px 8px;
    border-radius: 6px;
    border: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
  }
  .summary-count {
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
  }
  .summary-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 2px;
  }
  .summary-success .summary-count { color: var(--el-color-success); }
  .summary-fail    .summary-count { color: var(--el-color-danger); }
  .summary-pending .summary-count { color: var(--el-color-warning); }
  .summary-confirmed .summary-count { color: var(--el-color-primary); }

  .result-tabs { margin-bottom: 8px; }
  .result-table { width: 100%; }
  .issue-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .issue-item {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 2px 0;
    font-size: 13px;
  }
  .issue-field { flex-shrink: 0; }
  .issue-msg { color: var(--el-text-color-secondary); line-height: 1.4; }

  .step-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    margin-top: 12px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
  .step-footer-left,
  .step-footer-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-divider {
    margin-top: 4px;
    margin-bottom: 16px;
    :deep(.el-divider__text) {
      font-weight: 600;
      background: var(--el-bg-color);
    }
  }
  .edit-item.is-required :deep(.el-form-item__label)::before {
    content: '*';
    color: var(--el-color-danger);
    margin-right: 4px;
    font-family: SimSun, sans-serif;
  }
</style>
