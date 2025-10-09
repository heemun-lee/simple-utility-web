/**
 * Stitch Calculator
 * 뜨개질 코수 증감 계산기
 *
 * @module stitch-calculator
 * @description 코수 증감을 균등하게 분배하여 각 단의 코수를 계산합니다.
 */

/* ============================================================================
   Constants
   ========================================================================== */

const INPUT_CONSTRAINTS = {
  MIN_VALUE: 1,
  MAX_VALUE: 10000,
  VALIDATION_DEBOUNCE_MS: 500,
  SAVE_DEBOUNCE_MS: 300,
};

const ERROR_TYPE = {
  REQUIRED: 'required',
  NOT_A_NUMBER: 'not_a_number',
  OUT_OF_RANGE: 'out_of_range',
  NOT_INTEGER: 'not_integer',
};

const FIELD_NAMES = {
  'start-stitches': '시작 코수',
  'target-stitches': '목표 코수',
  'total-rows': '총 단수',
};

const ERROR_MESSAGES = {
  [ERROR_TYPE.REQUIRED]: (fieldName) => `${fieldName}을(를) 입력해주세요.`,
  [ERROR_TYPE.NOT_A_NUMBER]: (fieldName) => `${fieldName}은(는) 숫자여야 합니다.`,
  [ERROR_TYPE.OUT_OF_RANGE]: (fieldName) => `${fieldName}은(는) 1 이상 10000 이하여야 합니다.`,
  [ERROR_TYPE.NOT_INTEGER]: (fieldName) => `${fieldName}은(는) 정수로 입력해주세요.`,
};

const STORAGE_KEYS = {
  CALCULATOR_INPUTS: 'stitchCalculatorInputs',
};

/* ============================================================================
   State
   ========================================================================== */

let debounceTimers = {};

/* ============================================================================
   Validation Functions (T011)
   ========================================================================== */

/**
 * 단일 필드 검증
 *
 * @param {string} field - 필드 ID
 * @param {string} value - 검증할 값
 * @returns {Object|null} 검증 오류 객체 또는 null
 */
function validateField(field, value) {
  const fieldName = FIELD_NAMES[field];

  // Required check
  if (!value || value.trim() === '') {
    return {
      field,
      errorType: ERROR_TYPE.REQUIRED,
      message: ERROR_MESSAGES[ERROR_TYPE.REQUIRED](fieldName),
    };
  }

  // Number check
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return {
      field,
      errorType: ERROR_TYPE.NOT_A_NUMBER,
      message: ERROR_MESSAGES[ERROR_TYPE.NOT_A_NUMBER](fieldName),
    };
  }

  // Integer check
  if (!Number.isInteger(numValue)) {
    return {
      field,
      errorType: ERROR_TYPE.NOT_INTEGER,
      message: ERROR_MESSAGES[ERROR_TYPE.NOT_INTEGER](fieldName),
    };
  }

  // Range check
  if (numValue < INPUT_CONSTRAINTS.MIN_VALUE || numValue > INPUT_CONSTRAINTS.MAX_VALUE) {
    return {
      field,
      errorType: ERROR_TYPE.OUT_OF_RANGE,
      message: ERROR_MESSAGES[ERROR_TYPE.OUT_OF_RANGE](fieldName),
    };
  }

  return null;
}

/**
 * 전체 입력 검증
 *
 * @param {Object} input - 검증할 입력 객체 (문자열 값)
 * @returns {Array} 검증 오류 배열
 */
function validateInput(input) {
  const errors = [];

  const startError = validateField('start-stitches', input.startStitches || '');
  if (startError) errors.push(startError);

  const targetError = validateField('target-stitches', input.targetStitches || '');
  if (targetError) errors.push(targetError);

  const rowsError = validateField('total-rows', input.totalRows || '');
  if (rowsError) errors.push(rowsError);

  return errors;
}

/* ============================================================================
   Calculation Algorithm (T012)
   ========================================================================== */

