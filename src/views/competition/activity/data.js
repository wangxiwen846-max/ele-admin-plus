/**
 * 活动管理 - 前端原型本地 Mock 数据
 */
import { reactive } from 'vue';
import {
  findEventItem,
  formatNow,
  formatRequirement,
  formatSportsDisplay,
  eventItemStore,
  clone,
  buildAwardSettingFromItem,
  cloneAwardsFromItem,
  cloneAwardConfigFromItem,
  formatAwardSettingSummary,
  formatParticipationRequirementSummary,
  formatApplicableRegionSummary,
  getAwardCount
} from '@/views/event-item/data.js';
import {
  CLASS_OPTIONS,
  SCHOOL_OPTIONS,
  createDefaultScope,
  createDefaultStageScope,
  createEmptyScope,
  formatCoverageClasses,
  formatCoverageRegions,
  formatCoverageSchools,
  formatScopeBriefSummary,
  formatScopeDetailText,
  formatScopeDisplaySummary,
  formatScopeSummary,
  getScopeDetailRows,
  getScopeEffectiveDetailRows,
  getScopeDimensionLabels,
  migrateLegacyScope,
  normalizeScope,
  getCoverageMode,
  COVERAGE_MODE_SPECIFIED,
  validateScopeConfig,
  validateCoverageAgainstStages,
  validateStageScopeWithinCoverage
} from './scope-utils.js';
import {
  CAMPUS_PUBLISH_MATCH_TYPES,
  PUBLISH_MATCH_TYPE_CLASS,
  PUBLISH_MATCH_TYPE_DAILY,
  PUBLISH_MATCH_TYPE_FINAL,
  PUBLISH_MATCH_TYPE_REGION,
  formatStagePublishMatchTypes,
  getDefaultPublishMatchTypesForStageName,
  resolveStagePublishMatchTypes
} from '@/views/competition/match-type.js';

export {
  CAMPUS_PUBLISH_MATCH_TYPES,
  PUBLISH_MATCH_TYPE_CLASS,
  PUBLISH_MATCH_TYPE_DAILY,
  PUBLISH_MATCH_TYPE_FINAL,
  PUBLISH_MATCH_TYPE_REGION,
  formatStagePublishMatchTypes,
  getDefaultPublishMatchTypesForStageName,
  resolveStagePublishMatchTypes
};

export { clone };
export {
  CLASS_OPTIONS,
  SCHOOL_OPTIONS,
  createDefaultScope,
  createDefaultStageScope,
  createEmptyScope,
  formatCoverageClasses,
  formatCoverageRegions,
  formatCoverageSchools,
  formatScopeBriefSummary,
  formatScopeDetailText,
  formatScopeDisplaySummary,
  formatScopeSummary,
  getScopeDetailRows,
  getScopeEffectiveDetailRows,
  getScopeDimensionLabels,
  getCoverageMode,
  normalizeScope,
  validateScopeConfig,
  validateCoverageAgainstStages,
  validateStageScopeWithinCoverage
};
export { REGION_OPTIONS, STAGE_OPTIONS, STAGE_GRADE_MAP } from './scope-utils.js';

export const ACTIVITY_STATUS_OPTIONS = ['未开始', '进行中', '已结束'];

/** 活动 1.0：保存即生效，无草稿/审核/发布流程；状态仅由活动时间自动计算 */
export const MOCK_OPERATOR = '赛事管理员';

let stageSeq = 100;
let committeeSeq = 100;

export function createStageId() {
  stageSeq += 1;
  return `stage_${stageSeq}`;
}

export function createDefaultStage(partial = {}) {
  return {
    stageId: createStageId(),
    stageName: '',
    startTime: '',
    endTime: '',
    scope: createDefaultStageScope(),
    threshold: '',
    chiefReferee: '',
    description: '',
    enabled: true,
    matchCount: 0,
    publishMatchTypes:
      partial.publishMatchTypes ??
      getDefaultPublishMatchTypesForStageName(partial.stageName ?? ''),
    ...partial
  };
}

