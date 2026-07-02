/**
 * 比赛类型统一数据字典
 *
 * 两级结构：
 * - 校园赛 - 班班赛 / 校园赛 - 每日积分赛
 * - 区域赛
 * - 全国总决赛
 *
 * 存储使用叶子类型；展示使用 formatMatchTypeLabel 完整路径。
 */

export const MATCH_TYPE_CAMPUS_TOP = '校园赛';
export const MATCH_TYPE_REGION = '区域赛';
export const MATCH_TYPE_FINAL = '全国总决赛';

/** @deprecated 筛选场景请使用叶子类型 + 级联选择 */
export const MATCH_TYPE_TOP_LEVEL_OPTIONS = ['校园赛', '区域赛', '全国总决赛'];

export const CAMPUS_SUBTYPE_CLASS = '班班赛';
export const CAMPUS_SUBTYPE_DAILY = '每日积分赛';

export const CAMPUS_SUBTYPE_OPTIONS = [CAMPUS_SUBTYPE_DAILY, CAMPUS_SUBTYPE_CLASS];

export const PUBLISH_MATCH_TYPE_DAILY = CAMPUS_SUBTYPE_DAILY;
export const PUBLISH_MATCH_TYPE_CLASS = CAMPUS_SUBTYPE_CLASS;
export const PUBLISH_MATCH_TYPE_REGION = MATCH_TYPE_REGION;
export const PUBLISH_MATCH_TYPE_FINAL = MATCH_TYPE_FINAL;

export const CAMPUS_PUBLISH_MATCH_TYPES = [
  PUBLISH_MATCH_TYPE_CLASS,
  PUBLISH_MATCH_TYPE_DAILY
];

export const MATCH_TYPE_DAILY = CAMPUS_SUBTYPE_DAILY;
export const MATCH_TYPE_CLASS = CAMPUS_SUBTYPE_CLASS;

export const MATCH_TYPE_CLASS_TYPES = [
  MATCH_TYPE_CLASS,
  MATCH_TYPE_REGION,
  MATCH_TYPE_FINAL
];

export const MATCH_TYPE_LEAF_OPTIONS = [MATCH_TYPE_DAILY, ...MATCH_TYPE_CLASS_TYPES];

/** @deprecated 历史代码别名，值为班班赛 */
export const MATCH_TYPE_CAMPUS = MATCH_TYPE_CLASS;

export const MATCH_TYPE_CASCADER_PROPS_SINGLE = {
  emitPath: true,
  value: 'value',
  label: 'label',
  children: 'children'
};

export const MATCH_TYPE_CASCADER_PROPS_MULTIPLE = {
  multiple: true,
  emitPath: true,
  value: 'value',
  label: 'label',
  children: 'children'
};

const LEGACY_LEAF_TYPE_MAP = {
  校内赛: MATCH_TYPE_CLASS,
  '校内赛/班班赛': MATCH_TYPE_CLASS,
  班班赛: MATCH_TYPE_CLASS,
  每日积分赛: MATCH_TYPE_DAILY,
  区域赛: MATCH_TYPE_REGION,
  区域晋级赛: MATCH_TYPE_REGION,
  全国总决赛: MATCH_TYPE_FINAL,
  全国赛: MATCH_TYPE_FINAL,
  校园积分赛: MATCH_TYPE_DAILY
};

const TOP_LEVEL_BY_LEAF = {
  [MATCH_TYPE_CLASS]: MATCH_TYPE_CAMPUS_TOP,
  [MATCH_TYPE_DAILY]: MATCH_TYPE_CAMPUS_TOP,
  [MATCH_TYPE_REGION]: MATCH_TYPE_REGION,
  [MATCH_TYPE_FINAL]: MATCH_TYPE_FINAL
};

