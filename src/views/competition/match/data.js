/**
 * 比赛管理 - 前端原型本地 Mock 数据
 */
import {
  findEventItem,
  formatNow,
  formatRegistrationMethods,
  normalizeRegistrationMethods,
  getAwardCount,
  clone,
  createDefaultInsuranceSetting,
  formatInsuranceSettingSummary,
  normalizeAwardSettings,
  buildParticipationRequirementText
} from '@/views/event-item/data.js';
import {
  activityStore,
  findActivity,
  getActivityLinkedItems,
  getActivityStatus,
  getStatusTagType,
  mapEventItemForActivity,
  cloneAwardConfigForMatch,
  formatAwardSummaryForDisplay,
  MOCK_OPERATOR
} from '@/views/competition/activity/data.js';
import {
  createDefaultScope,
  formatRegionDisplayLabel,
  getScopeEffectiveDetailRows,
  isScopeAllNational,
  migrateLegacyScope,
  SCHOOL_OPTIONS,
  SCOPE_MODE_ALL,
  SCOPE_MODE_SPECIFIED,
  validateScopeConfig,
  validateScopeWithinParent
} from '@/views/competition/activity/scope-utils.js';
import {
  findSemesterPlanByDate,
  findInsurancePlan,
  getInsuranceTypeByMatchType,
  getInsurancePlanOptions,
  isPlanCoveringDate
} from '@/views/competition/insurance/data.js';

export { getStatusTagType, clone };

export const MATCH_TYPE_DAILY = '每日积分赛';
export const MATCH_TYPE_CAMPUS = '校内赛';
export const MATCH_TYPE_REGION = '区域晋级赛';
export const MATCH_TYPE_FINAL = '全国总决赛';
export const MATCH_TYPE_CLASS_TYPES = [
  MATCH_TYPE_CAMPUS,
  MATCH_TYPE_REGION,
  MATCH_TYPE_FINAL
];
export const MATCH_TYPE_OPTIONS = [MATCH_TYPE_DAILY, ...MATCH_TYPE_CLASS_TYPES];
/** @deprecated 使用 MATCH_TYPE_CAMPUS / MATCH_TYPE_REGION / MATCH_TYPE_FINAL */
export const MATCH_TYPE_CLASS = '班班赛';
export const STAGE_CAMPUS_NAME = '校园行';
export const STAGE_FINAL_NAME = '全国总决赛';

const STAGE_NAME_LEGACY_MAP = {
  校园积分赛: STAGE_CAMPUS_NAME,
  区域晋级赛: STAGE_CAMPUS_NAME
};

export function getMatchTypeOptionsForStage(stageName = '') {
  if (stageName === STAGE_FINAL_NAME) {
    return [MATCH_TYPE_FINAL];
  }
  if (stageName === STAGE_CAMPUS_NAME) {
    return [MATCH_TYPE_DAILY, MATCH_TYPE_CAMPUS, MATCH_TYPE_REGION];
  }
  return MATCH_TYPE_OPTIONS;
}

export function getMatchTypeStageHint(stageName = '') {
  if (stageName === STAGE_FINAL_NAME) {
    return '全国总决赛赛段仅支持发布全国总决赛类型比赛。';
  }
  if (stageName === STAGE_CAMPUS_NAME) {
    return '校园行赛段支持校园赛（每日积分赛、班班赛）和区域晋级赛。';
  }
  return '';
}

export function normalizeMatchType(type = '', stageName = '') {
  if (!type) {
    return '';
  }
  if (type === '区域赛' || type === '区域晋级赛') {
    return MATCH_TYPE_REGION;
  }
  if (
    type === MATCH_TYPE_DAILY ||
    type === MATCH_TYPE_CAMPUS ||
    type === MATCH_TYPE_REGION ||
    type === MATCH_TYPE_FINAL
  ) {
    return type;
  }
  if (type === MATCH_TYPE_CLASS || type === '班班赛') {
    if (stageName === STAGE_FINAL_NAME) {
      return MATCH_TYPE_FINAL;
    }
    if (stageName === '区域晋级赛') {
      return MATCH_TYPE_REGION;
    }
    return MATCH_TYPE_CAMPUS;
  }
  return type;
}
export const DELIVERY_FORM_OPTIONS = ['线上', '线下', '线上线下相结合'];
export const REGISTRATION_STATUS_OPTIONS = ['未开始', '报名中', '已截止', '待配置', '自动参与'];
export const MATCH_STATUS_OPTIONS = ['未开始', '进行中', '已结束'];
export const INSURANCE_METHOD_OPTIONS = ['统一购买', '自行购买', '其他'];
export { formatRegistrationMethods, normalizeRegistrationMethods, REGISTRATION_METHOD_OPTIONS, createDefaultInsuranceSetting } from '@/views/event-item/data.js';
export const CLASS_SCORE_COLLECT_OPTIONS = ['表单提交'];
export const CLASS_SCORE_SUBMITTER_OPTIONS = ['教师', '赛事专员'];
export const DAILY_SCORE_COLLECT_OPTIONS = ['表单提交', 'AI计数', '通讯设备'];
export const DAILY_SUBMIT_ROLE_OPTIONS = ['教师', '赛事专员', '学生', '家长', '系统自动采集'];
export const BELONG_DATE_OPTIONS = ['课程日期', '作业日期', '发生日期', '赛事日期', '运动日期'];
export const OVERDUE_DATA_OPTIONS = ['计入次日', '等待补算'];
export const WEEKLY_STAT_PERIOD_FIXED = '周一至周日';
/** @deprecated 1.0 不再开放周起始日配置 */
export const WEEKLY_PERIOD_TYPE_OPTIONS = ['自然周', '比赛周'];
/** @deprecated 1.0 不再开放周起始日配置 */
export const WEEK_START_DAY_OPTIONS = ['周一', '周日'];
export const STAGE_UPDATE_METHOD_OPTIONS = ['每日更新', '每周更新', '比赛结束后生成'];
export const RECALCULATE_SCOPE_OPTIONS = ['最近 7 天', '当前周', '当前比赛周期'];
export const RESUBMIT_RULE_FIXED = '同一学生 + 同一日期 + 同一来源 + 同一项目，按最新记录计算';
export const DAILY_SUBMIT_FREQUENCY_OPTIONS = ['每日', '每周', '不限', '按作业周期'];
export const DAILY_STAT_PERIOD_OPTIONS = ['每日', '每周', '自定义'];
export const POINTS_STAT_PERIOD_OPTIONS = ['每日', '每周'];
export const MISSING_DATA_OPTIONS = ['无数据记 0', '不参与统计'];
export const RANKING_TARGET_OPTIONS = ['学生', '班级'];
export const RANKING_PERIOD_TYPE_OPTIONS = ['日榜', '周榜', '阶段榜'];
/** @deprecated 使用 RANKING_PERIOD_TYPE_OPTIONS */
export const RANKING_PERIOD_OPTIONS = ['每日', '每周', '阶段'];
export const RANKING_BASIS_FIXED = '系统积分';
export const RANKING_TIE_OPTIONS = ['并列名次', '按系统默认规则'];
export const RANKING_DISPLAY_OPTIONS = ['学生端', '教师端', '管理端'];
export const DATA_SOURCE_TYPES = [
  '体育课 / 大课间',
  '体育作业',
  '校外培训',
  '赛事',
  'AI运动'
];
export const SCORING_PLAN_NAME = '每日综合评分体系';
export const SCORING_PLAN_VERSION = '1.0';
export const SCORING_PLAN_UPDATED_AT = '2026-06-17';

const SOURCE_ROLE_OPTIONS = {
  '体育课 / 大课间': ['教师', '赛事专员'],
  体育作业: ['学生', '家长', '系统自动采集'],
  校外培训: ['学生', '家长'],
  赛事: ['学生', '家长', '赛事专员'],
  AI运动: ['学生', '系统自动采集']
};

const SOURCE_COLLECT_METHOD_OPTIONS = {
  '体育课 / 大课间': ['表单提交'],
  体育作业: ['表单提交', 'AI计数', '通讯设备'],
  校外培训: ['表单提交'],
  赛事: ['表单提交'],
  AI运动: ['AI计数']
};

const LEGACY_COLLECT_METHOD_MAP = {
  '体育课 / 大课间': {
    人工录入: '表单提交'
  },
  体育作业: {
    人工录入: '表单提交',
    作业系统: '表单提交',
    AI识别: 'AI计数',
    设备采集: '通讯设备',
    设备记录: '通讯设备',
    设备: '通讯设备'
  },
  校外培训: {
    人工录入: '表单提交'
  },
  赛事: {
    人工录入: '表单提交'
  },
  AI运动: {
    AI识别: 'AI计数',
    运动记录: 'AI计数',
    设备记录: 'AI计数',
    设备采集: 'AI计数',
    设备: 'AI计数'
  }
};

const LEGACY_CLASS_COLLECT_METHOD_MAP = {
  人工录入: '表单提交',
  AI识别: 'AI计数',
  设备采集: '通讯设备',
  设备记录: '通讯设备',
  设备: '通讯设备'
};

