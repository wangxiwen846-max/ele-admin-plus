/**
 * 设项管理 - 前端原型本地 Mock 数据
 */
import { reactive } from 'vue';

export const SOURCE_OPTIONS = ['标准设项', '自定义设项'];
export const MATCH_FORM_OPTIONS = ['个人', '团体'];
export const STATUS_OPTIONS = [
  { value: 1, label: '启用' },
  { value: 0, label: '停用' }
];
export const GENDER_OPTIONS = ['不限', '男', '女'];
export const STAGE_OPTIONS = ['小学', '初中', '高中', '大学'];

/** 体育项目库（可关联选择，含一级项目分类） */
export const SPORT_PROJECT_CATALOG = [
  { category: '跳绳', name: '一分钟跳绳', projectType: '个数类', unit: '次' },
  { category: '跳绳', name: '30秒跳绳', projectType: '个数类', unit: '次' },
  { category: '田径', name: '50米跑', projectType: '时长类', unit: '秒' },
  { category: '田径', name: '男子1000米', projectType: '时长类', unit: '秒' },
  { category: '田径', name: '立定跳远', projectType: '距离类', unit: '厘米' },
  { category: '篮球', name: '3v3篮球', projectType: '胜负类', unit: '分' },
  { category: '篮球', name: '篮球运球', projectType: '时长类', unit: '秒' },
  { category: '体能', name: '仰卧起坐', projectType: '个数类', unit: '个' },
  { category: '体能', name: '俯卧撑', projectType: '个数类', unit: '个' },
  { category: '体能', name: '开合跳', projectType: '个数类', unit: '个' },
  { category: '体能', name: '深蹲', projectType: '个数类', unit: '个' },
  { category: '体能', name: '平板支撑', projectType: '时长类', unit: '秒' }
];

export const SPORT_CATEGORY_OPTIONS = [...new Set(SPORT_PROJECT_CATALOG.map((d) => d.category))];

/** 体育项目级联选项（一级项目 / 具体项目） */
export const SPORT_PROJECT_CASCADER_OPTIONS = SPORT_CATEGORY_OPTIONS.map((category) => ({
  value: category,
  label: category,
  children: SPORT_PROJECT_CATALOG.filter((d) => d.category === category).map((d) => ({
    value: d.name,
    label: d.name
  }))
}));

export const SPORT_OPTIONS = SPORT_PROJECT_CATALOG.map((d) => d.name);

export function inferSportSelectLevel(entry) {
  if (!entry) {
    return 'item';
  }
  if (entry.selectLevel === 'category' || entry.selectLevel === 'item') {
    return entry.selectLevel;
  }
  if (typeof entry === 'string') {
    const byName = SPORT_PROJECT_CATALOG.find((d) => d.name === entry);
    if (byName) {
      return 'item';
    }
    return SPORT_CATEGORY_OPTIONS.includes(entry) ? 'category' : 'item';
  }
  const category = entry.category ?? '';
  const name = entry.name ?? '';
  if (SPORT_CATEGORY_OPTIONS.includes(category) && (!name || name === category)) {
    return 'category';
  }
  if (name && name !== category) {
    return 'item';
  }
  return category ? 'category' : 'item';
}

export function getSportCatalogKey(entry) {
  if (!entry) {
    return '';
  }
  const normalized = normalizeSportEntry(entry);
  if (inferSportSelectLevel(normalized) === 'category') {
    return `${normalized.category}::__category__`;
  }
  return `${normalized.category}::${normalized.name}`;
}

export function normalizeSportEntry(entry) {
  let normalized;
  if (typeof entry === 'string') {
    const found =
      SPORT_PROJECT_CATALOG.find((d) => d.name === entry) ??
      SPORT_PROJECT_CATALOG.find((d) => d.category === entry);
    if (found) {
      normalized = { ...found, selectLevel: 'item' };
    } else if (SPORT_CATEGORY_OPTIONS.includes(entry)) {
      normalized = {
        category: entry,
        name: entry,
        projectType: '-',
        unit: '-',
        selectLevel: 'category'
      };
    } else {
      normalized = { category: '', name: entry, projectType: '-', unit: '-', selectLevel: 'item' };
    }
  } else if (entry.selectLevel === 'category') {
    normalized = {
      category: entry.category ?? entry.name ?? '',
      name: entry.category ?? entry.name ?? '',
      projectType: entry.projectType ?? '-',
      unit: entry.unit ?? '-',
      selectLevel: 'category'
    };
  } else if (entry.category && entry.name) {
    const found = SPORT_PROJECT_CATALOG.find(
      (d) => d.category === entry.category && d.name === entry.name
    );
    normalized = {
      ...(found ?? entry),
      selectLevel: entry.selectLevel ?? (entry.name === entry.category ? 'category' : 'item')
    };
  } else {
    const legacyName = entry.name ?? '';
    const found =
      SPORT_PROJECT_CATALOG.find((d) => d.name === legacyName) ??
      SPORT_PROJECT_CATALOG.find((d) => d.category === legacyName);
    if (found) {
      normalized = { ...found, selectLevel: entry.selectLevel ?? 'item' };
    } else if (SPORT_CATEGORY_OPTIONS.includes(legacyName)) {
      normalized = {
        category: legacyName,
        name: legacyName,
        projectType: entry.projectType ?? '-',
        unit: entry.unit ?? '-',
        selectLevel: 'category'
      };
    } else {
      normalized = {
        category: entry.category ?? legacyName,
        name: legacyName,
        projectType: entry.projectType ?? '-',
        unit: entry.unit ?? '-',
        selectLevel: entry.selectLevel ?? 'item'
      };
    }
  }
  normalized.selectLevel = normalized.selectLevel ?? inferSportSelectLevel(entry);
  return normalized;
}

/** 展示用户实际选中的项目名，不拼接上级分类 */
export function getSportEntryDisplayLabel(entry) {
  const normalized = normalizeSportEntry(entry);
  if (inferSportSelectLevel(normalized) === 'category') {
    return normalized.category || '-';
  }
  return normalized.name || normalized.category || '-';
}

export function formatSportEntryDisplay(entry) {
  return getSportEntryDisplayLabel(entry);
}

/** 详情展示：选中项 + 项目类型 */
export function formatSportEntryDetailDisplay(entry) {
  const label = getSportEntryDisplayLabel(entry);
  if (label === '-') {
    return '-';
  }
  const normalized = normalizeSportEntry(entry);
  if (normalized.projectType && normalized.projectType !== '-') {
    return `${label}（${normalized.projectType}）`;
  }
  return label;
}

export function sportEntryFromCascaderPath(path = []) {
  if (!path?.length) {
    return null;
  }
  const [category, name] = path;
  if (path.length === 1 || !name) {
    return {
      category,
      name: category,
      projectType: '-',
      unit: '-',
      selectLevel: 'category'
    };
  }
  const found = SPORT_PROJECT_CATALOG.find((d) => d.category === category && d.name === name);
  return {
    ...(found ?? { category, name, projectType: '-', unit: '-' }),
    selectLevel: 'item'
  };
}

