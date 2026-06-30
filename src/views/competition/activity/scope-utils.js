/**
 * 活动 / 赛段范围配置工具
 *
 * 范围各层级使用显式 mode（all / specified）表示「全国/全部」或「指定」，
 * 不使用空值隐式代表全部；上级为指定、下级为全部时表示该上级下全部下级对象。
 */
import {
  clone,
  getRegionLabelList,
  REGION_OPTIONS,
  STAGE_GRADE_MAP,
  STAGE_OPTIONS
} from '@/views/event-item/data.js';

export const SCOPE_MODE_ALL = 'all';
export const SCOPE_MODE_SPECIFIED = 'specified';

export const COVERAGE_MODE_NATIONAL = 'national';
export const COVERAGE_MODE_SPECIFIED = 'specified';

export const SCHOOL_OPTIONS = [
  {
    value: 'school_1',
    label: '北京市海淀区实验小学',
    region: ['110000', '110100', '110108']
  },
  {
    value: 'school_2',
    label: '北京市海淀区中关村第一小学',
    region: ['110000', '110100', '110108']
  },
  {
    value: 'school_3',
    label: '北京市朝阳区芳草地国际学校',
    region: ['110000', '110100', '110105']
  },
  {
    value: 'school_4',
    label: '北京市西城区育民小学',
    region: ['110000', '110100', '110102']
  },
  {
    value: 'school_5',
    label: '北京市东城区史家胡同小学',
    region: ['110000', '110100', '110101']
  }
];

export const CLASS_OPTIONS = [
  { value: 'class_1', label: '三年级1班', schoolId: 'school_1', grade: '三年级' },
  { value: 'class_2', label: '三年级2班', schoolId: 'school_1', grade: '三年级' },
  { value: 'class_3', label: '四年级1班', schoolId: 'school_2', grade: '四年级' },
  { value: 'class_4', label: '五年级1班', schoolId: 'school_3', grade: '五年级' },
  { value: 'class_5', label: '初一1班', schoolId: 'school_4', grade: '初一' }
];

export function createDefaultScope() {
  return {
    regionMode: SCOPE_MODE_ALL,
    regions: [],
    schoolMode: SCOPE_MODE_ALL,
    schools: [],
    stageMode: SCOPE_MODE_ALL,
    stages: [],
    gradeMode: SCOPE_MODE_ALL,
    grades: [],
    classMode: SCOPE_MODE_ALL,
    classes: [],
    remark: ''
  };
}

export function createDefaultStageScope() {
  return {
    inherit: true,
    ...createDefaultScope()
  };
}

/** @deprecated 兼容旧引用 */
export function createEmptyScope() {
  return createDefaultScope();
}

function isLegacyScope(scope = {}) {
  return scope.regionMode == null && scope.schoolMode == null;
}

function hasLegacySelection(scope = {}) {
  return !!(
    scope.regions?.length ||
    scope.schools?.length ||
    scope.stages?.length ||
    scope.grades?.length ||
    scope.classes?.length
  );
}

export function migrateLegacyScope(scope = {}, { isStage = false } = {}) {
  if (!scope) {
    return isStage ? createDefaultStageScope() : createDefaultScope();
  }
  if (!isLegacyScope(scope)) {
    const next = {
      ...(isStage ? createDefaultStageScope() : createDefaultScope()),
      ...clone(scope),
      regions: clone(scope.regions ?? []),
      schools: [...(scope.schools ?? [])],
      stages: [...(scope.stages ?? [])],
      grades: [...(scope.grades ?? [])],
      classes: [...(scope.classes ?? [])],
      remark: scope.remark ?? ''
    };
    if (isStage && scope.inherit == null) {
      next.inherit = !hasLegacySelection(scope);
    }
    return next;
  }

  const next = isStage ? createDefaultStageScope() : createDefaultScope();
  next.remark = scope.remark ?? '';
  if (scope.regions?.length) {
    next.regionMode = SCOPE_MODE_SPECIFIED;
    next.regions = clone(scope.regions);
  }
  if (scope.schools?.length) {
    next.schoolMode = SCOPE_MODE_SPECIFIED;
    next.schools = [...scope.schools];
  }
  if (scope.stages?.length) {
    next.stageMode = SCOPE_MODE_SPECIFIED;
    next.stages = [...scope.stages];
  }
  if (scope.grades?.length) {
    next.gradeMode = SCOPE_MODE_SPECIFIED;
    next.grades = [...scope.grades];
  }
  if (scope.classes?.length) {
    next.classMode = SCOPE_MODE_SPECIFIED;
    next.classes = [...scope.classes];
  }
  if (isStage) {
    next.inherit = !hasLegacySelection(scope);
  }
  return next;
}