export function createDefaultStages() {
  return [
    createDefaultStage({
      stageName: '校园行',
      publishMatchTypes: [
        PUBLISH_MATCH_TYPE_DAILY,
        PUBLISH_MATCH_TYPE_CLASS,
        PUBLISH_MATCH_TYPE_REGION
      ]
    }),
    createDefaultStage({
      stageName: '全国总决赛',
      publishMatchTypes: [PUBLISH_MATCH_TYPE_FINAL]
    })
  ];
}

export function createCommitteeMember(partial = {}) {
  committeeSeq += 1;
  return {
    id: partial.id ?? `cm_${committeeSeq}`,
    name: '',
    position: '',
    organization: '',
    ...partial
  };
}

function normalizeCommitteeMember(member) {
  if (typeof member === 'string') {
    const text = member.trim();
    if (!text) {
      return createCommitteeMember();
    }
    const parts = text.split(/\s+/);
    return createCommitteeMember({
      name: parts[0] || '',
      position: parts[1] || '',
      organization: parts.slice(2).join(' ') || ''
    });
  }
  return createCommitteeMember(member);
}

function normalizeCommitteeMembers(members = []) {
  return (members ?? []).map((item) => normalizeCommitteeMember(item));
}

function baseActivity() {
  return {
    activityId: void 0,
    activityName: '',
    cover: '',
    introduction: '',
    regulationText: '',
    regulationAttachments: [],
    attachments: [],
    guidingUnits: [],
    hostUnits: [],
    organizerUnits: [],
    coOrganizerUnits: [],
    supportUnits: [],
    operationServiceUnits: [],
    chiefReferee: '',
    committeeMembers: [],
    startTime: '',
    endTime: '',
    stages: createDefaultStages(),
    itemIds: [],
    coverage: createDefaultScope(),
    matchCount: 0,
    schoolCount: 0,
    studentCount: 0,
    createBy: '',
    createTime: '',
    updateBy: '',
    updateTime: '',
    matches: []
  };
}

export function createDefaultActivity() {
  return clone(baseActivity());
}

export function formatScoreRuleSummary(item) {
  if (!item) {
    return '-';
  }
  if (item.ruleDescription) {
    return item.ruleDescription.length > 36
      ? `${item.ruleDescription.slice(0, 36)}...`
      : item.ruleDescription;
  }
  return item.scoreType ? `按${item.scoreType}提交成绩` : '-';
}

/** 计分规则摘要，与设项管理配置保持一致 */
export function formatScoringRuleSummary(item) {
  if (!item || item.matchForm === '个人' || !item.scoringEnabled) {
    return '未启用';
  }
  if (item.scoringDescription?.trim()) {
    const text = item.scoringDescription.trim();
    return text.length > 36 ? `${text.slice(0, 36)}...` : text;
  }
  return item.scoringMethod || '已配置';
}

export function formatRegistrationSummary() {
  return '-';
}

export function formatQualificationSummary(item) {
  return formatParticipationRequirementSummary(item);
}

export function formatAwardSummaryForDisplay(item) {
  const count = getAwardCount(item?.awardSettings);
  if (!count) {
    return '暂无奖项';
  }
  return formatAwardSettingSummary(item?.awardSettings);
}

/** 获取比赛设项奖项（优先使用比赛级配置，否则从设项管理带出） */
export function getMatchItemAwards(match, itemId) {
  return getMatchItemAwardConfig(match, itemId).awards;
}

/** 获取比赛设项完整奖项配置（含补充说明） */
export function getMatchItemAwardConfig(match, itemId) {
  const key = String(itemId);
  if (match?.itemAwardConfig?.[key]) {
    return clone(match.itemAwardConfig[key]);
  }
  const item = findEventItem(itemId);
  const config = cloneAwardConfigFromItem(item);
  if (match?.itemAwards?.[key]?.length) {
    config.awards = clone(match.itemAwards[key]);
  }
  if (match?.itemAwardRemarks && Object.prototype.hasOwnProperty.call(match.itemAwardRemarks, key)) {
    config.awardRemark = match.itemAwardRemarks[key] ?? '';
  }
  return config;
}