export function cascaderPathsFromSports(sports = []) {
  return (sports ?? [])
    .map((sport) => {
      const normalized = normalizeSportEntry(sport);
      if (inferSportSelectLevel(normalized) === 'category') {
        return [normalized.category];
      }
      return [normalized.category, normalized.name];
    })
    .filter((path) => path[0]);
}

export function sportsFromCascaderPaths(paths = []) {
  return (paths ?? []).map((path) => sportEntryFromCascaderPath(path)).filter(Boolean);
}

/** 列表筛选：按级联选择路径匹配设项关联项目 */
export function matchesSportProjectFilter(itemSports, selectedPaths = []) {
  if (!selectedPaths?.length) {
    return true;
  }
  return selectedPaths.some((path) => {
    if (!path?.length) {
      return false;
    }
    const [category, name] = path;
    return (itemSports ?? []).some((sport) => {
      const entry = normalizeSportEntry(sport);
      if (name) {
        return entry.category === category && entry.name === name;
      }
      return entry.category === category;
    });
  });
}

/** 学段 → 年级 联动映射 */
export const STAGE_GRADE_MAP = {
  小学: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
  初中: ['初一', '初二', '初三'],
  高中: ['高一', '高二', '高三'],
  大学: ['大一', '大二', '大三', '大四']
};

export function getGradesByStages(stages = []) {
  const result = [];
  stages.forEach((stage) => {
    (STAGE_GRADE_MAP[stage] ?? []).forEach((g) => {
      if (!result.includes(g)) {
        result.push(g);
      }
    });
  });
  return result;
}

/** 内置成绩表单 */
export const BUILTIN_SCORE_FORMS = [
  '跳绳成绩提交表',
  '跑步计时成绩表',
  '篮球比赛结果提交表',
  '体能项目成绩提交表',
  '达标结果提交表'
];

/** 内置成绩表单字段预览 */
export const BUILTIN_SCORE_FORM_PREVIEWS = {
  跳绳成绩提交表: [
    { sportProject: '跳绳', name: '跳绳次数', type: '数字', required: '是', unit: '次', description: '填写有效跳绳次数' },
    { sportProject: '跳绳', name: '用时', type: '数字', required: '是', unit: '秒', description: '填写完成用时' },
    { sportProject: '', name: '比赛分', type: '数字', required: '否', unit: '分', description: '' }
  ],
  跑步计时成绩表: [
    { sportProject: '跑步', name: '完成用时', type: '数字', required: '是', unit: '秒', description: '' },
    { sportProject: '跑步', name: '是否完赛', type: '单选', required: '是', unit: '-', description: '' }
  ],
  篮球比赛结果提交表: [
    { sportProject: '篮球', name: '本方得分', type: '数字', required: '是', unit: '分', description: '' },
    { sportProject: '篮球', name: '对方得分', type: '数字', required: '是', unit: '分', description: '' },
    { sportProject: '篮球', name: '比赛结果', type: '单选', required: '是', unit: '-', description: '胜/平/负' }
  ],
  体能项目成绩提交表: [
    { sportProject: '', name: '完成个数', type: '数字', required: '是', unit: '个', description: '' },
    { sportProject: '', name: '用时', type: '数字', required: '否', unit: '秒', description: '' }
  ],
  达标结果提交表: [
    { sportProject: '', name: '达标结果', type: '单选', required: '是', unit: '-', description: '' },
    { sportProject: '', name: '备注', type: '文本', required: '否', unit: '-', description: '' }
  ]
};

/** 用户保存的成绩表单模板（动态追加） */
export const scoreFormStore = reactive({
  templates: {}
});

export function getScoreFormOptions() {
  return [...BUILTIN_SCORE_FORMS, ...Object.keys(scoreFormStore.templates)];
}

export function getScoreFormFields(formName) {
  if (!formName) {
    return [];
  }
  if (scoreFormStore.templates[formName]) {
    return clone(scoreFormStore.templates[formName]);
  }
  return clone(BUILTIN_SCORE_FORM_PREVIEWS[formName] ?? []);
}

export function saveScoreFormTemplate(name, fields) {
  scoreFormStore.templates[name] = clone(fields).map((f) => ({
    ...f,
    sportProject: normalizeSportProject(f.sportProject)
  }));
}

/** 所属项目展示：空值显示为 - */
export function formatSportProject(value) {
  const text = normalizeSportProject(value);
  return text || '-';
}

/** 所属项目存储：空、综合 等均归一为空字符串 */
export function normalizeSportProject(value) {
  if (value == null || value === '' || value === '综合') {
    return '';
  }
  return String(value);
}

export const DATA_SOURCE_OPTIONS = ['表单提交'];
export const SCORING_METHOD_OPTIONS = ['手动录入比赛分', '系统自动计算'];
/** 1.0 引用情况赛段 */
export const MATCH_STAGE_OPTIONS = ['校园积分赛', '区域晋级赛', '全国总决赛'];

/** 1.0 固定成绩类型 */
export const SCORE_TYPE_MEASUREMENT = '计量计数类';
export const SCORE_TYPE_RESULT = '胜负类';
export const SCORE_TYPE_OPTIONS = [SCORE_TYPE_MEASUREMENT, SCORE_TYPE_RESULT];
export const SCORE_SUBMITTER_OPTIONS = ['体育教师', '赛事专员'];
/** 1.0 报名方式（可多选） */
export const REGISTRATION_METHOD_OPTIONS = ['教师报名', '赛事专员报名'];
/** @deprecated 兼容旧数据迁移 */
export const REGISTRATION_METHOD_FIXED = '教师统一报名';
/** @deprecated 兼容旧数据 */
export const LEGACY_REGISTRATION_METHOD_OPTIONS = ['体育教师代报名', '赛事专员录入'];
/** @deprecated 兼容旧数据 */
export const DEFAULT_INSURANCE_OPTIONS = ['赛事统一保险', '参赛方自行购买'];

/** 成绩提交字段配置 - 可编辑项选项 */
export const DURATION_STAT_METHOD_OPTIONS = ['坚持时长', '完成用时'];
export const MEASUREMENT_UNIT_OPTIONS = ['个', '次', '米', '厘米', '秒'];
export const DURATION_UNIT_OPTIONS = ['秒'];
export const COUNT_STAT_METHOD_OPTIONS = ['固定时间计数', '规定次数命中', '距离成绩'];
export const COUNT_UNIT_OPTIONS = MEASUREMENT_UNIT_OPTIONS;
export const MATCH_RESULT_OPTIONS = ['胜', '负', '平'];

/** @deprecated 仅用于旧数据迁移 */
export const DURATION_CALIBER_OPTIONS = ['坚持时长', '完成用时'];
/** @deprecated 仅用于旧数据迁移 */
export const COUNT_STAT_CALIBER_OPTIONS = ['固定时间内个数', '规定次数命中数', '距离'];

export const RANK_BASIS_OPTIONS = ['成绩数值', '比赛分', '比赛结果', '人工排名'];
export const SORT_OPTIONS = ['数值越大排名越靠前', '数值越小排名越靠前'];
export const TIE_OPTIONS = ['并列排名', '按提交时间排序', '按规则说明处理'];

