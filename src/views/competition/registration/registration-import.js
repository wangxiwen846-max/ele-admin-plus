/**
 * 参赛名单 Excel 导入：模板下载、解析、校验、写入
 */
import ExcelJS from 'exceljs';
import { download } from '@/utils/common.js';
import { findEventItem, buildRegistrationSettingFromItem } from '@/views/event-item/data.js';
import {
  PARTICIPANT_EXPORT_COLUMNS,
  STUDENT_OPTIONS,
  addPersonalEntry,
  addTeamEntry,
  getItemOptionsByMatch,
  getItemRegisteredCount,
  isStudentRegisteredInItem,
  registrationStore,
  validateParticipantNumberInput
} from './data.js';

export const PERSONAL_IMPORT_TEMPLATE_NAME = '个人赛参赛名单导入模板.xlsx';
export const TEAM_IMPORT_TEMPLATE_NAME = '团体赛参赛名单导入模板.xlsx';

/**
 * 模板字段动态生成：
 * - 已选择的范围字段（学校 / 年级 / 班级）不出现在模板中；
 * - 未选择的范围字段出现在模板中；
 * - 模板不含比赛/设项相关信息，也不含联系电话、学号、证件号、组别、性别组。
 */
/** 返回需要出现在模板中的范围字段（未选择的部分），顺序：学校 → 年级 → 班级 */
function getScopeTemplateFields(scope = {}) {
  const fields = [];
  if (!scope.school) {
    fields.push('学校');
  }
  if (!scope.grade) {
    fields.push('年级');
  }
  if (!scope.className) {
    fields.push('班级');
  }
  return fields;
}

/** 按比赛形式 + 导入范围返回模板字段 */
export function getTemplateFields(matchForm, scope = {}) {
  const scopeFields = getScopeTemplateFields(scope);
  if (matchForm === '团体') {
    return ['队伍名称', '成员参赛编号', '成员姓名', ...scopeFields, '班内序号', '性别', '备注'];
  }
  return ['参赛编号', '学生姓名', ...scopeFields, '班内序号', '性别', '备注'];
}

/** 模板列（含 label 与字段 key），供在线预览编辑表格使用 */
export function getTemplateColumns(matchForm, scope = {}) {
  return getTemplateFields(matchForm, scope).map((label) => ({
    label,
    key: HEADER_MAP[label]
  }));
}

// 统一表头 -> 字段 key 映射
const HEADER_MAP = {
  参赛编号: 'participantNumber',
  成员参赛编号: 'participantNumber',
  学生姓名: 'studentName',
  成员姓名: 'memberName',
  学校: 'school',
  年级: 'grade',
  班级: 'className',
  班内序号: 'classNo',
  队伍名称: 'teamName',
  性别: 'gender',
  备注: 'remark'
};

// 字段 key -> 展示名称（用于错误明细，区分个人 / 团体）
const PERSONAL_FIELD_LABEL = {
  participantNumber: '参赛编号',
  studentName: '学生姓名',
  school: '学校',
  grade: '年级',
  className: '班级',
  classNo: '班内序号',
  gender: '性别',
  remark: '备注'
};
const TEAM_FIELD_LABEL = {
  participantNumber: '成员参赛编号',
  memberName: '成员姓名',
  school: '学校',
  grade: '年级',
  className: '班级',
  classNo: '班内序号',
  teamName: '队伍名称',
  gender: '性别',
  remark: '备注'
};

/** 将已选择的范围字段注入行数据（未在模板中出现的范围字段由导入范围补齐） */
function applyScopeToRow(row, scope = {}) {
  if (scope.school) {
    row.school = scope.school;
  }
  if (scope.grade) {
    row.grade = scope.grade;
  }
  if (scope.className) {
    row.className = scope.className;
  }
}

/**
 * 必填字段：姓名、班内序号必填；未通过导入范围确定的学校/年级/班级需在模板中填写。
 */
function getRequiredKeys(matchForm, scope = {}) {
  const scopeKeys = ['school', 'grade', 'className'].filter((key) => !scope[key]);
  if (matchForm === '团体') {
    return ['teamName', 'memberName', ...scopeKeys, 'classNo'];
  }
  return ['studentName', ...scopeKeys, 'classNo'];
}

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, '');
}

