import {useState} from 'react'

function StitchChangeCalculator() {
    const [inputMode, setInputMode] = useState('interval') // 'interval' or 'total'
    const [priorityMode, setPriorityMode] = useState('endFirst') // 'startFirst' or 'endFirst'

    // 공통 입력
    const [startStitches, setStartStitches] = useState('')
    const [endStitches, setEndStitches] = useState('')
    const [stitchesPerChange, setStitchesPerChange] = useState('')

    // 방식1: 간격 기반
    const [everyNRows, setEveryNRows] = useState('')

    // 방식2: 총량 기반
    const [totalRows, setTotalRows] = useState('')

    // 결과
    const [result, setResult] = useState(null)

    // 계산 함수
    const handleCalculate = () => {
        // 입력 검증
        if (!startStitches || !endStitches || !stitchesPerChange) {
            alert('시작 코수, 끝 코수, 증감 코수를 모두 입력해주세요')
            return
        }

        if (inputMode === 'interval' && !everyNRows) {
            alert('증감 간격을 입력해주세요')
            return
        }

        if (inputMode === 'total' && !totalRows) {
            alert('총 단수를 입력해주세요')
            return
        }

        const start = parseInt(startStitches)
        const end = parseInt(endStitches)
        const changeAmount = parseInt(stitchesPerChange)

        // 증가/감소 자동 판단
        const isIncrease = end > start
        const totalChange = Math.abs(end - start)

        // 증감 횟수
        const changeCount = Math.floor(totalChange / changeAmount)
        const remainder = totalChange % changeAmount

        if (changeCount === 0) {
            alert('증감할 코수가 충분하지 않습니다')
            return
        }

        let rows = []

        if (inputMode === 'interval') {
            // 방식1: 증감 간격
            const interval = parseInt(everyNRows)

            if (priorityMode === 'startFirst') {
                // 시작 단 우선: 1단부터 증감 시작하고 마지막 증감 후 간격만큼 더 표시
                let totalRowCount = changeCount * interval
                if (remainder > 0) {
                    totalRowCount += 1
                }

                let currentStitches = start
                let changesDone = 0

                for (let row = 1; row <= totalRowCount; row++) {
                    // 1단부터 시작하여 interval마다 증감
                    const isChangeRow = (row === 1 || (row - 1) % interval === 0) && changesDone < changeCount
                    let change = 0

                    if (isChangeRow) {
                        // 마지막 증감에서 나머지 처리
                        if (changesDone === changeCount - 1 && remainder > 0) {
                            change = isIncrease ? (changeAmount + remainder) : -(changeAmount + remainder)
                        } else {
                            change = isIncrease ? changeAmount : -changeAmount
                        }
                        currentStitches += change
                        changesDone++
                    }

                    rows.push({
                        rowNumber: row,
                        stitches: currentStitches,
                        change: change,
                        isChangeRow: isChangeRow
                    })
                }
            } else {
                // 마지막 단 우선: 마지막 단에서 끝 코수로 완료
                let totalRowCount = changeCount * interval
                if (remainder > 0) {
                    totalRowCount += 1 // 나머지 처리를 위한 추가 단
                }

                let currentStitches = start
                let changesDone = 0

                // 증감 단 계산 (역산)
                const changeRows = []
                for (let i = 1; i <= changeCount; i++) {
                    changeRows.push(totalRowCount - (changeCount - i) * interval - (remainder > 0 ? 1 : 0))
                }

                let changeIndex = 0

                for (let row = 1; row <= totalRowCount; row++) {
                    let isChangeRow = false
                    let change = 0

                    // 증감 단인지 확인
                    if (changeIndex < changeRows.length && row === changeRows[changeIndex]) {
                        isChangeRow = true
                        change = isIncrease ? changeAmount : -changeAmount
                        currentStitches += change
                        changeIndex++
                    }
                    // 마지막 단에서 나머지 처리
                    else if (row === totalRowCount && remainder > 0) {
                        isChangeRow = true
                        change = isIncrease ? remainder : -remainder
                        currentStitches += change
                    }

                    rows.push({
                        rowNumber: row,
                        stitches: currentStitches,
                        change: change,
                        isChangeRow: isChangeRow
                    })
                }
            }

        } else {
            // 방식2: 총 단수
            const total = parseInt(totalRows)

            // 총 단수가 증감 횟수보다 작으면 에러
            if (changeCount > total) {
                alert('총 단수가 증감 횟수보다 작습니다')
                return
            }

            const changeRows = []

            // 먼저 끝단 우선 방식으로 계산
            const endFirstRows = []
            const interval = Math.ceil(total / changeCount)
            let firstRow = total - (changeCount - 1) * interval

            // firstRow가 1 미만이면 1부터 시작하여 재분배
            if (firstRow < 1) {
                for (let i = 0; i < changeCount; i++) {
                    if (i === changeCount - 1) {
                        endFirstRows.push(total) // 마지막은 항상 total
                    } else {
                        const position = 1 + Math.floor((i * (total - 1)) / (changeCount - 1))
                        endFirstRows.push(position)
                    }
                }
            } else {
                // 정상적인 역산 방식
                for (let i = 0; i < changeCount; i++) {
                    endFirstRows.push(firstRow + i * interval)
                }
            }

            if (priorityMode === 'startFirst') {
                // 시작 단 우선: 끝단 우선을 거울 반사
                for (let i = changeCount - 1; i >= 0; i--) {
                    const mirroredPosition = 1 + (total - endFirstRows[i])
                    changeRows.push(mirroredPosition)
                }
            } else {
                // 마지막 단 우선: 끝단 우선 방식 그대로 사용
                changeRows.push(...endFirstRows)
            }

            let currentStitches = start
            let changeIndex = 0

            for (let row = 1; row <= total; row++) {
                let isChangeRow = false
                let change = 0

                // 계산된 증감 단인지 확인
                if (changeIndex < changeRows.length && row === changeRows[changeIndex]) {
                    isChangeRow = true

                    // 마지막 단 우선 + 마지막 증감인 경우: 남은 모든 코수 처리
                    if (priorityMode === 'endFirst' && row === total) {
                        change = end - currentStitches
                        currentStitches = end
                    }
                    // 시작 단 우선 + 마지막 증감인 경우: 남은 모든 코수 처리
                    else if (priorityMode === 'startFirst' && changeIndex === changeCount - 1) {
                        change = end - currentStitches
                        currentStitches = end
                    }
                    // 일반 증감
                    else {
                        change = isIncrease ? changeAmount : -changeAmount
                        currentStitches += change
                    }

                    changeIndex++
                }

                rows.push({
                    rowNumber: row,
                    stitches: currentStitches,
                    change: change,
                    isChangeRow: isChangeRow
                })
            }
        }

        setResult({
            rows: rows,
            isIncrease: isIncrease,
            totalChange: totalChange,
            changeCount: changeCount,
            remainder: remainder
        })
    }

    // 초기화 함수
    const handleReset = () => {
        setStartStitches('')
        setEndStitches('')
        setStitchesPerChange('')
        setEveryNRows('')
        setTotalRows('')
        setPriorityMode('endFirst')
        setResult(null)
    }

    return (
        <div className="uk-section uk-section-muted">
            <div className="uk-container uk-container-small">
                {/* 헤더 */}
                <div className="uk-margin-large-bottom">
                    <h1 className="uk-heading-medium uk-margin-remove-bottom">코 증감 계산기</h1>
                    <p className="uk-text-lead uk-text-muted uk-margin-small-top">
                        시작 코수와 끝 코수를 입력하면 단별 증감 계획을 확인하세요
                    </p>
                </div>

                {/* 입력 방식 선택 */}
                <div className="uk-card uk-card-default uk-margin-medium">
                    <div className="uk-card-header">
                        <h3 className="uk-card-title">계산 방식 선택</h3>
                    </div>
                    <div className="uk-card-body">
                        <div className="uk-button-group uk-width-1-1">
                            <button
                                className={`uk-button uk-width-1-2 ${inputMode === 'interval' ? 'uk-button-primary' : 'uk-button-default'}`}
                                onClick={() => setInputMode('interval')}
                            >
                                증감 간격
                            </button>
                            <button
                                className={`uk-button uk-width-1-2 ${inputMode === 'total' ? 'uk-button-primary' : 'uk-button-default'}`}
                                onClick={() => setInputMode('total')}
                            >
                                총 단수
                            </button>
                        </div>
                    </div>
                </div>

                {/* 공통 입력 필드 */}
                <div className="uk-card uk-card-default uk-margin-medium">
                    <div className="uk-card-header">
                        <h3 className="uk-card-title">기본 정보</h3>
                    </div>
                    <div className="uk-card-body">
                        <div className="uk-flex uk-flex-column uk-flex-row@s uk-grid-small" data-uk-grid>
                            <div className="uk-width-1-1 uk-width-1-3@s uk-margin-small-bottom">
                                <label className="uk-form-label uk-text-bold">시작 코수</label>
                                <input
                                    className="uk-input uk-form-large"
                                    type="number"
                                    placeholder="예시: 80"
                                    value={startStitches}
                                    onChange={(e) => setStartStitches(e.target.value)}
                                />
                            </div>
                            <div className="uk-width-1-1 uk-width-1-3@s uk-margin-small-bottom">
                                <label className="uk-form-label uk-text-bold">끝 코수</label>
                                <input
                                    className="uk-input uk-form-large"
                                    type="number"
                                    placeholder="예시: 60"
                                    value={endStitches}
                                    onChange={(e) => setEndStitches(e.target.value)}
                                />
                            </div>
                            <div className="uk-width-1-1 uk-width-1-3@s">
                                <label className="uk-form-label uk-text-bold">증감 코수</label>
                                <input
                                    className="uk-input uk-form-large"
                                    type="number"
                                    placeholder="예시: 2"
                                    value={stitchesPerChange}
                                    onChange={(e) => setStitchesPerChange(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 증감 우선순위 선택 */}
                <div className="uk-card uk-card-default uk-margin-medium">
                    <div className="uk-card-header">
                        <h3 className="uk-card-title">증감 우선순위</h3>
                    </div>
                    <div className="uk-card-body">
                        <div className="uk-button-group uk-width-1-1">
                            <button
                                className={`uk-button uk-width-1-2 ${priorityMode === 'startFirst' ? 'uk-button-primary' : 'uk-button-default'}`}
                                onClick={() => setPriorityMode('startFirst')}
                            >
                                시작 단 우선
                            </button>
                            <button
                                className={`uk-button uk-width-1-2 ${priorityMode === 'endFirst' ? 'uk-button-primary' : 'uk-button-default'}`}
                                onClick={() => setPriorityMode('endFirst')}
                            >
                                마지막 단 우선
                            </button>
                        </div>
                        <p className="uk-text-small uk-text-muted uk-margin-small-top">
                            • 시작 단 우선: 1단부터 증감 시작<br/>
                            • 마지막 단 우선: 마지막 단에서 끝 코수로 완료
                        </p>
                    </div>
                </div>

                {/* 방식별 추가 입력 */}
                <div className="uk-card uk-card-default uk-margin-medium">
                    <div className="uk-card-header">
                        <h3 className="uk-card-title">
                            {inputMode === 'interval' ? '증감 간격' : '총 단수'}
                        </h3>
                    </div>
                    <div className="uk-card-body">
                        {inputMode === 'interval' ? (
                            <div>
                                <label className="uk-form-label uk-text-bold">단수</label>
                                <input
                                    className="uk-input uk-form-large"
                                    type="number"
                                    placeholder="예시: 4"
                                    value={everyNRows}
                                    onChange={(e) => setEveryNRows(e.target.value)}
                                />
                                <p className="uk-text-small uk-text-muted uk-margin-small-top">
                                    예시: 4를 입력하면 4단마다 증감이 발생합니다
                                </p>
                            </div>
                        ) : (
                            <div>
                                <label className="uk-form-label uk-text-bold">총 단수</label>
                                <input
                                    className="uk-input uk-form-large"
                                    type="number"
                                    placeholder="예시: 20"
                                    value={totalRows}
                                    onChange={(e) => setTotalRows(e.target.value)}
                                />
                                <p className="uk-text-small uk-text-muted uk-margin-small-top">
                                    입력한 단수에 걸쳐 균등하게 증감이 분배됩니다
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 계산 버튼 */}
                <div className="uk-flex uk-flex-column uk-flex-row@s uk-grid-small" data-uk-grid>
                    <div className="uk-width-1-1 uk-width-1-2@s">
                        <button
                            className="uk-button uk-button-primary uk-button-large uk-width-1-1"
                            onClick={handleCalculate}
                        >
                            계산하기
                        </button>
                    </div>
                    <div className="uk-width-1-1 uk-width-1-2@s">
                        <button
                            className="uk-button uk-button-default uk-background-default uk-button-large uk-width-1-1"
                            onClick={handleReset}
                        >
                            초기화
                        </button>
                    </div>
                </div>

                {/* 결과 표시 */}
                {result && (
                    <div className="uk-card uk-card-default uk-margin-medium uk-animation-slide-bottom-small">
                        <div className="uk-card-header">
                            <h3 className="uk-card-title">증감 계획</h3>
                            <div className="uk-text-meta">
                                <span className={result.isIncrease ? 'uk-text-success' : 'uk-text-danger'}>
                                    {result.isIncrease ? '코 늘리기' : '코 줄이기'}
                                </span>
                                {' • '}
                                총 {result.totalChange}코 {result.isIncrease ? '증가' : '감소'}
                                {' • '}
                                {result.changeCount}회 증감
                                {result.remainder > 0 && ` (나머지 ${result.remainder}코)`}
                            </div>
                        </div>
                        <div className="uk-card-body uk-padding-remove">
                            <div className="uk-overflow-auto">
                                <table className="uk-table uk-table-divider uk-table-hover uk-table-small">
                                    <thead>
                                    <tr>
                                        <th className="uk-text-center">단 번호</th>
                                        <th className="uk-text-center">코수</th>
                                        <th className="uk-text-center">증감량</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {result.rows.map((row) => (
                                        <tr
                                            key={row.rowNumber}
                                            className={row.isChangeRow ? 'uk-row-highlight uk-text-bold' : ''}
                                        >
                                            <td className="uk-text-center uk-text-bold">
                                                <span className={row.change !== 0 ? "uk-text-danger" : ""}>
                                                    {row.rowNumber}단
                                                </span>
                                            </td>
                                            <td className="uk-text-center uk-text-bold">
                                                <span className={row.change !== 0 ? "uk-text-danger" : ""}>
                                                    {row.stitches}코
                                                </span>
                                            </td>
                                            <td className="uk-text-center uk-text-bold">
                                                {row.change !== 0 ? (
                                                    <span className="uk-text-danger">
                                                            {row.change > 0 ? '+' : ''}{row.change}
                                                        </span>
                                                ) : (
                                                    <span className="uk-text-muted">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default StitchChangeCalculator
