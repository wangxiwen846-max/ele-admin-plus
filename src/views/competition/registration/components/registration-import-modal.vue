<!-- 导入名单弹窗（居中大弹窗） -->
<template>
  <el-dialog
    :model-value="visible"
    title="导入名单"
    width="920px"
    append-to-body
    destroy-on-close
    @update:model-value="emit('update:visible', $event)"
  >
    <el-steps :active="activeStep" simple class="import-steps">
      <el-step title="选择比赛设项" />
      <el-step title="下载模板 / 上传" />
      <el-step title="在线校验" />
      <el-step title="确认导入" />
    </el-steps>

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
              @change="resetValidation"
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
              @change="resetValidation"
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

    <el-alert
      v-if="!parsedRows.length"
      type="info"
      show-icon
      :closable="false"
      title="导入前请选择比赛和设项，并可按需选择导入范围（学校 / 年级 / 班级）。已选择的范围字段无需在模板中填写，未选择的字段需在模板中填写。参赛编号可留空，导入后由系统自动生成。上传后点击「校验数据」，可在下方表格中直接修改错误数据并重新校验，全部通过后方可确认导入。"
    />

    <template v-if="parsedRows.length">
      <div class="validate-summary">
        <span>总数据量：{{ summary.totalCount }}</span>
        <span>校验通过：{{ summary.successCount }}</span>
        <span :class="{ danger: summary.errorCount > 0 }">校验失败：{{ summary.errorCount }}</span>
      </div>
      <el-alert
        :type="alertType"
        show-icon
        :closable="false"
        :title="validateMessage"
        class="validate-alert"
      />

      <div class="preview-table-wrap">
        <div class="preview-table-title">
          导入预览（可直接修改后点击「重新校验」）
        </div>
        <el-table
          :data="parsedRows"
          border
          size="small"
          max-height="280"
          :row-class-name="rowClassName"
        >
          <el-table-column type="index" label="序号" width="56" align="center" />
          <el-table-column
            v-for="col in previewColumns"
            :key="col.key"
            :label="col.label"
            min-width="120"
          >
            <template #default="{ row }">
              <el-input
                v-model="row[col.key]"
                size="small"
                :class="{ 'cell-error': hasCellError(row.rowNo, col.key) }"
                :title="cellErrorText(row.rowNo, col.key)"
                @input="markDirty"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="summary.errors.length" class="error-table-wrap">
        <div class="error-table-title">错误明细</div>
        <el-table :data="summary.errors" border size="small" max-height="220">
          <el-table-column prop="rowNo" label="行号" width="70" align="center">
            <template #default="{ row }">{{ row.rowNo > 1 ? row.rowNo : '-' }}</template>
          </el-table-column>
          <el-table-column
            v-if="isTeamForm"
            prop="teamName"
            label="队伍名称"
            width="130"
            show-overflow-tooltip
          />
          <el-table-column :label="isTeamForm ? '成员姓名' : '学生姓名'" width="100">
            <template #default="{ row }">{{ row.name || '-' }}</template>
          </el-table-column>
          <el-table-column prop="classNo" label="班内序号" width="80" align="center">
            <template #default="{ row }">{{ row.classNo || '-' }}</template>
          </el-table-column>
          <el-table-column prop="fieldName" label="错误字段" width="110" />
          <el-table-column prop="reason" label="错误原因" min-width="220" show-overflow-tooltip />
        </el-table>
      </div>
    </template>

    <template #footer>
      <el-button @click="emit('update:visible', false)">取消</el-button>
      <el-button :disabled="!uploadFile && !parsedRows.length" @click="handleValidate">
        {{ parsedRows.length ? '重新校验' : '校验数据' }}
      </el-button>
      <el-button type="primary" :disabled="!canConfirm" @click="handleConfirmImport">确认导入</el-button>
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
    getTemplateColumns,
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

  const lockedMatchId = computed(() => props.matchId || '');
  const lockedItemId = computed(() => props.itemId || '');
  const registerableMatches = computed(() => getRegisterableMatches());
  const form = reactive({ matchId: '', itemId: '', school: '', grade: '', className: '' });
  const uploadFile = ref(null);
  const validated = ref(false);
  const dirty = ref(false);
  const parsedRows = ref([]);
  const summary = reactive({
    totalCount: 0,
    successCount: 0,
    errorCount: 0,
    errors: [],
    validRows: []
  });

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
  const previewColumns = computed(() =>
    selectedItem.value?.matchForm ? getTemplateColumns(selectedItem.value.matchForm, scope.value) : []
  );
  // rowNo -> { fieldKey: reason }，用于错误单元格标红与提示
  const errorFieldMap = computed(() => {
    const map = {};
    summary.errors.forEach((err) => {
      if (!err.fieldKey || Number(err.rowNo) <= 1) {
        return;
      }
      if (!map[err.rowNo]) {
        map[err.rowNo] = {};
      }
      map[err.rowNo][err.fieldKey] = err.reason;
    });
    return map;
  });
  const canDownloadTemplate = computed(() => !!(form.matchId && form.itemId && selectedItem.value));
  const canUpload = computed(() => canDownloadTemplate.value);
  const canConfirm = computed(
    () =>
      validated.value &&
      !dirty.value &&
      summary.errorCount === 0 &&
      summary.validRows.length > 0
  );
  const alertType = computed(() => {
    if (dirty.value) {
      return 'info';
    }
    return summary.errorCount ? 'warning' : 'success';
  });

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

  const activeStep = computed(() => {
    if (validated.value) {
      return summary.errorCount ? 2 : 3;
    }
    if (uploadFile.value) {
      return 2;
    }
    if (form.matchId && form.itemId) {
      return 1;
    }
    return 0;
  });

  const validateMessage = computed(() => {
    if (dirty.value) {
      return '数据已修改，请点击「重新校验」后再确认导入。';
    }
    if (!summary.errorCount) {
      return `校验通过，共 ${summary.successCount} 条数据可导入。`;
    }
    return `校验完成：通过 ${summary.successCount} 条，失败 ${summary.errorCount} 条。请在下方表格中修改错误数据后重新校验。`;
  });

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
      resetValidation();
    }
  );

  const clearSummary = () => {
    Object.assign(summary, {
      totalCount: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      validRows: []
    });
  };

  const resetValidation = () => {
    uploadFile.value = null;
    parsedRows.value = [];
    validated.value = false;
    dirty.value = false;
    clearSummary();
  };

  const handleMatchChange = () => {
    form.itemId = '';
    resetValidation();
  };

  const handleScopeSchoolChange = () => {
    form.grade = '';
    form.className = '';
    resetValidation();
  };

  const handleScopeGradeChange = () => {
    form.className = '';
    resetValidation();
  };

  const handleFileChange = (upload) => {
    uploadFile.value = upload?.raw || null;
    validated.value = false;
    dirty.value = false;
    parsedRows.value = [];
    clearSummary();
  };

  const handleFileRemove = () => {
    uploadFile.value = null;
    validated.value = false;
    dirty.value = false;
    parsedRows.value = [];
    clearSummary();
  };

  const markDirty = () => {
    if (validated.value) {
      dirty.value = true;
    }
  };

  const rowClassName = ({ row }) =>
    errorFieldMap.value[row.rowNo] ? 'import-error-row' : '';

  const hasCellError = (rowNo, fieldKey) => !!errorFieldMap.value[rowNo]?.[fieldKey];

  const cellErrorText = (rowNo, fieldKey) => errorFieldMap.value[rowNo]?.[fieldKey] || '';

  const runValidation = () => {
    const result = validateImportRows(
      parsedRows.value,
      selectedItem.value.matchForm,
      form.matchId,
      form.itemId,
      scope.value
    );
    Object.assign(summary, result);
    validated.value = true;
    dirty.value = false;
  };

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

  const handleValidate = async () => {
    if (!form.matchId || !form.itemId) {
      EleMessage.error({ message: '请选择比赛和设项', plain: true });
      return;
    }
    // 已解析过则直接对表格中（可能已修改的）数据重新校验，无需重新上传
    if (parsedRows.value.length) {
      runValidation();
      EleMessage.info({ message: '已重新校验，请查看校验结果。', plain: true });
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
      EleMessage.info({ message: '数据校验完成，请查看校验结果。', plain: true });
    } catch (error) {
      validated.value = true;
      dirty.value = false;
      parsedRows.value = [];
      Object.assign(summary, {
        totalCount: 0,
        successCount: 0,
        errorCount: 1,
        errors: [{ rowNo: 0, fieldName: '-', reason: error?.message || '文件解析失败' }],
        validRows: []
      });
      EleMessage.error({ message: error?.message || '文件解析失败', plain: true });
    }
  };

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
  .import-steps {
    margin-bottom: 16px;
  }

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

  .validate-summary {
    display: flex;
    gap: 20px;
    margin-bottom: 12px;
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  .validate-summary .danger {
    color: var(--el-color-danger);
  }

  .validate-alert {
    margin-bottom: 12px;
  }

  .error-table-wrap {
    margin-top: 8px;
  }

  .error-table-title {
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
</style>
