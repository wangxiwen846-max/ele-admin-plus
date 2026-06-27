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

/** 体育项目库（可关联选择） */
export const SPORT_PROJECT_CATALOG = [
  { name: '跳绳', projectType: '计数类', unit: '次' },
  { name: '跑步', projectType: '计时类', unit: '秒' },
  { name: '篮球', projectType: '得分类', unit: '分' },
  { name: '仰卧起坐', projectType: '计数类', unit: '个' },
  { name: '俯卧撑', projectType: '计数类', unit: '个' },
  { name: '开合跳', projectType: '计数类', unit: '个' },
  { name: '深蹲', projectType: '计数类', unit: '个' }
];

export const SPORT_OPTIONS = SPORT_PROJECT_CATALOG.map((d) => d.name);

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
export const SCORE_TYPE_OPTIONS = ['时长/用时类', '个数/距离类', '胜负类'];
export const SCORE_SUBMITTER_OPTIONS = ['体育教师', '赛事专员'];
export const REGISTRATION_METHOD_OPTIONS = ['体育教师代报名', '赛事专员录入'];
export const DEFAULT_INSURANCE_OPTIONS = ['赛事统一保险', '参赛方自行购买'];

/** 成绩提交字段配置 - 可编辑项选项 */
export const DURATION_STAT_METHOD_OPTIONS = ['坚持时长', '完成用时'];
export const DURATION_UNIT_OPTIONS = ['秒', '分钟'];
export const COUNT_STAT_METHOD_OPTIONS = ['固定时间计数', '规定次数命中', '距离成绩'];
export const COUNT_UNIT_OPTIONS = ['个', '次', '米', '厘米'];
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
  if (scoreType === '时长/用时类') {
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
      createRankFieldRow(),
      createProofFieldRow(),
      createRemarkFieldRow()
    ];
  }
  if (scoreType === '个数/距离类') {
    const statMethod = options.statMethod ?? '固定时间计数';
    return [
      {
        name: '成绩数值',
        type: '数字',
        required: true,
        statMethod,
        unit: options.unit ?? defaultUnitForCountStat(statMethod),
        options: '',
        description: '填写实际成绩数值'
      },
      createRankFieldRow(),
      createProofFieldRow(),
      createRemarkFieldRow()
    ];
  }
  if (scoreType === '胜负类') {
    return [
      {
        name: '对阵对象',
        type: '文本',
        required: true,
        statMethod: '',
        unit: '-',
        options: '',
        description: '填写对阵班级、队伍或学校'
      },
      {
        name: '本方得分',
        type: '数字',
        required: true,
        statMethod: '',
        unit: '分',
        options: '',
        description: '填写本方得分'
      },
      {
        name: '对方得分',
        type: '数字',
        required: true,
        statMethod: '',
        unit: '分',
        options: '',
        description: '填写对方得分'
      },
      {
        name: '比赛结果',
        type: '单选',
        required: true,
        statMethod: '',
        unit: '-',
        options: MATCH_RESULT_OPTIONS.join('、'),
        description: '选择比赛结果'
      },
      createRankFieldRow(),
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
  if (form.scoreType === '时长/用时类' && scoreValueRow) {
    form.durationCaliber = scoreValueRow.statMethod;
  } else if (form.scoreType === '个数/距离类' && scoreValueRow) {
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
    submitters: item?.scoreSubmitters ?? ['体育教师'],
    scoreType: item?.scoreType ?? '个数/距离类',
    fields: fields.map(fieldConfigRowToScoreConfigField)
  };
}

export function applyScoreConfigToItem(item) {
  if (!item?.scoreConfig?.fields?.length) {
    return;
  }
  item.dataSource = item.scoreConfig.dataSource ?? '表单提交';
  item.scoreSubmitters = item.scoreConfig.submitters ?? item.scoreSubmitters ?? ['体育教师'];
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

export function normalizeScoreFieldConfig(config = []) {
  return config.map((row) => {
    const normalized = {
      name: row.name ?? row.fieldName,
      type: row.type ?? row.fieldType,
      required: typeof row.required === 'boolean' ? row.required : row.required === '是',
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

export function buildRegistrationSettingFromItem(item) {
  return {
    registrationMethods: item?.registrationMethods?.length
      ? item.registrationMethods
      : ['体育教师代报名'],
    defaultInsuranceRequirement: item?.defaultInsuranceRequirement ?? '赛事统一保险'
  };
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

export function syncStructuredFieldsFromForm(form) {
  if (!form) {
    return;
  }
  syncScoreMetaFromFieldConfig(form);
  syncScoreConfigFromForm(form);
  form.competitionForm = buildCompetitionFormFromItem(form);
  form.applicableScope = buildApplicableScopeFromItem(form);
  form.registrationSetting = buildRegistrationSettingFromItem(form);
  form.competitionScoringRule = buildCompetitionScoringRuleFromItem(form);
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
  if (item.registrationSetting) {
    item.registrationMethods =
      item.registrationSetting.registrationMethods ?? ['体育教师代报名'];
    item.defaultInsuranceRequirement =
      item.registrationSetting.defaultInsuranceRequirement ?? '赛事统一保险';
  }
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
}

export function formatRequiredDisplay(required) {
  if (typeof required === 'boolean') {
    return required ? '是' : '否';
  }
  return required || '-';
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
      item.scoreType === '时长/用时类'
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

export function formatScoringRuleDisplay(row) {
  if (row?.matchForm === '个人') {
    return '不适用';
  }
  return row?.scoringEnabled ? '已配置' : '未配置';
}

export function migrateLegacyItem(data) {
  const item = { ...data };
  delete item.rankingMethod;
  delete item.needMaterial;
  delete item.materialDescription;
  applyStructuredFieldsToItem(item);
  if (!item.scoreType) {
    if (item.scoreForm === '篮球比赛结果提交表' || item.rankBasis === '胜负结果') {
      item.scoreType = '胜负类';
    } else if (item.scoreForm === '跑步计时成绩表' || item.sortType === '数值越小排名越靠前') {
      item.scoreType = '时长/用时类';
      item.durationCaliber = '完成用时';
    } else {
      item.scoreType = '个数/距离类';
      item.countStatCaliber = '固定时间内个数';
    }
  }
  if (!item.scoreSubmitters?.length) {
    item.scoreSubmitters = ['体育教师'];
  }
  if (item.scoreConfig?.fields?.length) {
    applyScoreConfigToItem(item);
  } else if (!item.scoreFieldConfig?.length) {
    const statMethod =
      item.scoreType === '时长/用时类'
        ? item.durationCaliber || '完成用时'
        : COUNT_STAT_LEGACY_MAP[item.countStatCaliber] ?? '固定时间计数';
    item.scoreFieldConfig = createDefaultScoreFieldConfig(item.scoreType, { statMethod });
  } else {
    item.scoreFieldConfig = normalizeScoreFieldConfig(item.scoreFieldConfig);
  }
  item.scoreFieldConfig = ensureRankFieldInConfig(item.scoreFieldConfig, item.scoreType);
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
  if (!item.registrationMethods?.length) {
    item.registrationMethods = ['体育教师代报名'];
  }
  if (!item.defaultInsuranceRequirement || item.defaultInsuranceRequirement === '无需保险') {
    item.defaultInsuranceRequirement = '赛事统一保险';
  }
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
    registrationMethods: ['体育教师代报名'],
    defaultInsuranceRequirement: '赛事统一保险',
    dataSource: '表单提交',
    scoreType: '个数/距离类',
    scoreSubmitters: ['体育教师'],
    scoreFieldConfig: createDefaultScoreFieldConfig('个数/距离类'),
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

function sportEntry(name) {
  return SPORT_PROJECT_CATALOG.find((d) => d.name === name) ?? { name, projectType: '-', unit: '-' };
}

function normalizeSports(data) {
  if (data.sports?.length) {
    return data.sports.map((s) => (typeof s === 'string' ? sportEntry(s) : s));
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
      itemName: '一分钟跳绳',
      source: '标准设项',
      sports: [sportEntry('跳绳')],
      matchForm: '个人',
      gender: '不限',
      stages: ['小学'],
      grades: ['三年级', '四年级'],
      scoreType: '个数/距离类',
      scoreSubmitters: ['体育教师'],
      scoringEnabled: false,
      status: 1,
      isReferenced: true,
      regionType: '指定地区',
      regions: [['110000', '110100', '110108']],
      includeChildren: false,
      ruleAttachments: clone(DEFAULT_ATTACHMENTS),
      description: '用于校园积分赛中学生一分钟跳绳成绩采集与排名。',
      qualification: '面向小学三至四年级学生开放。',
      ruleDescription: '一分钟内完成有效跳绳计数，复杂排名和地区差异以附件规程为准。'
    }),
    makeItem({
      itemId: 2,
      itemName: '3v3篮球',
      source: '标准设项',
      sports: [sportEntry('篮球')],
      matchForm: '团体',
      enableTeamMemberLimit: true,
      teamMin: 3,
      teamMax: 5,
      needTeamName: true,
      teamRule: '由教师组织队伍参赛，也可根据比赛规则进行自由组队。',
      gender: '不限',
      stages: ['初中'],
      scoreType: '胜负类',
      scoreSubmitters: ['体育教师', '赛事专员'],
      scoringEnabled: false,
      status: 1,
      isReferenced: true,
      description: '用于校园篮球团队比赛结果提交与排名。',
      qualification: '面向初中学生组队参赛。',
      ruleDescription: '团体队伍不固定等于班级，具体组织方式以赛事通知为准。'
    }),
    makeItem({
      itemId: 3,
      itemName: '男子1000米',
      source: '标准设项',
      sports: [sportEntry('跑步')],
      matchForm: '个人',
      gender: '男',
      stages: ['初中', '高中'],
      grades: ['初一', '初二', '初三', '高一', '高二', '高三'],
      scoreType: '时长/用时类',
      durationCaliber: '完成用时',
      scoreSubmitters: ['体育教师'],
      scoringEnabled: false,
      status: 1,
      isReferenced: false,
      description: '用于男子1000米跑步成绩采集与排名。'
    }),
    makeItem({
      itemId: 4,
      itemName: '一分钟跳绳',
      source: '标准设项',
      sports: [sportEntry('跳绳')],
      matchForm: '团体',
      enableTeamMemberLimit: true,
      teamMin: 5,
      teamMax: 10,
      needTeamName: true,
      teamRule: '以班级为单位组队参赛。',
      gender: '不限',
      stages: ['小学'],
      grades: ['四年级', '五年级', '六年级'],
      scoreType: '个数/距离类',
      scoreSubmitters: ['体育教师'],
      scoringEnabled: true,
      scoringMethod: '手动录入比赛分',
      scoringDescription: '按班级累计跳绳个数折算比赛分，具体规则见竞赛规程。',
      status: 1,
      isReferenced: false,
      description: '用于班级团体一分钟跳绳成绩采集与计分。'
    }),
    makeItem({
      itemId: 5,
      itemName: '50米跑',
      source: '标准设项',
      sports: [sportEntry('跑步')],
      matchForm: '个人',
      gender: '不限',
      stages: ['小学', '初中'],
      scoreType: '时长/用时类',
      durationCaliber: '完成用时',
      scoreSubmitters: ['体育教师'],
      status: 1,
      isReferenced: false,
      description: '用于50米跑计时成绩采集。'
    }),
    makeItem({
      itemId: 6,
      itemName: '立定跳远',
      source: '标准设项',
      sports: [{ name: '立定跳远', projectType: '距离类', unit: '厘米' }],
      matchForm: '个人',
      gender: '不限',
      stages: ['小学', '初中', '高中'],
      scoreType: '个数/距离类',
      scoreSubmitters: ['体育教师'],
      status: 1,
      isReferenced: false,
      description: '用于立定跳远距离成绩采集。'
    }),
    makeItem({
      itemId: 7,
      itemName: '班班赛',
      source: '标准设项',
      sports: [sportEntry('篮球'), sportEntry('跳绳')],
      matchForm: '团体',
      enableTeamMemberLimit: false,
      needTeamName: true,
      teamRule: '以班级为单位组织参赛。',
      gender: '不限',
      stages: ['小学', '初中'],
      scoreType: '胜负类',
      scoreSubmitters: ['体育教师'],
      status: 1,
      isReferenced: false,
      description: '班级对抗类综合赛事设项。'
    }),
    makeItem({
      itemId: 8,
      itemName: '每周达标赛',
      source: '标准设项',
      sports: [sportEntry('跳绳'), sportEntry('开合跳')],
      matchForm: '个人',
      gender: '不限',
      stages: ['小学', '初中', '高中'],
      scoreType: '个数/距离类',
      scoreSubmitters: ['体育教师'],
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
  const names = sports.map((s) => (typeof s === 'string' ? s : s.name)).filter(Boolean);
  if (!names.length) {
    return '-';
  }
  if (names.length <= 2) {
    return names.join('、');
  }
  return `${names.slice(0, 2).join('、')}等 ${names.length} 项`;
}

export function formatRequirement(row) {
  return [
    row.stages?.join('、'),
    row.grades?.length ? gradeRangeText(row.grades) : '',
    row.gender
  ]
    .filter(Boolean)
    .join('｜');
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
    registrationSetting: data.registrationSetting,
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
    ruleAttachments: data.ruleAttachments
  };
}

function gradeRangeText(grades = []) {
  if (grades.length <= 2) {
    return grades.join('、');
  }
  return `${grades[0]}-${grades[grades.length - 1]}`;
}