function normalizeClassName(value) {
  return normalizeText(value).replace(/班/g, '班');
}

function matchStudent({ school, grade, className, classNo, name }) {
  const candidates = STUDENT_OPTIONS.filter(
    (student) =>
      student.school === String(school || '').trim() &&
      student.grade === String(grade || '').trim() &&
      normalizeClassName(student.className) === normalizeClassName(className) &&
      student.name === String(name || '').trim()
  );
  if (!candidates.length) {
    return null;
  }
  // 同班同名时用班内序号进一步区分
  if (classNo) {
    return candidates.find((student) => String(student.classNo) === String(classNo).trim()) ?? null;
  }
  return candidates.length === 1 ? candidates[0] : null;
}

function getCellText(cell) {
  if (!cell || cell.value == null) {
    return '';
  }
  if (typeof cell.value === 'object' && cell.value.text) {
    return String(cell.value.text).trim();
  }
  return String(cell.value).trim();
}

async function buildWorkbook(headers, sampleRows, sheetName) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.addRow(headers);
  sampleRows.forEach((row) => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true };
  sheet.columns.forEach((column) => {
    column.width = 16;
  });
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

// 模板示例值（按表头标签取值；参赛编号可留空，导入后自动生成）
const SAMPLE_VALUES = {
  参赛编号: 'HD00001',
  成员参赛编号: 'HD00001',
  学生姓名: '王小明',
  成员姓名: '王小明',
  学校: '第一实验小学',
  年级: '五年级',
  班级: '3班',
  班内序号: '1',
  队伍名称: '五年级跳绳队',
  性别: '男',
  备注: '-'
};

function buildSampleRow(fields, overrides = {}) {
  return fields.map((label) => overrides[label] ?? SAMPLE_VALUES[label] ?? '');
}

export async function downloadImportTemplate(matchForm, scope = {}) {
  const fields = getTemplateFields(matchForm, scope);
  if (matchForm === '团体') {
    const sampleRows = [
      buildSampleRow(fields),
      buildSampleRow(fields, {
        参赛编号: 'HD00002',
        成员参赛编号: 'HD00002',
        学生姓名: '李思雨',
        成员姓名: '李思雨',
        班内序号: '2'
      })
    ];
    const buffer = await buildWorkbook(fields, sampleRows, '团体赛名单');
    download(buffer, TEAM_IMPORT_TEMPLATE_NAME, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return TEAM_IMPORT_TEMPLATE_NAME;
  }
  const buffer = await buildWorkbook(fields, [buildSampleRow(fields)], '个人赛名单');
  download(buffer, PERSONAL_IMPORT_TEMPLATE_NAME, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  return PERSONAL_IMPORT_TEMPLATE_NAME;
}

function parseSheetRows(worksheet, headerMap, expectedHeaders) {
  const headerRow = worksheet.getRow(1);
  const headers = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber - 1] = getCellText(cell);
  });
  const trimmedHeaders = headers.map((item) => String(item || '').trim()).filter(Boolean);
  const missing = expectedHeaders.filter((header) => !trimmedHeaders.includes(header));
  if (missing.length) {
    throw new Error(`模板列缺失：${missing.join('、')}`);
  }
  const indexMap = {};
  expectedHeaders.forEach((header) => {
    indexMap[headerMap[header]] = trimmedHeaders.indexOf(header);
  });

  const rows = [];
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }
    const record = { rowNo: rowNumber };
    let hasValue = false;
    Object.entries(headerMap).forEach(([header, key]) => {
      const colIndex = indexMap[key];
      const value = colIndex >= 0 ? getCellText(row.getCell(colIndex + 1)) : '';
      record[key] = value;
      if (value) {
        hasValue = true;
      }
    });
    if (hasValue) {
      rows.push(record);
    }
  });
  return rows;
}

function pushError(errors, row, fieldKey, reason, fieldLabelMap) {
  const record = row && typeof row === 'object' ? row : { rowNo: row };
  errors.push({
    rowNo: record.rowNo ?? 0,
    fieldKey,
    fieldName: fieldLabelMap[fieldKey] || fieldKey,
    reason,
    teamName: record.teamName || '',
    name: record.memberName || record.studentName || '',
    classNo: record.classNo || ''
  });
}

