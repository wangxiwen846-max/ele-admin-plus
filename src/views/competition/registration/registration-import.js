/**
 * 参赛名单 Excel 导入：模板下载、解析、校验、写入
 */
import ExcelJS from 'exceljs';
import { download } from '@/utils/common.js';
import {
  PERSONAL_IMPORT_FIELDS,
  TEAM_IMPORT_FIELDS,
  STUDENT_OPTIONS,
  addPersonalEntry,
  addTeamEntry,
  getItemOptionsByMatch,
  isStudentRegisteredInItem,
  registrationStore
} from './data.js';

export const PERSONAL_IMPORT_TEMPLATE_NAME = '个人赛参赛名单导入模板.xlsx';
export const TEAM_IMPORT_TEMPLATE_NAME = '团体赛参赛名单导入模板.xlsx';

const PERSONAL_HEADER_MAP = {
  学校: 'school',
  年级: 'grade',
  班级: 'className',
  学生姓名: 'studentName',
  学号: 'studentNo',
  性别: 'gender',
  联系电话: 'phone',
  备注: 'remark'
};

const TEAM_HEADER_MAP = {
  学校: 'school',
  年级: 'grade',
  班级: 'className',
  团队名称: 'teamName',
  成员姓名: 'memberName',
  成员学号: 'memberNo',
  联系电话: 'phone',
  备注: 'remark'
};

const PERSONAL_REQUIRED = ['school', 'grade', 'className', 'studentName', 'studentNo', 'gender'];
const TEAM_REQUIRED = ['school', 'grade', 'className', 'teamName', 'memberName', 'memberNo'];

const PERSONAL_FIELD_LABEL = Object.fromEntries(
  Object.entries(PERSONAL_HEADER_MAP).map(([label, key]) => [key, label])
);
const TEAM_FIELD_LABEL = Object.fromEntries(
  Object.entries(TEAM_HEADER_MAP).map(([label, key]) => [key, label])
);

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, '');
}

function normalizeClassName(value) {
  return normalizeText(value).replace(/班/g, '班');
}

