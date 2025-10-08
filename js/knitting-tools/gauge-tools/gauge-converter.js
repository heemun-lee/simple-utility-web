/**
 * Gauge Converter Logic
 * @module gauge-converter
 */

import { validateAllInputs, convertGauge, convertGaugeWithUnit, GAUGE_UNITS } from './validator.js';
import { $, showError } from '../../utils.js';

/**
 * 현재 선택된 측정 단위
 * @type {string}
 */
let currentUnit = GAUGE_UNITS.CM;

/**
 * 게이지 변환 계산 실행
 */
export const calculate = () => {
  // 입력 값 가져오기
  const inputs = {
    baseStitches: $('#base-stitches')?.value,
    baseRows: $('#base-rows')?.value,
    actualStitches: $('#actual-stitches')?.value,
    actualRows: $('#actual-rows')?.value,
    inputStitches: $('#input-stitches')?.value,
    inputRows: $('#input-rows')?.value,
  };

  // 검증
  const validation = validateAllInputs(inputs);

  if (!validation.valid) {
    displayError(validation.errors);
    clearResults();
    return;
  }

  try {
    // 변환 계산 (선택된 단위 고려)
    const results = {
      stitches: null,
      rows: null,
    };

    if (inputs.inputStitches) {
      results.stitches = convertGaugeWithUnit(
        Number(inputs.inputStitches),
        Number(inputs.baseStitches),
        Number(inputs.actualStitches),
        currentUnit
      );
    }

    if (inputs.inputRows) {
      results.rows = convertGaugeWithUnit(
        Number(inputs.inputRows),
        Number(inputs.baseRows),
        Number(inputs.actualRows),
        currentUnit
      );
    }

    // 결과 표시 (단위 포함)
    displayResults(results, currentUnit);
    clearError();
  } catch (error) {
    displayError([error.message]);
    clearResults();
  }
};

/**
 * 결과 표시 (단위 포함)
 * @param {{stitches: number|null, rows: number|null}} results - 계산 결과
 * @param {string} unit - 측정 단위
 */
const displayResults = (results, unit) => {
  const resultStitches = $('#result-stitches');
  const resultRows = $('#result-rows');
  const unitText = unit === GAUGE_UNITS.INCH ? '4 inch 기준' : '10cm 기준';

  if (resultStitches) {
    if (results.stitches !== null) {
      resultStitches.textContent = `${results.stitches}코 (${unitText})`;
    } else {
      resultStitches.textContent = '';
    }
  }

  if (resultRows) {
    if (results.rows !== null) {
      resultRows.textContent = `${results.rows}단 (${unitText})`;
    } else {
      resultRows.textContent = '';
    }
  }
};

/**
 * 결과 초기화
 */
const clearResults = () => {
  const resultStitches = $('#result-stitches');
  const resultRows = $('#result-rows');

  if (resultStitches) {
    resultStitches.textContent = '';
  }

  if (resultRows) {
    resultRows.textContent = '';
  }
};

/**
 * 에러 표시
 * @param {string[]} errors - 에러 메시지 배열
 */
const displayError = (errors) => {
  const errorContainer = $('#error-container');

  if (!errorContainer) return;

  const errorHtml = `
    <div class="error-message" role="alert">
      <strong>입력 오류:</strong>
      <ul>
        ${errors.map((error) => `<li>${error}</li>`).join('')}
      </ul>
    </div>
  `;

  errorContainer.innerHTML = errorHtml;
};

/**
 * 에러 메시지 제거
 */
const clearError = () => {
  const errorContainer = $('#error-container');

  if (errorContainer) {
    errorContainer.innerHTML = '';
  }
};

/**
 * 입력 필드 초기화
 */
export const resetForm = () => {
  const inputs = [
    '#base-stitches',
    '#base-rows',
    '#actual-stitches',
    '#actual-rows',
    '#input-stitches',
    '#input-rows',
  ];

  inputs.forEach((selector) => {
    const input = $(selector);
    if (input) {
      input.value = '';
    }
  });

  clearResults();
  clearError();
};

/**
 * 측정 단위에 따라 레이블 업데이트
 * @param {string} unit - 측정 단위 ('10cm' 또는 '4inch')
 */
export const updateLabels = (unit) => {
  const unitText = unit === GAUGE_UNITS.INCH ? '4 inch' : '10cm';

  // 기준 게이지 레이블 업데이트
  const baseStitchesLabel = document.querySelector('label[for="base-stitches"]');
  const baseRowsLabel = document.querySelector('label[for="base-rows"]');

  if (baseStitchesLabel) {
    baseStitchesLabel.textContent = `코수 (${unitText} 기준)`;
  }

  if (baseRowsLabel) {
    baseRowsLabel.textContent = `단수 (${unitText} 기준)`;
  }

  // 실제 게이지 레이블 업데이트
  const actualStitchesLabel = document.querySelector('label[for="actual-stitches"]');
  const actualRowsLabel = document.querySelector('label[for="actual-rows"]');

  if (actualStitchesLabel) {
    actualStitchesLabel.textContent = `코수 (${unitText} 기준)`;
  }

  if (actualRowsLabel) {
    actualRowsLabel.textContent = `단수 (${unitText} 기준)`;
  }
};

/**
 * 측정 단위 변경 이벤트 핸들러
 * @param {Event} event - change 이벤트
 */
export const handleUnitChange = (event) => {
  currentUnit = event.target.value;
  updateLabels(currentUnit);
  clearResults();
  clearError();
};

/**
 * 현재 선택된 측정 단위 반환
 * @returns {string} 현재 측정 단위
 */
export const getCurrentUnit = () => currentUnit;