function validatePersonalRows(rows, matchId, itemId, scope = {}) {
  const errors = [];
  const validRows = [];
  const seenKeys = new Set();
  const fileParticipantNumbers = new Map();
  const requiredKeys = getRequiredKeys('个人', scope);

  rows.forEach((row) => {
    // 已选择的范围字段由导入范围补齐
    applyScopeToRow(row, scope);

    const rowErrors = [];
    requiredKeys.forEach((key) => {
      if (!String(row[key] || '').trim()) {
        rowErrors.push(key);
        pushError(errors, row, key, '必填字段不能为空', PERSONAL_FIELD_LABEL);
      }
    });

    if (rowErrors.length) {
      return;
    }

    const student = matchStudent({
      school: row.school,
      grade: row.grade,
      className: row.className,
      classNo: row.classNo,
      name: row.studentName
    });
    if (!student) {
      pushError(errors, row, 'studentName', '无法匹配学生库，请核对学校、年级、班级、班内序号、姓名', PERSONAL_FIELD_LABEL);
      return;
    }

    const dupKey = `${row.school}|${row.grade}|${row.className}|${row.classNo}|${row.studentName}`;
    if (seenKeys.has(dupKey)) {
      pushError(errors, row, 'studentName', '导入文件中存在重复学生', PERSONAL_FIELD_LABEL);
      return;
    }
    seenKeys.add(dupKey);

    if (isStudentRegisteredInItem(matchId, itemId, student.studentId)) {
      pushError(errors, row, 'studentName', '该学生已在当前比赛设项报名', PERSONAL_FIELD_LABEL);
      return;
    }

    const participantNumber = String(row.participantNumber || '').trim();
    if (participantNumber) {
      const previousStudent = fileParticipantNumbers.get(participantNumber);
      if (previousStudent && previousStudent !== student.studentId) {
        pushError(errors, row, 'participantNumber', '导入文件中参赛编号重复', PERSONAL_FIELD_LABEL);
        return;
      }
      fileParticipantNumbers.set(participantNumber, student.studentId);
      const check = validateParticipantNumberInput(matchId, participantNumber, {
        studentId: student.studentId
      });
      if (!check.valid) {
        pushError(errors, row, 'participantNumber', check.reason, PERSONAL_FIELD_LABEL);
        return;
      }
    }

    validRows.push({ ...row, student, participantNumber });
  });

  // 报名人数限制：已报名 + 本次导入通过人数不得超过设项上限
  checkRegistrationLimit(errors, matchId, itemId, validRows.length, PERSONAL_FIELD_LABEL);

  return { errors, validRows };
}

