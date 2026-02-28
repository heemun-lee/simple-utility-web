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

    const guideHex = 'FF' + guidelineColor.map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();

    // 열 너비 설정
    sheet.getColumn(1).width = 4;
    for (let x = 0; x < width; x++) {
        sheet.getColumn(x + 2).width = 3;
    }

    // 열 너비 설정
    sheet.getColumn(1).width = 4;
    for (let x = 0; x < width; x++) {
        sheet.getColumn(x + 2).width = 3;
    }
    // 오른쪽 단 번호 열
    sheet.getColumn(width + 2).width = 4;

    // 도안 데이터 행
    for (let y = 0; y < height; y++) {
        const row = sheet.getRow(y + 1);
        row.height = 18;

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

    const baseCellSize = Math.min(usableWidth / width, usableHeight / height);
    const scaleFactor = scalePercent / 100;
    const cellSize = baseCellSize * scaleFactor;

    const colsPerPage = Math.floor(usableWidth / cellSize);
    const rowsPerPage = Math.floor(usableHeight / cellSize);

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
                    doc.rect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize, 'F');
                }
            }

            // 기본 그리드 선
            doc.setDrawColor(180);
            doc.setLineWidth(0.1);
            for (let x = 0; x <= currentCols; x++) {
                doc.line(offsetX + x * cellSize, offsetY, offsetX + x * cellSize, offsetY + currentRows * cellSize);
            }
            for (let y = 0; y <= currentRows; y++) {
                doc.line(offsetX, offsetY + y * cellSize, offsetX + currentCols * cellSize, offsetY + y * cellSize);
            }

            // 가이드라인 (5코/5단마다 두꺼운 선)
            doc.setDrawColor(guidelineColor[0], guidelineColor[1], guidelineColor[2]);
            doc.setLineWidth(0.4);

            // 코 가이드라인 (세로선)
            for (let x = 0; x <= currentCols; x++) {
                const stitchNum = width - (startX + x);
                if (stitchNum > 0 && stitchNum % 5 === 0) {
                    doc.line(offsetX + x * cellSize, offsetY, offsetX + x * cellSize, offsetY + currentRows * cellSize);
                }
            }

            // 단 가이드라인 (가로선)
            for (let y = 0; y <= currentRows; y++) {
                const rowNum = height - (startY + y);
                if (rowNum > 0 && rowNum % 5 === 0) {
                    doc.line(offsetX, offsetY + y * cellSize, offsetX + currentCols * cellSize, offsetY + y * cellSize);
                }
            }

            // 메모리 번호 — 그리드 바깥 (하단: 코 번호, 오른쪽: 단 번호)
            const pdfFontSize = 8;
            doc.setFontSize(pdfFontSize);
            doc.setTextColor(100);

            // 셀 크기(mm)에 따라 번호 표시 간격 결정 (8pt ≈ 2.8mm)
            let labelInterval;
            if (cellSize * 2 >= 4) {
                labelInterval = 2; // 홀수
            } else if (cellSize * 5 >= 4) {
                labelInterval = 5; // 5의 배수
            } else {
                labelInterval = 10; // 10의 배수
            }

            const shouldShow = (num) => labelInterval === 2
                ? (num % 2 === 1)
                : (num % labelInterval === 0);

            // 하단: 코 번호
            for (let x = 0; x < currentCols; x++) {
                const stitchNum = width - (startX + x);
                if (shouldShow(stitchNum)) {
                    doc.text(
                        String(stitchNum),
                        offsetX + x * cellSize + cellSize / 2,
                        offsetY + currentRows * cellSize + 2.5,
                        { align: 'center' }
                    );
                }
            }

            // 오른쪽: 단 번호
            for (let y = 0; y < currentRows; y++) {
                const rowNum = height - (startY + y);
                if (shouldShow(rowNum)) {
                    doc.text(
                        String(rowNum),
                        offsetX + currentCols * cellSize + 1,
                        offsetY + y * cellSize + cellSize / 2 + 0.5,
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