const COUNT_STAT_LEGACY_MAP = {
  固定时间内个数: '固定时间计数',
  规定次数命中数: '规定次数命中',
  距离: '距离成绩'
};

const COUNT_STAT_TO_LEGACY = {
  固定时间计数: '固定时间内个数',
  规定次数命中: '规定次数命中数',
  距离成绩: '距离'
};

export function isMeasurementScoreType(scoreType) {
  return ['计量计数类', '时长/用时类', '个数/距离类'].includes(scoreType);
}

export function normalizeScoreType(scoreType) {
  return isMeasurementScoreType(scoreType) ? SCORE_TYPE_MEASUREMENT : scoreType || SCORE_TYPE_MEASUREMENT;
}

export function defaultUnitForCountStat(statMethod) {
  if (statMethod === '规定次数命中') {
    return '个';
  }
  if (statMethod === '距离成绩') {
    return '米';
  }
  return '次';
}

function createRankFieldRow() {
  return {
    name: '名次',
    type: '数字',
    required: true,
    statMethod: '',
    unit: '名',
    options: '',
    description: '填写最终名次'
  };
}

function createProofFieldRow() {
  return {
    name: '成绩证明',
    type: '上传',
    required: false,
    statMethod: '',
    unit: '-',
    options: '',
    description: '上传成绩证明材料'
  };
}

function createRemarkFieldRow() {
  return {
    name: '备注',
    type: '文本',
    required: false,
    statMethod: '',
    unit: '-',
    options: '',
    description: '补充说明'
  };
}

export function createDefaultScoreFieldConfig(scoreType, options = {}) {
  if (isMeasurementScoreType(scoreType)) {
    const statMethod = options.statMethod ?? '完成用时';
    return [
      {
        name: '成绩数值',
        type: '数字',
        required: true,
        statMethod,
        unit: options.unit ?? '秒',
        options: '',
        description: '填写实际成绩数值'
      },
      createProofFieldRow(),
      createRemarkFieldRow()
    ];
  }
  if (scoreType === '胜负类') {
    return [
      {
        name: '比赛结果',
        type: '单选',
        required: true,
        statMethod: '',
        unit: '-',
        options: MATCH_RESULT_OPTIONS.join('、'),
        description: '选择比赛结果'
      },
      {
        name: '比分',
        type: '文本',
        required: false,
        statMethod: '',
        unit: '-',
        options: '',
        description: '填写比分'
      },
      createProofFieldRow(),
      createRemarkFieldRow()
    ];
  }
  return [];
}

export function createMatchScoreFieldRow() {
  return {
    name: '比赛分',
    type: '数字',
    required: true,
    statMethod: '',
    unit: '分',
    options: '',
    description: '填写团队比赛分'
  };
}

export function ensureMatchScoreField(config = []) {
  if (config.some((f) => f.name === '比赛分')) {
    return config;
  }
  return [...config, createMatchScoreFieldRow()];
}

export function removeMatchScoreField(config = []) {
  return config.filter((f) => f.name !== '比赛分');
}

export function syncScoreMetaFromFieldConfig(form) {
  if (!form) {
    return;
  }
  const scoreValueRow = (form.scoreFieldConfig ?? []).find((f) => f.name === '成绩数值');
  if (isMeasurementScoreType(form.scoreType) && scoreValueRow) {
    form.durationCaliber = scoreValueRow.statMethod;
    form.countStatCaliber = COUNT_STAT_TO_LEGACY[scoreValueRow.statMethod] ?? scoreValueRow.statMethod;
  }
}

export function fieldConfigRowToScoreConfigField(row) {
  return {
    fieldName: row.name,
    fieldType: row.type,
    required: typeof row.required === 'boolean' ? row.required : row.required === '是',
    statisticMethod: row.statMethod ?? '',
    unitOrOptions:
      row.name === '比赛结果' ? row.options || MATCH_RESULT_OPTIONS.join('、') : row.unit ?? '-',
    description: row.description ?? ''
  };
}

export function scoreConfigFieldToFieldConfigRow(field) {
  const name = field.fieldName ?? field.name;
  const isMatchResult = name === '比赛结果';
  return {
    name,
    type: field.fieldType ?? field.type,
    required: typeof field.required === 'boolean' ? field.required : field.required === '是',
    statMethod: field.statisticMethod ?? field.statMethod ?? '',
    unit: isMatchResult ? '-' : field.unitOrOptions ?? field.unit ?? '-',
    options: isMatchResult ? field.unitOrOptions ?? field.options ?? '' : field.options ?? '',
    description: field.description ?? ''
  };
}

export function buildScoreConfigFromItem(item) {
  const fields = normalizeScoreFieldConfig(item?.scoreFieldConfig ?? []);
  return {
    dataSource: item?.dataSource ?? '表单提交',
    scoreType: normalizeScoreType(item?.scoreType),
    fields: fields.map(fieldConfigRowToScoreConfigField)
  };
}

export function applyScoreConfigToItem(item) {
  if (!item?.scoreConfig?.fields?.length) {
    return;
  }
  item.dataSource = item.scoreConfig.dataSource ?? '表单提交';
  item.scoreType = item.scoreConfig.scoreType ?? item.scoreType;
  item.scoreFieldConfig = item.scoreConfig.fields.map(scoreConfigFieldToFieldConfigRow);
}

function ensureRankFieldInConfig(config = [], scoreType) {
  if (scoreType === '胜负类' || !scoreType) {
    if (config.some((f) => f.name === '名次')) {
      return config;
    }
    const resultIndex = config.findIndex((f) => f.name === '比赛结果');
    if (resultIndex === -1) {
      return [...config, createRankFieldRow()];
    }
    const next = [...config];
    next.splice(resultIndex + 1, 0, createRankFieldRow());
    return next;
  }
  if (config.some((f) => f.name === '名次')) {
    return config;
  }
  const scoreIndex = config.findIndex((f) => f.name === '成绩数值');
  if (scoreIndex === -1) {
    return [...createDefaultScoreFieldConfig(scoreType), ...config];
  }
  const next = [...config];
  next.splice(scoreIndex + 1, 0, createRankFieldRow());
  return next;
}

export function applyScoreTypeDefaults(form) {
  if (!form?.scoreType) {
    return;
  }
  form.scoreFieldConfig = createDefaultScoreFieldConfig(form.scoreType);
  syncStructuredFieldsFromForm(form);
}

export function isOptionalScoreField(name) {
  return name === '比分' || name === '成绩证明' || name === '备注';
}

export function normalizeScoreFieldRequired(name) {
  return !isOptionalScoreField(name);
}

export function formatScoreFieldRequiredDisplay(row) {
  return isOptionalScoreField(row?.name) ? '否' : '必填';
}