/** 从设项管理复制奖项配置，供比赛发布时确认或调整（不回写设项管理） */
export function cloneAwardsForMatch(itemId, overrides = null) {
  const item = findEventItem(itemId);
  if (!item) {
    return [];
  }
  if (overrides) {
    return clone(Array.isArray(overrides) ? overrides : overrides.awards ?? []);
  }
  return cloneAwardsFromItem(item);
}

export function cloneAwardConfigForMatch(itemId, overrides = null) {
  const item = findEventItem(itemId);
  if (!item) {
    return { awards: [], awardRemark: '' };
  }
  if (overrides) {
    return clone(overrides);
  }
  return cloneAwardConfigFromItem(item);
}

export function formatMatchItemAwardSummary(match, itemId) {
  const awards = getMatchItemAwards(match, itemId);
  const count = getAwardCount(awards);
  if (!count) {
    return '暂无奖项';
  }
  return formatAwardSettingSummary(awards);
}

export function mapEventItemForActivity(item) {
  if (!item) {
    return null;
  }
  const awards = buildAwardSettingFromItem(item);
  return {
    itemId: item.itemId,
    itemName: item.itemName,
    project: formatSportsDisplay(item.sports),
    scoreType: item.scoreType || '-',
    scoringRule: formatScoringRuleSummary(item),
    registrationSetting: formatRegistrationSummary(item),
    qualification: formatQualificationSummary(item),
    applicableRegion: formatApplicableRegionSummary(item),
    awardCount: getAwardCount(awards),
    matchForm: item.matchForm || '-',
    awardCountText: getAwardCount(awards) ? `${getAwardCount(awards)} 个` : '暂无奖项',
    awardSummary: formatAwardSummaryForDisplay(item),
    awards,
    awardRemark: item.awardRemark?.trim() ?? '',
    status: item.status,
    statusText: item.status === 1 ? '启用' : '停用'
  };
}

/** 从设项管理读取可选择的设项（仅启用） */
export function getSelectableEventItems() {
  return eventItemStore.list
    .filter((d) => d.status === 1)
    .map((item) => mapEventItemForActivity(item))
    .filter(Boolean);
}

/** 设项选择弹窗：展示全部设项（含停用） */
export function getAllEventItemsForPicker() {
  return eventItemStore.list.map((item) => mapEventItemForActivity(item)).filter(Boolean);
}

/** 今天 00:00:00 */
export function getTodayStart() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/** 活动开始时间不能早于今天 */
export function isActivityStartBeforeToday(startTime) {
  if (!startTime) {
    return false;
  }
  const start = new Date(`${startTime}T00:00:00`);
  return start.getTime() < getTodayStart().getTime();
}

/** 赛段时间是否超出活动时间范围 */
export function isStageTimeOutOfActivityRange(stage, activityStart, activityEnd) {
  if (!stage?.startTime || !stage?.endTime || !activityStart || !activityEnd) {
    return false;
  }
  return stage.startTime < activityStart || stage.endTime > activityEnd;
}

export function getActivityLinkedItems(itemIds = []) {
  return itemIds
    .map((id) => mapEventItemForActivity(findEventItem(id)))
    .filter(Boolean);
}

export function formatStageDateRange(stage) {
  if (!stage?.startTime || !stage?.endTime) {
    return '未设置';
  }
  return `${stage.startTime} 至 ${stage.endTime}`;
}

export function getActivityStatus(row) {
  if (!row?.startTime || !row?.endTime) {
    return '未开始';
  }
  const now = new Date();
  const start = new Date(`${row.startTime}T00:00:00`);
  const end = new Date(`${row.endTime}T23:59:59`);
  if (now < start) {
    return '未开始';
  }
  if (now > end) {
    return '已结束';
  }
  return '进行中';
}

export function getStatusTagType(status) {
  if (status === '进行中') {
    return 'success';
  }
  if (status === '已结束') {
    return 'info';
  }
  return 'warning';
}

export function formatActivityTime(row) {
  if (!row?.startTime || !row?.endTime) {
    return '-';
  }
  return `${row.startTime} 至 ${row.endTime}`;
}