function normalizeClassCollectMethods(methods = []) {
  const allowed = new Set(CLASS_SCORE_COLLECT_OPTIONS);
  const migrated = [...new Set(
    (methods ?? []).map((method) => LEGACY_CLASS_COLLECT_METHOD_MAP[method] ?? method).filter((method) => allowed.has(method))
  )];
  return migrated.length ? migrated : ['表单提交'];
}

const SOURCE_CALIBER_OPTIONS = {
  '体育课 / 大课间': ['每日运动总时长', '课堂记录'],
  体育作业: ['体育作业完成情况', '运动时长'],
  校外培训: ['校外培训加分'],
  赛事: ['赛事参与和赛事成绩加分'],
  AI运动: ['每日运动总时长', '校外运动时长']
};

const DEFAULT_SOURCE_WEIGHTS = {
  '体育课 / 大课间': 30,
  体育作业: 25,
  校外培训: 10,
  赛事: 15,
  AI运动: 20
};

const DATA_SOURCE_RULE_PRESETS = {
  '体育课 / 大课间': {
    roleSummary: '教师 / 赛事专员',
    methodSummary: '表单提交',
    countInCaliber: '每日运动总时长、课堂记录',
    countInCalibers: ['每日运动总时长', '课堂记录'],
    belongDate: '课程日期',
    scoringDescription: '用于记录学生校内运动参与情况。',
    resubmitRule: RESUBMIT_RULE_FIXED,
    proofRequirement: '非必填',
    submitRoles: ['教师', '赛事专员'],
    collectMethods: ['表单提交'],
    proofRequired: false
  },
  体育作业: {
    roleSummary: '学生 / 家长 / 系统',
    methodSummary: '表单提交 / AI计数 / 通讯设备',
    countInCaliber: '体育作业完成情况、运动时长',
    countInCalibers: ['体育作业完成情况', '运动时长'],
    belongDate: '作业日期',
    scoringDescription: '学生完成体育作业后，系统按预置规则计入积分。',
    resubmitRule: RESUBMIT_RULE_FIXED,
    proofRequirement: '非必填',
    submitRoles: ['学生', '家长', '系统自动采集'],
    collectMethods: ['表单提交', 'AI计数', '通讯设备'],
    proofRequired: false
  },
  校外培训: {
    roleSummary: '学生 / 家长',
    methodSummary: '表单提交',
    countInCaliber: '校外培训加分',
    countInCalibers: ['校外培训加分'],
    belongDate: '发生日期',
    scoringDescription: '用于记录学生校外培训参与情况，可按系统规则计入超额激励。',
    resubmitRule: RESUBMIT_RULE_FIXED,
    proofRequirement: '可选上传证明材料',
    submitRoles: ['学生', '家长'],
    collectMethods: ['表单提交'],
    proofRequired: false
  },
  赛事: {
    roleSummary: '学生 / 家长 / 赛事专员',
    methodSummary: '表单提交',
    countInCaliber: '赛事参与和赛事成绩加分',
    countInCalibers: ['赛事参与和赛事成绩加分'],
    belongDate: '赛事日期',
    scoringDescription: '用于记录学生参加赛事情况，可按系统规则计入赛事加分。',
    resubmitRule: RESUBMIT_RULE_FIXED,
    proofRequirement: '可选上传证明材料',
    submitRoles: ['学生', '家长', '赛事专员'],
    collectMethods: ['表单提交'],
    proofRequired: false
  },
  AI运动: {
    roleSummary: '学生 / 系统自动',
    methodSummary: 'AI计数',
    countInCaliber: '每日运动总时长、校外运动时长',
    countInCalibers: ['每日运动总时长', '校外运动时长'],
    belongDate: '运动日期',
    scoringDescription:
      'AI运动产生的数据计入每日积分；如果同一条记录已作为体育作业完成依据，不允许在同一维度重复计分。',
    resubmitRule: RESUBMIT_RULE_FIXED,
    proofRequirement: '无需证明材料',
    submitRoles: ['学生', '系统自动采集'],
    collectMethods: ['AI计数'],
    proofRequired: false
  }
};

function formatRoleSummary(roles = [], sourceType = '') {
  return roles
    .map((role) => {
      if (role === '系统自动采集') {
        return sourceType === 'AI运动' ? '系统自动' : '系统';
      }
      return role;
    })
    .join(' / ');
}

function formatMethodSummary(methods = []) {
  return (methods ?? []).join(' / ');
}

function migrateCollectMethods(type, methods = []) {
  const allowed = new Set(SOURCE_COLLECT_METHOD_OPTIONS[type] ?? []);
  const legacy = LEGACY_COLLECT_METHOD_MAP[type] ?? {};
  const migrated = (methods ?? [])
    .map((method) => legacy[method] ?? method)
    .filter((method) => allowed.has(method));
  const unique = [...new Set(migrated)];
  if (!unique.length) {
    return [...(SOURCE_COLLECT_METHOD_OPTIONS[type] ?? [])];
  }
  return unique;
}

function formatCaliberSummary(calibers = []) {
  return calibers.join('、');
}

export function getSourceRoleOptions(type) {
  return SOURCE_ROLE_OPTIONS[type] ?? DAILY_SUBMIT_ROLE_OPTIONS;
}

export function getSourceCollectMethodOptions(type) {
  return SOURCE_COLLECT_METHOD_OPTIONS[type] ?? DAILY_SCORE_COLLECT_OPTIONS;
}

export function getSourceCaliberOptions(type) {
  return SOURCE_CALIBER_OPTIONS[type] ?? [];
}

export function syncDataSourceSummaries(source = {}) {
  const type = source.sourceType;
  const preset = getDataSourceRulePreset(type);
  const roles = source.submitRoles ?? preset.submitRoles ?? [];
  const methods = migrateCollectMethods(type, source.collectMethods ?? preset.collectMethods);
  const calibers = source.countInCalibers?.length
    ? source.countInCalibers
    : preset.countInCalibers?.length
      ? preset.countInCalibers
      : source.countInCaliber
        ? String(source.countInCaliber)
            .split(/[、,，]/)
            .map((d) => d.trim())
            .filter(Boolean)
        : [];
  return {
    ...source,
    sourceType: type,
    submitRoles: roles,
    collectMethods: methods,
    countInCalibers: calibers,
    belongDate: preset.belongDate,
    roleSummary: formatRoleSummary(roles, type),
    methodSummary: formatMethodSummary(methods),
    countInCaliber: formatCaliberSummary(calibers)
  };
}

const RESUBMIT_RULE_TEXT = '按最新成绩计算';

let matchSeq = 100;

export function createMatchId() {
  matchSeq += 1;
  return `match_${matchSeq}`;
}

export function createDefaultMatchScope() {
  return {
    regionMode: SCOPE_MODE_ALL,
    regions: [],
    schoolMode: SCOPE_MODE_ALL,
    schools: [],
    stageMode: SCOPE_MODE_ALL,
    stages: [],
    gradeMode: SCOPE_MODE_ALL,
    grades: []
  };
}

export function isMatchScopeInherit(scope = {}) {
  if (scope.customized === false) {
    return true;
  }
  if (scope.customized === true) {
    return false;
  }
  return (
    scope.regionMode !== SCOPE_MODE_SPECIFIED &&
    scope.schoolMode !== SCOPE_MODE_SPECIFIED
  );
}

export function createDefaultMatchRegistration(partial = {}) {
  return createDefaultItemRegistration(partial);
}

export function normalizeMatchRegistration(config = {}) {
  return normalizeItemRegistration(config);
}

export function formatMatchRegistrationSummary(match) {
  if (isDailyMatch(match)) {
    return '无需报名';
  }
  const config = normalizeMatchRegistration(match?.matchRegistration ?? {});
  const methods = formatRegistrationMethods(config.methods);
  const limit = config.limitEnabled
    ? `数量上限 ${config.limitCount ?? '-'}${config.limitRemark ? `；${config.limitRemark}` : ''}`
    : '不限制报名数量';
  return `${methods}；${limit}`;
}

export function formatMatchInsuranceSummary(match) {
  if (isDailyMatch(match)) {
    return formatInsuranceSettingSummary(match?.dailyInsurance ?? createDefaultInsuranceSetting());
  }
  return formatInsuranceSettingSummary(match?.matchInsurance ?? createDefaultInsuranceSetting());
}

export function createDefaultItemRegistration(partial = {}) {
  return {
    methods: ['教师报名'],
    limitEnabled: false,
    limitCount: null,
    limitRemark: '',
    ...partial,
    methods: normalizeRegistrationMethods(partial.methods ?? ['教师报名'])
  };
}

export function cloneItemRegistrationFromItem() {
  return createDefaultItemRegistration();
}

function normalizeItemRegistration(config = {}) {
  const methods = config.methods?.length
    ? normalizeRegistrationMethods(config.methods)
    : config.method
      ? normalizeRegistrationMethods([config.method])
      : ['教师报名'];
  return createDefaultItemRegistration({
    methods,
    limitEnabled: !!config.limitEnabled,
    limitCount: config.limitCount ?? null,
    limitRemark: config.limitRemark || ''
  });
}

function createDefaultItemScoreSetting(partial = {}) {
  return {
    submitters: ['教师'],
    collectMethods: ['表单提交'],
    submitStartTime: '',
    submitEndTime: '',
    allowResubmit: true,
    resubmitRule: RESUBMIT_RULE_TEXT,
    remark: '',
    ...partial
  };
}