export function normalizeScoreFieldConfig(config = []) {
  return config.map((row) => {
    const name = row.name ?? row.fieldName;
    const normalized = {
      name,
      type: row.type ?? row.fieldType,
      required: normalizeScoreFieldRequired(name),
      statMethod: row.statMethod ?? row.statisticMethod ?? '',
      unit: row.unit ?? (row.name === '比赛结果' || row.fieldName === '比赛结果' ? '-' : row.unitOrOptions ?? '-'),
      options: row.options ?? '',
      description: row.description ?? ''
    };
    if (normalized.name === '比赛结果' && !normalized.options) {
      normalized.options = row.unitOrOptions || MATCH_RESULT_OPTIONS.join('、');
    }
    return normalized;
  });
}

export function syncScoreConfigFromForm(form) {
  if (!form) {
    return;
  }
  form.scoreConfig = buildScoreConfigFromItem(form);
}

function formatAgeRangeText(ageStart, ageEnd) {
  if (ageStart && ageEnd) {
    return `${ageStart}-${ageEnd}岁`;
  }
  return '';
}

function parseAgeRangeText(ageRange) {
  if (!ageRange) {
    return { ageStart: void 0, ageEnd: void 0 };
  }
  const match = String(ageRange).match(/(\d+)\s*-\s*(\d+)/);
  if (!match) {
    return { ageStart: void 0, ageEnd: void 0 };
  }
  return { ageStart: Number(match[1]), ageEnd: Number(match[2]) };
}

export function buildCompetitionFormFromItem(item) {
  return {
    type: item?.matchForm ?? '个人',
    enableTeamMemberLimit: !!item?.enableTeamMemberLimit,
    minTeamMembers: item?.enableTeamMemberLimit ? item.teamMin ?? null : null,
    maxTeamMembers: item?.enableTeamMemberLimit ? item.teamMax ?? null : null,
    needTeamName: item?.needTeamName ?? true,
    teamRuleDescription: item?.teamRule ?? ''
  };
}

export function buildApplicableScopeFromItem(item) {
  return {
    gender: item?.gender ?? '不限',
    stages: item?.stages ?? [],
    grades: item?.grades ?? [],
    ageRange: formatAgeRangeText(item?.ageStart, item?.ageEnd),
    description: item?.qualification ?? ''
  };
}

export function normalizeRegistrationMethods(methods = []) {
  const map = {
    体育教师代报名: '教师报名',
    教师统一报名: '教师报名',
    赛事专员录入: '赛事专员报名'
  };
  const normalized = (methods ?? [])
    .map((item) => map[item] || item)
    .filter((item) => REGISTRATION_METHOD_OPTIONS.includes(item));
  return normalized.length ? [...new Set(normalized)] : ['教师报名'];
}

export function buildRegistrationSettingFromItem(item) {
  if (item?.registrationSetting) {
    const raw = clone(item.registrationSetting);
    const methods = raw.methods?.length
      ? normalizeRegistrationMethods(raw.methods)
      : raw.method
        ? normalizeRegistrationMethods([raw.method])
        : ['教师报名'];
    return {
      ...createDefaultRegistrationSetting(),
      ...raw,
      methods
    };
  }
  return migrateRegistrationFromLegacy(item);
}

export function createDefaultRegistrationSetting(partial = {}) {
  return {
    methods: ['教师报名'],
    limitEnabled: false,
    limitCount: null,
    limitRemark: '',
    ...partial,
    methods: normalizeRegistrationMethods(
      partial.methods ?? (partial.method ? [partial.method] : ['教师报名'])
    )
  };
}

function migrateRegistrationFromLegacy(item = {}) {
  const setting = createDefaultRegistrationSetting();
  if (item.registrationMethods?.length) {
    setting.methods = normalizeRegistrationMethods(item.registrationMethods);
  } else if (item.registrationSetting?.method) {
    setting.methods = normalizeRegistrationMethods([item.registrationSetting.method]);
  }
  if (item.registrationLimitEnabled != null) {
    setting.limitEnabled = !!item.registrationLimitEnabled;
  } else if (item.registrationSetting?.limitEnabled != null) {
    setting.limitEnabled = !!item.registrationSetting.limitEnabled;
  }
  if (item.registrationLimitCount != null) {
    setting.limitCount = item.registrationLimitCount;
  } else if (item.registrationSetting?.limitCount != null) {
    setting.limitCount = item.registrationSetting.limitCount;
  }
  if (item.registrationLimitRemark) {
    setting.limitRemark = item.registrationLimitRemark;
  } else if (item.registrationSetting?.limitRemark) {
    setting.limitRemark = item.registrationSetting.limitRemark;
  }
  return setting;
}

export function formatRegistrationMethods(methods = []) {
  const list = normalizeRegistrationMethods(methods);
  return list.join('、');
}

export function formatRegistrationLimitDetail(setting = {}) {
  if (!setting.limitEnabled) {
    return '不限制数量';
  }
  return `数量上限 ${setting.limitCount ?? '-'}`;
}

export function formatRegistrationSettingSummary(item) {
  const setting = buildRegistrationSettingFromItem(item);
  return `${formatRegistrationMethods(setting.methods)}；${formatRegistrationLimitDetail(setting)}`;
}

export function validateRegistrationSetting(setting = {}) {
  const errors = [];
  if (!normalizeRegistrationMethods(setting.methods).length) {
    errors.push('请至少选择一种报名方式');
  }
  if (setting.limitEnabled) {
    if (
      setting.limitCount == null ||
      setting.limitCount <= 0 ||
      !Number.isInteger(Number(setting.limitCount))
    ) {
      errors.push('请填写有效的报名数量上限（正整数）');
    }
  }
  return errors;
}

export function validateInsuranceSetting(setting = {}) {
  const errors = [];
  if (setting.required && !setting.method) {
    errors.push('请选择保险方式');
  }
  return errors;
}

export const INSURANCE_METHOD_OPTIONS = ['统一购买', '自行购买', '其他'];

export function createDefaultInsuranceSetting(partial = {}) {
  return {
    required: true,
    method: '统一购买',
    description: '',
    attachments: [],
    ...partial
  };
}

/** 从设项默认保险要求解析结构化保险配置 */
export function buildInsuranceSettingFromItem(item) {
  if (item?.insuranceSetting) {
    return {
      ...createDefaultInsuranceSetting(),
      ...clone(item.insuranceSetting),
      attachments: clone(item.insuranceSetting.attachments ?? [])
    };
  }
  const req = item?.defaultInsuranceRequirement;
  if (req === '无需保险') {
    return createDefaultInsuranceSetting({ required: false, method: '统一购买' });
  }
  if (req === '参赛方自行购买') {
    return createDefaultInsuranceSetting({ required: true, method: '自行购买' });
  }
  if (req === '其他') {
    return createDefaultInsuranceSetting({ required: true, method: '其他' });
  }
  return createDefaultInsuranceSetting({ required: true, method: '统一购买' });
}

export function cloneInsuranceFromItem(item) {
  return buildInsuranceSettingFromItem(item);
}

export function formatInsuranceSettingSummary(setting) {
  if (!setting?.required) {
    return '无需保险';
  }
  return `${setting.method || '统一购买'}${setting.description ? `；${setting.description}` : ''}`;
}