function validateTeamRows(rows, matchId, itemId, scope = {}) {
  const errors = [];
  const validRows = [];
  const teamMemberKeys = new Map();
  const fileParticipantNumbers = new Map();
  const requiredKeys = getRequiredKeys('团体', scope);

  rows.forEach((row) => {
    // 已选择的范围字段由导入范围补齐
    applyScopeToRow(row, scope);

    const requiredMissing = requiredKeys.filter((key) => !String(row[key] || '').trim());
    if (requiredMissing.length) {
      requiredMissing.forEach((key) => {
        pushError(errors, row, key, '必填字段不能为空', TEAM_FIELD_LABEL);
      });
      return;
    }

    const teamKey = String(row.teamName).trim();
    const student = matchStudent({
      school: row.school,
      grade: row.grade,
      className: row.className,
      classNo: row.classNo,
      name: row.memberName
    });
    if (!student) {
      pushError(errors, row, 'memberName', '无法匹配学生库，请核对学校、年级、班级、班内序号、姓名', TEAM_FIELD_LABEL);
      return;
    }

    const memberKey = `${teamKey}|${student.studentId}`;
    if (!teamMemberKeys.has(teamKey)) {
      teamMemberKeys.set(teamKey, new Set());
    }
    const members = teamMemberKeys.get(teamKey);
    if (members.has(memberKey)) {
      pushError(errors, row, 'memberName', '同一团队下成员不可重复', TEAM_FIELD_LABEL);
      return;
    }
    members.add(memberKey);

    if (isStudentRegisteredInItem(matchId, itemId, student.studentId)) {
      pushError(errors, row, 'memberName', '该学生已在当前比赛设项报名', TEAM_FIELD_LABEL);
      return;
    }

    const participantNumber = String(row.participantNumber || '').trim();
    if (participantNumber) {
      const previousStudent = fileParticipantNumbers.get(participantNumber);
      if (previousStudent && previousStudent !== student.studentId) {
        pushError(errors, row, 'participantNumber', '导入文件中成员参赛编号重复', TEAM_FIELD_LABEL);
        return;
      }
      fileParticipantNumbers.set(participantNumber, student.studentId);
      const check = validateParticipantNumberInput(matchId, participantNumber, {
        studentId: student.studentId
      });
      if (!check.valid) {
        pushError(errors, row, 'participantNumber', check.reason, TEAM_FIELD_LABEL);
        return;
      }
    }

    validRows.push({ ...row, student, teamKey, participantNumber });
  });

  if (!rows.length) {
    pushError(errors, { rowNo: 0 }, 'teamName', '团体报名数据不能为空', TEAM_FIELD_LABEL);
  }

  // 团队人数限制：每个队伍成员数需符合设项配置的最小 / 最大人数
  checkTeamMemberLimit(errors, itemId, validRows);
  // 报名人数限制：已报名 + 本次导入通过成员数不得超过设项上限
  checkRegistrationLimit(errors, matchId, itemId, validRows.length, TEAM_FIELD_LABEL);

  return { errors, validRows };
}

/** 读取设项的报名人数上限与团队人数限制配置 */
function getItemLimits(itemId) {
  const item = findEventItem(itemId);
  if (!item) {
    return {
      regLimitEnabled: false,
      regLimitCount: null,
      teamLimitEnabled: false,
      teamMin: null,
      teamMax: null
    };
  }
  const reg = buildRegistrationSettingFromItem(item);
  return {
    regLimitEnabled: !!reg.limitEnabled,
    regLimitCount: reg.limitCount,
    teamLimitEnabled: !!item.enableTeamMemberLimit,
    teamMin: item.enableTeamMemberLimit ? (item.teamMin ?? null) : null,
    teamMax: item.enableTeamMemberLimit ? (item.teamMax ?? null) : null
  };
}

/** 报名人数限制校验（全局错误） */
function checkRegistrationLimit(errors, matchId, itemId, passCount, fieldLabelMap) {
  const { regLimitEnabled, regLimitCount } = getItemLimits(itemId);
  if (!regLimitEnabled || regLimitCount == null || regLimitCount <= 0 || passCount <= 0) {
    return;
  }
  const current = getItemRegisteredCount(matchId, itemId);
  const total = current + passCount;
  if (total > regLimitCount) {
    pushError(
      errors,
      { rowNo: 0 },
      'registerLimit',
      `报名人数超出设项上限：已报名 ${current} 人，本次通过 ${passCount} 人，合计 ${total} 人，上限 ${regLimitCount} 人`,
      { ...fieldLabelMap, registerLimit: '报名人数' }
    );
  }
}

/** 团队人数限制校验（按队伍名称分组） */
function checkTeamMemberLimit(errors, itemId, validRows) {
  const { teamLimitEnabled, teamMin, teamMax } = getItemLimits(itemId);
  if (!teamLimitEnabled) {
    return;
  }
  const teamGroups = new Map();
  validRows.forEach((row) => {
    if (!teamGroups.has(row.teamKey)) {
      teamGroups.set(row.teamKey, []);
    }
    teamGroups.get(row.teamKey).push(row);
  });
  teamGroups.forEach((group, teamKey) => {
    const count = group.length;
    let reason = '';
    if (teamMin != null && count < teamMin) {
      reason = `团队「${teamKey}」成员 ${count} 人，少于设项最小人数 ${teamMin} 人`;
    } else if (teamMax != null && count > teamMax) {
      reason = `团队「${teamKey}」成员 ${count} 人，超过设项最大人数 ${teamMax} 人`;
    }
    if (reason) {
      pushError(errors, group[0], 'teamName', reason, TEAM_FIELD_LABEL);
    }
  });
}

