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

        <!-- 适用时间 -->
        <el-col :sm="12" :xs="24">
          <el-form-item label="适用时间" prop="timeType">
            <el-radio-group v-model="form.timeType" @change="handleTimeTypeChange">
              <el-radio value="unlimited">不限</el-radio>
              <el-radio value="specific">指定学年学期</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <!-- 学年（仅 specific 时显示） -->
        <el-col v-if="form.timeType === 'specific'" :sm="12" :xs="24">
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

        <!-- 学期（仅 specific 时显示） -->
        <el-col v-if="form.timeType === 'specific'" :sm="12" :xs="24">
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
        <span class="section-hint">拖动行或使用上移 / 下移按钮调整顺序</span>
      </el-divider>
      <el-table
        :data="form.items"
        :border="true"
        size="default"
        class="item-table"
      >
        <el-table-column label="#" width="44" align="center">
          <template #default="{ $index }">
            <span class="sort-index">{{ $index + 1 }}</span>
          </template>
        </el-table-column>
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
        <el-table-column label="排序" width="120" align="center">
          <template #default="{ $index }">
            <el-button
              text
              size="small"
              :disabled="$index === 0"
              @click="moveItem($index, -1)"
            >
              上移
            </el-button>
            <el-button
              text
              size="small"
              :disabled="$index === form.items.length - 1"
              @click="moveItem($index, 1)"
            >
              下移
            </el-button>
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
    timeType: 'unlimited',
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
    timeType: [{ required: true, message: '请选择适用时间', trigger: 'change' }],
    schoolYear: [
      {
        validator: (_, value, cb) => {
          if (form.timeType === 'specific' && !value) cb(new Error('请选择学年'));
          else cb();
        },
        trigger: 'change'
      }
    ],
    term: [
      {
        validator: (_, value, cb) => {
          if (form.timeType === 'specific' && !value) cb(new Error('请选择学期'));
          else cb();
        },
        trigger: 'change'
      }
    ]
  });

  const gradeOptions = computed(() => GRADE_OPTIONS[form.stage] ?? []);

  /** el-cascader 多选配置 */
  const cascaderProps = {
    multiple: true,
    checkStrictly: false,
    emitPath: true,
    value: 'value',
    label: 'label',
    children: 'children'
  };

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

  const handleTimeTypeChange = (val) => {
    if (val === 'unlimited') {
      form.schoolYear = '';
      form.term = '';
    } else {
      form.schoolYear = form.schoolYear || '2025-2026';
      form.term = form.term || 'fall';
    }
    formRef.value?.clearValidate(['schoolYear', 'term']);
  };

  if (props.data) {
    const source = JSON.parse(JSON.stringify(props.data));
    const mergedItems = initItems().map((base) => {
      const existed = source.items?.find((d) => d.code === base.code);
      return existed ? { ...base, ...existed } : base;
    });
    // 兼容旧数据（无 timeType 字段时按 unlimited 处理）
    const timeType = source.timeType ?? (source.schoolYear ? 'specific' : 'unlimited');
    Object.assign(form, source, {
      scopeType: source.scopeType ?? 'general',
      regions: source.regions ?? [],
      timeType,
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

  /** 上移 / 下移 */
  const moveItem = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= form.items.length) return;
    const arr = form.items;
    const tmp = arr[index];
    arr[index] = arr[target];
    arr[target] = tmp;
    // 同步 sort 字段
    arr.forEach((it, i) => { it.sort = i + 1; });
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
        // 不限时间时清空学年学期
        if (payload.timeType === 'unlimited') {
          payload.schoolYear = '';
          payload.term = '';
        }
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
  .section-hint {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    font-weight: normal;
    margin-left: 8px;
  }
  .sort-index {
    color: var(--el-text-color-secondary);
    font-size: 13px;
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