/** @deprecated 兼容旧引用 */
function createDefaultClassScoreSetting() {
  return createDefaultItemScoreSetting();
}

export { createDefaultItemScoreSetting };

export function cloneItemMetaFromItem(item) {
  if (!item) {
    return { scoringRule: '', qualification: '' };
  }
  let scoringRule = '未启用';
  if (item.matchForm !== '个人' && item.scoringEnabled) {
    scoringRule = item.scoringDescription?.trim() || item.scoringMethod || '已配置';
  }
  return {
    scoringRule,
    qualification: buildParticipationRequirementText(item)
  };
}

export function cloneItemScoreFromItem(item, partial = {}) {
  return createDefaultItemScoreSetting(partial);
}

function createDefaultDailyScoreRules() {
  return {
    statPeriod: '每日',
    submitDeadline: '',
    allowLateSubmit: false,
    lateDeadline: '',
    allowResubmit: true,
    resubmitRule: RESUBMIT_RULE_TEXT,
    remark: ''
  };
}

function createDefaultPointsRules() {
  return {
    ruleVersion: SCORING_PLAN_VERSION,
    dailyEnabled: true,
    dailyGenerateTime: '每日 22:00',
    dataCutoffTime: '每日 21:30',
    weeklyEnabled: true,
    weeklyStatPeriod: WEEKLY_STAT_PERIOD_FIXED,
    weeklyGenerateTime: '每周日 23:00',
    weeklyRankingVisible: true,
    stageEnabled: true,
    stageUpdateMethod: '每日更新',
    stageUpdateTime: '每日 22:30',
    stageRule: '按比赛周期内日积分累计',
    allowLateRecalculate: false,
    allowLateSubmit: false,
    lateSubmitDeadline: '',
    allowRecalculate: false,
    recalculateScope: '最近 7 天',
    recalculateRemark: '',
    resubmitRule: RESUBMIT_RULE_FIXED,
    description: '系统按已配置数据来源及权重计算积分；同一学生、同一日期、同一来源、同一项目重复提交时按最新记录计算。'
  };
}

export function normalizePointsRules(rules = {}) {
  const next = { ...createDefaultPointsRules(), ...clone(rules) };
  next.dailyEnabled = true;
  next.dailyGenerateTime = '每日 22:00';
  next.dataCutoffTime = '每日 21:30';
  next.stageEnabled = true;
  next.weeklyStatPeriod = WEEKLY_STAT_PERIOD_FIXED;
  next.allowLateRecalculate = !!(
    next.allowLateRecalculate ||
    next.allowLateSubmit ||
    next.allowRecalculate
  );
  next.allowLateSubmit = next.allowLateRecalculate;
  next.allowRecalculate = next.allowLateRecalculate;
  next.lateSubmitDeadline = '';
  next.recalculateScope = '';
  next.recalculateRemark = '';
  next.resubmitRule = RESUBMIT_RULE_FIXED;
  delete next.overdueDataHandling;
  delete next.weeklyPeriodType;
  delete next.weeklyStartDay;
  return next;
}

export function isWeeklyPointsEnabled(pointsRules = {}) {
  return normalizePointsRules(pointsRules).weeklyEnabled !== false;
}

function createDefaultScoringPlan() {
  return {
    name: SCORING_PLAN_NAME,
    version: SCORING_PLAN_VERSION
  };
}

function createDefaultRankingRules() {
  return {
    targets: ['学生'],
    periods: ['日榜', '周榜', '阶段榜'],
    basis: RANKING_BASIS_FIXED,
    tieRule: '并列名次',
    displayScopes: ['学生端', '教师端', '管理端'],
    description: ''
  };
}

function normalizeRankingRules(rules = {}) {
  const next = { ...createDefaultRankingRules(), ...clone(rules) };
  if (!next.periods?.length && next.period) {
    const map = { 每日: '日榜', 每周: '周榜', 阶段: '阶段榜' };
    next.periods = [map[next.period] ?? next.period].filter(Boolean);
  }
  if (!next.periods?.length) {
    next.periods = ['日榜', '周榜', '阶段榜'];
  }
  next.basis = RANKING_BASIS_FIXED;
  delete next.period;
  return next;
}

export function getDataSourceRulePreset(type) {
  return DATA_SOURCE_RULE_PRESETS[type] ?? {};
}

function createDataSourcePreset(type, overrides = {}) {
  const rulePreset = getDataSourceRulePreset(type);
  const weight = DEFAULT_SOURCE_WEIGHTS[type] ?? 0;
  return syncDataSourceSummaries({
    id: `ds_${type}`,
    sourceType: type,
    enabled: true,
    weight,
    weightRemark: '',
    countInPoints: true,
    allowResubmit: true,
    ...rulePreset,
    remark: '',
    ...overrides
  });
}

export function normalizeDataSources(sources = []) {
  const map = new Map((sources ?? []).map((d) => [d.sourceType, d]));
  return DATA_SOURCE_TYPES.map((type) => {
    const existing = map.get(type);
    const preset = createDataSourcePreset(type);
    if (!existing) {
      return preset;
    }
    const rulePreset = getDataSourceRulePreset(type);
    return syncDataSourceSummaries({
      ...preset,
      ...existing,
      sourceType: type,
      weight: !existing.enabled
        ? 0
        : existing.weight != null && existing.weight !== ''
          ? Number(existing.weight)
          : preset.weight,
      submitRoles: existing.submitRoles?.length ? existing.submitRoles : rulePreset.submitRoles,
      collectMethods: migrateCollectMethods(
        type,
        existing.collectMethods?.length ? existing.collectMethods : rulePreset.collectMethods
      ),
      countInCalibers: existing.countInCalibers?.length
        ? existing.countInCalibers
        : rulePreset.countInCalibers,
      belongDate: rulePreset.belongDate,
      scoringDescription: existing.scoringDescription || rulePreset.scoringDescription
    });
  });
}

export function createDefaultDataSources() {
  return DATA_SOURCE_TYPES.map((type) => createDataSourcePreset(type));
}

export function getEnabledDataSources(match) {
  return (match?.dataSources ?? []).filter((d) => d.enabled && d.countInPoints !== false);
}

export function computeEnabledWeightTotal(sources = []) {
  return getEnabledDataSources({ dataSources: sources }).reduce(
    (sum, d) => sum + (Number(d.weight) || 0),
    0
  );
}

export function formatSourceWeight(source) {
  if (!source?.enabled || source.countInPoints === false) {
    return '-';
  }
  const weight = Number(source.weight);
  return Number.isFinite(weight) ? `${weight}%` : '-';
}

export function formatWeightTotalHint(sources = []) {
  const total = computeEnabledWeightTotal(sources);
  if (total === 100) {
    return '当前启用数据来源权重合计：100%。';
  }
  if (total < 100) {
    return `当前启用数据来源权重合计：${total}%，还需补足 ${100 - total}%。`;
  }
  return `当前启用数据来源权重合计：${total}%，超出 ${total - 100}%。`;
}

export function restoreDefaultSourceWeights(sources = []) {
  return normalizeDataSources(sources).map((d) => ({
    ...d,
    weight: DEFAULT_SOURCE_WEIGHTS[d.sourceType] ?? 0
  }));
}

export function averageEnabledSourceWeights(sources = []) {
  const next = normalizeDataSources(sources);
  const enabled = next.filter((d) => d.enabled && d.countInPoints !== false);
  if (!enabled.length) {
    return next;
  }
  const base = Math.floor(100 / enabled.length);
  let remainder = 100 - base * enabled.length;
  return next.map((d) => {
    if (!d.enabled || d.countInPoints === false) {
      return { ...d, weight: 0 };
    }
    const extra = remainder > 0 ? 1 : 0;
    remainder -= extra;
    return { ...d, weight: base + extra };
  });
}

export function buildScoringPlanSnapshot(form) {
  const sources = normalizeDataSources(form.dataSources ?? []);
  const pointsRules = normalizePointsRules(form.pointsRules ?? {});
  return {
    name: SCORING_PLAN_NAME,
    version: SCORING_PLAN_VERSION,
    savedAt: formatNow(),
    dataSources: sources.map((d) => ({
      sourceType: d.sourceType,
      enabled: d.enabled,
      submitRoles: d.submitRoles,
      collectMethods: d.collectMethods,
      countInCalibers: d.countInCalibers,
      belongDate: d.belongDate,
      weight: d.weight,
      weightRemark: d.weightRemark || '',
      proofRequired: !!d.proofRequired,
      remark: d.remark || ''
    })),
    pointsRules
  };
}

function createDefaultDailyAwards() {
  return {
    awards: normalizeAwardSettings([]),
    awardRemark: ''
  };
}

