<!-- 导入名单弹窗 -->
<template>
  <el-dialog
    :model-value="visible"
    title="导入名单"
    width="960px"
    append-to-body
    destroy-on-close
    @update:model-value="emit('update:visible', $event)"
  >
    <!-- ───────── 步骤一：选择比赛设项 + 下载模板 + 上传文件 ───────── -->
    <div v-if="step === 0">
      <el-form :model="form" label-width="100px">
        <el-row :gutter="16">
          <el-col :sm="12" :xs="24">
            <el-form-item label="比赛" required>
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
            <el-form-item label="设项" required>
              <el-select
                v-model="form.itemId"
                placeholder="请选择设项"
                class="ele-fluid"
                :disabled="!form.matchId || !!lockedItemId"
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
        <el-form-item label="比赛形式">
          <span class="readonly-text">{{ selectedItem?.matchForm || '选择设项后自动带出' }}</span>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :sm="8" :xs="24">
            <el-form-item label="学校">
              <el-select
                v-model="form.school"
                clearable
                filterable
                placeholder="全部（跨校导入）"
                class="ele-fluid"
                @change="handleScopeSchoolChange"
              >
                <el-option v-for="s in scopeSchoolOptions" :key="s" :label="s" :value="s" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :sm="8" :xs="24">
            <el-form-item label="年级">
              <el-select
                v-model="form.grade"
                clearable
                placeholder="全部"
                class="ele-fluid"
                :disabled="!form.school"
                @change="handleScopeGradeChange"
              >
                <el-option v-for="g in scopeGradeOptions" :key="g" :label="g" :value="g" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :sm="8" :xs="24">
            <el-form-item label="班级">
              <el-select
                v-model="form.className"
                clearable
                placeholder="全部（跨班导入）"
                class="ele-fluid"
                :disabled="!form.grade"
              >
                <el-option v-for="c in scopeClassOptions" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="导入模板">
          <el-button :disabled="!canDownloadTemplate" @click="handleDownloadTemplate">
            {{ downloadTemplateText }}
          </el-button>
          <span v-if="templateFields.length" class="field-tip">
            模板字段：{{ templateFields.join('、') }}
          </span>
        </el-form-item>
        <el-form-item label="上传文件">
          <el-upload
            action=""
            :auto-upload="false"
            :limit="1"
            accept=".xlsx,.xls"
            drag
            class="ele-fluid"
            :disabled="!canUpload"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
          >
            <div class="upload-placeholder">
              {{ uploadHint }}
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
    </div>

    <!-- ───────── 步骤二：校验结果页 ───────── -->
    <div v-else-if="step === 1">
      <!-- 校验统计 -->
      <div class="validate-summary">
        <div class="summary-item">
          <span class="summary-label">导入总数</span>
          <span class="summary-value">{{ summary.totalCount }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">通过数</span>
          <span class="summary-value success">{{ summary.successCount }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">失败数</span>
          <span class="summary-value" :class="{ danger: summary.errorCount > 0 }">
            {{ summary.errorCount }}
          </span>
        </div>
      </div>

      <el-alert
        v-if="summary.errorCount > 0"
        type="warning"
        show-icon
        :closable="false"
        title="存在校验失败数据，请修改错误字段后重新校验，失败数为 0 后可确认导入。"
        class="validate-alert"
      />
      <el-alert
        v-else-if="dirty"
        type="info"
        show-icon
        :closable="false"
        title="数据已修改，请点击「重新校验」后再确认导入。"
        class="validate-alert"
      />

      <!-- 预览表格 -->
      <el-table
        :data="parsedRows"
        border
        size="small"
        max-height="420"
        :row-class-name="rowClassName"
        class="preview-table"
      >
        <el-table-column prop="rowNo" label="行号" width="60" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="rowStatus(row) === 'error'" type="danger" size="small">校验失败</el-tag>
            <el-tag v-else-if="rowStatus(row) === 'dirty'" type="warning" size="small">待重新校验</el-tag>
            <el-tag v-else type="success" size="small">通过</el-tag>
          </template>
        </el-table-column>

        <!-- 团体：队伍名称、成员参赛编号、成员姓名 -->
        <el-table-column v-if="isTeamForm" label="队伍名称" min-width="120">
          <template #default="{ row }">
            <el-input
              v-model="row.teamName"
              size="small"
              :class="{ 'cell-error': hasCellError(row, 'teamName') }"
              @input="markRowDirty(row)"
            />
          </template>
        </el-table-column>
        <el-table-column v-if="isTeamForm" label="成员参赛编号" min-width="120">
          <template #default="{ row }">
            <el-input
              v-model="row.participantNumber"
              size="small"
              :class="{ 'cell-error': hasCellError(row, 'participantNumber') }"
              @input="markRowDirty(row)"
            />
          </template>
        </el-table-column>
        <el-table-column v-if="isTeamForm" label="成员姓名" min-width="100">
          <template #default="{ row }">
            <el-input
              v-model="row.memberName"
              size="small"
              :class="{ 'cell-error': hasCellError(row, 'memberName') }"
              @input="markRowDirty(row)"
            />
          </template>
        </el-table-column>

        <!-- 个人：参赛编号、学生姓名 -->
        <el-table-column v-if="!isTeamForm" label="参赛编号" min-width="110">
          <template #default="{ row }">
            <el-input
              v-model="row.participantNumber"
              size="small"
              :class="{ 'cell-error': hasCellError(row, 'participantNumber') }"
              @input="markRowDirty(row)"
            />
          </template>
        </el-table-column>
        <el-table-column v-if="!isTeamForm" label="学生姓名" min-width="100">
          <template #default="{ row }">
            <el-input
              v-model="row.studentName"
              size="small"
              :class="{ 'cell-error': hasCellError(row, 'studentName') }"
              @input="markRowDirty(row)"
            />
          </template>
        </el-table-column>

        <!-- 学校：未选择则可编辑，已选择则只读 -->
        <el-table-column v-if="!form.school" label="学校" min-width="130">
          <template #default="{ row }">
            <el-input
              v-model="row.school"
              size="small"
              :class="{ 'cell-error': hasCellError(row, 'school') }"
              @input="markRowDirty(row)"
            />
          </template>
        </el-table-column>
        <el-table-column v-else label="学校" min-width="110">
          <template #default="{ row }">
            <span class="readonly-cell">{{ row.school }}</span>
          </template>
        </el-table-column>

        <!-- 年级 -->
        <el-table-column v-if="!form.grade" label="年级" min-width="100">
          <template #default="{ row }">
            <el-input
              v-model="row.grade"
              size="small"
              :class="{ 'cell-error': hasCellError(row, 'grade') }"
              @input="markRowDirty(row)"
            />
          </template>
        </el-table-column>
        <el-table-column v-else label="年级" min-width="90">
          <template #default="{ row }">
            <span class="readonly-cell">{{ row.grade }}</span>
          </template>
        </el-table-column>

        <!-- 班级 -->
        <el-table-column v-if="!form.className" label="班级" min-width="100">
          <template #default="{ row }">
            <el-input
              v-model="row.className"
              size="small"
              :class="{ 'cell-error': hasCellError(row, 'className') }"
              @input="markRowDirty(row)"
            />
          </template>
        </el-table-column>
        <el-table-column v-else label="班级" min-width="90">
          <template #default="{ row }">
            <span class="readonly-cell">{{ row.className }}</span>
          </template>
        </el-table-column>

        <el-table-column label="班内序号" width="80" align="center">
          <template #default="{ row }">
            <el-input
              v-model="row.classNo"
              size="small"
              :class="{ 'cell-error': hasCellError(row, 'classNo') }"
              @input="markRowDirty(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="性别" width="72" align="center">
          <template #default="{ row }">
            <el-input
              v-model="row.gender"
              size="small"
              :class="{ 'cell-error': hasCellError(row, 'gender') }"
              @input="markRowDirty(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="100">
          <template #default="{ row }">
            <el-input v-model="row.remark" size="small" @input="markRowDirty(row)" />
          </template>
        </el-table-column>

        <!-- 错误信息 -->
        <el-table-column label="错误信息" min-width="180">
          <template #default="{ row }">
            <span v-if="rowErrorText(row)" class="error-text">{{ rowErrorText(row) }}</span>
            <span v-else class="ok-text">—</span>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="70" align="center" fixed="right">
          <template #default="{ $index }">
            <el-button type="danger" link size="small" @click="handleDeleteRow($index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- ───────── Footer ───────── -->
    <template #footer>
      <!-- 上传文件页 footer -->
      <div v-if="step === 0" class="dialog-footer">
        <el-button @click="emit('update:visible', false)">取消</el-button>
        <el-button type="primary" :disabled="!uploadFile" @click="handleGoValidate">
          下一步
        </el-button>
      </div>
      <!-- 校验结果页 footer -->
      <div v-else class="dialog-footer">
        <el-button @click="step = 0">上一步</el-button>
        <el-button @click="handleRevalidate">重新校验</el-button>
        <el-button type="primary" :disabled="!canConfirm" @click="handleConfirmImport">
          确认导入
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { computed, reactive, ref, watch } from 'vue';
  import { EleMessage } from 'ele-admin-plus';
  import {
    appendImportLog,
    confirmImportRows,
    downloadImportTemplate,
    getTemplateFields,
    parseImportFile,
    validateImportRows
  } from '../registration-import.js';
  import {
    getItemOptionsByMatch,
    getRegisterableMatches,
    getScopeSchoolOptions,
    getScopeGradeOptions,
    getScopeClassOptions
  } from '../data.js';

  const props = defineProps({
    visible: Boolean,
    matchId: { type: [String, Number], default: '' },
    itemId: { type: [String, Number], default: '' }
  });

  const emit = defineEmits(['update:visible', 'done']);

  // ─── 步骤 ───────────────────────────────────────────────────
  const step = ref(0); // 0 = 上传页, 1 = 校验结果页

  // ─── 表单 ───────────────────────────────────────────────────
  const lockedMatchId = computed(() => props.matchId || '');
  const lockedItemId = computed(() => props.itemId || '');
  const registerableMatches = computed(() => getRegisterableMatches());
  const form = reactive({ matchId: '', itemId: '', school: '', grade: '', className: '' });

  // ─── 上传 ───────────────────────────────────────────────────
  const uploadFile = ref(null);

  // ─── 校验状态 ────────────────────────────────────────────────
  const validated = ref(false);
  const parsedRows = ref([]);
  // 逐行 dirty 标记 rowNo -> boolean
  const dirtyRows = ref({});
  const summary = reactive({
    totalCount: 0,
    successCount: 0,
    errorCount: 0,
    errors: [],
    validRows: []
  });
  // rowNo -> { fieldKey: reason }
  const errorFieldMap = ref({});
  // 全局 dirty：有任意行被修改
  const dirty = computed(() => Object.values(dirtyRows.value).some(Boolean));

  // ─── 选项计算 ��───────────────────────────────────────────────
  const itemOptions = computed(() => (form.matchId ? getItemOptionsByMatch(form.matchId) : []));
  const selectedItem = computed(() =>
    itemOptions.value.find((item) => String(item.itemId) === String(form.itemId))
  );
  const scope = computed(() => ({
    school: form.school,
    grade: form.grade,
    className: form.className
  }));
  const scopeSchoolOptions = computed(() => getScopeSchoolOptions());
  const scopeGradeOptions = computed(() => getScopeGradeOptions(form.school));
  const scopeClassOptions = computed(() => getScopeClassOptions(form.school, form.grade));
  const templateFields = computed(() =>
    selectedItem.value?.matchForm ? getTemplateFields(selectedItem.value.matchForm, scope.value) : []
  );
  const isTeamForm = computed(() => selectedItem.value?.matchForm === '团体');

  const canDownloadTemplate = computed(() => !!(form.matchId && form.itemId && selectedItem.value));
  const canUpload = computed(() => canDownloadTemplate.value);
  const canConfirm = computed(
    () =>
      validated.value &&
      !dirty.value &&
      summary.errorCount === 0 &&
      summary.validRows.length > 0
  );

  const downloadTemplateText = computed(() => {
    if (!selectedItem.value?.matchForm) {
      return '下载导入模板';
    }
    return selectedItem.value.matchForm === '团体' ? '下载团体赛导入模板' : '下载个人赛导入模板';
  });

  const uploadHint = computed(() => {
    if (!canUpload.value) {
      return '请先选择比赛和设项';
    }
    if (uploadFile.value?.name) {
      return `已选择：${uploadFile.value.name}`;
    }
    return '点击或拖拽 Excel 文件到此处';
  });

  // ─── 行状态辅助 ──────────────────────────────────────────────
  const rowStatus = (row) => {
    if (dirtyRows.value[row.rowNo]) {
      return 'dirty';
    }
    if (errorFieldMap.value[row.rowNo]) {
      return 'error';
    }
    return 'ok';
  };

  const rowClassName = ({ row }) => (errorFieldMap.value[row.rowNo] ? 'import-error-row' : '');

  const hasCellError = (row, fieldKey) => !!errorFieldMap.value[row.rowNo]?.[fieldKey];

  const rowErrorText = (row) => {
    const errs = errorFieldMap.value[row.rowNo];
    if (!errs) {
      return '';
    }
    return Object.values(errs).join('；');
  };

  const markRowDirty = (row) => {
    if (validated.value) {
      dirtyRows.value = { ...dirtyRows.value, [row.rowNo]: true };
    }
  };

  // ─── 重置 ────────────────────────────────────────────────────
  const clearSummary = () => {
    Object.assign(summary, {
      totalCount: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      validRows: []
    });
    errorFieldMap.value = {};
    dirtyRows.value = {};
  };

  const resetAll = () => {
    uploadFile.value = null;
    parsedRows.value = [];
    validated.value = false;
    step.value = 0;
    clearSummary();
  };

  // ─── watch props.visible ─────────────────────────────────────
  watch(
    () => props.visible,
    (value) => {
      if (!value) {
        return;
      }
      form.matchId = props.matchId || '';
      form.itemId = props.itemId || '';
      form.school = '';
      form.grade = '';
      form.className = '';
      resetAll();
    }
  );

  // ─── 表单变更处理 ─────────────────────────────────────────────
  const handleMatchChange = () => {
    form.itemId = '';
    resetAll();
  };

  const handleItemChange = () => {
    resetAll();
  };

  const handleScopeSchoolChange = () => {
    form.grade = '';
    form.className = '';
  };

  const handleScopeGradeChange = () => {
    form.className = '';
  };

  // ─── 文件上传 ─────────────────────────────────────────────────
  const handleFileChange = (upload) => {
    uploadFile.value = upload?.raw || null;
  };

  const handleFileRemove = () => {
    uploadFile.value = null;
  };

  // ─── 下载模板 ─────────────────────────────────────────────────
  const handleDownloadTemplate = async () => {
    if (!selectedItem.value?.matchForm) {
      EleMessage.error({ message: '请先选择比赛和设项', plain: true });
      return;
    }
    try {
      const fileName = await downloadImportTemplate(selectedItem.value.matchForm, scope.value);
      EleMessage.success({ message: `${fileName} 已开始下载。`, plain: true });
    } catch (error) {
      EleMessage.error({ message: error?.message || '模板下载失败', plain: true });
    }
  };

  // ─── 核心校验逻辑 ─────────────────────────────────────────────
  const buildErrorFieldMap = (errors) => {
    const map = {};
    errors.forEach((err) => {
      if (!err.fieldKey || Number(err.rowNo) <= 1) {
        return;
      }
      if (!map[err.rowNo]) {
        map[err.rowNo] = {};
      }
      map[err.rowNo][err.fieldKey] = err.reason;
    });
    return map;
  };

  const runValidation = () => {
    const result = validateImportRows(
      parsedRows.value,
      selectedItem.value.matchForm,
      form.matchId,
      form.itemId,
      scope.value
    );
    Object.assign(summary, result);
    errorFieldMap.value = buildErrorFieldMap(result.errors);
    dirtyRows.value = {};
    validated.value = true;
  };

  // ─── 下一步（解析 + 校验 + 进入结果页） ──────────────────────
  const handleGoValidate = async () => {
    if (!form.matchId || !form.itemId) {
      EleMessage.error({ message: '请选择比赛和设项', plain: true });
      return;
    }
    if (!uploadFile.value) {
      EleMessage.error({ message: '请先上传 Excel 文件', plain: true });
      return;
    }
    try {
      parsedRows.value = await parseImportFile(
        uploadFile.value,
        selectedItem.value.matchForm,
        scope.value
      );
      runValidation();
      step.value = 1;
    } catch (error) {
      EleMessage.error({ message: error?.message || '文件解析失败，请检查 Excel 格式', plain: true });
    }
  };

  // ─── 重新校验 ─────────────────────────────────────────────────
  const handleRevalidate = () => {
    if (!parsedRows.value.length) {
      EleMessage.warning({ message: '暂无数据可校验', plain: true });
      return;
    }
    runValidation();
    EleMessage.info({ message: '已重新校验，请查看校验结果。', plain: true });
  };

  // ─── 删除行 ───────────────────────────────────────────────────
  const handleDeleteRow = (index) => {
    const row = parsedRows.value[index];
    parsedRows.value.splice(index, 1);
    const newDirty = { ...dirtyRows.value };
    const newMap = { ...errorFieldMap.value };
    delete newDirty[row.rowNo];
    delete newMap[row.rowNo];
    dirtyRows.value = newDirty;
    errorFieldMap.value = newMap;
    // 重新计算统计
    const failed = parsedRows.value.filter((r) => newMap[r.rowNo]).length;
    const total = parsedRows.value.length;
    Object.assign(summary, {
      totalCount: total,
      successCount: total - failed,
      errorCount: failed
    });
  };

  // ─── 确认导入 ─────────────────────────────────────────────────
  const handleConfirmImport = () => {
    if (!canConfirm.value) {
      EleMessage.error({ message: '请先完成数据校验并确保全部通过', plain: true });
      return;
    }
    const count = confirmImportRows(
      summary.validRows,
      selectedItem.value.matchForm,
      form.matchId,
      form.itemId
    );
    appendImportLog({
      itemName: selectedItem.value.itemName,
      importType: selectedItem.value.matchForm === '团体' ? '团体报名' : '个人报名',
      totalCount: summary.totalCount,
      successCount: count,
      errorCount: 0
    });
    emit('update:visible', false);
    emit('done');
    EleMessage.success({ message: `导入完成，${count} 条数据已写入参赛名单。`, plain: true });
  };
</script>

<style scoped>
  .readonly-text,
  .field-tip {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .field-tip {
    margin-left: 12px;
  }

  .upload-placeholder {
    padding: 20px 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  /* 校验统计 */
  .validate-summary {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }

  .summary-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 12px 16px;
    background: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-lighter);
    border-left-width: 3px;
    border-radius: 6px;
  }

  .summary-item:nth-child(1) {
    border-left-color: var(--el-border-color);
  }

  .summary-item:nth-child(2) {
    border-left-color: var(--el-color-success);
  }

  .summary-item:nth-child(3) {
    border-left-color: var(--el-color-danger);
  }

  .summary-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1;
  }

  .summary-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    line-height: 1;
  }

  .summary-value.success {
    color: var(--el-color-success);
  }

  .summary-value.danger {
    color: var(--el-color-danger);
  }

  .validate-alert {
    margin-bottom: 12px;
  }

  /* 预览表格 */
  .preview-table {
    width: 100%;
  }

  .readonly-cell {
    display: block;
    padding: 0 8px;
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  .error-text {
    font-size: 12px;
    color: var(--el-color-danger);
  }

  .ok-text {
    font-size: 13px;
    color: var(--el-text-color-placeholder);
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  :deep(.import-error-row td) {
    background-color: var(--el-color-danger-light-9) !important;
  }

  :deep(.cell-error .el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--el-color-danger) inset;
  }
</style>
