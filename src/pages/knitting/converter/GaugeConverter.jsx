import {useState} from 'react'

function GaugeConverter() {
    const [unit, setUnit] = useState('cm')

    // 패턴 게이지
    const [patternGaugeStitches, setPatternGaugeStitches] = useState('')
    const [patternGaugeRows, setPatternGaugeRows] = useState('')

    // 실제 게이지
    const [actualGaugeStitches, setActualGaugeStitches] = useState('')
    const [actualGaugeRows, setActualGaugeRows] = useState('')

    // 패턴 코/단 수
    const [patternStitches, setPatternStitches] = useState('')
    const [patternRows, setPatternRows] = useState('')

    // 결과
    const [result, setResult] = useState(null)

    // 단위에 따른 게이지 크기
    const gaugeSize = unit === 'cm' ? '10cm' : '4inch'
    const gaugeSizeValue = unit === 'cm' ? 10 : 4

    // 계산 함수
    const handleCalculate = () => {
        // 입력 검증
        if (!patternGaugeStitches || !patternGaugeRows || !actualGaugeStitches || !actualGaugeRows) {
            alert('패턴 게이지와 실제 게이지를 모두 입력해주세요')
            return
        }

        if (!patternStitches && !patternRows) {
            alert('패턴 코 수 또는 단 수를 입력해주세요')
            return
        }

        // 게이지당 코/단 계산
        const patternStitchesPerUnit = parseFloat(patternGaugeStitches) / gaugeSizeValue
        const patternRowsPerUnit = parseFloat(patternGaugeRows) / gaugeSizeValue
        const actualStitchesPerUnit = parseFloat(actualGaugeStitches) / gaugeSizeValue
        const actualRowsPerUnit = parseFloat(actualGaugeRows) / gaugeSizeValue

        let calculatedResult = {}

        // 코 수 계산
        if (patternStitches) {
            const actualStitchesNeeded = parseFloat(patternStitches) * (actualStitchesPerUnit / patternStitchesPerUnit)
            calculatedResult.stitches = {
                pattern: parseFloat(patternStitches),
                actual: Math.round(actualStitchesNeeded)
            }
        }

        // 단 수 계산
        if (patternRows) {
            const actualRowsNeeded = parseFloat(patternRows) * (actualRowsPerUnit / patternRowsPerUnit)
            calculatedResult.rows = {
                pattern: parseFloat(patternRows),
                actual: Math.round(actualRowsNeeded)
            }
        }

        setResult(calculatedResult)
    }

    return (
        <div className="uk-section uk-section-muted">
            <div className="uk-container uk-container-small">
                {/* 헤더 */}
                <div className="uk-margin-large-bottom">
                    <h1 className="uk-heading-medium uk-margin-remove-bottom">게이지 변환 계산기</h1>
                    <p className="uk-text-lead uk-text-muted uk-margin-small-top">
                        패턴과 실제 게이지를 비교하여 정확한 코/단 수를 계산하세요
                    </p>
                </div>

                {/* 단위 선택 카드 */}
                <div className="uk-card uk-card-default uk-margin-medium">
                    <div className="uk-card-header">
                        <h3 className="uk-card-title">단위 선택</h3>
                    </div>
                    <div className="uk-card-body">
                        <div className="uk-button-group uk-width-1-1">
                            <button
                                className={`uk-button uk-width-1-2 ${unit === 'cm' ? 'uk-button-primary' : 'uk-button-default'}`}
                                onClick={() => setUnit('cm')}
                            >
                                cm
                            </button>
                            <button
                                className={`uk-button uk-width-1-2 ${unit === 'inch' ? 'uk-button-primary' : 'uk-button-default'}`}
                                onClick={() => setUnit('inch')}
                            >
                                inch
                            </button>
                        </div>
                    </div>
                </div>

                {/* 기준 게이지 카드 */}
                <div className="uk-card uk-card-default uk-margin-medium">
                    <div className="uk-card-header">
                        <h3 className="uk-card-title">
                            기준 게이지<span className="uk-badge uk-margin-small-left">{gaugeSize} 기준</span>
                        </h3>
                    </div>
                    <div className="uk-card-body">
                        <div className="uk-flex uk-flex-column uk-flex-row@s uk-grid-small" data-uk-grid>
                            <div className="uk-width-1-1 uk-width-1-2@s uk-margin-small-bottom">
                                <label className="uk-form-label uk-text-bold">코 수</label>
                                <input
                                    className="uk-input uk-form-large"
                                    type="number"
                                    placeholder="예시: 20"
                                    value={patternGaugeStitches}
                                    onChange={(e) => setPatternGaugeStitches(e.target.value)}
                                />
                            </div>
                            <div className="uk-width-1-1 uk-width-1-2@s">
                                <label className="uk-form-label uk-text-bold">단 수</label>
                                <input
                                    className="uk-input uk-form-large"
                                    type="number"
                                    placeholder="예시: 28"
                                    value={patternGaugeRows}
                                    onChange={(e) => setPatternGaugeRows(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 실제 게이지 카드 */}
                <div className="uk-card uk-card-default uk-margin-medium">
                    <div className="uk-card-header">
                        <h3 className="uk-card-title">
                            실제 게이지<span className="uk-badge uk-margin-small-left">{gaugeSize} 기준</span>
                        </h3>
                    </div>
                    <div className="uk-card-body">
                        <div className="uk-flex uk-flex-column uk-flex-row@s uk-grid-small" data-uk-grid>
                            <div className="uk-width-1-1 uk-width-1-2@s uk-margin-small-bottom">
                                <label className="uk-form-label uk-text-bold">코 수</label>
                                <input
                                    className="uk-input uk-form-large"
                                    type="number"
                                    placeholder="예시: 22"
                                    value={actualGaugeStitches}
                                    onChange={(e) => setActualGaugeStitches(e.target.value)}
                                />
                            </div>
                            <div className="uk-width-1-1 uk-width-1-2@s">
                                <label className="uk-form-label uk-text-bold">단 수</label>
                                <input
                                    className="uk-input uk-form-large"
                                    type="number"
                                    placeholder="예시: 30"
                                    value={actualGaugeRows}
                                    onChange={(e) => setActualGaugeRows(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 계산할 코/단 수 입력 */}
                <div className="uk-card uk-card-default uk-margin-medium">
                    <div className="uk-card-header">
                        <h3 className="uk-card-title">계산할 코/단 수</h3>
                    </div>
                    <div className="uk-card-body">
                        <div className="uk-flex uk-flex-column uk-flex-row@s uk-grid-small" data-uk-grid>
                            <div className="uk-width-1-1 uk-width-1-2@s uk-margin-small-bottom">
                                <label className="uk-form-label uk-text-bold">코 수</label>
                                <input
                                    className="uk-input uk-form-large"
                                    type="number"
                                    placeholder="예시: 100"
                                    value={patternStitches}
                                    onChange={(e) => setPatternStitches(e.target.value)}
                                />
                            </div>
                            <div className="uk-width-1-1 uk-width-1-2@s">
                                <label className="uk-form-label uk-text-bold">단 수</label>
                                <input
                                    className="uk-input uk-form-large"
                                    type="number"
                                    placeholder="예시: 140"
                                    value={patternRows}
                                    onChange={(e) => setPatternRows(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 계산 버튼 */}
                <div className="uk-margin-medium uk-text-center">
                    <button
                        className="uk-button uk-button-primary uk-button-large uk-width-1-1 uk-border-rounded"
                        onClick={handleCalculate}
                        style={{fontSize: '1.2rem', padding: '15px 60px'}}
                    >
                        계산하기
                    </button>
                </div>

                {/* 결과 표시 */}
                {result && Object.keys(result).length > 0 && (
                    <div className="uk-card uk-card-default uk-margin-medium uk-animation-slide-bottom-small">
                        <div className="uk-card-header">
                            <h3 className="uk-card-title">계산 결과</h3>
                        </div>
                        <div className="uk-card-body">
                            <div className="uk-flex uk-flex-column uk-flex-row@s uk-grid-small" data-uk-grid>
                                {result.stitches && (
                                    <div className="uk-width-1-1 uk-width-1-2@s uk-margin-small-bottom">
                                        <div className="uk-card uk-card-primary uk-card-body">
                                            <div className="uk-text-center">
                                                <div className="uk-text-bold uk-text-large uk-margin-remove">
                                                    {result.stitches.actual}코
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {result.rows && (
                                    <div className="uk-width-1-1 uk-width-1-2@s">
                                        <div className="uk-card uk-card-primary uk-card-body">
                                            <div className="uk-text-center">
                                                <div className="uk-text-bold uk-text-large uk-margin-remove">
                                                    {result.rows.actual}단
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default GaugeConverter