export function buildCompetitionScoringRuleFromItem(item) {
  const applicable = item?.matchForm === '团体';
  return {
    applicable,
    enabled: applicable && !!item?.scoringEnabled,
    method: applicable && item?.scoringEnabled ? item.scoringMethod ?? '' : '',
    description: applicable && item?.scoringEnabled ? item.scoringDescription ?? '' : '',
    attachments:
      applicable && item?.scoringEnabled ? clone(item.scoringAttachments ?? []) : []
  };
}

export const AWARD_TARGET_OPTIONS = ['个人', '团体'];

let awardSeq = 100;

export function createAwardId() {
  awardSeq += 1;
  return `award_${awardSeq}`;
}

export function createDefaultAward(partial = {}) {
  return {
    id: createAwardId(),
    awardName: '',
    awardRule: '',
    awardTarget: '个人',
    ...partial
  };
}

export function normalizeAwardSettings(awards = []) {
  return (awards ?? []).map((item) =>
    createDefaultAward({
      ...item,
      id: item.id ?? createAwardId()
    })
  );
}

export function getAwardCount(awards = []) {
  return normalizeAwardSettings(awards).length;
}

export function formatAwardCountDisplay(awards = []) {
  const count = getAwardCount(awards);
  if (!count) {
    return '暂无奖项';
  }
  return `${count} 个`;
}

export function formatAwardSettingSummary(awards = []) {
  const count = getAwardCount(awards);
  if (!count) {
    return '暂未配置奖项';
  }
  return `已配置奖项数量：${count} 个`;
}

export function buildAwardSettingFromItem(item) {
  return normalizeAwardSettings(item?.awardSettings);
}

export function buildAwardConfigFromItem(item) {
  return {
    awards: normalizeAwardSettings(item?.awardSettings),
    awardRemark: item?.awardRemark?.trim() ?? ''
  };
}

export function cloneAwardConfigFromItem(item) {
  if (!item) {
    return { awards: [], awardRemark: '' };
  }
  return {
    awards: cloneAwardsFromItem(item),
    awardRemark: item.awardRemark?.trim() ?? ''
  };
}

export function cloneAwardsFromItem(item) {
  return normalizeAwardSettings(item?.awardSettings).map((award) => ({
    ...clone(award),
    id: createAwardId()
  }));
}

export function validateAwardSettings(awards = []) {
  const errors = [];
  normalizeAwardSettings(awards).forEach((item, index) => {
    const label = `第${index + 1}条奖项`;
    if (!item.awardName?.trim()) {
      errors.push(`${label}：请填写奖项名称`);
    }
    if (!item.awardRule?.trim()) {
      errors.push(`${label}：请填写奖项规则`);
    }
    if (!item.awardTarget) {
      errors.push(`${label}：请选择获奖对象`);
    }
  });
  return errors;
}

export function syncStructuredFieldsFromForm(form) {
  if (!form) {
    return;
  }
  syncScoreMetaFromFieldConfig(form);
  syncScoreConfigFromForm(form);
  form.competitionForm = buildCompetitionFormFromItem(form);
  form.applicableScope = buildApplicableScopeFromItem(form);
  form.competitionScoringRule = buildCompetitionScoringRuleFromItem(form);
  form.awardSetting = buildAwardConfigFromItem(form);
}

export function applyStructuredFieldsToItem(item) {
  if (!item) {
    return;
  }
  if (item.competitionForm) {
    const cf = item.competitionForm;
    item.matchForm = cf.type ?? item.matchForm;
    item.enableTeamMemberLimit = !!cf.enableTeamMemberLimit;
    item.teamMin = cf.minTeamMembers ?? null;
    item.teamMax = cf.maxTeamMembers ?? null;
    item.needTeamName = cf.needTeamName ?? item.needTeamName ?? true;
    item.teamRule = cf.teamRuleDescription ?? item.teamRule ?? '';
  }
  if (item.applicableScope) {
    const scope = item.applicableScope;
    item.gender = scope.gender ?? item.gender;
    item.stages = scope.stages ?? item.stages ?? [];
    item.grades = scope.grades ?? item.grades ?? [];
    item.qualification = scope.description ?? item.qualification ?? '';
    const ages = parseAgeRangeText(scope.ageRange);
    if (ages.ageStart) {
      item.ageStart = ages.ageStart;
    }
    if (ages.ageEnd) {
      item.ageEnd = ages.ageEnd;
    }
  }
  delete item.registrationSetting;
  delete item.registrationMethods;
  delete item.defaultInsuranceRequirement;
  delete item.insuranceSetting;
  delete item.scoreSubmitters;
  if (item.competitionScoringRule) {
    const rule = item.competitionScoringRule;
    if (!rule.applicable) {
      item.scoringEnabled = false;
      item.scoringMethod = '';
      item.scoringDescription = '';
      item.scoringAttachments = [];
    } else {
      item.scoringEnabled = !!rule.enabled;
      item.scoringMethod = rule.method ?? '';
      item.scoringDescription = rule.description ?? '';
      item.scoringAttachments = rule.attachments ?? [];
    }
  }
  if (item.awardSetting) {
    if (Array.isArray(item.awardSetting)) {
      item.awardSettings = normalizeAwardSettings(item.awardSetting);
    } else {
      item.awardSettings = normalizeAwardSettings(item.awardSetting.awards);
      item.awardRemark = item.awardSetting.awardRemark ?? '';
    }
  } else if (!item.awardSettings?.length) {
    item.awardSettings = [];
    item.awardRemark = item.awardRemark ?? '';
  } else {
    item.awardSettings = normalizeAwardSettings(item.awardSettings);
    item.awardRemark = item.awardRemark ?? '';
  }
}

export function formatRequiredDisplay(required) {
  if (typeof required === 'boolean') {
    return required ? '必填' : '否';
  }
  return required === '否' || required === false ? '否' : '必填';
}

export function getScoreFieldConfigForDisplay(item, options = {}) {
  let config;
  if (item?.scoreConfig?.fields?.length) {
    config = item.scoreConfig.fields.map(scoreConfigFieldToFieldConfigRow);
  } else {
    config = normalizeScoreFieldConfig(item?.scoreFieldConfig ?? []);
  }
  if (!config.length && item?.scoreType) {
    const statMethod =
      item.scoreType === '时长/用时类' || item.scoreType === SCORE_TYPE_MEASUREMENT
        ? item.durationCaliber
        : COUNT_STAT_LEGACY_MAP[item.countStatCaliber] ?? item.countStatCaliber;
    config = createDefaultScoreFieldConfig(item.scoreType, { statMethod });
  }
  config = ensureRankFieldInConfig(config, item?.scoreType);
  if (options.includeMatchScore) {
    config = ensureMatchScoreField(config);
  }
  return config;
}

/** @deprecated 兼容旧引用 */
export function getScoreTypeFields(scoreType, options = {}) {
  const config = createDefaultScoreFieldConfig(scoreType);
  if (options.includeMatchScore) {
    return ensureMatchScoreField(config);
  }
  return config;
}

export function hasScoreFieldNamed(fields, name) {
  return (fields ?? []).some((f) => f.name === name);
}