export function formatUnits(units = []) {
  if (!units?.length) {
    return '-';
  }
  return units.join('、');
}

export function getEditMode(activity) {
  const status = getActivityStatus(activity);
  const hasMatches = (activity?.matchCount ?? 0) > 0;
  if (status === '已结束') {
    return 'readonly';
  }
  if (status === '进行中') {
    return 'limited';
  }
  if (hasMatches) {
    return 'cautious';
  }
  return 'full';
}

export function validateActivityForm(form, context = {}, options = {}) {
  const step1Errors = [];
  const step2Errors = [];
  const simplified = options.simplified === true;

  if (!form.activityName?.trim()) {
    step1Errors.push('请填写活动名称');
  }
  if (!form.startTime) {
    step1Errors.push('请选择活动开始时间');
  }
  if (!form.endTime) {
    step1Errors.push('请选择活动结束时间');
  }
  if (isActivityStartBeforeToday(form.startTime)) {
    const keepExistingStart =
      options.allowExistingPastStart &&
      options.originalStartTime &&
      form.startTime === options.originalStartTime;
    if (!keepExistingStart) {
      step1Errors.push('活动开始时间不能早于今天');
    }
  }
  if (form.startTime && form.endTime && form.endTime <= form.startTime) {
    step1Errors.push('活动结束时间必须晚于活动开始时间');
  }

  const invalidRegulationPdf = (form.regulationAttachments ?? []).some((file) => {
    const name = (file.name ?? '').toLowerCase();
    return name && !name.endsWith('.pdf');
  });
  if (invalidRegulationPdf) {
    step1Errors.push('仅支持上传 PDF 文件');
  }

  if (!form.stages?.length) {
    step2Errors.push('至少保留一个赛段');
  }
  if (!simplified) {
    if (getCoverageMode(form.coverage) === COVERAGE_MODE_SPECIFIED) {
      step2Errors.push(
        ...validateScopeConfig(form.coverage, { labelPrefix: '覆盖', activitySpecified: true })
      );
    }
    step2Errors.push(...validateCoverageAgainstStages(form.coverage, form.stages));
  }
  form.stages?.forEach((stage, index) => {
    const label = stage.stageName || `第${index + 1}个赛段`;
    if (!stage.stageName?.trim()) {
      step2Errors.push(`${label}：请填写赛段名称`);
    }
    if (!stage.startTime) {
      step2Errors.push(`${label}：请选择赛段开始时间`);
    }
    if (!stage.endTime) {
      step2Errors.push(`${label}：请选择赛段结束时间`);
    }
    if (stage.startTime && stage.endTime && stage.endTime <= stage.startTime) {
      step2Errors.push(`${label}：赛段结束时间必须晚于赛段开始时间`);
    }
    if (isStageTimeOutOfActivityRange(stage, form.startTime, form.endTime)) {
      step2Errors.push(`${label}：赛段时间必须在活动时间范围内`);
    }
    if (!resolveStagePublishMatchTypes(stage).length) {
      step2Errors.push(`${label}：请至少配置一个比赛类型`);
    }
    if (!simplified) {
      step2Errors.push(...validateStageScopeWithinCoverage(stage.scope, form.coverage));
      if (!stage.scope?.inherit) {
        step2Errors.push(
          ...validateScopeConfig(stage.scope, { isStage: true, labelPrefix: '参赛' })
        );
      }
    }
  });

  const enabledItemCount = (form.itemIds ?? []).filter((id) => {
    const item = findEventItem(id);
    return item?.status === 1;
  }).length;
  if (!enabledItemCount) {
    step2Errors.push('活动设项范围至少选择一个启用设项');
  }

  step2Errors.push(...validateActivityItemScope(form, context));

  if (options.step === 1) {
    return step1Errors;
  }
  if (options.step === 2) {
    return step2Errors;
  }
  return [...step1Errors, ...step2Errors];
}

/** 根据校验错误文案判断所属步骤 */
export function resolveActivityErrorStep(message = '') {
  const step1Keywords = ['活动名称', '活动开始', '活动结束', 'PDF', '规程'];
  if (step1Keywords.some((key) => message.includes(key))) {
    return 1;
  }
  return 2;
}