/**
 * 코수 분배 계산 알고리즘
 * 균등 분배를 사용하여 각 단의 코수를 계산합니다.
 *
 * @param {Object} input - 계산 입력
 * @param {number} input.startStitches - 시작 코수
 * @param {number} input.targetStitches - 목표 코수
 * @param {number} input.totalRows - 총 단수
 * @returns {Object} 계산 결과
 */
function calculateStitchDistribution(input) {
  const startTime = performance.now();

  const { startStitches, targetStitches, totalRows } = input;

  // Calculate total change
  const totalChange = targetStitches - startStitches;
  const changeType = totalChange > 0 ? 'increase' : totalChange < 0 ? 'decrease' : 'none';

  // If no change needed
  if (totalChange === 0) {
    const rows = Array.from({ length: totalRows }, (_, i) => ({
      rowNumber: i + 1,
      stitches: startStitches,
      isChanged: false,
      changeAmount: 0,
    }));

    return {
      input,
      rows,
      totalChange: 0,
      changeType: 'none',
      changedRowsCount: 0,
      calculationTime: performance.now() - startTime,
    };
  }

  // Calculate distribution using cumulative method for even spacing
  // This ensures changes are distributed evenly across all rows
  const rows = [];
  let currentStitches = startStitches;
  let totalAppliedChange = 0;
  let changedRowsCount = 0;

  // Use absolute value for calculation, then apply sign
  const absChange = Math.abs(totalChange);
  const sign = totalChange > 0 ? 1 : -1;

  for (let i = 0; i < totalRows; i++) {
    const rowNumber = i + 1;

    // Calculate expected cumulative change using floor for even distribution
    // Example: 5 changes over 20 rows -> changes at rows 4, 8, 12, 16, 20
    const expectedAbsChange = Math.floor((rowNumber * absChange) / totalRows);
    const expectedCumulativeChange = expectedAbsChange * sign;

    // Calculate change for this specific row
    const changeAmount = expectedCumulativeChange - totalAppliedChange;

    // Update current stitches
    currentStitches = currentStitches + changeAmount;
    totalAppliedChange += changeAmount;

    // Track if this row has a change
    if (changeAmount !== 0) {
      changedRowsCount++;
    }

    rows.push({
      rowNumber,
      stitches: currentStitches,
      isChanged: changeAmount !== 0,
      changeAmount,
    });
  }

  const calculationTime = performance.now() - startTime;

  return {
    input,
    rows,
    totalChange,
    changeType,
    changedRowsCount,
    calculationTime,
  };
}

/* ============================================================================
   UI Rendering Functions (T013)
   ========================================================================== */

/**
 * 계산 결과를 테이블로 렌더링
 *
 * @param {Object} result - 계산 결과
 * @param {HTMLElement} containerElement - 컨테이너 엘리먼트
 */