export function formatParticipationRequirementSummary(item) {
  const text = buildParticipationRequirementText(item);
  if (!text) {
    return '-';
  }
  return text.length > 36 ? `${text.slice(0, 36)}...` : text;
}

/** @deprecated 使用 formatParticipationRequirementSummary */
export function formatItemRequirementSummary(item) {
  return formatParticipationRequirementSummary(item);
}

export function buildParticipationRequirementText(item) {
  const parts = [formatRequirement(item), item?.qualification?.trim()].filter(Boolean);
  return parts.join('；') || '';
}

export function formatScoreRuleSummaryForList(item) {
  if (!item) {
    return '-';
  }
  if (item.ruleDescription?.trim()) {
    const text = item.ruleDescription.trim();
    return text.length > 36 ? `${text.slice(0, 36)}...` : text;
  }
  return item.scoreType ? `按${item.scoreType}提交成绩` : '-';
}

export function formatScoringRuleDisplay(row) {
  if (row?.matchForm === '个人') {
    return '不适用';
  }
  if (!row?.scoringEnabled) {
    return '未启用';
  }
  if (row.scoringDescription?.trim()) {
    const text = row.scoringDescription.trim();
    return text.length > 24 ? `${text.slice(0, 24)}...` : text;
  }
  return row.scoringMethod || '已配置';
}

export function migrateLegacyItem(data) {
  const item = { ...data };
  delete item.rankingMethod;
  delete item.needMaterial;
  delete item.materialDescription;
  applyStructuredFieldsToItem(item);
  if (!item.scoreType) {
    if (item.scoreForm === '篮球比赛结果提交表' || item.rankBasis === '胜负结果') {
      item.scoreType = SCORE_TYPE_RESULT;
    } else if (item.scoreForm === '跑步计时成绩表' || item.sortType === '数值越小排名越靠前') {
      item.scoreType = SCORE_TYPE_MEASUREMENT;
      item.durationCaliber = '完成用时';
    } else {
      item.scoreType = SCORE_TYPE_MEASUREMENT;
      item.countStatCaliber = '固定时间内个数';
    }
  }
  item.scoreType = normalizeScoreType(item.scoreType);
  if (!item.scoreSubmitters?.length) {
    delete item.scoreSubmitters;
  }
  if (item.scoreConfig?.fields?.length) {
    applyScoreConfigToItem(item);
  } else if (!item.scoreFieldConfig?.length) {
    const statMethod =
      item.scoreType === SCORE_TYPE_MEASUREMENT
        ? item.durationCaliber || '完成用时'
        : COUNT_STAT_LEGACY_MAP[item.countStatCaliber] ?? '固定时间计数';
    item.scoreFieldConfig = createDefaultScoreFieldConfig(item.scoreType, { statMethod });
  } else {
    item.scoreFieldConfig = normalizeScoreFieldConfig(item.scoreFieldConfig);
  }
  item.scoreType = normalizeScoreType(item.scoreType);
  item.scoreFieldConfig = ensureRankFieldInConfig(item.scoreFieldConfig, item.scoreType);
  if (item.scoreType === SCORE_TYPE_MEASUREMENT) {
    const scoreRow = item.scoreFieldConfig.find((f) => f.name === '成绩数值');
    if (scoreRow && (!scoreRow.unit || scoreRow.unit === '-')) {
      scoreRow.unit = '秒';
    }
  }
  item.scoreFieldConfig = item.scoreFieldConfig.map((row) => ({
    ...row,
    required: normalizeScoreFieldRequired(row.name)
  }));
  item.rankingEnabled = false;
  item.rankBasis = '';
  item.sortType = '';
  item.tieRule = '';
  item.rankDescription = '';
  item.rankAttachments = [];
  if (item.matchForm === '个人') {
    item.scoringEnabled = false;
    item.scoringMethod = '';
    item.scoringDescription = '';
    item.scoringAttachments = [];
    item.scoreFieldConfig = removeMatchScoreField(item.scoreFieldConfig);
  } else if (
    item.matchForm === '团体' &&
    item.scoringEnabled &&
    item.scoringMethod === '手动录入比赛分'
  ) {
    item.scoreFieldConfig = ensureMatchScoreField(item.scoreFieldConfig);
  }
  if (item.matchForm === '团体' && item.scoringEnabled == null) {
    item.scoringEnabled = false;
  }
  if (item.matchForm === '团体' && item.enableTeamMemberLimit == null) {
    item.enableTeamMemberLimit = !!(item.teamMin && item.teamMax);
  }
  if (!item.enableTeamMemberLimit) {
    item.teamMin = null;
    item.teamMax = null;
  }
  if (item.itemRequirement?.trim()) {
    item.qualification = item.qualification?.trim()
      ? item.qualification
      : item.itemRequirement.trim();
  }
  delete item.itemRequirement;
  item.sports = normalizeSports(item);
  item.awardSettings = normalizeAwardSettings(item.awardSettings);
  if (item.matchForm === '个人') {
    item.awardSettings = item.awardSettings.map((award) => ({
      ...award,
      awardTarget: '个人'
    }));
  }
  item.awardRemark = item.awardRemark ?? '';
  delete item.registrationSetting;
  delete item.registrationMethods;
  delete item.defaultInsuranceRequirement;
  delete item.insuranceSetting;
  delete item.scoreSubmitters;
  syncScoreMetaFromFieldConfig(item);
  syncStructuredFieldsFromForm(item);
  return item;
}

export const FIELD_TYPE_OPTIONS = ['文本', '数字', '单选', '多选', '日期', '上传'];

export function createMultiSportScoreFields() {
  return [
    {
      fieldId: 1,
      sportProject: '跳绳',
      name: '跳绳次数',
      type: '数字',
      required: true,
      unit: '次',
      description: '填写有效跳绳次数',
      options: []
    },
    {
      fieldId: 2,
      sportProject: '仰卧起坐',
      name: '仰卧起坐个数',
      type: '数字',
      required: true,
      unit: '个',
      description: '填写仰卧起坐个数',
      options: []
    },
    {
      fieldId: 3,
      sportProject: '俯卧撑',
      name: '俯卧撑个数',
      type: '数字',
      required: true,
      unit: '个',
      description: '填写俯卧撑个数',
      options: []
    },
    {
      fieldId: 4,
      sportProject: '',
      name: '比赛分',
      type: '数字',
      required: false,
      unit: '分',
      description: '若计分规则为手动录入比赛分，可填写',
      options: []
    }
  ];
}

export const REGION_OPTIONS = [
  {
    value: '110000',
    label: '北京市',
    children: [
      {
        value: '110100',
        label: '北京市',
        children: [
          { value: '110108', label: '海淀区' },
          { value: '110105', label: '朝阳区' },
          { value: '110102', label: '西城区' }
        ]
      }
    ]
  },
  {
    value: '310000',
    label: '上海市',
    children: [
      {
        value: '310100',
        label: '上海市',
        children: [
          { value: '310115', label: '浦东新区' },
          { value: '310101', label: '黄浦区' }
        ]
      }
    ]
  },
  {
    value: '440000',
    label: '广东省',
    children: [
      {
        value: '440100',
        label: '广州市',
        children: [
          { value: '440106', label: '天河区' },
          { value: '440104', label: '越秀区' }
        ]
      },
      {
        value: '440300',
        label: '深圳市',
        children: [
          { value: '440305', label: '南山区' },
          { value: '440304', label: '福田区' }
        ]
      }
    ]
  }
];