/** 已被下属比赛使用的设项不可从活动设项范围移除 */
export function validateActivityItemScope(form, context = {}) {
  const usedIds = getUsedItemIds({
    itemIds: form.itemIds,
    matchCount: context.matchCount,
    matches: context.matches
  });
  const removed = usedIds.filter((id) => !(form.itemIds ?? []).includes(id));
  if (removed.length) {
    return ['已被下属比赛使用的设项不允许从活动设项范围中移除'];
  }
  return [];
}

function makeStages(stages) {
  return (stages ?? createDefaultStages()).map((stage) => {
    const next = createDefaultStage({
      ...stage,
      stageId: stage.stageId || createStageId(),
      scope: migrateLegacyScope(stage.scope, { isStage: true })
    });
    next.publishMatchTypes = resolveStagePublishMatchTypes(next);
    return next;
  });
}

function makeMatches(matches) {
  return clone(matches);
}

function makeActivity(data) {
  return {
    ...baseActivity(),
    ...data,
    regulationText: data.regulationText ?? '',
    regulationAttachments: clone(data.regulationAttachments ?? []),
    guidingUnits: clone(data.guidingUnits ?? []),
    hostUnits: clone(data.hostUnits ?? []),
    organizerUnits: clone(data.organizerUnits ?? []),
    coOrganizerUnits: clone(data.coOrganizerUnits ?? []),
    supportUnits: clone(data.supportUnits ?? []),
    operationServiceUnits: clone(data.operationServiceUnits ?? data.supportUnits ?? []),
    committeeMembers: normalizeCommitteeMembers(data.committeeMembers ?? []),
    stages: makeStages(data.stages ?? createDefaultStages()),
    itemIds: [...(data.itemIds ?? [])],
    coverage: migrateLegacyScope(data.coverage),
    matches: makeMatches(data.matches ?? [])
  };
}