export function normalizeScope(scope = {}, options = {}) {
  return migrateLegacyScope(scope, options);
}

function regionPathKey(path = []) {
  return path.join('/');
}

function isRegionPathWithin(path = [], parentPaths = []) {
  const key = regionPathKey(path);
  return parentPaths.some((parentPath) => {
    const parentKey = regionPathKey(parentPath);
    return key.startsWith(parentKey) || parentKey.startsWith(key);
  });
}

/** 活动覆盖区域路径是否落在设项适用区域内 */
function isCoveragePathWithinItemRegion(coveragePath = [], itemPath = []) {
  const coverageKey = regionPathKey(coveragePath);
  const itemKey = regionPathKey(itemPath);
  return coverageKey === itemKey || coverageKey.startsWith(`${itemKey}/`);
}

function getActivityCoverageRegionPaths(coverage = {}) {
  const scope = migrateLegacyScope(coverage ?? {});
  if (isScopeAllNational(scope)) {
    return { national: true, paths: [] };
  }
  if (scope.regionMode === SCOPE_MODE_SPECIFIED && scope.regions?.length) {
    return { national: false, paths: scope.regions };
  }
  if (scope.schoolMode === SCOPE_MODE_SPECIFIED && scope.schools?.length) {
    const pathMap = new Map();
    scope.schools.forEach((schoolId) => {
      const school = SCHOOL_OPTIONS.find((item) => item.value === schoolId);
      if (!school?.region?.length) {
        return;
      }
      pathMap.set(regionPathKey(school.region), school.region);
    });
    return { national: false, paths: [...pathMap.values()] };
  }
  return { national: false, paths: [] };
}

/** 判断活动覆盖范围是否在设项适用区域内 */
export function isItemApplicableToActivityCoverage(item, coverage) {
  if (!item || item.regionType === '全国') {
    return true;
  }
  const itemPaths = item.regions ?? [];
  if (!itemPaths.length) {
    return false;
  }
  const { national, paths } = getActivityCoverageRegionPaths(coverage);
  if (national) {
    return false;
  }
  if (!paths.length) {
    return false;
  }
  return paths.every((coveragePath) =>
    itemPaths.some((itemPath) => isCoveragePathWithinItemRegion(coveragePath, itemPath))
  );
}

export function getSchoolsByRegions(regionPaths = []) {
  if (!regionPaths.length) {
    return [...SCHOOL_OPTIONS];
  }
  return SCHOOL_OPTIONS.filter((school) =>
    regionPaths.some((path) => isRegionPathWithin(school.region, [path]))
  );
}

function getEffectiveRegions(scope = {}, parentScope = null) {
  const parent = parentScope ? migrateLegacyScope(parentScope) : null;
  if (parent && !isScopeAllNational(parent)) {
    if (parent.regionMode === SCOPE_MODE_SPECIFIED && parent.regions?.length) {
      if (scope.regionMode === SCOPE_MODE_SPECIFIED && scope.regions?.length) {
        return scope.regions;
      }
      return parent.regions;
    }
  }
  if (scope.regionMode === SCOPE_MODE_SPECIFIED) {
    return scope.regions ?? [];
  }
  return [];
}

