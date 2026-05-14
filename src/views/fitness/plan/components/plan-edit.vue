<!-- 体测方案 新建 / 编辑弹窗 -->
<template>
  <ele-modal
    form
    :width="900"
    :title="isUpdate ? '编辑方案' : '新建方案'"
    :loading="loading"
    v-bind="modalProps"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.prevent=""
    >
      <el-divider content-position="left" class="section-divider">
        基础信息
      </el-divider>
      <el-row :gutter="16">
        <!-- 方案名称 -->
        <el-col :sm="12" :xs="24">
          <el-form-item label="方案名称" prop="planName">
            <el-input
              v-model.trim="form.planName"
              placeholder="请输入方案名称"
              :maxlength="40"
            />
          </el-form-item>
        </el-col>

        <!-- 适用范围类型 -->
        <el-col :sm="12" :xs="24">
          <el-form-item label="适用范围" prop="scopeType">
            <el-radio-group v-model="form.scopeType" @change="handleScopeChange">
              <el-radio value="general">通用</el-radio>
              <el-radio value="region">指定地区</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <!-- 适用地区（指定地区时显示，省市两级级联多选） -->
        <el-col v-if="form.scopeType === 'region'" :xs="24">
          <el-form-item label="适用地区" prop="regions">
            <el-cascader
              v-model="regionPaths"
              :options="regionCascaderOptions"
              :props="cascaderProps"
              placeholder="请选择省/市（可多选）"
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="3"
              filterable
              clearable
              class="ele-fluid"
              @change="handleRegionChange"
            />
          </el-form-item>
        </el-col>

        <!-- 学段 -->
        <el-col :sm="12" :xs="24">
          <el-form-item label="学段" prop="stage">
            <el-select
              v-model="form.stage"
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

        <!-- 适用年级 -->
        <el-col :sm="12" :xs="24">
          <el-form-item label="适用年级" prop="grades">
            <el-select
              multiple
              collapse-tags
              collapse-tags-tooltip
              v-model="form.grades"
              placeholder="请选择适用年级"
              class="ele-fluid"
              :disabled="!form.stage"
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

        <!-- 学年 -->
        <el-col :sm="12" :xs="24">
          <el-form-item label="学年" prop="schoolYear">
            <el-select
              v-model="form.schoolYear"
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

        <!-- 学期 -->
        <el-col :sm="12" :xs="24">
          <el-form-item label="学期" prop="term">
            <el-select
              v-model="form.term"
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

        <!-- 是否默认 -->
        <el-col :sm="12" :xs="24">
          <el-form-item label="是否默认">
            <el-switch v-model="form.isDefault" />
          </el-form-item>
        </el-col>

        <!-- 状态 -->
        <el-col :sm="12" :xs="24">
          <el-form-item label="状态">
            <el-radio-group v-model="form.status">
              <el-radio :value="1">启用</el-radio>
              <el-radio :value="0">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <!-- 备注 -->
        <el-col :xs="24">
          <el-form-item label="备注">
            <el-input
              type="textarea"
              :rows="2"
              :maxlength="200"
              v-model="form.remark"
              placeholder="请输入备注（选填）"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left" class="section-divider">
        项目配置
      </el-divider>
      <el-table
        :data="form.items"
        :border="true"
        size="default"
        class="item-table"
      >
        <el-table-column label="#" width="56" align="center" type="index" />
        <el-table-column label="项目名称" min-width="140">
          <template #default="{ row }">
            <span>{{ row.name }}</span>
            <span class="item-unit">（{{ row.unit }}）</span>
          </template>
        </el-table-column>
        <el-table-column label="是否启用" width="100" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" />
          </template>
        </el-table-column>
        <el-table-column label="是否必填" width="100" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.required" :disabled="!row.enabled" />
          </template>
        </el-table-column>
        <el-table-column label="适用性别" width="180" align="center">
          <template #default="{ row }">
            <el-radio-group v-model="row.gender" :disabled="!row.enabled">
              <el-radio value="all">全部</el-radio>
              <el-radio value="male">仅男</el-radio>
              <el-radio value="female">仅女</el-radio>
            </el-radio-group>
          </template>
        </el-table-column>
        <el-table-column label="展示顺序" width="120" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.sort"
              :min="1"
              :max="99"
              :controls="false"
              size="small"
              style="width: 80px"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="save">
        保存
      </el-button>
    </template>
  </ele-modal>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue';
  import { EleMessage, useModal } from 'ele-admin-plus';
  import {
    STAGE_OPTIONS,
    SCHOOL_YEAR_OPTIONS,
    TERM_OPTIONS,
    FITNESS_ITEMS,
    GRADE_OPTIONS,
    planStore
  } from '@/views/fitness/data.js';
  import {
    regionCascaderOptions,
    codeToPath,
    pathToCode
  } from '@/utils/region-data.js';

  const props = defineProps({ data: Object });
  const emit = defineEmits(['done']);

  const { modalProps, closeModal } = useModal();

  const isUpdate = ref(!!props.data);
  const loading = ref(false);
  const formRef = ref(null);

  function initItems() {
    return FITNESS_ITEMS.map((it, idx) => ({
      code: it.code,
      name: it.name,
      unit: it.unit,
      enabled: false,
      required: false,
      gender: it.gender ?? 'all',
      sort: idx + 1
    }));
  }

  const form = reactive({
    planId: void 0,
    planName: '',
    scopeType: 'general',
    regions: [],
    stage: '',
    grades: [],
    schoolYear: '2025-2026',
    term: 'fall',
    isDefault: false,
    status: 1,
    remark: '',
    items: initItems()
  });

  const rules = reactive({
    planName: [{ required: true, message: '请输入方案名称', trigger: 'blur' }],
    scopeType: [{ required: true, message: '请选择适用范围类型', trigger: 'change' }],
    regions: [
      {
        validator: (_, value, cb) => {
          if (form.scopeType === 'region' && (!value || value.length === 0)) {
            cb(new Error('请选择适用地区'));
          } else {
            cb();
          }
        },
        trigger: 'change'
      }
    ],
    stage: [{ required: true, message: '请选择学段', trigger: 'change' }],
    grades: [{ required: true, type: 'array', message: '请选择适用年级', trigger: 'change' }],
    schoolYear: [{ required: true, message: '请选择学年', trigger: 'change' }],
    term: [{ required: true, message: '请选择学期', trigger: 'change' }]
  });

  const gradeOptions = computed(() => GRADE_OPTIONS[form.stage] ?? []);

  /** el-cascader 多选配置：多选、只显示叶子节点 */
  const cascaderProps = {
    multiple: true,
    checkStrictly: false,
    emitPath: true,
    value: 'value',
    label: 'label',
    children: 'children'
  };

  /**
   * el-cascader 的 v-model 值：每个选中项是 [provinceCode, cityCode] 路径数组
   * 与 form.regions（城市 code 字符串数组）双向映射
   */
  const regionPaths = computed({
    get() {
      return (form.regions ?? []).map((code) => codeToPath(code));
    },
    set(paths) {
      form.regions = (paths ?? []).map((path) => pathToCode(path));
    }
  });

  const handleRegionChange = () => {
    formRef.value?.clearValidate('regions');
  };

  if (props.data) {
    const source = JSON.parse(JSON.stringify(props.data));
    const mergedItems = initItems().map((base) => {
      const existed = source.items?.find((d) => d.code === base.code);
      return existed ? { ...base, ...existed } : base;
    });
    Object.assign(form, source, {
      scopeType: source.scopeType ?? 'general',
      regions: source.regions ?? [],
      items: mergedItems
    });
  }

  const handleScopeChange = (val) => {
    if (val === 'general') form.regions = [];
    formRef.value?.clearValidate('regions');
  };

  const handleStageChange = () => {
    form.grades = [];
  };

  const handleCancel = () => closeModal();

  const save = () => {
    formRef.value?.validate?.((valid) => {
      if (!valid) return;
      if (!form.items.some((d) => d.enabled)) {
        EleMessage.error({ message: '请至少启用一个体测项目', plain: true });
        return;
      }
      loading.value = true;
      setTimeout(() => {
        const now = formatNow();
        const payload = JSON.parse(JSON.stringify(form));
        if (isUpdate.value) {
          const target = planStore.list.find((d) => d.planId === payload.planId);
          if (target) Object.assign(target, payload, { updateTime: now });
          EleMessage.success({ message: '修改成功', plain: true });
        } else {
          planStore.list.unshift({
            ...payload,
            planId: planStore.nextId++,
            createTime: now,
            updateTime: now
          });
          EleMessage.success({ message: '新建成功', plain: true });
        }
        loading.value = false;
        emit('done');
        closeModal();
      }, 300);
    });
  };

  function formatNow() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
</script>

<style lang="scss" scoped>
  .section-divider {
    margin-top: 4px;
    margin-bottom: 20px;
    :deep(.el-divider__text) {
      font-weight: 600;
      background: var(--el-bg-color);
    }
  }
  .item-unit {
    color: var(--el-text-color-secondary);
    font-size: 13px;
    margin-left: 4px;
  }
  .item-table {
    margin-bottom: 8px;
  }
</style>