export const activityStore = reactive({
  nextId: 2,
  list: [
    makeActivity({
      activityId: 1,
      activityName: '学体联全国学生健康第一大赛',
      cover: '',
      introduction:
        '面向全国中小学生开展的健康促进系列赛事活动，涵盖校园积分、区域晋级和全国总决赛三个阶段，旨在推动学生体质健康水平全面提升。',
      regulationText:
        '本规程适用于学体联全国学生健康第一大赛。赛事分为校园赛、区域赛和全国总决赛三个阶段，各阶段比赛时间、参赛范围及晋级规则以本规程及补充通知为准。',
      regulationAttachments: [
        {
          id: 'reg_1',
          name: '学体联全国学生健康第一大赛活动规程.pdf',
          type: 'PDF',
          uploadTime: '2026-01-08 10:00:00'
        }
      ],
      attachments: [
        {
          id: 'att_1',
          name: '赛事保险说明.pdf',
          type: 'PDF',
          uploadTime: '2026-01-08 10:30:00'
        },
        {
          id: 'att_2',
          name: '赛事通知.docx',
          type: 'Word',
          uploadTime: '2026-01-09 09:00:00'
        }
      ],
      guidingUnits: [],
      hostUnits: [],
      organizerUnits: [],
      coOrganizerUnits: [],
      supportUnits: [],
      operationServiceUnits: [],
      chiefReferee: '',
      committeeMembers: [],
      startTime: '2026-08-01',
      endTime: '2027-09-30',
      stages: [
        {
          stageId: 'stage_1',
          stageName: '校园行',
          startTime: '2026-08-01',
          endTime: '2027-06-30',
          scope: createDefaultStageScope(),
          description: '校园内开展的基础积分与晋级赛事。',
          enabled: true,
          matchCount: 6,
          publishMatchTypes: [
            PUBLISH_MATCH_TYPE_DAILY,
            PUBLISH_MATCH_TYPE_CLASS,
            PUBLISH_MATCH_TYPE_REGION
          ]
        },
        {
          stageId: 'stage_3',
          stageName: '全国总决赛',
          startTime: '2027-07-01',
          endTime: '2027-09-30',
          scope: createDefaultStageScope(),
          description: '全国范围最终决赛阶段。',
          enabled: true,
          matchCount: 1,
          publishMatchTypes: [PUBLISH_MATCH_TYPE_FINAL]
        }
      ],
      itemIds: [1, 2, 7],
      coverage: createDefaultScope(),
      matchCount: 7,
      schoolCount: 186,
      studentCount: 8200,
      createBy: '赛事管理员',
      createTime: '2026-01-10 09:00:00',
      updateBy: '赛事管理员',
      updateTime: '2026-03-15 16:20:00',
      matches: [
        {
          matchId: 'm1',
          matchName: '海淀区校园跳绳积分赛',
          stageId: 'stage_1',
          stageName: '校园行',
          matchType: '班班赛',
          startTime: '2026-08-15',
          endTime: '2026-12-30',
          regStartTime: '2026-08-01 00:00',
          regEndTime: '2026-09-20 23:59',
          matchStatus: '进行中',
          registrationStatus: '报名中',
          itemCount: 2,
          itemIds: [1],
          registrationCount: 1280,
          itemAwards: {
            1: [
              { id: 'match_award_1', awardName: '冠军', awardRule: '第1名', awardTarget: '个人' },
              { id: 'match_award_2', awardName: '亚军', awardRule: '第2名', awardTarget: '个人' },
              { id: 'match_award_3', awardName: '参与奖', awardRule: '完成比赛', awardTarget: '个人' }
            ]
          },
          itemAwardRemarks: {
            1: '本比赛奖项以发布时确认配置为准，并列名次按现场裁判组判定。'
          }
        },
        {
          matchId: 'm2',
          matchName: '3v3篮球班级对抗赛',
          stageId: 'stage_1',
          stageName: '校园行',
          matchType: '班班赛',
          startTime: '2026-09-01',
          endTime: '2027-03-31',
          regStartTime: '2026-08-20 09:00',
          regEndTime: '2026-10-31 18:00',
          matchStatus: '进行中',
          registrationStatus: '报名中',
          itemCount: 1,
          itemIds: [2],
          registrationCount: 48
        },
        {
          matchId: 'm3',
          matchName: '朝阳区校园积分赛',
          stageId: 'stage_1',
          stageName: '校园行',
          matchType: '班班赛',
          startTime: '2026-08-01',
          endTime: '2027-06-30',
          regStartTime: '2026-07-01 00:00',
          regEndTime: '2026-07-31 23:59',
          matchStatus: '进行中',
          registrationStatus: '已截止',
          itemCount: 3,
          itemIds: [1, 7],
          registrationCount: 960
        },
        {
          matchId: 'm4',
          matchName: '海淀区区域跳绳挑战赛',
          stageId: 'stage_1',
          stageName: '校园行',
          matchType: '区域赛',
          startTime: '2027-03-01',
          endTime: '2027-05-20',
          matchStatus: '未开始',
          registrationStatus: '未开始',
          itemCount: 2,
          itemIds: [1, 2],
          registrationCount: 0
        },
        {
          matchId: 'm5',
          matchName: '北京市区域跳绳挑战赛',
          stageId: 'stage_1',
          stageName: '校园行',
          matchType: '区域赛',
          startTime: '2027-04-01',
          endTime: '2027-06-15',
          matchStatus: '未开始',
          registrationStatus: '未开始',
          itemCount: 1,
          itemIds: [1],
          registrationCount: 0
        },
        {
          matchId: 'm6',
          matchName: '海淀区每日积分赛',
          matchType: '每日积分赛',
          stageId: 'stage_1',
          stageName: '校园行',
          startTime: '2026-09-01 00:00',
          endTime: '2027-06-30 23:59',
          matchStatus: '进行中',
          itemIds: [],
          registrationCount: 3200,
          personCount: 3200
        },
        {
          matchId: 'm7',
          matchName: '全国总决赛跳绳精英赛',
          stageId: 'stage_3',
          stageName: '全国总决赛',
          matchType: '全国总决赛',
          startTime: '2027-07-10',
          endTime: '2027-09-15',
          regStartTime: '2027-06-01 00:00',
          regEndTime: '2027-06-30 23:59',
          matchStatus: '未开始',
          registrationStatus: '未开始',
          itemCount: 1,
          itemIds: [1],
          registrationCount: 0
        }
      ]
    })
  ]
});