function baseMatch() {
  return {
    matchId: void 0,
    activityId: void 0,
    stageId: '',
    matchType: '',
    matchName: '',
    deliveryForm: '',
    description: '',
    startTime: '',
    endTime: '',
    regStartTime: '',
    regEndTime: '',
    scope: createDefaultMatchScope(),
    matchRegistration: createDefaultMatchRegistration(),
    matchInsurance: createDefaultInsuranceSetting(),
    itemIds: [],
    itemAwardConfig: {},
    itemRegistrationConfig: {},
    itemInsuranceConfig: {},
    itemMetaConfig: {},
    itemScoreConfig: {},
    classScoreSetting: createDefaultItemScoreSetting(),
    dataSources: createDefaultDataSources(),
    scoringPlan: createDefaultScoringPlan(),
    scoringPlanSnapshot: null,
    dailyScoreRules: createDefaultDailyScoreRules(),
    pointsRules: createDefaultPointsRules(),
    rankingRules: createDefaultRankingRules(),
    dailyInsurance: createDefaultInsuranceSetting(),
    dailyAwards: createDefaultDailyAwards(),
    attachments: [],
    personCount: 0,
    teamCount: 0,
    createBy: '',
    createTime: '',
    updateBy: '',
    updateTime: ''
  };
}

export function createDefaultMatch(partial = {}) {
  return clone({ ...baseMatch(), ...partial });
}

export function isClassMatch(match) {
  return MATCH_TYPE_CLASS_TYPES.includes(match?.matchType);
}

export function isDailyMatch(match) {
  return match?.matchType === MATCH_TYPE_DAILY;
}

export function getStageEffectiveScope(stage, activity) {
  if (!stage) {
    return activity?.coverage ?? createDefaultScope();
  }
  if (stage.scope?.inherit) {
    return migrateLegacyScope(activity?.coverage ?? createDefaultScope());
  }
  return migrateLegacyScope(stage.scope ?? createDefaultScope());
}

function stripScopeMeta(scope = {}) {
  const next = clone(scope);
  delete next.customized;
  delete next.inheritStage;
  delete next.inherit;
  return migrateLegacyScope(next);
}

export function getMatchEffectiveScope(match, activity, stage) {
  const scope = match?.scope ?? createDefaultMatchScope();
  if (isMatchScopeInherit(scope)) {
    return getStageEffectiveScope(stage, activity);
  }
  const stageEffective = stripScopeMeta(getStageEffectiveScope(stage, activity));
  const next = {
    ...stageEffective,
    regionMode: scope.regionMode ?? stageEffective.regionMode ?? SCOPE_MODE_ALL,
    regions: clone(scope.regions ?? stageEffective.regions ?? []),
    schoolMode: scope.schoolMode ?? SCOPE_MODE_SPECIFIED,
    schools: [...(scope.schools ?? [])],
    stageMode: scope.stageMode ?? SCOPE_MODE_ALL,
    stages: [...(scope.stages ?? [])],
    gradeMode: scope.gradeMode ?? SCOPE_MODE_ALL,
    grades: [...(scope.grades ?? [])],
    classMode: SCOPE_MODE_ALL,
    classes: []
  };
  return migrateLegacyScope(next, { isStage: true });
}

function formatMatchScopeStageText(stages = []) {
  if (!stages.length) {
    return '';
  }
  if (stages.length === 1) {
    return `${stages[0]}阶段`;
  }
  return `${stages.join('、')}阶段`;
}

function formatMatchScopeGradeText(grades = []) {
  if (!grades.length) {
    return '';
  }
  if (grades.length <= 3) {
    return grades.join('、');
  }
  return `${grades.length}个年级`;
}

function formatMatchScopeGradeBusinessText(stages = [], grades = []) {
  if (!grades.length) {
    return '';
  }
  if (stages.length === 1 && stages[0] === '小学') {
    return `小学${formatMatchScopeGradeText(grades)}`;
  }
  return formatMatchScopeGradeText(grades);
}

export function formatMatchScopeSummary(match, activity, stage) {
  const scope = match?.scope ?? createDefaultMatchScope();
  const buildSummary = (sourceScope) => {
    const regionSource =
      sourceScope.regionMode === SCOPE_MODE_SPECIFIED && sourceScope.regions?.length
        ? sourceScope.regions
        : [];
    const regionText = regionSource.length
      ? regionSource.map((path) => formatRegionDisplayLabel(path)).join('、')
      : '';
    const schools = sourceScope.schools ?? [];
    let summary = '';
    if (sourceScope.schoolMode === SCOPE_MODE_SPECIFIED && schools.length) {
      if (schools.length === 1) {
        summary =
          SCHOOL_OPTIONS.find((item) => item.value === schools[0])?.label ??
          schools[0];
      } else {
        summary = `${regionText} ${schools.length} 所学校`.replace(/\s+/g, ' ').trim();
      }
    } else {
      summary = regionText ? `${regionText}全部学校` : '所属赛段范围内全部学校';
    }
    return summary;
  };

  if (isMatchScopeInherit(scope)) {
    return buildSummary(getStageEffectiveScope(stage, activity));
  }
  const regionSource =
    scope.regionMode === SCOPE_MODE_SPECIFIED && scope.regions?.length
      ? scope.regions
      : [];
  const regionText = regionSource.length
    ? regionSource.map((path) => formatRegionDisplayLabel(path)).join('、')
    : '';

  const schools = scope.schools ?? [];
  let summary = '';
  if (scope.schoolMode === SCOPE_MODE_SPECIFIED && schools.length) {
    if (schools.length === 1) {
      summary =
        SCHOOL_OPTIONS.find((item) => item.value === schools[0])?.label ??
        schools[0];
    } else {
      summary = `${regionText} ${schools.length} 所学校`.replace(/\s+/g, ' ').trim();
    }
  } else {
    summary = regionText ? `${regionText}全部学校` : '所属赛段范围内全部学校';
  }

  if (
    scope.stageMode === SCOPE_MODE_SPECIFIED &&
    scope.stages?.length &&
    scope.gradeMode !== SCOPE_MODE_SPECIFIED
  ) {
    summary = `${summary}，${formatMatchScopeStageText(scope.stages)}`;
  }

  if (scope.gradeMode === SCOPE_MODE_SPECIFIED && scope.grades?.length) {
    summary = `${summary}，${formatMatchScopeGradeBusinessText(scope.stages ?? [], scope.grades)}`;
  }

  return summary;
}

export function resetMatchScopeToStage(stage, activity) {
  return createDefaultMatchScope();
}

function parseDateTime(value) {
  if (!value) {
    return null;
  }
  const normalized = value.length <= 10 ? `${value}T00:00:00` : value.replace(' ', 'T');
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function computeRegistrationStatus(match) {
  if (isDailyMatch(match)) {
    return '自动参与';
  }
  if (!match?.regStartTime || !match?.regEndTime) {
    return '待配置';
  }
  const now = new Date();
  const start = parseDateTime(match.regStartTime);
  const end = parseDateTime(match.regEndTime);
  if (!start || !end) {
    return '待配置';
  }
  if (now < start) {
    return '未开始';
  }
  if (now > end) {
    return '已截止';
  }
  return '报名中';
}

export function computeMatchStatus(match) {
  if (!match?.startTime || !match?.endTime) {
    return '未开始';
  }
  const now = new Date();
  const start = parseDateTime(match.startTime);
  const end = parseDateTime(match.endTime);
  if (!start || !end) {
    return '未开始';
  }
  if (now < start) {
    return '未开始';
  }
  if (now > end) {
    return '已结束';
  }
  return '进行中';
}

export function getRegistrationStatusTagType(status) {
  if (status === '报名中') {
    return 'success';
  }
  if (status === '已截止') {
    return 'info';
  }
  if (status === '自动参与') {
    return 'primary';
  }
  if (status === '待配置') {
    return 'warning';
  }
  if (status === '未开始') {
    return 'warning';
  }
  return 'info';
}

function parseDateTimeParts(value) {
  if (!value) {
    return null;
  }
  const datePart = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return null;
  }
  const [y, m, d] = datePart.split('-').map(Number);
  const timePart = value.length > 10 ? value.slice(11, 16) : '';
  return { y, m, d, time: timePart, hasTime: value.length > 10 };
}

function formatDateDot(y, m, d) {
  return `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}`;
}

/** 短格式日期时间，如 2026.06.29 18:36 */
export function formatShortDateTime(value) {
  const parts = parseDateTimeParts(value);
  if (!parts) {
    return value || '-';
  }
  const dateText = formatDateDot(parts.y, parts.m, parts.d);
  if (parts.hasTime && parts.time) {
    return `${dateText} ${parts.time}`;
  }
  return dateText;
}

/** 列表用：同一年 2026.06.29 - 07.31；跨年 2026.09.01 - 2027.08.31；同日 2026.06.29 09:00-18:00 */
export function formatDateRangeShort(start, end) {
  const startParts = parseDateTimeParts(start);
  const endParts = parseDateTimeParts(end);
  if (!startParts || !endParts) {
    return '-';
  }
  const startDate = formatDateDot(startParts.y, startParts.m, startParts.d);
  const endDate = formatDateDot(endParts.y, endParts.m, endParts.d);

  if (
    startParts.y === endParts.y &&
    startParts.m === endParts.m &&
    startParts.d === endParts.d
  ) {
    if (startParts.hasTime || endParts.hasTime) {
      const st = startParts.time || '00:00';
      const et = endParts.time || '00:00';
      return `${startDate} ${st}-${et}`;
    }
    return startDate;
  }

  if (startParts.y === endParts.y) {
    const endShort = `${String(endParts.m).padStart(2, '0')}.${String(endParts.d).padStart(2, '0')}`;
    return `${startDate} - ${endShort}`;
  }

  return `${startDate} - ${endDate}`;
}