function matchStudent({ school, grade, className, studentNo, name }) {
  return STUDENT_OPTIONS.find(
    (student) =>
      student.school === String(school || '').trim() &&
      student.grade === String(grade || '').trim() &&
      normalizeClassName(student.className) === normalizeClassName(className) &&
      String(student.studentNo) === String(studentNo).trim() &&
      student.name === String(name || '').trim()
  );
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

export async function downloadImportTemplate(matchForm) {
  if (matchForm === '团体') {
    const buffer = await buildWorkbook(
      TEAM_IMPORT_FIELDS,
      [
        ['第一实验小学', '五年级', '3班', '五年级跳绳队', '王小明', '20250001', '138****1234', '队员'],
        ['第一实验小学', '五年级', '3班', '五年级跳绳队', '李思雨', '20250002', '138****2356', '队员']
      ],
      '团体赛名单'
    );
    download(buffer, TEAM_IMPORT_TEMPLATE_NAME, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return TEAM_IMPORT_TEMPLATE_NAME;
  }
  const buffer = await buildWorkbook(
    PERSONAL_IMPORT_FIELDS,
    [['第一实验小学', '五年级', '3班', '王小明', '20250001', '男', '138****1234', '-']],
    '个人赛名单'
  );
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

function pushError(errors, rowNo, fieldKey, reason, fieldLabelMap) {
  errors.push({
    rowNo,
    fieldName: fieldLabelMap[fieldKey] || fieldKey,
    reason
  });
}

function validatePersonalRows(rows, matchId, itemId) {
  const errors = [];
  const validRows = [];
  const seenKeys = new Set();

  rows.forEach((row) => {
    const rowErrors = [];
    PERSONAL_REQUIRED.forEach((key) => {
      if (!String(row[key] || '').trim()) {
        rowErrors.push(key);
        pushError(errors, row.rowNo, key, '必填字段不能为空', PERSONAL_FIELD_LABEL);
      }
    });

    if (rowErrors.length) {
      return;
    }

    const student = matchStudent({
      school: row.school,
      grade: row.grade,
      className: row.className,
      studentNo: row.studentNo,
      name: row.studentName
    });
    if (!student) {
      pushError(errors, row.rowNo, 'studentNo', '无法匹配学生库，请核对学校、年级、班级、学号、姓名', PERSONAL_FIELD_LABEL);
      return;
    }

    const dupKey = `${row.school}|${row.grade}|${row.className}|${row.studentNo}|${row.studentName}`;
    if (seenKeys.has(dupKey)) {
      pushError(errors, row.rowNo, 'studentNo', '导入文件中存在重复学生', PERSONAL_FIELD_LABEL);
      return;
    }
    seenKeys.add(dupKey);

    if (isStudentRegisteredInItem(matchId, itemId, student.studentId)) {
      pushError(errors, row.rowNo, 'studentNo', '该学生已在当前比赛设项报名', PERSONAL_FIELD_LABEL);
      return;
    }

    validRows.push({ ...row, student });
  });

  return { errors, validRows };
}

function validateTeamRows(rows, matchId, itemId) {
  const errors = [];
  const validRows = [];
  const teamMeta = new Map();
  const teamMemberKeys = new Map();

  rows.forEach((row) => {
    TEAM_REQUIRED.forEach((key) => {
      if (!String(row[key] || '').trim()) {
        pushError(errors, row.rowNo, key, '必填字段不能为空', TEAM_FIELD_LABEL);
      }
    });
  });

  rows.forEach((row) => {
    const requiredMissing = TEAM_REQUIRED.some((key) => !String(row[key] || '').trim());
    if (requiredMissing) {
      return;
    }

    const teamKey = String(row.teamName).trim();
    const currentMeta = {
      school: String(row.school).trim(),
      grade: String(row.grade).trim(),
      className: String(row.className).trim()
    };
    if (!teamMeta.has(teamKey)) {
      teamMeta.set(teamKey, currentMeta);
    } else {
      const saved = teamMeta.get(teamKey);
      if (
        saved.school !== currentMeta.school ||
        saved.grade !== currentMeta.grade ||
        normalizeClassName(saved.className) !== normalizeClassName(currentMeta.className)
      ) {
        pushError(
          errors,
          row.rowNo,
          'teamName',
          '同一团队名称下的学校、年级、班级需保持一致',
          TEAM_FIELD_LABEL
        );
        return;
      }
    }

    const student = matchStudent({
      school: row.school,
      grade: row.grade,
      className: row.className,
      studentNo: row.memberNo,
      name: row.memberName
    });
    if (!student) {
      pushError(errors, row.rowNo, 'memberNo', '无法匹配学生库，请核对学校、年级、班级、学号、姓名', TEAM_FIELD_LABEL);
      return;
    }

    const memberKey = `${teamKey}|${student.studentId}`;
    if (!teamMemberKeys.has(teamKey)) {
      teamMemberKeys.set(teamKey, new Set());
    }
    const members = teamMemberKeys.get(teamKey);
    if (members.has(memberKey)) {
      pushError(errors, row.rowNo, 'memberNo', '同一团队下成员不可重复', TEAM_FIELD_LABEL);
      return;
    }
    members.add(memberKey);

    if (isStudentRegisteredInItem(matchId, itemId, student.studentId)) {
      pushError(errors, row.rowNo, 'memberNo', '该学生已在当前比赛设项报名', TEAM_FIELD_LABEL);
      return;
    }

    validRows.push({ ...row, student, teamKey });
  });

  if (!rows.length) {
    pushError(errors, 0, 'teamName', '团体报名数据不能为空', TEAM_FIELD_LABEL);
  } else if (!validRows.length && !errors.length) {
    pushError(errors, rows[0].rowNo, 'teamName', '团体成员信息缺失或无效', TEAM_FIELD_LABEL);
  }

  return { errors, validRows };
}

export async function parseImportFile(file, matchForm) {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('Excel 文件中没有可用工作表');
  }
  if (matchForm === '团体') {
    return parseSheetRows(worksheet, TEAM_HEADER_MAP, TEAM_IMPORT_FIELDS);
  }
  return parseSheetRows(worksheet, PERSONAL_HEADER_MAP, PERSONAL_IMPORT_FIELDS);
}

export function validateImportRows(rows, matchForm, matchId, itemId) {
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
      ? validateTeamRows(rows, matchId, itemId)
      : validatePersonalRows(rows, matchId, itemId);

  const errorCount = result.errors.length;
  const failedRowNos = new Set(result.errors.map((item) => item.rowNo));
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
          memberIds: []
        });
      }
      const team = teamMap.get(row.teamKey);
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
        remark: team.remark
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
      remark: row.remark || ''
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

export function getTemplateFields(matchForm) {
  return matchForm === '团体' ? TEAM_IMPORT_FIELDS : PERSONAL_IMPORT_FIELDS;
}

export function getItemMatchForm(matchId, itemId) {
  const item = getItemOptionsByMatch(matchId).find((row) => String(row.itemId) === String(itemId));
  return item?.matchForm || '';
}
