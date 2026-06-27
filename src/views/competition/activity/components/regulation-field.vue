<!-- 活动规程：文本 + 附件上传 -->
<template>
  <div class="regulation-field">
    <div class="regulation-desc">
      填写或上传赛事活动的整体规程说明，支持文本说明和附件上传。
    </div>
    <el-input
      :model-value="text"
      type="textarea"
      :rows="4"
      :maxlength="2000"
      :disabled="disabled"
      placeholder="请输入活动规程内容"
      @update:model-value="emit('update:text', $event)"
    />
    <div class="regulation-upload">
      <el-upload
        v-if="!disabled"
        :auto-upload="false"
        :show-file-list="false"
        :disabled="disabled"
        accept=".pdf,.doc,.docx"
        @change="handleUpload"
      >
        <el-button type="primary" link>上传附件</el-button>
      </el-upload>
      <div class="upload-tip">支持上传 Word、PDF 等文件</div>
    </div>
    <div v-if="attachments.length" class="regulation-files">
      <div class="files-label">已上传附件：</div>
      <div v-for="file in attachments" :key="file.id" class="file-row">
        <span class="file-name" :title="file.name">{{ file.name }}</span>
        <div class="file-actions">
          <el-link type="primary" underline="never" @click="handlePreview(file)">查看</el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" underline="never" @click="handleDownload(file)">下载</el-link>
          <template v-if="!disabled">
            <el-divider direction="vertical" />
            <el-link type="danger" underline="never" @click="handleRemove(file)">删除</el-link>
          </template>
        </div>
      </div>
    </div>
    <div class="field-tip">活动规程仅作为活动层面说明材料，不参与系统计算。</div>

    <el-dialog
      v-model="previewVisible"
      title="附件预览"
      width="480px"
      append-to-body
      destroy-on-close
    >
      <el-descriptions v-if="previewRow" :column="1" border>
        <el-descriptions-item label="文件名称">{{ previewRow.name }}</el-descriptions-item>
        <el-descriptions-item label="文件类型">{{ previewRow.type }}</el-descriptions-item>
        <el-descriptions-item label="上传时间">{{ previewRow.uploadTime }}</el-descriptions-item>
      </el-descriptions>
      <div class="preview-placeholder">这里是附件预览区域（mock）</div>
      <template #footer>
        <el-button type="primary" @click="previewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { ElMessageBox } from 'element-plus';
  import { EleMessage } from 'ele-admin-plus';
  import { formatNow } from '@/views/event-item/data.js';

  defineProps({
    text: {
      type: String,
      default: ''
    },
    attachments: {
      type: Array,
      default: () => []
    },
    disabled: Boolean
  });

  const emit = defineEmits(['update:text', 'add', 'remove']);

  const previewVisible = ref(false);
  const previewRow = ref(null);

  const handleUpload = (file) => {
    emit('add', {
      id: `reg_${Date.now()}`,
      name: file.name,
      type: getFileType(file.name),
      uploadTime: formatNow()
    });
  };

  const handlePreview = (row) => {
    previewRow.value = row;
    previewVisible.value = true;
  };

  const handleDownload = (row) => {
    EleMessage.success({ message: `开始下载附件：${row.name}`, plain: true });
  };

  const handleRemove = (row) => {
    ElMessageBox.confirm(`确定删除附件“${row.name}”吗？`, '删除附件', {
      type: 'warning',
      draggable: true
    })
      .then(() => emit('remove', row))
      .catch(() => {});
  };

  function getFileType(name = '') {
    const ext = name.split('.').pop()?.toUpperCase() || '文件';
    if (['DOC', 'DOCX'].includes(ext)) {
      return 'Word';
    }
    return ext;
  }
</script>

<style scoped lang="scss">
  .regulation-field {
    width: 100%;
  }

  .regulation-desc {
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
  }

  .regulation-upload {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 10px;
  }

  .upload-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .regulation-files {
    margin-top: 10px;
    padding: 10px 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 4px;
  }

  .files-label {
    margin-bottom: 6px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .file-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 4px 0;

    & + .file-row {
      border-top: 1px dashed var(--el-border-color-lighter);
      margin-top: 4px;
      padding-top: 8px;
    }
  }

  .file-name {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    color: var(--el-text-color-regular);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .field-tip {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
  }

  .preview-placeholder {
    margin-top: 16px;
    padding: 40px 16px;
    text-align: center;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
    border: 1px dashed var(--el-border-color);
    border-radius: 4px;
  }
</style>