/** 将任意比赛类型值规范为叶子类型 */
export function normalizeMatchTypeLeaf(type = '', stageName = '') {
  if (!type) {
    return '';
  }
  if (LEGACY_LEAF_TYPE_MAP[type]) {
    return LEGACY_LEAF_TYPE_MAP[type];
  }
  if (type === MATCH_TYPE_CAMPUS_TOP) {
    if (stageName === MATCH_TYPE_FINAL) {
      return MATCH_TYPE_FINAL;
    }
    if (stageName === '区域晋级赛' || stageName === MATCH_TYPE_REGION) {
      return MATCH_TYPE_REGION;
    }
    return MATCH_TYPE_CLASS;
  }
  if (MATCH_TYPE_LEAF_OPTIONS.includes(type)) {
    return type;
  }
  return type;
}

/** 规范化比赛类型列表为叶子类型（兼容历史一级「校园赛」） */
export function normalizeMatchTypeLeaves(types = []) {
  const leaves = [];
  (types ?? []).forEach((type) => {
    if (type === MATCH_TYPE_CAMPUS_TOP) {
      leaves.push(MATCH_TYPE_DAILY, MATCH_TYPE_CLASS);
      return;
    }
    const leaf = normalizeMatchTypeLeaf(type);
    if (leaf && leaf !== MATCH_TYPE_CAMPUS_TOP) {
      leaves.push(leaf);
    }
  });
  return [...new Set(leaves)];
}

/** 获取一级比赛类型 */
export function getMatchTypeTopLevel(type = '', stageName = '') {
  const leaf = normalizeMatchTypeLeaf(type, stageName);
  return TOP_LEVEL_BY_LEAF[leaf] ?? leaf;
}

/** 统一展示标签（校园赛必须展示到二级） */
export function formatMatchTypeLabel(type = '', stageName = '') {
  const leaf = normalizeMatchTypeLeaf(type, stageName);
  if (!leaf) {
    return '-';
  }
  if (CAMPUS_PUBLISH_MATCH_TYPES.includes(leaf)) {
    return `${MATCH_TYPE_CAMPUS_TOP} - ${leaf}`;
  }
  return leaf;
}

/** @deprecated 与 formatMatchTypeLabel 相同 */
export function formatMatchTypePublishLabel(type = '', stageName = '') {
  return formatMatchTypeLabel(type, stageName);
}

/** 多个比赛类型展示 */
export function formatMatchTypesList(types = [], separator = '；') {
  const labels = normalizeMatchTypeLeaves(types).map((leaf) => formatMatchTypeLabel(leaf));
  return labels.length ? labels.join(separator) : '-';
}

/** 赛段比赛类型展示 */
export function formatStagePublishMatchTypes(stage = {}) {
  return formatMatchTypesList(resolveStagePublishMatchTypes(stage));
}

export function getDefaultPublishMatchTypesForStageName(stageName = '') {
  if (stageName === MATCH_TYPE_FINAL) {
    return [PUBLISH_MATCH_TYPE_FINAL];
  }
  if (stageName === '校园行') {
    return [
      PUBLISH_MATCH_TYPE_DAILY,
      PUBLISH_MATCH_TYPE_CLASS,
      PUBLISH_MATCH_TYPE_REGION
    ];
  }
  return [PUBLISH_MATCH_TYPE_DAILY, PUBLISH_MATCH_TYPE_CLASS];
}

export function resolveStagePublishMatchTypes(stage = {}) {
  const raw = stage.publishMatchTypes ?? [];
  const normalized = raw.map((type) => normalizeMatchTypeLeaf(type));
  if (normalized.length) {
    return [...new Set(normalized)];
  }
  return getDefaultPublishMatchTypesForStageName(stage.stageName ?? '');
}

export function isCampusLeafType(type = '', stageName = '') {
  return CAMPUS_PUBLISH_MATCH_TYPES.includes(normalizeMatchTypeLeaf(type, stageName));
}

export function isDailyMatchType(type = '', stageName = '') {
  return normalizeMatchTypeLeaf(type, stageName) === MATCH_TYPE_DAILY;
}

export function isClassMatchType(type = '', stageName = '') {
  return MATCH_TYPE_CLASS_TYPES.includes(normalizeMatchTypeLeaf(type, stageName));
}

export function matchTypeMatchesLeaf(type = '', leaf = '', stageName = '') {
  if (!leaf) {
    return true;
  }
  return normalizeMatchTypeLeaf(type, stageName) === normalizeMatchTypeLeaf(leaf);
}

