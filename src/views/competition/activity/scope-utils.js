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

export function getSchoolsByRegions(regionPaths = []) {
  if (!regionPaths.length) {
    return [...SCHOOL_OPTIONS];
  }
  return SCHOOL_OPTIONS.filter((school) =>
    regionPaths.some((path) => isRegionPathWithin(school.region, [path]))
  );
}

function getEffectiveRegions(scope = {}, parentScope = null) {
  if (parentScope?.regionMode === SCOPE_MODE_SPECIFIED && parentScope.regions?.length) {
    return parentScope.regions;
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

function formatRegionShortLabel(path = []) {
  const labels = getRegionLabelList([path]);
  const text = labels[0] ?? '';
  const parts = text.split(' / ');
  return parts[parts.length - 1] || text;
}

function formatRegionSummary(scope = {}) {
  if (scope.regionMode === SCOPE_MODE_ALL) {
    return '全国';
  }
  if (!scope.regions?.length) {
    return '';
  }
  if (scope.regions.length <= 2) {
    return scope.regions.map((path) => formatRegionShortLabel(path)).join('、');
  }
  return `${scope.regions.length}个区域`;
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

export function isScopeAllNational(scope = {}) {
  return (
    scope.regionMode === SCOPE_MODE_ALL &&
    scope.schoolMode === SCOPE_MODE_ALL &&
    scope.stageMode === SCOPE_MODE_ALL &&
    scope.gradeMode === SCOPE_MODE_ALL &&
    scope.classMode === SCOPE_MODE_ALL
  );
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
  const { isStage = false } = options;
  const normalized = migrateLegacyScope(scope, { isStage });
  if (isStage && normalized.inherit) {
    return '继承活动覆盖范围';
  }

  if (isScopeAllNational(normalized)) {
    return '全国范围';
  }

  const regionText = formatRegionSummary(normalized);
  const stageText = formatStageEduSummary(normalized);
  const gradeText = formatGradeSummary(normalized);
  const hasClassFilter =
    normalized.classMode === SCOPE_MODE_SPECIFIED && normalized.classes?.length;

  if (
    normalized.schoolMode === SCOPE_MODE_ALL &&
    !stageText &&
    !gradeText &&
    !hasClassFilter
  ) {
    return `${regionText}全部学校`;
  }

  if (
    normalized.schoolMode === SCOPE_MODE_SPECIFIED &&
    normalized.schools?.length &&
    !stageText &&
    !gradeText &&
    !hasClassFilter
  ) {
    const schoolPart = formatSchoolSummary(normalized);
    return `${regionText} ${schoolPart}`.replace(/\s+/g, ' ').trim();
  }

  if (stageText) {
    const parts = [regionText];
    if (normalized.schoolMode === SCOPE_MODE_SPECIFIED && normalized.schools?.length) {
      parts.push(formatSchoolSummary(normalized));
    }
    parts.push(`${stageText}阶段`);
    if (normalized.gradeMode === SCOPE_MODE_SPECIFIED && gradeText) {
      parts.push(gradeText);
    }
    return `${parts.join('，')}学生`;
  }

  const parts = [regionText];
  if (normalized.schoolMode === SCOPE_MODE_ALL) {
    parts.push('全部学校');
  } else if (normalized.schools?.length) {
    parts.push(formatSchoolSummary(normalized));
  }
  if (stageText) {
    parts.push(stageText);
  }
  if (gradeText) {
    parts.push(gradeText);
  }
  return parts.join('，');
}

export function getScopeDetailRows(scope = {}, options = {}) {
  const { isStage = false, labelPrefix = '覆盖' } = options;
  const normalized = migrateLegacyScope(scope, { isStage });
  if (isStage && normalized.inherit) {
    return [];
  }
  const labels = getScopeDimensionLabels(normalized, options);
  const rows = [
    { level: `${labelPrefix}区域`, content: labels.region },
    { level: `${labelPrefix}学校`, content: labels.school },
    { level: `${labelPrefix}学段`, content: labels.stage },
    { level: `${labelPrefix}年级`, content: labels.grade },
    { level: `${labelPrefix}班级`, content: labels.class }
  ];
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
  return `覆盖区域：${labels.region}；学校：${labels.school}；学段：${labels.stage}；年级：${labels.grade}；班级：${labels.class}`;
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
  const needRegion =
    activitySpecified || scope.regionMode === SCOPE_MODE_SPECIFIED;
  if (needRegion && !scope.regions?.length) {
    errors.push(`请选择${labelPrefix}区域`);
  }
  if (scope.schoolMode === SCOPE_MODE_SPECIFIED && !scope.schools?.length) {
    errors.push(`请选择${labelPrefix}学校`);
  }
  if (scope.stageMode === SCOPE_MODE_SPECIFIED && !scope.stages?.length) {
    errors.push(`请选择${labelPrefix}学段`);
  }
  if (scope.gradeMode === SCOPE_MODE_SPECIFIED && !scope.grades?.length) {
    errors.push(`请选择${labelPrefix}年级`);
  }
  if (scope.classMode === SCOPE_MODE_SPECIFIED && !scope.classes?.length) {
    errors.push(`请选择${labelPrefix}班级`);
  }
  return errors;
}

export function validateStageScopeWithinCoverage(stageScope = {}, activityCoverage = {}) {
  if (stageScope?.inherit) {
    return [];
  }
  const errors = [];
  const parent = migrateLegacyScope(activityCoverage);
  const child = migrateLegacyScope(stageScope);

  if (parent.regionMode === SCOPE_MODE_SPECIFIED && parent.regions?.length) {
    if (child.regionMode === SCOPE_MODE_SPECIFIED && child.regions?.length) {
      const ok = child.regions.every((path) => isRegionPathWithin(path, parent.regions));
      if (!ok) {
        errors.push('赛段参赛区域不能超出活动覆盖区域');
      }
    }
  }

  const parentSchools = getEffectiveSchoolIds(parent);
  if (child.schoolMode === SCOPE_MODE_SPECIFIED && child.schools?.length) {
    if (!isSubset(child.schools, parentSchools)) {
      errors.push('赛段参赛学校不能超出活动覆盖学校范围');
    }
  }

  const parentStages = getEffectiveStages(parent);
  if (child.stageMode === SCOPE_MODE_SPECIFIED && child.stages?.length) {
    if (!isSubset(child.stages, parentStages)) {
      errors.push('赛段参赛学段不能超出活动覆盖学段范围');
    }
  }

  const parentGrades = getEffectiveGrades(parent);
  if (child.gradeMode === SCOPE_MODE_SPECIFIED && child.grades?.length) {
    if (!isSubset(child.grades, parentGrades)) {
      errors.push('赛段参赛年级不能超出活动覆盖年级范围');
    }
  }

  const parentClasses = getAvailableClassOptions(parent).map((item) => item.value);
  if (child.classMode === SCOPE_MODE_SPECIFIED && child.classes?.length) {
    if (!isSubset(child.classes, parentClasses)) {
      errors.push('赛段参赛班级不能超出活动覆盖班级范围');
    }
  }

  return errors;
}

export { REGION_OPTIONS, STAGE_OPTIONS, STAGE_GRADE_MAP, clone };