function getEffectiveSchoolIds(scope = {}, parentScope = null) {
  if (parentScope?.schoolMode === SCOPE_MODE_SPECIFIED && parentScope.schools?.length) {
    return parentScope.schools;
  }
  if (scope.schoolMode === SCOPE_MODE_SPECIFIED && scope.schools?.length) {
    return scope.schools;
  }
  const regionPaths = getEffectiveRegions(scope, parentScope);
  return getSchoolsByRegions(regionPaths).map((item) => item.value);
}

function getEffectiveStages(scope = {}, parentScope = null) {
  if (parentScope?.stageMode === SCOPE_MODE_SPECIFIED && parentScope.stages?.length) {
    return parentScope.stages;
  }
  if (scope.stageMode === SCOPE_MODE_SPECIFIED && scope.stages?.length) {
    return scope.stages;
  }
  return [...STAGE_OPTIONS];
}

function getEffectiveGrades(scope = {}, parentScope = null) {
  if (parentScope?.gradeMode === SCOPE_MODE_SPECIFIED && parentScope.grades?.length) {
    return parentScope.grades;
  }
  if (scope.gradeMode === SCOPE_MODE_SPECIFIED && scope.grades?.length) {
    return scope.grades;
  }
  const stages = getEffectiveStages(scope, parentScope);
  const grades = [];
  stages.forEach((stage) => {
    (STAGE_GRADE_MAP[stage] ?? []).forEach((grade) => {
      if (!grades.includes(grade)) {
        grades.push(grade);
      }
    });
  });
  return grades;
}

export function getAvailableSchoolOptions(scope = {}, parentScope = null) {
  const regionPaths = getEffectiveRegions(scope, parentScope);
  let list = getSchoolsByRegions(regionPaths);
  const parentSchools = parentScope?.schoolMode === SCOPE_MODE_SPECIFIED ? parentScope.schools : [];
  if (parentSchools.length) {
    list = list.filter((item) => parentSchools.includes(item.value));
  }
  return list;
}

export function getAvailableStageOptions(scope = {}, parentScope = null) {
  const stages = getEffectiveStages(scope, parentScope);
  return stages.map((item) => ({ label: item, value: item }));
}

export function getAvailableGradeOptions(scope = {}, parentScope = null) {
  const stages =
    scope.stageMode === SCOPE_MODE_SPECIFIED && scope.stages?.length
      ? scope.stages
      : getEffectiveStages(scope, parentScope);
  const grades = [];
  stages.forEach((stage) => {
    (STAGE_GRADE_MAP[stage] ?? []).forEach((grade) => {
      if (!grades.includes(grade)) {
        grades.push(grade);
      }
    });
  });
  const parentGrades =
    parentScope?.gradeMode === SCOPE_MODE_SPECIFIED ? parentScope.grades ?? [] : [];
  if (parentGrades.length) {
    return grades.filter((grade) => parentGrades.includes(grade));
  }
  return grades;
}

export function getAvailableClassOptions(scope = {}, parentScope = null) {
  const grades =
    scope.gradeMode === SCOPE_MODE_SPECIFIED && scope.grades?.length
      ? scope.grades
      : getEffectiveGrades(scope, parentScope);
  const schools = getEffectiveSchoolIds(scope, parentScope);
  return CLASS_OPTIONS.filter((item) => {
    const gradeOk = !grades.length || grades.includes(item.grade);
    const schoolOk = !schools.length || schools.includes(item.schoolId);
    return gradeOk && schoolOk;
  });
}

function isSubset(child = [], parent = []) {
  if (!child.length) {
    return true;
  }
  if (!parent.length) {
    return false;
  }
  return child.every((item) => parent.includes(item));
}

export function formatRegionShortLabel(path = []) {
  const labels = getRegionLabelList([path]);
  const text = labels[0] ?? '';
  const parts = text.split(' / ');
  return parts[parts.length - 1] || text;
}