export function formatMatchTimeShort(match) {
  return formatDateRangeShort(match?.startTime, match?.endTime);
}

export function formatMatchTimeTooltip(match) {
  return `比赛开始时间：${match?.startTime || '-'}\n比赛结束时间：${match?.endTime || '-'}`;
}

export function formatDateTimeRange(start, end) {
  if (!start || !end) {
    return '-';
  }
  return `${start} 至 ${end}`;
}

export function formatMatchTime(match) {
  return formatDateTimeRange(match?.startTime, match?.endTime);
}

export function formatRegistrationListDisplay(match) {
  if (isDailyMatch(match)) {
    return {
      timeText: '无需报名',
      status: '自动参与'
    };
  }
  if (!match?.regStartTime || !match?.regEndTime) {
    return {
      timeText: '未配置报名时间',
      status: '待配置'
    };
  }
  return {
    timeText: formatDateRangeShort(match.regStartTime, match.regEndTime),
    status: computeRegistrationStatus(match)
  };
}

export function formatRegistrationTime(match) {
  if (isDailyMatch(match)) {
    return '无需报名';
  }
  if (!match?.regStartTime || !match?.regEndTime) {
    return '未配置报名时间';
  }
  return formatDateRangeShort(match.regStartTime, match.regEndTime);
}

export function formatActivityStageLabel(match, activity) {
  const activityName = activity?.activityName || '-';
  const stageName = match?.stageName || '-';
  return `${activityName} / ${stageName}`;
}

export function getMatchItemStats(match) {
  if (isDailyMatch(match)) {
    return { total: 0, personal: 0, team: 0 };
  }
  const items = (match?.itemIds ?? []).map((id) => findEventItem(id)).filter(Boolean);
  const personal = items.filter((d) => d.matchForm === '个人').length;
  const team = items.filter((d) => d.matchForm === '团体').length;
  return { total: items.length, personal, team };
}

export function getEnabledDataSourceCount(match) {
  return (match?.dataSources ?? []).filter((d) => d.enabled).length;
}

export function formatMatchContentPrimary(match) {
  if (isDailyMatch(match)) {
    return '每日积分赛';
  }
  const stats = getMatchItemStats(match);
  return `共 ${stats.total} 项`;
}

export function formatMatchContentSecondary(match) {
  if (isDailyMatch(match)) {
    const enabled = getEnabledDataSourceCount(match);
    const total = DATA_SOURCE_TYPES.length;
    if (enabled < total) {
      return `已启用 ${enabled} 类数据来源`;
    }
    return `${total} 类数据来源`;
  }
  const stats = getMatchItemStats(match);
  if (!stats.total) {
    return '暂无设项';
  }
  const parts = [];
  if (stats.personal) {
    parts.push(`个人 ${stats.personal}`);
  }
  if (stats.team) {
    parts.push(`团体 ${stats.team}`);
  }
  return parts.join('｜');
}

export function formatMatchContentTooltip(match) {
  if (isDailyMatch(match)) {
    const sources = (match?.dataSources ?? [])
      .filter((d) => d.enabled)
      .map((d) => d.sourceType);
    return sources.length ? sources.join('、') : '暂未配置数据来源';
  }
  const lines = (match?.itemIds ?? [])
    .map((id) => {
      const item = findEventItem(id);
      return `${item?.itemName ?? id}｜${item?.matchForm ?? '-'}`;
    })
    .filter(Boolean);
  return lines.length ? lines.join('\n') : '暂无设项';
}

/** @deprecated 使用 formatMatchContentPrimary */
export function formatItemOverview(match) {
  const primary = formatMatchContentPrimary(match);
  const secondary = formatMatchContentSecondary(match);
  if (isDailyMatch(match)) {
    return `${primary}\n${secondary}`;
  }
  if (!secondary || secondary === '暂无设项') {
    return primary;
  }
  return `${primary}  ${secondary.replace('｜', '  ')}`;
}

/** @deprecated 使用 formatMatchContentTooltip */
export function formatItemOverviewTooltip(match) {
  return formatMatchContentTooltip(match);
}

export function formatRegistrationOverview(match) {
  if (isDailyMatch(match)) {
    const count = match?.personCount ?? match?.registrationCount ?? 0;
    if (count > 0) {
      return `覆盖 ${count} 人`;
    }
    return '自动参与';
  }
  const person = match?.personCount ?? 0;
  const team = match?.teamCount ?? 0;
  const stats = getMatchItemStats(match);
  if (stats.personal && stats.team) {
    return `${person} 人 / ${team} 队`;
  }
  if (stats.team && !stats.personal) {
    return `${team} 队`;
  }
  return `${person} 人`;
}

export function formatMatchItemRegistrationSummary(match, itemId) {
  const config = match?.itemRegistrationConfig?.[String(itemId)];
  if (!config) {
    return '-';
  }
  const methods = formatRegistrationMethods(config.methods);
  const limit = config.limitEnabled ? `数量上限 ${config.limitCount}` : '不限制数量';
  return `${methods}；${limit}`;
}

export function formatMatchItemInsuranceSummary(match, itemId) {
  const config = match?.itemInsuranceConfig?.[String(itemId)];
  if (!config) {
    return '-';
  }
  if (!config.required) {
    return '不需要保险';
  }
  const attachmentText = config.attachments?.length
    ? `；已上传 ${config.attachments.length} 个附件`
    : '';
  return `需要保险；${config.method || '统一购买'}${attachmentText}`;
}

export function formatMatchItemAwardCountText(match, itemId) {
  const config = match?.itemAwardConfig?.[String(itemId)];
  const count = getAwardCount(config?.awards);
  return count ? `${count} 个` : '暂无奖项';
}

export function getMatchScopeDisplayInfo(match, activity, stage) {
  const effective = getMatchEffectiveScope(match, activity, stage);
  const customized = !isMatchScopeInherit(match?.scope ?? {});
  return {
    source: customized ? '指定范围' : '使用所属赛段参赛范围',
    summary: formatMatchScopeSummary(match, activity, stage),
    detailRows: getScopeEffectiveDetailRows(effective, { isStage: true, labelPrefix: '参赛' })
  };
}

export function formatListDateTime(value) {
  if (!value) {
    return '-';
  }
  return formatShortDateTime(value);
}

function migrateDeliveryForm(match) {
  if (match.deliveryForm) {
    return match.deliveryForm;
  }
  const legacy = match.matchMode;
  if (!legacy) {
    return '';
  }
  if (legacy.includes('线上')) {
    return legacy.includes('线下') ? '线上线下相结合' : '线上';
  }
  return '线下';
}

function buildItemMetaConfig(itemIds = [], existing = {}) {
  const config = clone(existing ?? {});
  itemIds.forEach((id) => {
    const key = String(id);
    if (!config[key]) {
      config[key] = cloneItemMetaFromItem(findEventItem(id));
    }
  });
  Object.keys(config).forEach((key) => {
    if (!itemIds.includes(Number(key))) {
      delete config[key];
    }
  });
  return config;
}

function normalizeItemScoreSetting(setting = {}) {
  return {
    ...createDefaultItemScoreSetting(),
    ...setting,
    collectMethods: normalizeClassCollectMethods(setting.collectMethods)
  };
}

function buildItemScoreConfig(itemIds = [], existing = {}, fallback = null) {
  const config = clone(existing ?? {});
  itemIds.forEach((id) => {
    const key = String(id);
    if (!config[key]) {
      config[key] = cloneItemScoreFromItem(findEventItem(id), fallback ?? undefined);
    } else {
      config[key] = normalizeItemScoreSetting(config[key]);
    }
  });
  Object.keys(config).forEach((key) => {
    if (!itemIds.includes(Number(key))) {
      delete config[key];
    }
  });
  return config;
}

function buildItemRegistrationConfig(itemIds = [], existing = {}) {
  const config = clone(existing ?? {});
  itemIds.forEach((id) => {
    const key = String(id);
    if (!config[key]) {
      config[key] = createDefaultItemRegistration();
    } else {
      config[key] = normalizeItemRegistration(config[key]);
    }
  });
  Object.keys(config).forEach((key) => {
    if (!itemIds.includes(Number(key))) {
      delete config[key];
    }
  });
  return config;
}

function buildItemInsuranceConfig(itemIds = [], existing = {}) {
  const config = clone(existing ?? {});
  itemIds.forEach((id) => {
    const key = String(id);
    if (!config[key]) {
      config[key] = createDefaultInsuranceSetting();
    }
  });
  Object.keys(config).forEach((key) => {
    if (!itemIds.includes(Number(key))) {
      delete config[key];
    }
  });
  return config;
}

function buildItemAwardConfig(itemIds = [], existing = {}) {
  const config = clone(existing ?? {});
  itemIds.forEach((id) => {
    const key = String(id);
    if (!config[key]) {
      config[key] = cloneAwardConfigForMatch(id);
    }
  });
  Object.keys(config).forEach((key) => {
    if (!itemIds.includes(Number(key))) {
      delete config[key];
    }
  });
  return config;
}

function migrateItemScoreConfig(match) {
  const config = {};
  const base = normalizeItemScoreSetting(match.classScoreSetting ?? createDefaultItemScoreSetting());
  (match.itemIds ?? []).forEach((id) => {
    config[String(id)] = clone(base);
  });
  return config;
}