const REGION_CODE_MAP = (() => {
  const map = {};
  const walk = (nodes) => {
    nodes.forEach((node) => {
      map[node.value] = node.label;
      if (node.children) {
        walk(node.children);
      }
    });
  };
  walk(REGION_OPTIONS);
  return map;
})();

export function getRegionPathLabel(path = []) {
  return path.map((code) => REGION_CODE_MAP[code] ?? code).join(' / ');
}

export function getRegionLabelList(paths = []) {
  return paths.map((path) => getRegionPathLabel(path));
}

/** 业务化地区展示，如「北京市海淀区」 */
export function formatRegionPathBusinessLabel(path = []) {
  const text = getRegionPathLabel(path);
  const parts = text.split(' / ').filter(Boolean);
  if (!parts.length) {
    return text;
  }
  const compact = [];
  parts.forEach((part) => {
    if (compact[compact.length - 1] !== part) {
      compact.push(part);
    }
  });
  return compact.join('');
}

/** 设项适用区域摘要 */
export function formatApplicableRegionSummary(item) {
  if (!item || item.regionType === '全国') {
    return '全国';
  }
  const paths = item.regions ?? [];
  if (!paths.length) {
    return '未指定区域';
  }
  return paths.map((path) => formatRegionPathBusinessLabel(path)).join('、');
}

export const DEFAULT_ATTACHMENTS = [
  {
    id: 'file_rule_1',
    name: '竞赛规程示例.pdf',
    type: 'PDF',
    uploadTime: '2026-08-01 09:30'
  }
];

function baseItem() {
  return {
    itemId: void 0,
    itemName: '',
    description: '',
    source: '标准设项',
    sports: [],
    status: 1,
    matchForm: '个人',
    enableTeamMemberLimit: false,
    teamMin: null,
    teamMax: null,
    needTeamName: true,
    teamRule: '',
    gender: '不限',
    stages: [],
    grades: [],
    ageStart: void 0,
    ageEnd: void 0,
    qualification: '',
    dataSource: '表单提交',
    scoreType: SCORE_TYPE_MEASUREMENT,
    scoreFieldConfig: createDefaultScoreFieldConfig(SCORE_TYPE_MEASUREMENT),
    durationCaliber: '完成用时',
    countStatCaliber: '固定时间内个数',
    rankingEnabled: false,
    rankBasis: '',
    sortType: '',
    tieRule: '',
    rankDescription: '',
    rankAttachments: [],
    scoringEnabled: false,
    scoringMethod: '',
    scoringDescription: '',
    scoringAttachments: [],
    regionType: '全国',
    regions: [],
    includeChildren: true,
    ruleDescription: '',
    ruleAttachments: [],
    awardSettings: [],
    awardRemark: '',
    isReferenced: false,
    createBy: '',
    createTime: '',
    updateTime: '',
    operationLogs: []
  };
}

export function createDefaultItem() {
  const item = {
    ...baseItem(),
    sports: []
  };
  item.scoreFieldConfig = createDefaultScoreFieldConfig(item.scoreType);
  syncStructuredFieldsFromForm(item);
  return item;
}

function sportEntry(categoryOrName, name) {
  if (name) {
    return (
      SPORT_PROJECT_CATALOG.find((d) => d.category === categoryOrName && d.name === name) ??
      normalizeSportEntry({ category: categoryOrName, name })
    );
  }
  return normalizeSportEntry(categoryOrName);
}

function normalizeSports(data) {
  if (data.sports?.length) {
    return data.sports.map((s) => (typeof s === 'string' ? sportEntry(s) : normalizeSportEntry(s)));
  }
  if (data.sport) {
    return [sportEntry(data.sport)];
  }
  return [];
}

function makeItem(data) {
  const sports = normalizeSports(data);
  const merged = migrateLegacyItem({
    ...baseItem(),
    dataSource: '表单提交',
    sports,
    createBy: data.createBy ?? '管理员',
    createTime: data.createTime ?? '2026-08-01 09:00',
    updateTime: data.updateTime ?? '2026-08-20 10:00',
    operationLogs: [
      {
        time: data.createTime ?? '2026-08-01 09:00',
        operator: '管理员',
        type: '新增',
        content: '创建设项'
      },
      {
        time: data.updateTime ?? '2026-08-20 10:00',
        operator: '管理员',
        type: '编辑',
        content: '维护设项规则配置'
      }
    ],
    ...data,
    sports
  });
  return merged;
}

export const MATCH_MODE_OPTIONS = ['校内线下', '集中线下', '线上开展'];

