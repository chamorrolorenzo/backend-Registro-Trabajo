import PDFDocument from "pdfkit";
const formatARDate = (d) => new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
}).format(d);
const formatARTime = (d) => new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
}).format(d);
const toBuffer = (doc) => new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
});
const hr = (doc) => {
    const y = doc.y;
    doc
        .moveTo(doc.page.margins.left, y)
        .lineTo(doc.page.width - doc.page.margins.right, y)
        .stroke();
};
const header = (doc, title, meta) => {
    doc.fontSize(18).text(title, { align: "left" });
    doc.moveDown(0.5);
    doc.fontSize(10);
    for (const m of meta) {
        doc.text(`${m.label}: ${m.value}`);
    }
    doc.moveDown(0.8);
    hr(doc);
    doc.moveDown(1);
};
const tableHeader = (doc, cols) => {
    doc.fontSize(10).font("Helvetica-Bold").text(cols.join("   |   "));
    doc.font("Helvetica").moveDown(0.5);
};
export const buildHoursPdf = async (opts) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    header(doc, "Reporte de Horas", [
        { label: "Empresa", value: opts.companyName },
        { label: "Usuario", value: opts.username },
        { label: "Mes", value: opts.monthLabel },
        {
            label: "Generado",
            value: `${formatARDate(new Date())} ${formatARTime(new Date())}`,
        },
    ]);
    tableHeader(doc, ["Fecha", "Entrada", "Salida", "Hs", "Extras"]);
    let totalMin = 0;
    let extraMin = 0;
    doc.fontSize(10);
    for (const r of opts.rows) {
        const entry = r.entryTime;
        const exit = r.exitTime;
        const minutes = Math.max(0, r.totalMinutes || 0);
        totalMin += minutes;
        const extras = Math.max(0, minutes - 8 * 60);
        extraMin += extras;
        doc.text([
            formatARDate(entry),
            formatARTime(entry),
            exit ? formatARTime(exit) : "—",
            (minutes / 60).toFixed(2),
            extras > 0 ? `+${(extras / 60).toFixed(2)}` : "—",
        ].join("   |   "));
        if (doc.y > doc.page.height - 80)
            doc.addPage();
    }
    doc.moveDown(1);
    hr(doc);
    doc.moveDown(0.7);
    doc.font("Helvetica-Bold").text("Totales");
    doc.font("Helvetica");
    doc.text(`Horas: ${(totalMin / 60).toFixed(2)} hs`);
    doc.text(`Extras: +${(extraMin / 60).toFixed(2)} hs`);
    return toBuffer(doc);
};
export const buildTripsPdf = async (opts) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    header(doc, "Reporte de Viajes", [
        { label: "Empresa", value: opts.companyName },
        { label: "Usuario", value: opts.username },
        { label: "Mes", value: opts.monthLabel },
        {
            label: "Generado",
            value: `${formatARDate(new Date())} ${formatARTime(new Date())}`,
        },
    ]);
    tableHeader(doc, ["Fecha", "Remito", "M³"]);
    let totalM3 = 0;
    doc.fontSize(10);
    for (const r of opts.rows) {
        totalM3 += Number(r.cubicMeters || 0);
        doc.text([
            formatARDate(r.date),
            r.remito,
            String(r.cubicMeters),
        ].join("   |   "));
        if (doc.y > doc.page.height - 80)
            doc.addPage();
    }
    doc.moveDown(1);
    hr(doc);
    doc.moveDown(0.7);
    doc.font("Helvetica-Bold").text("Totales");
    doc.font("Helvetica");
    doc.text(`M³: ${totalM3.toFixed(2)}`);
    return toBuffer(doc);
};
export const buildMonthlyReportPdf = async (opts) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    // -------- VIAJES --------
    header(doc, "Reporte de Viajes", [
        { label: "Empresa", value: opts.companyName },
        { label: "Usuario", value: opts.username },
        { label: "Mes", value: opts.monthLabel },
    ]);
    tableHeader(doc, ["Fecha", "Remito", "M³"]);
    let totalM3 = 0;
    doc.fontSize(10);
    for (const r of opts.trips) {
        totalM3 += Number(r.cubicMeters || 0);
        doc.text([
            formatARDate(r.date),
            r.remito,
            String(r.cubicMeters),
        ].join("   |   "));
        if (doc.y > doc.page.height - 80)
            doc.addPage();
    }
    doc.moveDown(1);
    hr(doc);
    doc.moveDown(0.7);
    doc.text(`Total M³: ${totalM3.toFixed(2)}`);
    // -------- HORAS --------
    doc.addPage();
    header(doc, "Reporte de Horas", [
        { label: "Empresa", value: opts.companyName },
        { label: "Usuario", value: opts.username },
        { label: "Mes", value: opts.monthLabel },
    ]);
    tableHeader(doc, ["Fecha", "Entrada", "Salida", "Hs", "Extras"]);
    let totalMin = 0;
    let extraMin = 0;
    doc.fontSize(10);
    for (const r of opts.hours) {
        const entry = r.entryTime;
        const exit = r.exitTime;
        const minutes = Math.max(0, r.totalMinutes || 0);
        totalMin += minutes;
        const extras = Math.max(0, minutes - 8 * 60);
        extraMin += extras;
        doc.text([
            formatARDate(entry),
            formatARTime(entry),
            exit ? formatARTime(exit) : "—",
            (minutes / 60).toFixed(2),
            extras > 0 ? `+${(extras / 60).toFixed(2)}` : "—",
        ].join("   |   "));
        if (doc.y > doc.page.height - 80)
            doc.addPage();
    }
    doc.moveDown(1);
    hr(doc);
    doc.moveDown(0.7);
    doc.text(`Horas: ${(totalMin / 60).toFixed(2)} hs`);
    doc.text(`Extras: ${(extraMin / 60).toFixed(2)} hs`);
    // -------- RESUMEN --------
    doc.addPage();
    header(doc, "Resumen Mensual", [
        { label: "Empresa", value: opts.companyName },
        { label: "Usuario", value: opts.username },
        { label: "Mes", value: opts.monthLabel },
    ]);
    doc.fontSize(11);
    doc.text(`Total viajes: ${opts.trips.length}`);
    doc.text(`Total M³ transportados: ${totalM3.toFixed(2)}`);
    doc.text(`Total horas trabajadas: ${(totalMin / 60).toFixed(2)} hs`);
    doc.text(`Total horas extras: ${(extraMin / 60).toFixed(2)} hs`);
    return toBuffer(doc);
};