export function findActivity(id) {
  return activityStore.list.find((d) => d.activityId === Number(id));
}

export function saveActivity(form, activityId) {
  const payload = makeActivity(form);
  const now = formatNow();
  if (activityId) {
    const index = activityStore.list.findIndex((d) => d.activityId === Number(activityId));
    if (index === -1) {
      return null;
    }
    const prev = activityStore.list[index];
    payload.activityId = prev.activityId;
    payload.createBy = prev.createBy || MOCK_OPERATOR;
    payload.createTime = prev.createTime;
    payload.updateBy = MOCK_OPERATOR;
    payload.updateTime = now;
    payload.matchCount = prev.matchCount;
    payload.schoolCount = prev.schoolCount;
    payload.studentCount = prev.studentCount;
    payload.matches = prev.matches;
    activityStore.list.splice(index, 1, payload);
    return payload;
  }
  payload.activityId = activityStore.nextId++;
  payload.createBy = MOCK_OPERATOR;
  payload.createTime = now;
  payload.updateBy = MOCK_OPERATOR;
  payload.updateTime = now;
  if (!payload.schoolCount) {
    payload.schoolCount = Math.floor(Math.random() * 20);
  }
  if (!payload.studentCount) {
    payload.studentCount = Math.floor(Math.random() * 500);
  }
  activityStore.list.unshift(payload);
  return payload;
}

export function computeMatchStatus(match, activity) {
  const activityStatus = getActivityStatus(activity);
  if (activityStatus === '未开始') {
    return '未开始';
  }
  if (activityStatus === '已结束') {
    return '已结束';
  }
  if (!match?.startTime || !match?.endTime) {
    return '未开始';
  }
  const now = new Date();
  const start = new Date(`${match.startTime}T00:00:00`);
  const end = new Date(`${match.endTime}T23:59:59`);
  if (now < start) {
    return '未开始';
  }
  if (now > end) {
    return '已结束';
  }
  return '进行中';
}

export function enrichMatchesWithStatus(matches = [], activity) {
  return (matches ?? []).map((match) => ({
    ...match,
    matchStatus: computeMatchStatus(match, activity)
  }));
}

export function getMatchStats(matches = [], activity = null) {
  const list = activity ? enrichMatchesWithStatus(matches, activity) : matches;
  return {
    notStarted: list.filter((d) => d.matchStatus === '未开始').length,
    inProgress: list.filter((d) => d.matchStatus === '进行中').length,
    ended: list.filter((d) => d.matchStatus === '已结束').length
  };
}

export function getUsedItemIds(activity) {
  const used = new Set();
  (activity?.matches ?? []).forEach((match) => {
    (match.itemIds ?? []).forEach((id) => used.add(Number(id)));
  });
  return [...used];
}

/** 发布比赛时可选择的活动列表（保存即生效，无草稿/审核） */
export function getSelectableActivities() {
  return activityStore.list.map((item) => ({
    activityId: item.activityId,
    activityName: item.activityName,
    status: getActivityStatus(item),
    startTime: item.startTime,
    endTime: item.endTime,
    itemIds: item.itemIds ?? []
  }));
}

export function copyActivityData(source) {
  const data = clone(source);
  delete data.activityId;
  delete data.createBy;
  delete data.createTime;
  delete data.updateBy;
  delete data.updateTime;
  delete data.matchCount;
  delete data.schoolCount;
  delete data.studentCount;
  delete data.matches;
  data.activityName = `${data.activityName}-副本`;
  data.regulationText = '';
  data.regulationAttachments = [];
  data.attachments = [];
  data.startTime = '';
  data.endTime = '';
  data.stages = (data.stages ?? []).map((stage) =>
    createDefaultStage({
      ...stage,
      stageId: createStageId(),
      startTime: '',
      endTime: '',
      matchCount: 0
    })
  );
  return data;
}