/** 业务化地区展示，如「北京市海淀区」 */
export function formatRegionDisplayLabel(path = []) {
  const text = getRegionLabelList([path])[0] ?? '';
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

export function formatRegionReadonlyLabel(paths = []) {
  if (!paths?.length) {
    return '';
  }
  return paths.map((path) => formatRegionDisplayLabel(path)).join('、');
}

function formatRegionSummary(scope = {}) {
  if (scope.regionMode === SCOPE_MODE_ALL) {
    return '全国范围';
  }
  if (!scope.regions?.length) {
    return '';
  }
  if (scope.regions.length <= 2) {
    return scope.regions.map((path) => formatRegionDisplayLabel(path)).join('、');
  }
  return `已选择 ${scope.regions.length} 个地区`;
}

function formatSchoolSummary(scope = {}) {
  if (scope.schoolMode === SCOPE_MODE_ALL) {
    return '全部学校';
  }
  if (!scope.schools?.length) {
    return '';
  }
  if (scope.schools.length <= 2) {
    return scope.schools
      .map((id) => SCHOOL_OPTIONS.find((item) => item.value === id)?.label ?? id)
      .join('、');
  }
  return `${scope.schools.length}所学校`;
}

function formatSchoolBusinessSummary(scope = {}, regionText = '') {
  if (scope.schoolMode === SCOPE_MODE_ALL) {
    return `${regionText}全部学校`;
  }
  const schools = scope.schools ?? [];
  if (!schools.length) {
    return regionText;
  }
  if (schools.length === 1) {
    return SCHOOL_OPTIONS.find((item) => item.value === schools[0])?.label ?? schools[0];
  }
  return `${regionText} ${schools.length} 所学校`.replace(/\s+/g, ' ').trim();
}

function formatStageEduSummary(scope = {}) {
  if (scope.stageMode === SCOPE_MODE_ALL) {
    return '';
  }
  return scope.stages?.join('、') ?? '';
}

function formatGradeSummary(scope = {}) {
  if (scope.gradeMode === SCOPE_MODE_ALL) {
    return '';
  }
  if (!scope.grades?.length) {
    return '';
  }
  if (scope.grades.length <= 3) {
    return scope.grades.join('、');
  }
  return `${scope.grades.length}个年级`;
}

function formatClassBusinessSummary(scope = {}) {
  if (scope.classMode !== SCOPE_MODE_SPECIFIED || !scope.classes?.length) {
    return '';
  }
  if (scope.classes.length <= 3) {
    return scope.classes
      .map((id) => CLASS_OPTIONS.find((item) => item.value === id)?.label ?? id)
      .join('、');
  }
  return `${scope.classes.length}个班级`;
}

export function isScopeAllNational(scope = {}) {
  return (
    scope.regionMode === SCOPE_MODE_ALL &&
    scope.schoolMode === SCOPE_MODE_ALL &&
    scope.stageMode === SCOPE_MODE_ALL &&
    scope.gradeMode === SCOPE_MODE_ALL &&
    scope.classMode === SCOPE_MODE_ALL
  );
}

/** 解析上级范围约束，供下级范围配置使用 */
export function getParentScopeConstraints(parentScope = {}) {
  const parent = migrateLegacyScope(parentScope);
  const national = isScopeAllNational(parent);
  return {
    isNational: national,
    regionSpecified: !national && parent.regionMode === SCOPE_MODE_SPECIFIED && !!parent.regions?.length,
    regionPaths: parent.regionMode === SCOPE_MODE_SPECIFIED ? clone(parent.regions ?? []) : [],
    schoolSpecified: parent.schoolMode === SCOPE_MODE_SPECIFIED && !!parent.schools?.length,
    schoolIds: parent.schoolMode === SCOPE_MODE_SPECIFIED ? [...(parent.schools ?? [])] : [],
    stageSpecified: parent.stageMode === SCOPE_MODE_SPECIFIED && !!parent.stages?.length,
    stages: parent.stageMode === SCOPE_MODE_SPECIFIED ? [...(parent.stages ?? [])] : [],
    gradeSpecified: parent.gradeMode === SCOPE_MODE_SPECIFIED && !!parent.grades?.length,
    grades: parent.gradeMode === SCOPE_MODE_SPECIFIED ? [...(parent.grades ?? [])] : [],
    classSpecified: parent.classMode === SCOPE_MODE_SPECIFIED && !!parent.classes?.length,
    classes: parent.classMode === SCOPE_MODE_SPECIFIED ? [...(parent.classes ?? [])] : []
  };
}

/** 按上级地区路径过滤级联选项 */
export function filterRegionOptionsByPaths(regionPaths = [], options = REGION_OPTIONS) {
  if (!regionPaths?.length) {
    return options;
  }
  const filterNodes = (nodes, prefix = []) => {
    const result = [];
    nodes.forEach((node) => {
      const path = [...prefix, node.value];
      const key = regionPathKey(path);
      const allowed = regionPaths.some((parentPath) => {
        const parentKey = regionPathKey(parentPath);
        return key.startsWith(parentKey) || parentKey.startsWith(key);
      });
      if (!allowed) {
        return;
      }
      const item = { value: node.value, label: node.label };
      if (node.children?.length) {
        const children = filterNodes(node.children, path);
        if (children.length) {
          item.children = children;
        }
      }
      result.push(item);
    });
    return result;
  };
  return filterNodes(options);
}

/** 从上级范围初始化下级可缩小范围 */
export function initScopeFromParent(parentScope = {}) {
  return migrateLegacyScope(parentScope);
}

export function clampScopeToParent(childScope = {}, parentScope = {}) {
  const parent = migrateLegacyScope(parentScope);
  const child = migrateLegacyScope(childScope);
  const constraints = getParentScopeConstraints(parent);

  if (constraints.isNational) {
    return child;
  }

  const next = { ...child };

  if (constraints.regionSpecified) {
    next.regionMode = SCOPE_MODE_SPECIFIED;
    const allowed = constraints.regionPaths;
    next.regions = (child.regions ?? []).filter((path) =>
      allowed.some((p) => regionPathKey(path) === regionPathKey(p) || isRegionPathWithin(path, [p]))
    );
    if (!next.regions.length) {
      next.regions = clone(allowed);
    }
  }

  const allowedSchools = getAvailableSchoolOptions(next, parent).map((d) => d.value);
  if (constraints.schoolSpecified || allowedSchools.length) {
    if (child.schoolMode === SCOPE_MODE_SPECIFIED) {
      next.schools = (child.schools ?? []).filter((id) => allowedSchools.includes(id));
    }
  }

  const allowedStages = getAvailableStageOptions(next, parent).map((d) => d.value);
  if (constraints.stageSpecified) {
    if (child.stageMode === SCOPE_MODE_SPECIFIED) {
      next.stages = (child.stages ?? []).filter((s) => allowedStages.includes(s));
    }
  }

  const allowedGrades = getAvailableGradeOptions(next, parent);
  if (constraints.gradeSpecified) {
    if (child.gradeMode === SCOPE_MODE_SPECIFIED) {
      next.grades = (child.grades ?? []).filter((g) => allowedGrades.includes(g));
    }
  }

  const allowedClasses = getAvailableClassOptions(next, parent).map((d) => d.value);
  if (constraints.classSpecified) {
    if (child.classMode === SCOPE_MODE_SPECIFIED) {
      next.classes = (child.classes ?? []).filter((id) => allowedClasses.includes(id));
    }
  }

  return next;
}

export function getCoverageMode(scope = {}) {
  return isScopeAllNational(migrateLegacyScope(scope))
    ? COVERAGE_MODE_NATIONAL
    : COVERAGE_MODE_SPECIFIED;
}

export function createNationalScope(remark = '') {
  return {
    ...createDefaultScope(),
    remark
  };
}

export function formatScopeDisplaySummary(scope = {}, options = {}) {
  const { isStage = false, parentScope = null } = options;
  const normalized = migrateLegacyScope(scope, { isStage });
  if (isStage && normalized.inherit) {
    if (parentScope) {
      return formatScopeDisplaySummary(parentScope);
    }
    return '使用活动覆盖范围';
  }

  if (isScopeAllNational(normalized)) {
    return '全国范围';
  }

  const regionText = formatRegionSummary(normalized);
  const schoolText = formatSchoolBusinessSummary(normalized, regionText);
  const stageText = formatStageEduSummary(normalized);
  const gradeText = formatGradeSummary(normalized);
  const classText = formatClassBusinessSummary(normalized);

  if (classText) {
    return `${schoolText}${classText}学生`;
  }

  if (gradeText) {
    const prefix = stageText ? `${stageText}${gradeText}` : gradeText;
    return `${schoolText}，${prefix}学生`;
  }

  if (stageText) {
    return `${schoolText}，${stageText}阶段学生`;
  }

  return schoolText;
}

export function getScopeDetailRows(scope = {}, options = {}) {
  const { isStage = false, labelPrefix = '覆盖' } = options;
  const normalized = migrateLegacyScope(scope, { isStage });
  if (isStage && normalized.inherit) {
    return [];
  }
  const labels = getScopeDimensionLabels(normalized, options);
  const rows = [
    { level: `${labelPrefix}地区`, content: labels.region },
    { level: `${labelPrefix}学校`, content: labels.school },
    { level: `${labelPrefix}学段`, content: labels.stage },
    { level: `${labelPrefix}年级`, content: labels.grade },
    { level: `${labelPrefix}班级`, content: labels.class }
  ];
  if (!isScopeAllNational(normalized)) {
    rows.push({
      level: `${labelPrefix}对象说明`,
      content: normalized.remark?.trim() || '未填写'
    });
  }
  return rows;
}

/** 详情页：仅展示实际限制到的有效层级 */
export function getScopeEffectiveDetailRows(scope = {}, options = {}) {
  const { isStage = false, labelPrefix = '覆盖' } = options;
  const normalized = migrateLegacyScope(scope, { isStage });
  if (isStage && normalized.inherit) {
    return [];
  }
  if (isScopeAllNational(normalized)) {
    return [];
  }

  const labels = getScopeDimensionLabels(normalized, options);
  const rows = [];

  if (normalized.regionMode === SCOPE_MODE_SPECIFIED && normalized.regions?.length) {
    rows.push({ level: `${labelPrefix}地区`, content: labels.region });
  }

  rows.push({ level: `${labelPrefix}学校`, content: labels.school });

  if (normalized.stageMode === SCOPE_MODE_SPECIFIED && normalized.stages?.length) {
    rows.push({ level: `${labelPrefix}学段`, content: labels.stage });
  }

  if (normalized.gradeMode === SCOPE_MODE_SPECIFIED && normalized.grades?.length) {
    rows.push({ level: `${labelPrefix}年级`, content: labels.grade });
  }

  if (
    normalized.classMode === SCOPE_MODE_SPECIFIED &&
    normalized.classes?.length &&
    normalized.schoolMode === SCOPE_MODE_SPECIFIED &&
    normalized.schools?.length
  ) {
    rows.push({ level: `${labelPrefix}班级`, content: labels.class });
  }

  if (normalized.remark?.trim()) {
    rows.push({ level: `${labelPrefix}对象说明`, content: normalized.remark.trim() });
  }

  return rows;
}

export function getScopeDimensionLabels(scope = {}, options = {}) {
  const { isStage = false, parentScope = null } = options;
  if (isStage && scope.inherit) {
    return {
      region: '继承活动覆盖范围',
      school: '继承活动覆盖范围',
      stage: '继承活动覆盖范围',
      grade: '继承活动覆盖范围',
      class: '继承活动覆盖范围'
    };
  }
  return {
    region:
      scope.regionMode === SCOPE_MODE_ALL
        ? '全国'
        : getRegionLabelList(scope.regions).join('、') || '-',
    school:
      scope.schoolMode === SCOPE_MODE_ALL
        ? '全部学校'
        : scope.schools
            ?.map((id) => SCHOOL_OPTIONS.find((item) => item.value === id)?.label ?? id)
            .join('、') || '-',
    stage: scope.stageMode === SCOPE_MODE_ALL ? '全部学段' : scope.stages?.join('、') || '-',
    grade: scope.gradeMode === SCOPE_MODE_ALL ? '全部年级' : scope.grades?.join('、') || '-',
    class:
      scope.classMode === SCOPE_MODE_ALL
        ? '全部班级'
        : scope.classes
            ?.map((id) => CLASS_OPTIONS.find((item) => item.value === id)?.label ?? id)
            .join('、') || '-'
  };
}

export function formatScopeDetailText(scope = {}, options = {}) {
  const labels = getScopeDimensionLabels(scope, options);
  const { labelPrefix = '覆盖' } = options;
  return `${labelPrefix}地区：${labels.region}；学校：${labels.school}；学段：${labels.stage}；年级：${labels.grade}；班级：${labels.class}`;
}

/** @deprecated 详情表格等场景兼容 */
export function formatScopeSummary(scope = {}, options = {}) {
  return formatScopeDisplaySummary(scope, options);
}

export function formatScopeBriefSummary(scope = {}, options = {}) {
  return formatScopeDisplaySummary(scope, options);
}

export function formatCoverageRegions(paths = []) {
  if (!paths?.length) {
    return '-';
  }
  return getRegionLabelList(paths).join('；');
}

export function formatCoverageSchools(schoolIds = []) {
  if (!schoolIds?.length) {
    return '-';
  }
  return schoolIds
    .map((id) => SCHOOL_OPTIONS.find((d) => d.value === id)?.label ?? id)
    .join('、');
}

export function formatCoverageClasses(classIds = []) {
  if (!classIds?.length) {
    return '-';
  }
  return classIds
    .map((id) => CLASS_OPTIONS.find((d) => d.value === id)?.label ?? id)
    .join('、');
}

export function validateScopeConfig(scope = {}, options = {}) {
  const { isStage = false, labelPrefix = '覆盖', activitySpecified = false } = options;
  const errors = [];
  if (isStage && scope.inherit) {
    return errors;
  }
  const normalized = migrateLegacyScope(scope);
  const needRegion =
    activitySpecified || normalized.regionMode === SCOPE_MODE_SPECIFIED;
  if (needRegion && !normalized.regions?.length) {
    errors.push(`请选择${labelPrefix}地区`);
  }
  if (normalized.schoolMode === SCOPE_MODE_SPECIFIED && !normalized.schools?.length) {
    errors.push(`请选择${labelPrefix}学校`);
  }
  if (normalized.stageMode === SCOPE_MODE_SPECIFIED && !normalized.stages?.length) {
    errors.push(`请选择${labelPrefix}学段`);
  }
  if (normalized.gradeMode === SCOPE_MODE_SPECIFIED && !normalized.grades?.length) {
    errors.push(`请选择${labelPrefix}年级`);
  }
  if (normalized.classMode === SCOPE_MODE_SPECIFIED) {
    if (normalized.schoolMode !== SCOPE_MODE_SPECIFIED && !isStage) {
      errors.push('指定班级前请先选择指定学校');
    } else if (!normalized.classes?.length) {
      errors.push(`请选择${labelPrefix}班级`);
    }
  }

  const allowedSchools = getAvailableSchoolOptions(normalized).map((item) => item.value);
  if (normalized.schoolMode === SCOPE_MODE_SPECIFIED && normalized.schools?.length) {
    if (!isSubset(normalized.schools, allowedSchools)) {
      errors.push(`${labelPrefix}学校不能超出${labelPrefix}地区范围`);
    }
  }

  const allowedGrades = getAvailableGradeOptions(normalized);
  if (normalized.gradeMode === SCOPE_MODE_SPECIFIED && normalized.grades?.length) {
    if (!isSubset(normalized.grades, allowedGrades)) {
      errors.push(`${labelPrefix}年级不能超出${labelPrefix}学段范围`);
    }
  }

  const allowedClasses = getAvailableClassOptions(normalized).map((item) => item.value);
  if (normalized.classMode === SCOPE_MODE_SPECIFIED && normalized.classes?.length) {
    if (!isSubset(normalized.classes, allowedClasses)) {
      errors.push(`${labelPrefix}班级不能超出上级范围`);
    }
  }

  return errors;
}

/** 活动覆盖范围变更时，校验已有赛段范围是否超出新覆盖范围 */
export function validateCoverageAgainstStages(coverage = {}, stages = []) {
  const errors = [];
  const normalizedCoverage = migrateLegacyScope(coverage);
  (stages ?? []).forEach((stage, index) => {
    const stageScope = migrateLegacyScope(stage.scope, { isStage: true });
    if (stageScope.inherit) {
      return;
    }
    const stageErrors = validateStageScopeWithinCoverage(stageScope, normalizedCoverage);
    if (stageErrors.length) {
      const label = stage.stageName || `第${index + 1}个赛段`;
      errors.push(`${label}的参赛范围超出新的活动覆盖范围，请先调整赛段范围`);
    }
  });
  return errors;
}

export function validateScopeWithinParent(childScope = {}, parentScope = {}, options = {}) {
  const { labelPrefix = '参赛' } = options;
  const errors = [];
  const parent = migrateLegacyScope(parentScope);
  const child = migrateLegacyScope(childScope);
  const constraints = getParentScopeConstraints(parent);

  if (constraints.isNational) {
    return errors;
  }

  if (constraints.regionSpecified) {
    if (child.regionMode === SCOPE_MODE_ALL) {
      errors.push(`${labelPrefix}区域不能超出上级范围`);
    } else if (child.regions?.length) {
      const ok = child.regions.every((path) => isRegionPathWithin(path, constraints.regionPaths));
      if (!ok) {
        errors.push(`${labelPrefix}区域不能超出上级范围`);
      }
    }
  }

  const parentSchools = getEffectiveSchoolIds(parent);
  if (child.schoolMode === SCOPE_MODE_SPECIFIED && child.schools?.length) {
    if (!isSubset(child.schools, parentSchools)) {
      errors.push(`${labelPrefix}学校不能超出上级范围`);
    }
  }

  const parentStages = getEffectiveStages(parent);
  if (child.stageMode === SCOPE_MODE_SPECIFIED && child.stages?.length) {
    if (!isSubset(child.stages, parentStages)) {
      errors.push(`${labelPrefix}学段不能超出上级范围`);
    }
  }

  const parentGrades = getEffectiveGrades(parent);
  if (child.gradeMode === SCOPE_MODE_SPECIFIED && child.grades?.length) {
    if (!isSubset(child.grades, parentGrades)) {
      errors.push(`${labelPrefix}年级不能超出上级范围`);
    }
  }

  const parentClasses = getAvailableClassOptions(parent).map((item) => item.value);
  if (child.classMode === SCOPE_MODE_SPECIFIED && child.classes?.length) {
    if (!isSubset(child.classes, parentClasses)) {
      errors.push(`${labelPrefix}班级不能超出上级范围`);
    }
  }

  return errors;
}

export function validateStageScopeWithinCoverage(stageScope = {}, activityCoverage = {}) {
  if (stageScope?.inherit) {
    return [];
  }
  return validateScopeWithinParent(stageScope, activityCoverage, { labelPrefix: '参赛' });
}

export { REGION_OPTIONS, STAGE_OPTIONS, STAGE_GRADE_MAP, clone };