function resolveMatchStage(match, activity) {
  let stageName = match.stageName;
  if (STAGE_NAME_LEGACY_MAP[stageName]) {
    stageName = STAGE_NAME_LEGACY_MAP[stageName];
  }
  let stage = activity?.stages?.find(
    (d) => d.stageId === match.stageId || d.stageName === stageName
  );
  if (!stage && (match.stageId === 'stage_2' || match.stageName === '区域晋级赛')) {
    stage = activity?.stages?.find((d) => d.stageId === 'stage_1' || d.stageName === STAGE_CAMPUS_NAME);
  }
  return stage;
}

function migrateLegacyMatchScope(legacyScope = {}) {
  if (legacyScope.customized === false || isMatchScopeInherit(legacyScope)) {
    return createDefaultMatchScope();
  }
  return {
    regionMode: legacyScope.regionMode ?? SCOPE_MODE_ALL,
    regions: clone(legacyScope.regions ?? []),
    schoolMode: legacyScope.schoolMode ?? SCOPE_MODE_SPECIFIED,
    schools: [...(legacyScope.schools ?? [])],
    stageMode: legacyScope.stageMode ?? SCOPE_MODE_ALL,
    stages: [...(legacyScope.stages ?? [])],
    gradeMode: legacyScope.gradeMode ?? SCOPE_MODE_ALL,
    grades: [...(legacyScope.grades ?? [])],
    ...(legacyScope.customized ? { customized: true } : {})
  };
}

function migrateLegacyMatch(match, activity) {
  const stage = resolveMatchStage(match, activity);
  const stageName = stage?.stageName ?? match.stageName ?? '';
  const itemIds = [...(match.itemIds ?? [])];
  const regCount = match.registrationCount ?? 0;
  const itemStats = itemIds.map((id) => findEventItem(id)).filter(Boolean);
  const hasTeamOnly =
    itemStats.some((d) => d.matchForm === '团体') &&
    !itemStats.some((d) => d.matchForm === '个人');
  const matchType = normalizeMatchType(match.matchType, stageName);

  const firstItemKey = itemIds.length ? String(itemIds[0]) : null;
  let matchRegistration = match.matchRegistration;
  if (!matchRegistration && firstItemKey && match.itemRegistrationConfig?.[firstItemKey]) {
    matchRegistration = match.itemRegistrationConfig[firstItemKey];
  }
  let matchInsurance = match.matchInsurance;
  if (!matchInsurance && firstItemKey && match.itemInsuranceConfig?.[firstItemKey]) {
    matchInsurance = clone(match.itemInsuranceConfig[firstItemKey]);
  }

  const normalized = createDefaultMatch({
    ...match,
    matchId: match.matchId,
    activityId: activity?.activityId,
    stageId: stage?.stageId ?? match.stageId ?? '',
    stageName: stage?.stageName ?? stageName,
    matchType,
    deliveryForm: migrateDeliveryForm(match),
    startTime: match.startTime?.length <= 10 ? `${match.startTime} 09:00` : match.startTime,
    endTime: match.endTime?.length <= 10 ? `${match.endTime} 18:00` : match.endTime,
    scope: migrateLegacyMatchScope(match.scope ?? createDefaultMatchScope()),
    matchRegistration: normalizeMatchRegistration(matchRegistration ?? {}),
    matchInsurance: matchInsurance ?? createDefaultInsuranceSetting(),
    itemIds: matchType === MATCH_TYPE_DAILY ? [] : itemIds,
    itemAwardConfig: buildItemAwardConfig(
      matchType === MATCH_TYPE_DAILY ? [] : itemIds,
      match.itemAwardConfig ?? migrateItemAwards(match)
    ),
    itemRegistrationConfig: {},
    itemInsuranceConfig: {},
    itemMetaConfig: buildItemMetaConfig(
      matchType === MATCH_TYPE_DAILY ? [] : itemIds,
      match.itemMetaConfig
    ),
    itemScoreConfig: buildItemScoreConfig(
      matchType === MATCH_TYPE_DAILY ? [] : itemIds,
      match.itemScoreConfig ?? migrateItemScoreConfig(match)
    ),
    classScoreSetting: match.classScoreSetting ?? migrateClassScoreSetting(match),
    dataSources: normalizeDataSources(
      match.dataSources?.length ? clone(match.dataSources) : createDefaultDataSources()
    ),
    scoringPlan: match.scoringPlan ?? createDefaultScoringPlan(),
    scoringPlanSnapshot: match.scoringPlanSnapshot ?? null,
    dailyScoreRules: match.dailyScoreRules ?? createDefaultDailyScoreRules(),
    pointsRules: normalizePointsRules(match.pointsRules),
    rankingRules: normalizeRankingRules(match.rankingRules),
    dailyInsurance: match.dailyInsurance ?? migrateDailyInsurance(match),
    dailyAwards: match.dailyAwards ?? createDefaultDailyAwards(),
    attachments: clone(match.attachments ?? []),
    personCount: hasTeamOnly ? 0 : regCount,
    teamCount: hasTeamOnly ? regCount : match.teamCount ?? 0,
    regStartTime: match.regStartTime,
    regEndTime: match.regEndTime,
    createBy: match.createBy || MOCK_OPERATOR,
    createTime: match.createTime || '2026-03-01 10:00:00',
    updateBy: match.updateBy || MOCK_OPERATOR,
    updateTime: match.updateTime || '2026-03-01 10:00:00'
  });
  return normalized;
}

function migrateItemAwards(match) {
  const config = {};
  (match.itemIds ?? []).forEach((id) => {
    const key = String(id);
    config[key] = cloneAwardConfigForMatch(id, {
      awards: match.itemAwards?.[key] ?? match.itemAwards?.[id],
      awardRemark: match.itemAwardRemarks?.[key] ?? match.itemAwardRemarks?.[id] ?? ''
    });
  });
  return config;
}

function migrateClassScoreSetting(match) {
  const legacy = match.scoreSetting ?? {};
  const methods = normalizeClassCollectMethods(legacy.submitMethods ?? legacy.collectMethods);
  return {
    ...createDefaultClassScoreSetting(),
    submitters: legacy.submitters?.length ? legacy.submitters : ['教师'],
    collectMethods: methods,
    submitStartTime: legacy.submitStartTime ?? '',
    submitEndTime: legacy.submitEndTime ?? '',
    remark: legacy.remark ?? ''
  };
}

function migrateDailyInsurance(match) {
  if (match.insurance) {
    return {
      required: !!match.insurance.required,
      method: match.insurance.method ?? '统一购买',
      description: match.insurance.description ?? '',
      attachments: clone(match.insurance.attachments ?? [])
    };
  }
  return createDefaultInsuranceSetting();
}

export function getAllMatches() {
  const list = [];
  activityStore.list.forEach((activity) => {
    (activity.matches ?? []).forEach((match) => {
      const normalized = migrateLegacyMatch(match, activity);
      const stage = activity.stages?.find((d) => d.stageId === normalized.stageId);
      list.push({
        ...normalized,
        activityName: activity.activityName,
        stageName: stage?.stageName ?? normalized.stageName ?? '',
        registrationStatus: computeRegistrationStatus(normalized),
        matchStatus: computeMatchStatus(normalized)
      });
    });
  });
  return list;
}

export function findMatch(matchId) {
  return getAllMatches().find((d) => d.matchId === matchId) ?? null;
}

export function findMatchRaw(matchId) {
  for (const activity of activityStore.list) {
    const index = (activity.matches ?? []).findIndex((d) => d.matchId === matchId);
    if (index !== -1) {
      return { activity, index, match: activity.matches[index] };
    }
  }
  return null;
}

export function getActivityOptions() {
  return activityStore.list.map((item) => ({
    activityId: item.activityId,
    activityName: item.activityName,
    status: getActivityStatus(item),
    itemIds: item.itemIds ?? [],
    stages: (item.stages ?? []).filter((d) => d.enabled !== false)
  }));
}

export function getStageOptions(activityId) {
  const activity = findActivity(activityId);
  if (!activity) {
    return [];
  }
  return (activity.stages ?? [])
    .filter((d) => d.enabled !== false)
    .map((stage) => ({
      stageId: stage.stageId,
      stageName: stage.stageName,
      startTime: stage.startTime,
      endTime: stage.endTime,
      scope: stage.scope,
      matchCount: stage.matchCount ?? 0
    }));
}

export function getSelectableMatchItems(activityId) {
  const activity = findActivity(activityId);
  if (!activity) {
    return [];
  }
  return getActivityLinkedItems(activity.itemIds ?? []).filter((d) => d.status === 1);
}

