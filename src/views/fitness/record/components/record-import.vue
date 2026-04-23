<!-- 体测记录 批量导入（三步流程）-->
<template>
  <ele-modal
    :width="960"
    title="批量导入体测记录"
    :footer="false"
    v-bind="modalProps"
    :style="{ '--ele-modal-body-padding': '24px' }"
  >
    <el-steps :active="step" finish-status="success" class="import-steps">
      <el-step title="导入参数" description="选择导入条件" />
      <el-step title="上传文件" description="上传 Excel 模板" />
      <el-step title="校验结果" description="确认导入" />
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
              <div class="upload-file-hint">
                已上传 · 点击“重新上传”可更换文件
              </div>
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
      <div class="result-summary">
        <div class="summary-item summary-success">
          <div class="summary-count">{{ result.success.length }}</div>
          <div class="summary-label">成功</div>
        </div>
        <div class="summary-item summary-fail">
          <div class="summary-count">{{ result.fail.length }}</div>
          <div class="summary-label">失败</div>
        </div>
        <div class="summary-item summary-pending">
          <div class="summary-count">{{ result.pending.length }}</div>
          <div class="summary-label">待确认</div>
        </div>
      </div>

      <ele-alert
        v-if="result.fail.length > 0"
        type="error"
        show-icon
        :closable="false"
        style="margin-bottom: 12px"
      >
        <template #title>
          有 {{ result.fail.length }} 条数据校验失败，请先修正错误数据并重新上传后再导入。
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
          数据校验通过，共 {{ result.success.length + result.pending.length }}
          条数据可导入
          <span v-if="result.pending.length">
            （其中 {{ result.pending.length }} 条为待确认）
          </span>
          。
        </template>
      </ele-alert>

      <el-tabs v-model="resultTab">
        <el-tab-pane name="all">
          <template #label>
            全部 ({{ allRows.length }})
          </template>
        </el-tab-pane>
        <el-tab-pane name="success">
          <template #label>
            <span style="color: var(--el-color-success)">
              成功 ({{ result.success.length }})
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="fail">
          <template #label>
            <span style="color: var(--el-color-danger)">
              失败 ({{ result.fail.length }})
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="pending">
          <template #label>
            <span style="color: var(--el-color-warning)">
              待确认 ({{ result.pending.length }})
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <el-table
        :data="filteredRows"
        border
        size="default"
        class="result-table"
        max-height="320"
      >
        <el-table-column
          label="行号"
          prop="row"
          width="70"
          align="center"
        />
        <el-table-column
          label="学号"
          prop="studentNo"
          width="80"
          align="center"
        />
        <el-table-column
          label="学生姓名"
          prop="studentName"
          width="110"
        />
        <el-table-column label="状态" width="100" align="center">
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
          label="问题字段"
          prop="field"
          width="120"
          align="center"
        />
        <el-table-column
          label="问题类型"
          prop="issueType"
          width="110"
          align="center"
        />
        <el-table-column label="问题说明" prop="issue" min-width="180" />
        <el-table-column
          label="处理建议"
          prop="suggestion"
          min-width="180"
        />
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
        <el-button
          v-else
          type="primary"
          :disabled="result.fail.length > 0"
          :loading="confirmLoading"
          @click="confirmImport"
        >
          确认导入
        </el-button>
      </div>
    </div>
  </ele-modal>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue';
  import { EleMessage, useModal } from 'ele-admin-plus';
  import {
    FileOutlined,
    CloudUploadOutlined,
    CheckCircleOutlined,
    DownloadOutlined,
    UploadOutlined,
    ReloadOutlined
  } from '@/components/icons';
  import {
    SCHOOL_OPTIONS,
    SCHOOL_YEAR_OPTIONS,
    TERM_OPTIONS,
    STAGE_OPTIONS,
    GRADE_OPTIONS,
    CLASS_OPTIONS,
    planStore,
    recordStore
  } from '@/views/fitness/data.js';

  const emit = defineEmits(['done']);

  const { modalProps, closeModal } = useModal();

  const step = ref(0);
  const paramFormRef = ref(null);
  const fileName = ref('');
  const confirmLoading = ref(false);
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

  const handleStageChange = () => {
    params.grade = '';
    params.planId = '';
  };

  /** 校验结果 */
  const result = reactive({
    success: [],
    fail: [],
    pending: []
  });

  const allRows = computed(() => [
    ...result.fail,
    ...result.pending,
    ...result.success
  ]);

  const filteredRows = computed(() => {
    if (resultTab.value === 'success') return result.success;
    if (resultTab.value === 'fail') return result.fail;
    if (resultTab.value === 'pending') return result.pending;
    return allRows.value;
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
    EleMessage.success({
      message: '模板已开始下载',
      plain: true
    });
  };

  const nextFromStep1 = () => {
    if (!fileName.value) return;
    // 生成示例校验结果
    generateMockValidation();
    step.value = 2;
    resultTab.value = 'all';
  };

  /** 生成示例校验结果（演示用） */
  function generateMockValidation() {
    const success = [];
    const fail = [];
    const pending = [];
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
    mockNames.forEach((name, i) => {
      const row = i + 2; // Excel 表头占 1 行
      const studentNo = i + 10;
      if (i === 3) {
        fail.push({
          row,
          studentNo,
          studentName: name,
          result: 'fail',
          field: '学号',
          issueType: '格式错误',
          issue: '学号超出范围（必须为 1-99）',
          suggestion: '将学号修改为 1-99 的整数后重新上传'
        });
      } else if (i === 6) {
        fail.push({
          row,
          studentNo,
          studentName: name,
          result: 'fail',
          field: '身高',
          issueType: '必填缺失',
          issue: '必填项目“身高”未填写',
          suggestion: '补全“身高”字段后重新上传'
        });
      } else if (i === 8) {
        pending.push({
          row,
          studentNo,
          studentName: name,
          result: 'pending',
          field: '体重',
          issueType: '数据异常',
          issue: '体重疑似异常值（超出合理范围）',
          suggestion: '请核对后确认是否继续导入'
        });
      } else {
        success.push({
          row,
          studentNo,
          studentName: name,
          result: 'success',
          field: '-',
          issueType: '-',
          issue: '数据校验通过',
          suggestion: '-'
        });
      }
    });
    result.success = success;
    result.fail = fail;
    result.pending = pending;
  }

  const exportResult = () => {
    EleMessage.success({
      message: '校验结果导出成功',
      plain: true
    });
  };

  const confirmImport = () => {
    if (result.fail.length > 0) return;
    confirmLoading.value = true;
    setTimeout(() => {
      // 将成功 + 待确认的数据导入到 recordStore
      const plan = planStore.list.find((p) => p.planId === params.planId);
      const now = formatNow();
      [...result.success, ...result.pending].forEach((item) => {
        recordStore.list.unshift({
          recordId: recordStore.nextId++,
          studentName: item.studentName,
          studentNo: item.studentNo,
          sex: 'male',
          sexName: '男',
          age: null,
          school: params.school,
          stage: params.stage,
          grade: params.grade,
          className: params.className || '1班',
          planId: params.planId,
          planName: plan?.planName,
          testDate: params.testDate,
          schoolYear: params.schoolYear,
          term: params.term,
          recordType: params.recordType,
          status: 'valid',
          remark: '批量导入',
          scores: {},
          bmi: '',
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
        message: `导入成功，共 ${result.success.length + result.pending.length} 条记录`,
        plain: true
      });
      emit('done');
      closeModal();
    }, 600);
  };

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

  .result-summary {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;

    .summary-item {
      flex: 1;
      padding: 18px 16px;
      border-radius: 6px;
      background: var(--el-fill-color-light);
      border: 1px solid var(--el-border-color-lighter);
      text-align: center;
    }
    .summary-count {
      font-size: 24px;
      font-weight: 700;
      line-height: 1;
    }
    .summary-label {
      margin-top: 6px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
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
  .result-table {
    margin-top: 4px;
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
  }
</style>
