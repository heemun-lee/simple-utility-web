/**
 * PDF 및 Excel 내보내기 유틸리티
 */
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

function rgbToHex(color) {
    return '#' + color.map(c => c.toString(16).padStart(2, '0')).join('');
}

function getLuminance(color) {
    return 0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2];
}

// ─── Excel 내보내기 ───

/**
 * 도안을 Excel 파일로 내보내기 (가이드라인 + 메모리 번호 포함)
 */
export async function exportToExcel(pixelGrid, palette, width, height, guidelineColor = [255, 0, 0]) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('도안');

    const guideHex = guidelineColor
        ? 'FF' + guidelineColor.map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase()
        : null;

    // 셀 비율 가로 3 : 세로 2
    const colWidth = 4.0;
    const rowHeight = 16;

    // 열 너비 설정
    sheet.getColumn(1).width = colWidth;
    for (let x = 0; x < width; x++) {
        sheet.getColumn(x + 2).width = colWidth;
    }
    // 오른쪽 단 번호 열
    sheet.getColumn(width + 2).width = 5;

    // 도안 데이터 행
    for (let y = 0; y < height; y++) {
        const row = sheet.getRow(y + 1);
        row.height = rowHeight;

        for (let x = 0; x < width; x++) {
            const colorIdx = pixelGrid[y][x];
            const color = palette[colorIdx].color;
            const hex = color.map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();

            const cell = row.getCell(x + 1);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF' + hex }
            };

            // 기본 테두리
            const thinBorder = { style: 'thin', color: { argb: 'FFDDDDDD' } };
            const border = {
                top: thinBorder,
                left: thinBorder,
                bottom: thinBorder,
                right: thinBorder
            };

            // 가이드라인: 5코/5단마다 두꺼운 선
            if (guideHex) {
                const stitchNum = width - x;  // 오른쪽에서 카운트
                const fromBottom = height - y; // 아래에서 카운트

                // 코 가이드라인: 오른쪽에서 5의 배수 → 해당 셀의 왼쪽 선
                if (stitchNum > 0 && stitchNum % 5 === 0) {
                    border.left = { style: 'medium', color: { argb: guideHex } };
                }
                // 단 가이드라인: 아래에서 5의 배수 → 해당 셀의 위쪽 선
                if (fromBottom > 0 && fromBottom % 5 === 0) {
                    border.top = { style: 'medium', color: { argb: guideHex } };
                }
            }

            cell.border = border;
        }

        // 오른쪽: 단 번호 (홀수만)
        const rowNum = height - y;
        if (rowNum % 2 === 1) {
            const numCell = row.getCell(width + 1);
            numCell.value = rowNum;
            numCell.alignment = { horizontal: 'center', vertical: 'middle' };
            numCell.font = { size: 7, color: { argb: 'FF888888' } };
        }
    }

    // 하단: 코 번호 행 (홀수만)
    const footerRow = sheet.getRow(height + 1);
    footerRow.height = 18;
    for (let x = 0; x < width; x++) {
        const stitchNum = width - x;
        if (stitchNum % 2 === 1) {
            const cell = footerRow.getCell(x + 1);
            cell.value = stitchNum;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.font = { size: 7, color: { argb: 'FF888888' } };
        }
    }

    // ── 색상표 시트 ──
    const legendSheet = workbook.addWorksheet('색상표');
    legendSheet.getColumn(1).width = 5;
    legendSheet.getColumn(2).width = 8;
    legendSheet.getColumn(3).width = 12;
    legendSheet.getColumn(4).width = 12;

    const legendHeader = legendSheet.getRow(1);
    legendHeader.getCell(1).value = '번호';
    legendHeader.getCell(2).value = '색상';
    legendHeader.getCell(3).value = 'HEX 코드';
    legendHeader.getCell(4).value = '사용 비율';
    legendHeader.font = { bold: true };

    palette.forEach((entry, idx) => {
        const row = legendSheet.getRow(idx + 2);
        row.getCell(1).value = idx + 1;
        row.getCell(1).alignment = { horizontal: 'center' };

        const hex = entry.color.map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();
        const colorCell = row.getCell(2);
        colorCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF' + hex }
        };

        row.getCell(3).value = rgbToHex(entry.color).toUpperCase();
        row.getCell(4).value = entry.percentage + '%';
        row.getCell(4).alignment = { horizontal: 'right' };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, '배색뜨기_도안.xlsx');
}

// ─── PDF 내보내기 ───

/**
 * 도안을 PDF 파일로 내보내기 (가이드라인 + 메모리 번호 포함)
 */