export const eventItemStore = reactive({
  nextId: 9,
  list: [
    makeItem({
      itemId: 1,
      itemName: '一分钟跳绳挑战赛',
      source: '标准设项',
      sports: [sportEntry('跳绳', '一分钟跳绳')],
      matchForm: '个人',
      gender: '不限',
      stages: ['小学'],
      scoreType: SCORE_TYPE_MEASUREMENT,
      scoringEnabled: false,
      status: 1,
      isReferenced: true,
      regionType: '指定地区',
      regions: [['110000', '110100', '110108']],
      includeChildren: false,
      ruleAttachments: clone(DEFAULT_ATTACHMENTS),
      description: '用于校园积分赛中学生一分钟跳绳成绩采集与排名。',
      qualification: '面向小学三至四年级学生开放。',
      ruleDescription: '一分钟内完成有效跳绳计数，复杂排名和地区差异以附件规程为准。',
      awardSettings: [
        { id: 'award_1', awardName: '冠军', awardRule: '第1名', awardTarget: '个人' },
        { id: 'award_2', awardName: '亚军', awardRule: '第2名', awardTarget: '个人' },
        { id: 'award_3', awardName: '季军', awardRule: '第3名', awardTarget: '个人' },
        { id: 'award_4', awardName: '达标奖', awardRule: '成绩达标', awardTarget: '个人' }
      ],
      awardRemark: '并列名次时按规程说明处理；参赛人数不足时奖项可相应调整。'
    }),
    makeItem({
      itemId: 2,
      itemName: '3v3篮球班级对抗赛',
      source: '标准设项',
      sports: [sportEntry('篮球', '3v3篮球')],
      matchForm: '团体',
      enableTeamMemberLimit: true,
      teamMin: 3,
      teamMax: 5,
      needTeamName: true,
      teamRule: '由教师组织队伍参赛，也可根据比赛规则进行自由组队。',
      gender: '不限',
      stages: ['初中'],
      scoreType: '胜负类',
      scoringEnabled: false,
      status: 1,
      isReferenced: true,
      regionType: '全国',
      description: '用于校园篮球团队比赛结果提交与排名。',
      qualification: '面向初中学生组队参赛。',
      ruleDescription: '团体队伍不固定等于班级，具体组织方式以赛事通知为准。',
      awardSettings: [
        { id: 'award_5', awardName: '冠军', awardRule: '第1名', awardTarget: '团体' },
        { id: 'award_6', awardName: '亚军', awardRule: '第2名', awardTarget: '团体' },
        { id: 'award_7', awardName: '季军', awardRule: '第3名', awardTarget: '团体' }
      ]
    }),
    makeItem({
      itemId: 3,
      itemName: '男子1000米计时赛',
      source: '标准设项',
      sports: [sportEntry('田径', '男子1000米')],
      matchForm: '个人',
      gender: '男',
      stages: ['初中', '高中'],
      scoreType: SCORE_TYPE_MEASUREMENT,
      durationCaliber: '完成用时',
      scoringEnabled: false,
      status: 1,
      isReferenced: false,
      description: '用于男子1000米跑步成绩采集与排名。'
    }),
    makeItem({
      itemId: 4,
      itemName: '班级跳绳团体赛',
      source: '标准设项',
      sports: [sportEntry('跳绳', '一分钟跳绳')],
      matchForm: '团体',
      enableTeamMemberLimit: true,
      teamMin: 5,
      teamMax: 10,
      needTeamName: true,
      teamRule: '以班级为单位组队参赛。',
      gender: '不限',
      stages: ['小学'],
      scoreType: SCORE_TYPE_MEASUREMENT,
      scoringEnabled: true,
      scoringMethod: '手动录入比赛分',
      scoringDescription: '按班级累计跳绳个数折算比赛分，具体规则见竞赛规程。',
      status: 1,
      isReferenced: false,
      regionType: '指定地区',
      regions: [
        ['110000', '110100', '110108'],
        ['110000', '110100', '110105']
      ],
      description: '用于班级团体一分钟跳绳成绩采集与计分。'
    }),
    makeItem({
      itemId: 5,
      itemName: '50米跑积分赛',
      source: '标准设项',
      sports: [sportEntry('田径', '50米跑')],
      matchForm: '个人',
      gender: '不限',
      stages: ['小学', '初中'],
      scoreType: SCORE_TYPE_MEASUREMENT,
      durationCaliber: '完成用时',
      status: 1,
      isReferenced: false,
      description: '用于50米跑计时成绩采集。'
    }),
    makeItem({
      itemId: 6,
      itemName: '平板支撑挑战赛',
      source: '标准设项',
      sports: [sportEntry('体能', '平板支撑')],
      matchForm: '个人',
      gender: '不限',
      stages: ['小学', '初中', '高中'],
      scoreType: SCORE_TYPE_MEASUREMENT,
      durationCaliber: '坚持时长',
      status: 1,
      isReferenced: false,
      description: '用于平板支撑坚持时长成绩采集。'
    }),
    makeItem({
      itemId: 7,
      itemName: '班班赛',
      source: '标准设项',
      sports: [sportEntry('篮球', '3v3篮球'), sportEntry('跳绳', '一分钟跳绳')],
      matchForm: '团体',
      enableTeamMemberLimit: false,
      needTeamName: true,
      teamRule: '以班级为单位组织参赛。',
      gender: '不限',
      stages: ['小学', '初中'],
      scoreType: '胜负类',
      status: 1,
      isReferenced: false,
      description: '班级对抗类综合赛事设项。'
    }),
    makeItem({
      itemId: 8,
      itemName: '每周达标赛',
      source: '标准设项',
      sports: [sportEntry('跳绳', '一分钟跳绳'), sportEntry('体能', '开合跳')],
      matchForm: '个人',
      gender: '不限',
      stages: ['小学', '初中', '高中'],
      scoreType: SCORE_TYPE_MEASUREMENT,
      status: 1,
      isReferenced: false,
      description: '用于周期性运动达标挑战。'
    })
  ]
});

/** 设项比赛方式（活动管理选择设项时展示） */
export const EVENT_ITEM_MATCH_MODE_MAP = {
  1: '校内线下',
  2: '集中线下',
  3: '校内线下',
  4: '校内线下',
  5: '校内线下',
  6: '集中线下',
  7: '校内线下',
  8: '线上开展'
};

export function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

export function findEventItem(id) {
  return eventItemStore.list.find((d) => d.itemId === Number(id));
}

export function formatSportsDisplay(sports = []) {
  const labels = sports
    .map((s) => formatSportEntryDisplay(s))
    .filter((d) => d && d !== '-');
  if (!labels.length) {
    return '-';
  }
  if (labels.length <= 2) {
    return labels.join('、');
  }
  return `${labels.slice(0, 2).join('、')}等 ${labels.length} 项`;
}

export function formatRequirement(row) {
  return [row.stages?.join('、'), row.gender].filter(Boolean).join('｜');
}

export function formatNow() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** 列表展示用，格式 YYYY-MM-DD HH:mm */
export function formatListDateTime(value) {
  if (!value) {
    return '-';
  }
  return String(value).slice(0, 16);
}

export function createReferenceRecords(row) {
  if (!row?.isReferenced) {
    return [];
  }
  const sportName =
    typeof row.sports?.[0] === 'string' ? row.sports[0] : row.sports?.[0]?.name;
  const secondaryMatchName =
    row.matchForm === '团体' && sportName === '篮球'
      ? '3v3篮球班级赛'
      : sportName === '跳绳'
        ? '班班跳绳赛'
        : '东城区校园积分赛';
  return [
    {
      eventName: '学体联全国学生健康第一大赛',
      matchName: '海淀区校园积分赛',
      stage: '校园积分赛',
      matchTime: '2026-09-01 至 2026-12-31',
      status: '进行中',
      referenceTime: '2026-08-20 10:00'
    },
    {
      eventName: '北京市校园体育节',
      matchName: secondaryMatchName,
      stage: '区域晋级赛',
      matchTime: '2026-10-10 至 2026-10-30',
      status: '未开始',
      referenceTime: '2026-08-25 14:30'
    }
  ];
}

export function makeSnapshot(row) {
  const data = clone(row);
  return {
    sports: data.sports,
    matchForm: data.matchForm,
    competitionForm: data.competitionForm,
    applicableScope: data.applicableScope,
    requirement: {
      gender: data.gender,
      stages: data.stages,
      grades: data.grades,
      ageStart: data.ageStart,
      ageEnd: data.ageEnd,
      qualification: data.qualification
    },
    dataSource: data.dataSource,
    scoreConfig: data.scoreConfig,
    competitionScoringRule: data.competitionScoringRule,
    scoringRule: {
      enabled: data.scoringEnabled,
      method: data.scoringMethod,
      description: data.scoringDescription,
      attachments: data.scoringAttachments
    },
    ruleDescription: data.ruleDescription,
    ruleAttachments: data.ruleAttachments,
    awardSetting: buildAwardConfigFromItem(data)
  };
}

function gradeRangeText(grades = []) {
  if (grades.length <= 2) {
    return grades.join('、');
  }
  return `${grades[0]}-${grades[grades.length - 1]}`;
}