function renderResults(result, containerElement) {
  if (!containerElement) return;

  // Update summary
  document.getElementById('summary-start').textContent = formatNumber(result.input.startStitches);
  document.getElementById('summary-target').textContent = formatNumber(result.input.targetStitches);
  document.getElementById('summary-rows').textContent = formatNumber(result.input.totalRows);
  document.getElementById('summary-changed').textContent = formatNumber(result.changedRowsCount);

  // Create table
  const tableWrapper = containerElement.querySelector('.table-wrapper');
  if (!tableWrapper) return;

  // Use DocumentFragment for performance
  const fragment = document.createDocumentFragment();

  const table = document.createElement('table');
  table.className = 'results-table';
  table.setAttribute('role', 'table');

  // Caption
  const caption = document.createElement('caption');
  caption.textContent = `코수 변화 계산 결과 (총 ${result.rows.length}단)`;
  table.appendChild(caption);

  // Table head
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th scope="col">단</th>
      <th scope="col">코수</th>
      <th scope="col">변화량</th>
    </tr>
  `;
  table.appendChild(thead);

  // Table body
  const tbody = document.createElement('tbody');

  result.rows.forEach((row) => {
    const tr = document.createElement('tr');

    if (row.isChanged) {
      tr.classList.add('changed');
    }

    // Row number
    const tdRow = document.createElement('td');
    tdRow.textContent = row.rowNumber;
    tr.appendChild(tdRow);

    // Stitches count
    const tdStitches = document.createElement('td');
    tdStitches.textContent = formatNumber(row.stitches);
    tr.appendChild(tdStitches);

    // Change amount
    const tdChange = document.createElement('td');
    tdChange.className = 'change-amount';

    if (row.changeAmount > 0) {
      tdChange.classList.add('increase');
      tdChange.textContent = `+${row.changeAmount}`;
    } else if (row.changeAmount < 0) {
      tdChange.classList.add('decrease');
      tdChange.textContent = row.changeAmount;
    } else {
      tdChange.classList.add('no-change');
      tdChange.textContent = '-';
    }

    tr.appendChild(tdChange);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  fragment.appendChild(table);

  // Clear and append
  tableWrapper.innerHTML = '';
  tableWrapper.appendChild(fragment);

  // Show results section
  containerElement.style.display = 'block';
}

/**
 * 오류 메시지 표시
 *
 * @param {Array} errors - 오류 배열
 * @param {HTMLFormElement} formElement - 폼 엘리먼트
 */
function displayErrors(errors, formElement) {
  if (!formElement) return;

  // Clear previous errors first
  clearErrors(formElement);

  if (errors.length === 0) return;

  // Display field-specific errors
  errors.forEach((error) => {
    const errorSpan = formElement.querySelector(`[data-field="${error.field}"]`);
    if (errorSpan) {
      errorSpan.textContent = error.message;
      errorSpan.style.display = 'block';
      errorSpan.setAttribute('role', 'alert');
    }
  });

  // Display general error in error container
  const errorContainer = document.getElementById('error-container');
  if (errorContainer) {
    const errorList = errors.map(e => e.message).join(' ');
    errorContainer.textContent = errorList;
    errorContainer.style.display = 'block';
  }
}

/**
 * 오류 메시지 제거
 *
 * @param {HTMLFormElement} formElement - 폼 엘리먼트
 */
function clearErrors(formElement) {
  if (!formElement) return;

  // Clear field-specific errors
  const errorSpans = formElement.querySelectorAll('.error-message');
  errorSpans.forEach((span) => {
    span.textContent = '';
    span.style.display = 'none';
  });

  // Clear general error
  const errorContainer = document.getElementById('error-container');
  if (errorContainer) {
    errorContainer.textContent = '';
    errorContainer.style.display = 'none';
  }
}

/* ============================================================================
   Event Handlers (T014)
   ========================================================================== */

/**
 * 폼 제출 이벤트 핸들러
 *
 * @param {Event} event - 이벤트 객체
 */
function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;

  // Get raw input values (keep as strings for validation)
  const startValue = document.getElementById('start-stitches').value;
  const targetValue = document.getElementById('target-stitches').value;
  const rowsValue = document.getElementById('total-rows').value;

  // Create input object for validation
  const input = {
    startStitches: startValue,
    targetStitches: targetValue,
    totalRows: rowsValue,
  };

  // Validate input
  const errors = validateInput(input);

  if (errors.length > 0) {
    displayErrors(errors, form);
    return;
  }

  // Clear errors
  clearErrors(form);

  // Convert to numbers after validation
  const validInput = {
    startStitches: Number(startValue),
    targetStitches: Number(targetValue),
    totalRows: Number(rowsValue),
  };

  // Calculate
  const result = calculateStitchDistribution(validInput);

  // Render results
  const resultsContainer = document.getElementById('results-container');
  renderResults(result, resultsContainer);

  // Save to localStorage (optional)
  saveInput(validInput);

  // Scroll to results
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * 입력 변경 이벤트 핸들러 (디바운싱)
 *
 * @param {Event} event - 이벤트 객체
 */
function handleInputChange(event) {
  const field = event.target.id;
  const value = event.target.value;

  // Clear previous timer
  if (debounceTimers[field]) {
    clearTimeout(debounceTimers[field]);
  }

  // Debounce validation
  debounceTimers[field] = setTimeout(() => {
    const error = validateField(field, value);
    const form = event.target.closest('form');

    if (error) {
      displayErrors([error], form);
    } else {
      // Clear only this field's error
      const errorSpan = form.querySelector(`[data-field="${field}"]`);
      if (errorSpan) {
        errorSpan.textContent = '';
        errorSpan.style.display = 'none';
      }
    }
  }, INPUT_CONSTRAINTS.VALIDATION_DEBOUNCE_MS);
}

/**
 * 초기화 버튼 클릭 이벤트 핸들러
 *
 * @param {Event} event - 이벤트 객체
 */
function handleReset(event) {
  const form = event.target.closest('form');

  // Clear errors
  clearErrors(form);

  // Hide results
  const resultsContainer = document.getElementById('results-container');
  if (resultsContainer) {
    resultsContainer.style.display = 'none';
  }

  // Clear all debounce timers
  Object.keys(debounceTimers).forEach((key) => {
    clearTimeout(debounceTimers[key]);
  });
  debounceTimers = {};
}

/* ============================================================================
   Utility Functions (T015)
   ========================================================================== */

/**
 * 디바운스 유틸리티
 *
 * @param {Function} func - 실행할 함수
 * @param {number} delay - 지연 시간 (밀리초)
 * @returns {Function} 디바운스된 함수
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * 숫자 포맷팅 (천 단위 구분)
 *
 * @param {number} num - 포맷팅할 숫자
 * @returns {string} 포맷팅된 문자열
 */
function formatNumber(num) {
  return num.toLocaleString('ko-KR');
}

/* ============================================================================
   LocalStorage Functions (Optional)
   ========================================================================== */

/**
 * localStorage에 입력값 저장
 *
 * @param {Object} input - 저장할 입력값
 * @returns {boolean} 저장 성공 여부
 */
function saveInput(input) {
  try {
    const data = {
      ...input,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.CALCULATOR_INPUTS, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn('Failed to save input to localStorage:', error);
    return false;
  }
}

/**
 * localStorage에서 입력값 복원
 *
 * @returns {Object|null} 복원된 입력값
 */
function restoreInput() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CALCULATOR_INPUTS);
    if (!saved) return null;

    const data = JSON.parse(saved);

    // Return only input fields
    return {
      startStitches: data.startStitches,
      targetStitches: data.targetStitches,
      totalRows: data.totalRows,
    };
  } catch (error) {
    console.warn('Failed to restore input from localStorage:', error);
    return null;
  }
}

/* ============================================================================
   Initialization (T014)
   ========================================================================== */

/**
 * 계산기 초기화
 */
function initCalculator() {
  const form = document.getElementById('calculator-form');
  const calculateButton = document.getElementById('calculate-button');
  const resetButton = document.getElementById('reset-button');

  if (!form) {
    console.error('Calculator form not found');
    return;
  }

  // Attach event listeners
  form.addEventListener('submit', handleFormSubmit);
  resetButton?.addEventListener('click', handleReset);

  // Input change listeners with debouncing
  const inputs = form.querySelectorAll('input[type="number"]');
  inputs.forEach((input) => {
    input.addEventListener('input', handleInputChange);
  });

  // Restore previous input (optional)
  const savedInput = restoreInput();
  if (savedInput) {
    document.getElementById('start-stitches').value = savedInput.startStitches || '';
    document.getElementById('target-stitches').value = savedInput.targetStitches || '';
    document.getElementById('total-rows').value = savedInput.totalRows || '';
  }

  console.log('Stitch Calculator initialized');
}

/* ============================================================================
   Exports
   ========================================================================== */

export {
  initCalculator,
  calculateStitchDistribution,
  validateField,
  validateInput,
  renderResults,
  displayErrors,
  clearErrors,
  handleFormSubmit,
  handleInputChange,
  handleReset,
  debounce,
  formatNumber,
  saveInput,
  restoreInput,
};