export const PARTICIPANT_EXPORT_NAME = '参赛名单.xlsx';

/** 导出参赛名单（rows 为当前筛选后的主列表数据） */
export async function exportParticipants(rows = []) {
  const headers = PARTICIPANT_EXPORT_COLUMNS.map((column) => column.label);
  const dataRows = rows.map((row) =>
    PARTICIPANT_EXPORT_COLUMNS.map((column) => {
      const value = row[column.prop];
      return value == null || value === '' ? '-' : String(value);
    })
  );
  const buffer = await buildWorkbook(headers, dataRows, '参赛名单');
  download(buffer, PARTICIPANT_EXPORT_NAME, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  return PARTICIPANT_EXPORT_NAME;
}

export async function parseImportFile(file, matchForm, scope = {}) {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('Excel 文件中没有可用工作表');
  }
  return parseSheetRows(worksheet, HEADER_MAP, getTemplateFields(matchForm, scope));
}

export function validateImportRows(rows, matchForm, matchId, itemId, scope = {}) {
  const totalCount = rows.length;
  if (!totalCount) {
    return {
      totalCount: 0,
      successCount: 0,
      errorCount: 1,
      errors: [{ rowNo: 0, fieldName: '-', reason: '导入文件中没有有效数据' }],
      validRows: []
    };
  }

  const result =
    matchForm === '团体'
      ? validateTeamRows(rows, matchId, itemId, scope)
      : validatePersonalRows(rows, matchId, itemId, scope);

  const errorCount = result.errors.length;
  // 只统计真实数据行（rowNo > 1，首行为表头）作为失败行，全局错误（如人数超限）不计入失败行数
  const failedRowNos = new Set(
    result.errors.map((item) => item.rowNo).filter((rowNo) => Number(rowNo) > 1)
  );
  const successCount = totalCount - failedRowNos.size;

  return {
    totalCount,
    successCount: Math.max(successCount, 0),
    errorCount,
    errors: result.errors,
    validRows: result.validRows
  };
}

export function confirmImportRows(validRows, matchForm, matchId, itemId) {
  if (matchForm === '团体') {
    const teamMap = new Map();
    validRows.forEach((row) => {
      if (!teamMap.has(row.teamKey)) {
        teamMap.set(row.teamKey, {
          teamName: row.teamName,
          school: row.school,
          remark: row.remark || '',
          memberParticipantNumbers: {},
          memberIds: []
        });
      }
      const team = teamMap.get(row.teamKey);
      if (row.participantNumber) {
        team.memberParticipantNumbers[row.student.studentId] = row.participantNumber;
      }
      if (!team.memberIds.includes(row.student.studentId)) {
        team.memberIds.push(row.student.studentId);
      }
    });
    teamMap.forEach((team) => {
      addTeamEntry({
        matchId,
        itemId,
        teamName: team.teamName,
        school: team.school,
        memberIds: team.memberIds,
        remark: team.remark,
        memberParticipantNumbers: team.memberParticipantNumbers
      });
    });
    return teamMap.size;
  }

  validRows.forEach((row) => {
    addPersonalEntry({
      matchId,
      itemId,
      studentId: row.student.studentId,
      phone: row.phone || '',
      remark: row.remark || '',
      participantNumber: row.participantNumber || undefined
    });
  });
  return validRows.length;
}

export function appendImportLog(payload) {
  registrationStore.importLogs.unshift({
    logId: `log_${Date.now()}`,
    importTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    operator: '赛事专员',
    itemName: payload.itemName || '',
    importType: payload.importType || '',
    totalCount: payload.totalCount || 0,
    successCount: payload.successCount || 0,
    errorCount: payload.errorCount || 0,
    status: payload.errorCount ? '部分成功' : '成功'
  });
}

export function getItemMatchForm(matchId, itemId) {
  const item = getItemOptionsByMatch(matchId).find((row) => String(row.itemId) === String(itemId));
  return item?.matchForm || '';
}