export function exportToPdf(pixelGrid, palette, width, height, scalePercent = 100, guidelineColor = [255, 0, 0]) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const headerHeight = 8;

    const usableWidth = pageWidth - margin * 2 - headerHeight;
    const usableHeight = pageHeight - margin * 2 - headerHeight;

    // 셀 비율 가로 3 : 세로 2
    const baseCellW = usableWidth / width;
    const baseCellH = usableHeight / height;
    const baseUnit = Math.min(baseCellW / 3, baseCellH / 2);
    const scaleFactor = scalePercent / 100;
    const cellW = baseUnit * 3 * scaleFactor;
    const cellH = baseUnit * 2 * scaleFactor;

    const colsPerPage = Math.floor(usableWidth / cellW);
    const rowsPerPage = Math.floor(usableHeight / cellH);

    const pageCols = Math.ceil(width / colsPerPage);
    const pageRows = Math.ceil(height / rowsPerPage);

    let firstPage = true;

    for (let pageRow = 0; pageRow < pageRows; pageRow++) {
        for (let pageCol = 0; pageCol < pageCols; pageCol++) {
            if (!firstPage) doc.addPage();
            firstPage = false;

            const startX = pageCol * colsPerPage;
            const startY = pageRow * rowsPerPage;
            const endX = Math.min(startX + colsPerPage, width);
            const endY = Math.min(startY + rowsPerPage, height);
            const currentCols = endX - startX;
            const currentRows = endY - startY;

            // 페이지 정보
            if (pageCols > 1 || pageRows > 1) {
                doc.setFontSize(7);
                doc.setTextColor(150);
                doc.text(
                    `페이지 (${pageCol + 1},${pageRow + 1}) / (${pageCols},${pageRows})  |  코 ${startX + 1}~${endX}, 단 ${startY + 1}~${endY}`,
                    margin, margin
                );
            }

            const offsetX = margin + headerHeight;
            const offsetY = margin;

            // 셀 색상 채우기
            for (let y = 0; y < currentRows; y++) {
                for (let x = 0; x < currentCols; x++) {
                    const colorIdx = pixelGrid[startY + y][startX + x];
                    const [r, g, b] = palette[colorIdx].color;
                    doc.setFillColor(r, g, b);
                    doc.rect(offsetX + x * cellW, offsetY + y * cellH, cellW, cellH, 'F');
                }
            }

            // 기본 그리드 선
            doc.setDrawColor(180);
            doc.setLineWidth(0.1);
            for (let x = 0; x <= currentCols; x++) {
                doc.line(offsetX + x * cellW, offsetY, offsetX + x * cellW, offsetY + currentRows * cellH);
            }
            for (let y = 0; y <= currentRows; y++) {
                doc.line(offsetX, offsetY + y * cellH, offsetX + currentCols * cellW, offsetY + y * cellH);
            }

            // 가이드라인 (5코/5단마다 두꺼운 선)
            if (guidelineColor) {
                doc.setDrawColor(guidelineColor[0], guidelineColor[1], guidelineColor[2]);
                doc.setLineWidth(0.4);

                for (let x = 0; x <= currentCols; x++) {
                    const stitchNum = width - (startX + x);
                    if (stitchNum > 0 && stitchNum % 5 === 0) {
                        doc.line(offsetX + x * cellW, offsetY, offsetX + x * cellW, offsetY + currentRows * cellH);
                    }
                }

                for (let y = 0; y <= currentRows; y++) {
                    const rowNum = height - (startY + y);
                    if (rowNum > 0 && rowNum % 5 === 0) {
                        doc.line(offsetX, offsetY + y * cellH, offsetX + currentCols * cellW, offsetY + y * cellH);
                    }
                }
            }

            // 메모리 번호
            const pdfFontSize = 8;
            doc.setFontSize(pdfFontSize);
            doc.setTextColor(100);

            // 번호 간격: 가로는 cellW 기준, 세로는 cellH 기준
            let labelIntervalX;
            if (cellW * 2 >= 4) { labelIntervalX = 2; }
            else if (cellW * 5 >= 4) { labelIntervalX = 5; }
            else { labelIntervalX = 10; }

            let labelIntervalY;
            if (cellH * 2 >= 3) { labelIntervalY = 2; }
            else if (cellH * 5 >= 3) { labelIntervalY = 5; }
            else { labelIntervalY = 10; }

            const shouldShowX = (num) => labelIntervalX === 2 ? (num % 2 === 1) : (num % labelIntervalX === 0);
            const shouldShowY = (num) => labelIntervalY === 2 ? (num % 2 === 1) : (num % labelIntervalY === 0);

            // 하단: 코 번호
            for (let x = 0; x < currentCols; x++) {
                const stitchNum = width - (startX + x);
                if (shouldShowX(stitchNum)) {
                    doc.text(
                        String(stitchNum),
                        offsetX + x * cellW + cellW / 2,
                        offsetY + currentRows * cellH + 2.5,
                        { align: 'center' }
                    );
                }
            }

            // 오른쪽: 단 번호
            for (let y = 0; y < currentRows; y++) {
                const rowNum = height - (startY + y);
                if (shouldShowY(rowNum)) {
                    doc.text(
                        String(rowNum),
                        offsetX + currentCols * cellW + 1,
                        offsetY + y * cellH + cellH / 2 + 0.5,
                        { align: 'left' }
                    );
                }
            }
        }
    }

    // ── 색상표 페이지 ──
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('색상표 (Legend)', margin, margin + 10);

    const legendStartY = margin + 20;
    const swatchSize = 8;
    const lineHeight = 12;

    palette.forEach((entry, idx) => {
        const y = legendStartY + idx * lineHeight;
        if (y + lineHeight > pageHeight - margin) {
            doc.addPage();
        }
        const drawY = y > pageHeight - margin ? legendStartY : y;

        const [r, g, b] = entry.color;
        doc.setFillColor(r, g, b);
        doc.rect(margin, drawY, swatchSize, swatchSize, 'F');
        doc.setDrawColor(180);
        doc.rect(margin, drawY, swatchSize, swatchSize, 'S');

        doc.setFontSize(10);
        doc.setTextColor(0);
        const hex = rgbToHex(entry.color).toUpperCase();
        doc.text(
            `${idx + 1}.  ${hex}  (${entry.percentage}%)`,
            margin + swatchSize + 4,
            drawY + swatchSize - 1
        );
    });

    doc.save('배색뜨기_도안.pdf');
}