/** @deprecated 使用 matchTypeMatchesLeaf */
export function matchTypeMatchesTopLevel(type = '', topLevel = '', stageName = '') {
  if (!topLevel) {
    return true;
  }
  return getMatchTypeTopLevel(type, stageName) === topLevel;
}

/** 叶子类型 → 级联路径 */
export function leafToCascaderPath(leaf = '', stageName = '') {
  const normalized = normalizeMatchTypeLeaf(leaf, stageName);
  if (!normalized) {
    return [];
  }
  if (CAMPUS_PUBLISH_MATCH_TYPES.includes(normalized)) {
    return [MATCH_TYPE_CAMPUS_TOP, normalized];
  }
  return [normalized];
}

/** 级联路径 → 叶子类型（单选） */
export function cascaderPathToLeaf(path = [], stageName = '') {
  if (!Array.isArray(path) || !path.length) {
    return '';
  }
  const last = path[path.length - 1];
  if (last === MATCH_TYPE_CAMPUS_TOP) {
    return '';
  }
  return normalizeMatchTypeLeaf(last, stageName);
}

/** 赛段配置：全量比赛类型级联选项 */
export function buildStageMatchTypeCascaderOptions() {
  return buildMatchTypeCascaderOptions(MATCH_TYPE_LEAF_OPTIONS);
}

/** 赛段 publishMatchTypes → 级联多选值 */
export function publishMatchTypesToCascaderValue(types = []) {
  return normalizeMatchTypeLeaves(types)
    .map((leaf) => leafToCascaderPath(leaf))
    .filter((path) => path.length);
}

/** 级联多选值 → 赛段 publishMatchTypes（叶子类型） */
export function cascaderValueToPublishMatchTypes(paths = []) {
  if (!Array.isArray(paths)) {
    return [];
  }
  const leaves = paths
    .map((path) => cascaderPathToLeaf(path))
    .filter(Boolean);
  return [...new Set(leaves)];
}

/** 发布比赛级联选择：一级 + 校园赛子类型 */
export function buildMatchTypeCascaderOptions(allowedLeafTypes = []) {
  const allowed = allowedLeafTypes.map((type) => normalizeMatchTypeLeaf(type));
  const options = [];
  const campusChildren = [
    { label: CAMPUS_SUBTYPE_DAILY, value: MATCH_TYPE_DAILY },
    { label: CAMPUS_SUBTYPE_CLASS, value: MATCH_TYPE_CLASS }
  ].filter((item) => allowed.includes(item.value));
  if (campusChildren.length) {
    options.push({
      label: MATCH_TYPE_CAMPUS_TOP,
      value: MATCH_TYPE_CAMPUS_TOP,
      children: campusChildren
    });
  }
  if (allowed.includes(MATCH_TYPE_REGION)) {
    options.push({ label: MATCH_TYPE_REGION, value: MATCH_TYPE_REGION });
  }
  if (allowed.includes(MATCH_TYPE_FINAL)) {
    options.push({ label: MATCH_TYPE_FINAL, value: MATCH_TYPE_FINAL });
  }
  return options;
}

export function getMatchTypeStageHint(stage = {}) {
  const configured = resolveStagePublishMatchTypes(stage);
  if (configured.length) {
    return `当前赛段可发布：${formatStagePublishMatchTypes(stage)}。`;
  }
  const stageName = stage.stageName ?? '';
  if (stageName === MATCH_TYPE_FINAL) {
    return '全国总决赛赛段仅支持发布全国总决赛类型比赛。';
  }
  if (stageName === '校园行') {
    return `校园行赛段支持${formatMatchTypesList([MATCH_TYPE_DAILY, MATCH_TYPE_CLASS, MATCH_TYPE_REGION], '、')}。`;
  }
  return '';
}

/** @deprecated 使用 normalizeMatchTypeLeaf */
export function normalizeMatchType(type = '', stageName = '') {
  return normalizeMatchTypeLeaf(type, stageName);
}

/** @deprecated 使用 formatMatchTypeLabel */
export function normalizeMatchTypeLabel(type = '') {
  return formatMatchTypeLabel(type);
}