export function mapMatchItemRow(match, itemId) {
  const item = findEventItem(itemId);
  const mapped = mapEventItemForActivity(item);
  if (!mapped) {
    return null;
  }
  const meta = match?.itemMetaConfig?.[String(itemId)] ?? cloneItemMetaFromItem(item);
  const awardConfig = match?.itemAwardConfig?.[String(itemId)] ?? cloneAwardConfigForMatch(item);
  const insuranceConfig =
    match?.itemInsuranceConfig?.[String(itemId)] ?? createDefaultInsuranceSetting();
  const scoreConfig =
    match?.itemScoreConfig?.[String(itemId)] ??
    match?.classScoreSetting ??
    createDefaultItemScoreSetting();
  const awardCount = getAwardCount(awardConfig.awards);
  return {
    ...mapped,
    matchForm: item?.matchForm ?? '个人',
    scoringRule: meta.scoringRule || mapped.scoringRule,
    qualification: meta.qualification || mapped.qualification,
    awardCount: awardCount || mapped.awardCount,
    awardSummary: awardCount
      ? formatAwardSummaryForDisplay({ awardSettings: awardConfig.awards })
      : '暂无奖项',
    awardConfig,
    insuranceConfig,
    scoreConfig,
    metaConfig: meta,
    insuranceSummary: formatInsuranceSettingSummary(insuranceConfig)
  };
}

export function getMatchLinkedItems(match) {
  return (match?.itemIds ?? []).map((id) => mapMatchItemRow(match, id)).filter(Boolean);
}

export function getItemRegistrationRows(match) {
  return (match?.itemIds ?? [])
    .map((id) => {
      const row = mapMatchItemRow(match, id);
      if (!row) {
        return null;
      }
      const config =
        match.itemRegistrationConfig?.[String(id)] ?? createDefaultItemRegistration();
      return { itemId: id, itemName: row.itemName, ...config };
    })
    .filter(Boolean);
}

export function getItemScoreRows(match) {
  return (match?.itemIds ?? [])
    .map((id) => {
      const row = mapMatchItemRow(match, id);
      if (!row) {
        return null;
      }
      const config =
        match.itemScoreConfig?.[String(id)] ??
        match.classScoreSetting ??
        createDefaultItemScoreSetting();
      return { itemId: id, itemName: row.itemName, ...config };
    })
    .filter(Boolean);
}

export function getItemInsuranceRows(match) {
  return (match?.itemIds ?? [])
    .map((id) => {
      const row = mapMatchItemRow(match, id);
      if (!row) {
        return null;
      }
      const config = match.itemInsuranceConfig?.[String(id)] ?? createDefaultInsuranceSetting();
      return { itemId: id, itemName: row.itemName, ...config };
    })
    .filter(Boolean);
}

function syncActivityMatchStats(activity) {
  activity.matchCount = activity.matches?.length ?? 0;
  const stageCountMap = {};
  (activity.matches ?? []).forEach((m) => {
    const key = m.stageId || m.stageName;
    stageCountMap[key] = (stageCountMap[key] ?? 0) + 1;
  });
  (activity.stages ?? []).forEach((stage) => {
    const key = stage.stageId || stage.stageName;
    stage.matchCount = stageCountMap[key] ?? 0;
  });
}

function normalizeMatchScope(scope, stage, activity) {
  const next = clone(scope ?? createDefaultMatchScope());
  if (isMatchScopeInherit(next)) {
    return createDefaultMatchScope();
  }
  const stageEffective = getStageEffectiveScope(stage, activity);
  const payload = {
    schoolMode: next.schoolMode ?? SCOPE_MODE_SPECIFIED,
    schools: [...(next.schools ?? [])],
    stageMode: next.stageMode ?? SCOPE_MODE_ALL,
    stages: [...(next.stages ?? [])],
    gradeMode: next.gradeMode ?? SCOPE_MODE_ALL,
    grades: [...(next.grades ?? [])],
    customized: true,
    ...stripScopeMeta({
      ...stageEffective,
      ...next,
      classMode: SCOPE_MODE_ALL,
      classes: []
    })
  };
  return migrateLegacyScope(payload, { isStage: true });
}

function stripMatchForStorage(match) {
  const payload = clone(match);
  delete payload.activityName;
  delete payload.stageName;
  delete payload.registrationStatus;
  delete payload.matchStatus;
  delete payload.registrationCount;
  delete payload.matchMode;
  delete payload.matchLocation;
  delete payload.registration;
  delete payload.insurance;
  delete payload.scoreSetting;
  return payload;
}

export function saveMatch(form, matchId) {
  const activity = findActivity(form.activityId);
  if (!activity) {
    return null;
  }
  const stage = activity.stages?.find((d) => d.stageId === form.stageId);
  const payload = stripMatchForStorage({
    ...form,
    stageName: stage?.stageName ?? form.stageName ?? '',
    scope: normalizeMatchScope(form.scope, stage, activity),
    matchRegistration: isClassMatch(form)
      ? normalizeMatchRegistration(form.matchRegistration ?? {})
      : form.matchRegistration,
    matchInsurance: isClassMatch(form)
      ? form.matchInsurance ?? createDefaultInsuranceSetting()
      : form.matchInsurance,
    dataSources: isDailyMatch(form) ? normalizeDataSources(form.dataSources) : form.dataSources,
    pointsRules: isDailyMatch(form) ? normalizePointsRules(form.pointsRules) : form.pointsRules,
    rankingRules: isDailyMatch(form) ? normalizeRankingRules(form.rankingRules) : form.rankingRules,
    scoringPlanSnapshot: isDailyMatch(form) ? buildScoringPlanSnapshot(form) : form.scoringPlanSnapshot,
    itemAwardConfig: buildItemAwardConfig(form.itemIds ?? [], form.itemAwardConfig ?? {}),
    itemRegistrationConfig: {},
    itemInsuranceConfig: {},
    itemMetaConfig: buildItemMetaConfig(form.itemIds ?? [], form.itemMetaConfig ?? {}),
    itemScoreConfig: buildItemScoreConfig(
      form.itemIds ?? [],
      form.itemScoreConfig ?? {},
      form.classScoreSetting
    )
  });
  const now = formatNow();

  if (matchId) {
    const found = findMatchRaw(matchId);
    if (!found || found.activity.activityId !== Number(form.activityId)) {
      return null;
    }
    payload.matchId = matchId;
    payload.createBy = found.match.createBy || MOCK_OPERATOR;
    payload.createTime = found.match.createTime || now;
    payload.updateBy = MOCK_OPERATOR;
    payload.updateTime = now;
    found.activity.matches.splice(found.index, 1, payload);
    syncActivityMatchStats(found.activity);
    return findMatch(matchId);
  }

  payload.matchId = form.matchId || createMatchId();
  payload.createBy = MOCK_OPERATOR;
  payload.createTime = now;
  payload.updateBy = MOCK_OPERATOR;
  payload.updateTime = now;
  if (!activity.matches) {
    activity.matches = [];
  }
  activity.matches.unshift(payload);
  syncActivityMatchStats(activity);
  return findMatch(payload.matchId);
}

export function scopesEqual(a = {}, b = {}) {
  const normalize = (scope) => {
    const next = { ...createDefaultMatchScope(), ...scope };
    delete next.customized;
    delete next.inherit;
    delete next.inheritStage;
    delete next.classMode;
    delete next.classes;
    delete next.remark;
    return next;
  };
  return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
}

export function validateMatchScopeWithinStage(matchScope = {}, stageScope = {}, activityCoverage = {}) {
  const stageEffective = stageScope?.inherit ? activityCoverage : stageScope;
  if (isMatchScopeInherit(matchScope)) {
    return [];
  }
  const narrowed = {
    ...stripScopeMeta(matchScope),
    classMode: SCOPE_MODE_ALL,
    classes: []
  };
  return [
    ...validateScopeConfig(narrowed, { isStage: true, labelPrefix: '参赛' }),
    ...validateScopeWithinParent(narrowed, stageEffective, { labelPrefix: '参赛' })
  ];
}

export function validateMatchTypeForStage(form, stage) {
  const errors = [];
  if (!form.matchType || !stage?.stageName) {
    return errors;
  }
  const allowed = getMatchTypeOptionsForStage(stage.stageName);
  if (!allowed.includes(form.matchType)) {
    errors.push('当前比赛类型不适用于所选赛段，请重新选择比赛类型。');
  }
  return errors;
}

