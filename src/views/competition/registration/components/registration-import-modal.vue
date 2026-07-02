<!-- 导入名单弹窗（居中大弹窗） -->
<template>
  <el-dialog
    :model-value="visible"
    title="导入名单"
    width="880px"
    append-to-body
    destroy-on-close
    @update:model-value="emit('update:visible', $event)"
  >
    <el-steps :active="activeStep" simple class="import-steps">
      <el-step title="选择比赛设项" />
      <el-step title="上传 Excel" />
      <el-step title="数据校验" />
      <el-step title="确认导入" />
    </el-steps>

    <el-form :model="form" label-width="100px">
      <el-row :gutter="16">
        <el-col :sm="12" :xs="24">
          <el-form-item label="比赛名称" required>
            <el-select
              v-model="form.matchId"
              filterable
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
          <el-form-item label="设项名称" required>
            <el-select
              v-model="form.itemId"
              class="ele-fluid"
              :disabled="!form.matchId || !!lockedItemId"
              @change="resetProgress"
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
      <el-form-item label="模板类型">
        <span class="readonly-text">
          {{ selectedItem?.matchForm ? `${selectedItem.matchForm}报名模板` : '选择设项后自动匹配' }}
        </span>
      </el-form-item>
      <el-form-item label="模板字段">
        <template v-if="templateFields.length">
          <el-tag v-for="field in templateFields" :key="field" class="template-tag" effect="plain">
            {{ field }}
          </el-tag>
        </template>
        <span v-else class="readonly-text">选择设项后自动匹配模板字段</span>
      </el-form-item>
      <el-form-item label="上传文件">
        <el-upload
          action=""
          :auto-upload="false"
          :limit="1"
          drag
          class="ele-fluid"
          @change="handleFileChange"
        >
          <div class="upload-placeholder">
            {{ form.fileName ? `已选择：${form.fileName}` : '点击或拖拽 Excel 文件到此处' }}
          </div>
        </el-upload>
      </el-form-item>
    </el-form>

    <el-alert
      v-if="validated"
      :type="errorCount ? 'warning' : 'success'"
      show-icon
      :closable="false"
      :title="
        errorCount
          ? `校验完成：成功 ${successCount} 条，异常 ${errorCount} 条，可下载错误数据后修正重传。`
          : `校验通过：${successCount} 条数据可导入。`
      "
    />
    <el-alert
      v-else
      type="info"
      show-icon
      :closable="false"
      title="导入模板不包含比赛名称和设项名称；上传后请先校验数据，校验通过后确认导入。"
    />

    <template #footer>
      <el-button @click="emit('update:visible', false)">取消</el-button>
      <el-button @click="downloadTemplate">下载模板</el-button>
      <el-button @click="validateData">校验数据</el-button>
      <el-button v-if="errorCount" type="warning" @click="downloadErrorData">下载错误数据</el-button>
      <el-button type="primary" :disabled="!validated || !successCount" @click="confirmImport">
        确认导入
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
  import { computed, reactive, ref, watch } from 'vue';
  import { EleMessage } from 'ele-admin-plus';
  import {
    PERSONAL_IMPORT_FIELDS,
    TEAM_IMPORT_FIELDS,
    getItemOptionsByMatch,
    getRegisterableMatches
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
  const form = reactive({ matchId: '', itemId: '', fileName: '' });
  const validated = ref(false);
  const successCount = ref(0);
  const errorCount = ref(0);

  const itemOptions = computed(() => (form.matchId ? getItemOptionsByMatch(form.matchId) : []));
  const selectedItem = computed(() => itemOptions.value.find((item) => item.itemId === form.itemId));
  const templateFields = computed(() => {
    if (selectedItem.value?.matchForm === '团体') {
      return TEAM_IMPORT_FIELDS;
    }
    if (selectedItem.value?.matchForm === '个人') {
      return PERSONAL_IMPORT_FIELDS;
    }
    return [];
  });

  const activeStep = computed(() => {
    if (validated.value) {
      return errorCount.value ? 2 : 3;
    }
    if (form.fileName) {
      return 2;
    }
    if (form.matchId && form.itemId) {
      return 1;
    }
    return 0;
  });

  watch(
    () => props.visible,
    (value) => {
      if (!value) {
        return;
      }
      form.matchId = props.matchId || '';
      form.itemId = props.itemId || '';
      resetProgress();
    }
  );

  const resetProgress = () => {
    form.fileName = '';
    validated.value = false;
    successCount.value = 0;
    errorCount.value = 0;
  };

  const handleMatchChange = () => {
    form.itemId = '';
    resetProgress();
  };

  const handleFileChange = (file) => {
    form.fileName = file?.name || '';
    validated.value = false;
    successCount.value = 0;
    errorCount.value = 0;
  };

  const downloadTemplate = () => {
    if (!form.itemId) {
      EleMessage.error({ message: '请先选择比赛和设项', plain: true });
      return;
    }
    EleMessage.success({ message: `${selectedItem.value?.matchForm || ''}报名模板已下载。`, plain: true });
  };

  const validateData = () => {
    if (!form.matchId || !form.itemId) {
      EleMessage.error({ message: '请选择比赛和设项', plain: true });
      return;
    }
    if (!form.fileName) {
      EleMessage.error({ message: '请先上传 Excel 文件', plain: true });
      return;
    }
    // 原型：模拟校验结果
    successCount.value = 18;
    errorCount.value = 2;
    validated.value = true;
    EleMessage.info({ message: '数据校验完成，请查看校验结果。', plain: true });
  };

  const downloadErrorData = () => {
    EleMessage.success({ message: `已下载 ${errorCount.value} 条错误数据，请修正后重新上传。`, plain: true });
  };

  const confirmImport = () => {
    if (!validated.value || !successCount.value) {
      EleMessage.error({ message: '请先完成数据校验', plain: true });
      return;
    }
    emit('update:visible', false);
    emit('done');
    EleMessage.success({ message: `导入完成，${successCount.value} 条数据已写入参赛名单。`, plain: true });
  };
</script>

<style scoped>
  .import-steps {
    margin-bottom: 16px;
  }
  .readonly-text {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
  .template-tag {
    margin-right: 6px;
    margin-bottom: 6px;
  }
  .upload-placeholder {
    padding: 20px 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
</style>