function validateClassMatch(form) {
  const errors = [];
  if (!form.itemIds?.length) {
    errors.push('请至少选择一个比赛设项');
  }
  const selectable = new Set(getSelectableMatchItems(form.activityId).map((d) => d.itemId));
  const invalidItems = (form.itemIds ?? []).filter((id) => !selectable.has(id));
  if (invalidItems.length) {
    errors.push('比赛设项必须从当前活动设项范围中选择');
  }
  const selectedKeys = new Set((form.itemIds ?? []).map((id) => String(id)));
  [
    ['成绩设置', form.itemScoreConfig],
    ['奖项设置', form.itemAwardConfig],
    ['参赛要求', form.itemMetaConfig]
  ].forEach(([label, config]) => {
    Object.keys(config ?? {}).forEach((key) => {
      if (!selectedKeys.has(key)) {
        errors.push(`已移除设项不能保留${label}配置`);
      }
    });
  });

  const insurance = form.matchInsurance ?? createDefaultInsuranceSetting();
  const insuranceType = insurance.insuranceType || getInsuranceTypeByMatchType(form.matchType);
  if (!insurance.planId) {
    errors.push('请选择保险方案');
  }
  if (insurance.planId && !getInsurancePlanOptions(insuranceType).some((plan) => plan.planId === insurance.planId)) {
    errors.push('保险方案与保险类型不匹配');
  }
  if (insuranceType === '学期保险') {
    const plan = insurance.planId ? findInsurancePlan(insurance.planId) : null;
    if (!findSemesterPlanByDate(form.startTime)) {
      errors.push('当前比赛时间未匹配到有效学期保险方案，请先维护按学期收费的保险方案。');
    } else if (plan && !isPlanCoveringDate(plan, form.startTime)) {
      errors.push('所选保险方案的保障周期未覆盖当前比赛时间。');
    }
  }

  (form.itemIds ?? []).forEach((id) => {
    const itemName = findEventItem(id)?.itemName || id;
    const score =
      form.itemScoreConfig?.[String(id)] ?? form.classScoreSetting ?? createDefaultItemScoreSetting();
    if (!score.collectMethods?.length) {
      errors.push(`设项「${itemName}」请至少选择一种成绩采集方式`);
    }
    if (!score.submitters?.length) {
      errors.push(`设项「${itemName}」请至少选择一种成绩提交人`);
    }
    if (score.submitStartTime && score.submitEndTime && score.submitStartTime > score.submitEndTime) {
      errors.push(`设项「${itemName}」成绩提交开始时间不能晚于提交截止时间`);
    }
    const awardConfig = form.itemAwardConfig?.[String(id)] ?? { awards: [] };
    (awardConfig.awards ?? []).forEach((award, index) => {
      const prefix = `设项「${itemName}」第 ${index + 1} 条奖项`;
      if (!award.awardName?.trim()) {
        errors.push(`${prefix}请填写奖项名称`);
      }
      if (!award.awardRule?.trim()) {
        errors.push(`${prefix}请填写奖项规则`);
      }
      if (!award.awardTarget) {
        errors.push(`${prefix}请选择获奖对象`);
      }
    });
    if (!form.itemScoreConfig?.[String(id)]) {
      errors.push(`设项「${itemName}」缺少成绩设置快照`);
    }
    if (!form.itemAwardConfig?.[String(id)]) {
      errors.push(`设项「${itemName}」缺少奖项设置快照`);
    }
    if (!form.itemMetaConfig?.[String(id)]) {
      errors.push(`设项「${itemName}」缺少参赛要求快照`);
    }
  });
  if (!form.itemIds?.length) {
    if (!form.classScoreSetting?.collectMethods?.length) {
      errors.push('请至少选择一种成绩采集方式');
    }
    if (!form.classScoreSetting?.submitters?.length) {
      errors.push('请至少选择一种成绩提交人');
    }
  }
  return errors;
}

function validateDailyMatch(form) {
  const errors = [];
  const sources = normalizeDataSources(form.dataSources ?? []);
  const pointsRules = normalizePointsRules(form.pointsRules ?? {});
  const enabledSources = sources.filter((d) => d.enabled);
  if (!enabledSources.length) {
    errors.push('请至少启用一个数据来源');
  }
  enabledSources.forEach((source) => {
    if (!source.submitRoles?.length) {
      errors.push(`数据来源「${source.sourceType}」请至少选择一种提交/采集角色`);
    }
    if (!source.collectMethods?.length) {
      errors.push(`数据来源「${source.sourceType}」请至少选择一种采集方式`);
    }
    if (!source.countInCalibers?.length) {
      errors.push(`数据来源「${source.sourceType}」请配置计入口径`);
    }
    if (!source.belongDate) {
      errors.push(`数据来源「${source.sourceType}」请选择归属日期`);
    }
  });
  const scoringSources = enabledSources.filter((d) => d.countInPoints !== false);
  scoringSources.forEach((source) => {
    const weight = Number(source.weight);
    if (!Number.isFinite(weight) || weight <= 0 || weight > 100) {
      errors.push(`数据来源「${source.sourceType}」权重须为 0–100 之间的正数`);
    }
  });
  const weightTotal = computeEnabledWeightTotal(sources);
  if (scoringSources.length && weightTotal !== 100) {
    errors.push(formatWeightTotalHint(sources).replace('。', ''));
  }
  if (!pointsRules.dailyGenerateTime?.trim()) {
    errors.push('请填写日积分生成时间');
  }
  if (!pointsRules.dataCutoffTime?.trim()) {
    errors.push('请填写数据截止时间');
  }
  const insurance = form.dailyInsurance ?? createDefaultInsuranceSetting();
  const insuranceType = insurance.insuranceType || getInsuranceTypeByMatchType(form.matchType);
  if (!insurance.planId) {
    errors.push('请选择保险方案');
  }
  if (insurance.planId && !getInsurancePlanOptions(insuranceType).some((plan) => plan.planId === insurance.planId)) {
    errors.push('保险方案与保险类型不匹配');
  }
  if (insuranceType === '学期保险') {
    const plan = insurance.planId ? findInsurancePlan(insurance.planId) : null;
    if (!findSemesterPlanByDate(form.startTime)) {
      errors.push('当前比赛时间未匹配到有效学期保险方案，请先维护按学期收费的保险方案。');
    } else if (plan && !isPlanCoveringDate(plan, form.startTime)) {
      errors.push('所选保险方案的保障周期未覆盖当前比赛时间。');
    }
  }
  return errors;
}

export function validateMatchForm(form, options = {}) {
  const errors = [];
  const step = options.step;
  const activity = findActivity(form.activityId);
  const stage = activity?.stages?.find((d) => d.stageId === form.stageId);

  if (!form.activityId) {
    errors.push('请选择所属活动');
  }
  if (!form.stageId) {
    errors.push('请选择所属赛段');
  }
  if (!form.matchType) {
    errors.push('请选择比赛类型');
  }
  if (!form.matchName?.trim()) {
    errors.push('请填写比赛名称');
  }
  if (!form.startTime) {
    errors.push('请选择比赛开始时间');
  }
  if (!form.endTime) {
    errors.push('请选择比赛结束时间');
  }
  if (form.startTime && form.endTime && form.endTime <= form.startTime) {
    errors.push('比赛结束时间必须晚于比赛开始时间');
  }
  if (isClassMatch(form)) {
    if (!form.regStartTime) {
      errors.push('请选择报名开始时间');
    }
    if (!form.regEndTime) {
      errors.push('请选择报名截止时间');
    }
    if (form.regStartTime && form.regEndTime && form.regEndTime <= form.regStartTime) {
      errors.push('报名截止时间必须晚于报名开始时间');
    }
    if (form.regEndTime && form.endTime && form.regEndTime > form.endTime) {
      errors.push('报名截止时间不能晚于比赛结束时间');
    }
  }
  if (stage?.startTime && form.startTime) {
    const stageStart = stage.startTime.length <= 10 ? `${stage.startTime} 00:00` : stage.startTime;
    if (form.startTime < stageStart) {
      errors.push('比赛开始时间不能早于所属赛段比赛开始时间');
    }
  }
  if (stage?.endTime && form.endTime) {
    const stageEnd = stage.endTime.length <= 10 ? `${stage.endTime} 23:59` : stage.endTime;
    if (form.endTime > stageEnd) {
      errors.push('比赛结束时间不能晚于所属赛段比赛结束时间');
    }
  }
  errors.push(...validateMatchScopeWithinStage(form.scope, stage?.scope, activity?.coverage));
  errors.push(...validateMatchTypeForStage(form, stage));

  if (step === 1) {
    return errors;
  }

  if (isClassMatch(form)) {
    errors.push(...validateClassMatch(form));
  } else if (isDailyMatch(form)) {
    errors.push(...validateDailyMatch(form));
  }

  return errors;
}

/** 根据校验错误文案判断所属步骤 */
export function resolveMatchErrorStep(message = '') {
  const step1Keywords = [
    '所属活动',
    '所属赛段',
    '比赛类型',
    '比赛名称',
    '比赛开始',
    '比赛结束',
    '报名开始',
    '报名截止',
    '参赛范围',
    '参赛地区',
    '参赛学校',
    '参赛学段',
    '参赛年级',
    '参赛班级'
  ];
  if (step1Keywords.some((key) => message.includes(key))) {
    return 1;
  }
  return 2;
}

export function copyMatchData(source) {
  const data = clone(source);
  delete data.matchId;
  delete data.createBy;
  delete data.createTime;
  delete data.updateBy;
  delete data.updateTime;
  delete data.personCount;
  delete data.teamCount;
  delete data.activityName;
  delete data.stageName;
  delete data.registrationStatus;
  delete data.matchStatus;
  data.matchName = `${data.matchName}-副本`;
  data.startTime = '';
  data.endTime = '';
  data.regStartTime = '';
  data.regEndTime = '';
  return data;
}

export function getMatchScopeDetailRows(match, activity, stage) {
  const effective = getMatchEffectiveScope(match, activity, stage);
  return getScopeEffectiveDetailRows(effective, { isStage: true, labelPrefix: '参赛' });
}

export function isMatchScopeNational(match, activity, stage) {
  return isScopeAllNational(getMatchEffectiveScope(match, activity, stage));
}

export function buildMatchConfigsForItems(form, itemIds = []) {
  return {
    itemAwardConfig: buildItemAwardConfig(itemIds, form.itemAwardConfig),
    itemMetaConfig: buildItemMetaConfig(itemIds, form.itemMetaConfig),
    itemScoreConfig: buildItemScoreConfig(itemIds, form.itemScoreConfig, form.classScoreSetting)
  };
}
