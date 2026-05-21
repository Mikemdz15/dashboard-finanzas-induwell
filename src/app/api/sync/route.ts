import { NextResponse } from 'next/server';
import Papa from 'papaparse';

const SHEET_ID = '1rR_zW-rBNUPRdNGcTl5rv4pXMlckw8uAp-jzfZv9WL8';

// Helper to parse numbers like "-1,045" or "48.60%" to floats
const parseNumber = (val: any) => {
  if (val === undefined || val === null || val === '-' || val === '') return 0;
  if (typeof val === 'number') return val;
  const cleaned = val.toString().replace(/,/g, '').replace(/%/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

export async function GET() {
  try {
    const sheets = ['ACUMULADO', 'INTEGRADOR', 'PLAN', 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const rawData: Record<string, any[]> = {};

    await Promise.all(sheets.map(async (sheet) => {
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheet}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const csvText = await response.text();
        const parsed = Papa.parse(csvText, { header: sheet !== 'PLAN', skipEmptyLines: true });
        if (parsed.data && parsed.data.length > 0) {
          if (sheet !== 'ACUMULADO' && sheet !== 'PLAN') {
            const firstCol = Object.keys(parsed.data[0] as any)[0];
            const firstColUpper = firstCol.toUpperCase();
            // Google Sheets returns the first sheet if the requested sheet doesn't exist
            if (
              firstColUpper.includes('ACUMULADO') || 
              firstColUpper.includes('PLAN') || 
              firstColUpper.includes('P&L')
            ) {
              return; // Skip this sheet because it doesn't really exist yet
            }
          }
          rawData[sheet] = parsed.data as any[];
        }
      }
    }));

    // Process the data to create our dynamic "db" structure
    const db: any = {};
    
    // Extracción de nombres de columnas (unidades de negocio) desde ACUMULADO
    if (rawData['ACUMULADO'] && rawData['ACUMULADO'].length > 0) {
      const firstRow = rawData['ACUMULADO'][0];
      // Las columnas son todas excepto la primera (que dice ACUMULADO x UN)
      const keys = Object.keys(firstRow);
      const metricCol = keys[0]; // ej: "ACUMULADO x UN"
      
      // Filtrar columnas vacías o no deseadas
      const businessUnits = keys.filter(k => k !== metricCol && !k.startsWith('Unnamed'));

      const businessTypeMap: Record<string, string> = {
        'liquidos': 'Maquila',
        'womax': 'Comercialización',
        'tintes': 'Comercialización',
        'veladoras': 'Maquila',
        'dulces': 'Comercialización',
        'maruchan': 'Comercialización',
        'foco': 'Comercialización',
        'polvos': 'Maquila',
        'desperdicio': 'Otros',
        'boing': 'Comercialización',
        'cosmeticos': 'Comercialización',
        'desechables': 'Comercialización',
        'racks': 'Comercialización',
        'accfo': 'Otros',
        'vending': 'Otros',
        'oneg': 'Otros',
        'total': 'Consolidado'
      };

      // Mapear los índices de las filas de PLAN dinámicamente según las etiquetas oficiales
      const hasPlan = !!rawData['PLAN'];
      const planData = rawData['PLAN'];
      const planBuOrder = [
        'liquidos', 'womax', 'tintes', 'veladoras', 'dulces', 'maruchan', 'focos',
        'accfo', 'polvos', 'desperdicio', 'boing', 'cosmeticos', 'desechables',
        'vending', 'racks', 'oneg'
      ];
      
      const getBuPlanIndex = (buId: string) => {
        if (buId === 'total') return 16;
        return planBuOrder.indexOf(buId);
      };

      const findRowIdx = (label: string) => {
        if (!hasPlan || !planData) return -1;
        // La primera columna de PLAN contiene las etiquetas de fila
        const idx = planData.findIndex(row => row[0]?.toString().trim().toLowerCase() === label.toLowerCase());
        if (idx !== -1) return idx;
        return planData.findIndex(row => row[0]?.toString().trim().toLowerCase().includes(label.toLowerCase()));
      };

      const planVentasRowIdx = findRowIdx('Total Ventas Netas') !== -1 ? findRowIdx('Total Ventas Netas') : 6;
      const planCostoRowIdx = findRowIdx('Total Costo') !== -1 ? findRowIdx('Total Costo') : 10;
      const planFijosRowIdx = findRowIdx('Total Fijos') !== -1 ? findRowIdx('Total Fijos') : 23;
      const planVariablesRowIdx = findRowIdx('Total Variables') !== -1 ? findRowIdx('Total Variables') : 43;
      const planGastosRowIdx = findRowIdx('Total Gastos') !== -1 ? findRowIdx('Total Gastos') : 44;
      const planEbitdaRowIdx = findRowIdx('EBITDA') !== -1 ? findRowIdx('EBITDA') : 45;

      const planSueldosRowIdx = findRowIdx('Sueldos y Salarios') !== -1 ? findRowIdx('Sueldos y Salarios') : 13;
      const planEnergiaRowIdx = findRowIdx('Energia Electrica') !== -1 ? findRowIdx('Energia Electrica') : 15;
      const planFletesRowIdx = findRowIdx('Fletes') !== -1 ? findRowIdx('Fletes') : 25;
      const planMantRowIdx = findRowIdx('Mantenimientos') !== -1 ? findRowIdx('Mantenimientos') : 27;

      let maquilaVentas = 0; let maquilaEbitda = 0;
      let comVentas = 0; let comEbitda = 0;

      businessUnits.forEach(bu => {
        const id = bu.toLowerCase().replace(/[^a-z0-9]/g, '');
        const type = businessTypeMap[id] || 'Otros';
        const vtas = parseNumber(rawData['ACUMULADO'].find(r => r[metricCol]?.trim() === 'Total Ventas Netas' || r[metricCol]?.trim() === 'Ventas')?.[bu]);
        const eb = parseNumber(rawData['ACUMULADO'].find(r => r[metricCol]?.trim() === 'EBITDA' || r[metricCol]?.trim() === 'Ebitda' || r[metricCol]?.trim() === 'ebitda')?.[bu]);
        
        if (type === 'Maquila') {
          maquilaVentas += vtas;
          maquilaEbitda += eb;
        } else if (type === 'Comercialización') {
          comVentas += vtas;
          comEbitda += eb;
        }
      });

      const avgMaquilaMargin = maquilaVentas ? (maquilaEbitda / maquilaVentas) * 100 : 0;
      const avgComMargin = comVentas ? (comEbitda / comVentas) * 100 : 0;

      const getBenchmarkDesc = (myMargin: number, type: string, isConsolidado: boolean) => {
        if (isConsolidado) {
          return `El grupo opera con un margen consolidado del ${myMargin.toFixed(1)}%. En benchmark, las Maquilas promedian ${avgMaquilaMargin.toFixed(1)}% y Comercialización ${avgComMargin.toFixed(1)}%.`;
        }
        if (type === 'Maquila') {
          const diff = myMargin - avgMaquilaMargin;
          return diff >= 0 
            ? `Esta Maquiladora opera al ${myMargin.toFixed(1)}%, ubicándose por encima del promedio industrial del grupo (${avgMaquilaMargin.toFixed(1)}%). Excelente rentabilidad de planta.`
            : `Esta Maquiladora opera al ${myMargin.toFixed(1)}%, por debajo del promedio industrial (${avgMaquilaMargin.toFixed(1)}%). Sugerencia: Enfocar revisión en optimización de línea, mermas o costo de materia prima.`;
        }
        if (type === 'Comercialización') {
          const diff = myMargin - avgComMargin;
          return diff >= 0 
            ? `Esta Comercializadora opera al ${myMargin.toFixed(1)}%, ubicándose por encima del promedio comercial del grupo (${avgComMargin.toFixed(1)}%). Alta eficiencia de margen.`
            : `Esta Comercializadora opera al ${myMargin.toFixed(1)}%, por debajo del promedio comercial (${avgComMargin.toFixed(1)}%). Sugerencia: Auditar cadena de suministro, fletes y rotación de inventario para elevar EBITDA.`;
        }
        return `Unidad operativa de soporte (Margen: ${myMargin.toFixed(1)}%). No sujeta a benchmarking comercial directo.`;
      };

      businessUnits.forEach(bu => {
        const id = bu.toLowerCase().replace(/[^a-z0-9]/g, '');
        const isTotal = bu.toLowerCase() === 'total';
        
        // Extraer métricas para esta UN de ACUMULADO
        const metrics: Record<string, number> = {};
        rawData['ACUMULADO'].forEach(row => {
          const metricName = row[metricCol];
          if (metricName && metricName !== metricCol) {
            metrics[metricName.trim()] = parseNumber(row[bu]);
          }
        });

        let sueldosYtd = 0;
        let energiaYtd = 0;
        let fletesYtd = 0;
        let mantYtd = 0;
        
        Object.keys(metrics).forEach(mName => {
          const lower = mName.toLowerCase();
          if (lower.includes('sueldos') || lower.includes('salarios')) sueldosYtd += metrics[mName];
          else if (lower.includes('energía') || lower.includes('energia') || lower.includes('eléctrica') || lower.includes('electrica')) energiaYtd += metrics[mName];
          else if (lower.includes('fletes')) fletesYtd += metrics[mName];
          else if (lower.includes('mantenimiento')) mantYtd += metrics[mName];
        });

        const vtasNetas = metrics['Total Ventas Netas'] || metrics['Ventas'] || 0;
        const totalCosto = metrics['Total Costo'] || metrics['Costo'] || 0;
        const totalGastos = metrics['Total Gastos'] || ((metrics['Total Fijos'] || 0) + (metrics['Total Variables'] || metrics['Total gastos variables'] || 0));
        const ebitda = metrics['EBITDA'] || metrics['Ebitda'] || metrics['ebitda'] || (vtasNetas + totalCosto + totalGastos);

        const monthSheets = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
        const validMonths = monthSheets.filter(m => rawData[m]);
        const numMonths = validMonths.length || 1;
        
        const avgVentas = vtasNetas / numMonths;
        const avgCosto = totalCosto / numMonths;
        const avgGastos = totalGastos / numMonths;
        const avgEbitda = ebitda / numMonths;

        // Calcular PLAN YTD acumulado para los meses válidos
        let planVtasYtd = 0;
        let planCostoYtd = 0;
        let planGastosYtd = 0;
        let planEbitdaYtd = 0;

        const buIndex = getBuPlanIndex(id);

        if (hasPlan && planData) {
          validMonths.forEach(m => {
            const mIdx = monthSheets.indexOf(m);
            if (mIdx !== -1) {
              const colIndex = 1 + (mIdx * 17) + buIndex;
              planVtasYtd += parseNumber(planData[planVentasRowIdx]?.[colIndex]);
              planCostoYtd += parseNumber(planData[planCostoRowIdx]?.[colIndex]);
              planGastosYtd += parseNumber(planData[planGastosRowIdx]?.[colIndex]);
              planEbitdaYtd += parseNumber(planData[planEbitdaRowIdx]?.[colIndex]);
            }
          });
        }

        const getPlanDesc = (realVal: number, planVal: number, isNeg = false) => {
          if (!hasPlan) return '';
          const planM = planVal / 1000;
          let variation = 0;
          if (isNeg) {
            const realAbs = Math.abs(realVal);
            const planAbs = Math.abs(planVal);
            variation = planAbs !== 0 ? ((realAbs - planAbs) / planAbs) * 100 : 0;
          } else {
            variation = planVal !== 0 ? ((realVal - planVal) / Math.abs(planVal)) * 100 : 0;
          }
          const sign = variation >= 0 ? '+' : '';
          return `Plan: $${planM.toFixed(1)}M (Var: ${sign}${variation.toFixed(1)}%)`;
        };

        // Extraer métricas mensuales dinámicas
        const monthlyVentas: number[] = [];
        const monthlyCosto: number[] = [];
        const monthlyUtilidad: number[] = [];
        const monthlySueldos: number[] = [];
        const monthlyEnergia: number[] = [];
        const monthlyFletes: number[] = [];
        const monthlyMant: number[] = [];
        const monthlyDataDict: Record<string, any> = {};
        
        monthSheets.forEach(mSheet => {
          if (rawData[mSheet]) {
            const mMetricCol = Object.keys(rawData[mSheet][0])[0];
            let mVentas = 0;
            let mUtilidad = 0;
            let mCosto = 0;
            let mFijos = 0;
            let mVariables = 0;
            let mGastos = 0;

            let mSueldos = 0;
            let mEnergia = 0;
            let mFletes = 0;
            let mMant = 0;

            rawData[mSheet].forEach(row => {
              const mName = row[mMetricCol]?.trim();
              if (!mName) return;
              const lower = mName.toLowerCase();
              if (mName === 'Ventas' || mName === 'Total Ventas Netas') mVentas = parseNumber(row[bu]);
              if (mName === 'EBITDA' || mName === 'Utilidad de Operación' || mName === 'Utilidad Neta') mUtilidad = parseNumber(row[bu]);
              if (mName === 'Costo' || mName === 'Total Costo') mCosto = parseNumber(row[bu]);
              if (mName === 'Total Fijos') mFijos = parseNumber(row[bu]);
              if (mName === 'Total Variables' || mName === 'Total gastos variables') mVariables = parseNumber(row[bu]);
              if (mName === 'Total Gastos') mGastos = parseNumber(row[bu]);
              
              if (lower.includes('sueldos') || lower.includes('salarios')) mSueldos += parseNumber(row[bu]);
              else if (lower.includes('energía') || lower.includes('energia') || lower.includes('eléctrica') || lower.includes('electrica')) mEnergia += parseNumber(row[bu]);
              else if (lower.includes('fletes')) mFletes += parseNumber(row[bu]);
              else if (lower.includes('mantenimiento')) mMant += parseNumber(row[bu]);
            });

            mGastos = mGastos || (mFijos + mVariables);

            monthlyVentas.push(mVentas);
            monthlyCosto.push(mCosto);
            monthlyUtilidad.push(mUtilidad);
            monthlySueldos.push(mSueldos);
            monthlyEnergia.push(mEnergia);
            monthlyFletes.push(mFletes);
            monthlyMant.push(mMant);

            const prettyName = mSheet.charAt(0).toUpperCase() + mSheet.slice(1).toLowerCase();
            const mIdx = monthSheets.indexOf(mSheet);
            const mColIndex = 1 + (mIdx * 17) + buIndex;

            // Extraer presupuestos mensuales
            const planVentasMVal = hasPlan && planData ? parseNumber(planData[planVentasRowIdx]?.[mColIndex]) : 0;
            const planCostoMVal = hasPlan && planData ? parseNumber(planData[planCostoRowIdx]?.[mColIndex]) : 0;
            const planGastosMVal = hasPlan && planData ? parseNumber(planData[planGastosRowIdx]?.[mColIndex]) : 0;
            const planEbitdaMVal = hasPlan && planData ? parseNumber(planData[planEbitdaRowIdx]?.[mColIndex]) : 0;

            const planVentasM = planVentasMVal / 1000;
            const planCostoM = planCostoMVal / 1000;
            const planGastosM = planGastosMVal / 1000;
            const planEbitdaM = planEbitdaMVal / 1000;

            // Guardar vista aislada del mes con análisis clínico descriptivo
            monthlyDataDict[mSheet] = {
              kpis: [
                { label: `Ventas ${prettyName}`, value: `$${(mVentas/1000).toFixed(1)}M`, sub: "Ventas Netas", trend: "up", trendVal: "Ref Sheet", avgDesc: `Promedio mensual anualizado: $${(avgVentas/1000).toFixed(1)}M`, planDesc: getPlanDesc(mVentas, planVentasMVal) },
                { label: `Costo Total ${prettyName}`, value: `$${(mCosto/1000).toFixed(1)}M`, sub: "Costo Directo", trend: "down", trendVal: `${mVentas ? Math.abs((mCosto/mVentas)*100).toFixed(1) : 0}% s/Vtas`, avgDesc: `Promedio mensual anualizado: $${(avgCosto/1000).toFixed(1)}M`, planDesc: getPlanDesc(mCosto, planCostoMVal, true) },
                { label: `Gastos ${prettyName}`, value: `$${(mGastos/1000).toFixed(1)}M`, sub: "Fijos + Variables", trend: "down", trendVal: `${mVentas ? Math.abs((mGastos/mVentas)*100).toFixed(1) : 0}% s/Vtas`, avgDesc: `Promedio mensual anualizado: $${(avgGastos/1000).toFixed(1)}M`, planDesc: getPlanDesc(mGastos, planGastosMVal, true) },
                { label: `EBITDA ${prettyName}`, value: `$${(mUtilidad/1000).toFixed(1)}M`, sub: "Beneficio Operativo", trend: "up", trendVal: `${mVentas ? ((mUtilidad/mVentas)*100).toFixed(1) : 0}% Margen`, avgDesc: `Promedio mensual anualizado: $${(avgEbitda/1000).toFixed(1)}M`, planDesc: getPlanDesc(mUtilidad, planEbitdaMVal) }
              ],
              insights: `
                <p><strong>Desempeño Operativo ${prettyName}:</strong> Se registraron ventas netas por $${mVentas.toLocaleString('es-MX')} MXN, con costos de $${mCosto.toLocaleString('es-MX')} y gastos de $${mGastos.toLocaleString('es-MX')}.</p>
                <p class="text-blue-700 bg-blue-50 p-2 rounded border border-blue-100"><strong>EBITDA ${prettyName}:</strong> $${mUtilidad.toLocaleString('es-MX')} MXN.</p>
              `,
              charts: {
                trend: {
                  labels: [prettyName], 
                  real: [mVentas/1000],
                  plan: hasPlan ? [planVentasM] : undefined,
                  desc: `<strong>Diagnóstico Clínico ${prettyName} (Tendencia):</strong> El volumen de ventas en ${prettyName} presenta su comportamiento real aislado de la estacionalidad acumulada. Se recomienda monitorear posibles picos o caídas en la demanda comercial para este periodo específico frente al presupuesto mensual.`
                },
                trendCost: {
                  labels: [prettyName], 
                  real: [mCosto/1000],
                  plan: hasPlan ? [planCostoM] : undefined,
                  desc: `<strong>Diagnóstico Clínico ${prettyName} (Costo):</strong> El volumen de costo de ventas en ${prettyName} presenta su comportamiento real. Se recomienda monitorear posibles variaciones respecto al presupuesto mensual.`
                },
                composition: {
                  type: 'bar',
                  title: `EBITDA ${prettyName}`,
                  labels: [prettyName],
                  data: [mUtilidad/1000],
                  plan: hasPlan ? [planEbitdaM] : undefined,
                  desc: `<strong>Diagnóstico Clínico ${prettyName} (EBITDA):</strong> El margen operativo del mes (${mVentas ? ((mUtilidad/mVentas)*100).toFixed(1) : 0}%) refleja la eficiencia bruta de conversión a flujo de caja libre. Desviaciones negativas aquí alertan ineficiencias críticas de control de gastos sobre los ingresos obtenidos en los 30 días operados.`
                },
                pnl: {
                  labels: ['Ventas Netas', 'Total Costo', 'Total Gastos', 'EBITDA'],
                  data: [mVentas/1000, mCosto/1000, mGastos/1000, mUtilidad/1000],
                  plan: hasPlan ? [planVentasM, planCostoM, planGastosM, planEbitdaM] : undefined,
                  desc: `<strong>Diagnóstico Clínico ${prettyName} (P&L):</strong> ${getBenchmarkDesc(mVentas ? (mUtilidad/mVentas)*100 : 0, businessTypeMap[id] || 'Otros', isTotal)}`
                }
              }
            };
          }
        });

        db[id] = {
          id: id,
          name: isTotal ? "Consolidado GRUPO INDUWELL" : bu,
          type: businessTypeMap[id] || (isTotal ? 'Consolidado' : 'Otros'),
          icon: isTotal ? "building-2" : "shopping-bag",
          kpis: [
            { label: "Ventas YTD", value: `$${(vtasNetas/1000).toFixed(1)}M`, sub: "Ventas Netas Acum.", trend: "up", trendVal: "Ref Sheet", avgDesc: `Promedio mensual anualizado: $${(avgVentas/1000).toFixed(1)}M`, planDesc: getPlanDesc(vtasNetas, planVtasYtd) },
            { label: "Costo Total YTD", value: `$${(totalCosto/1000).toFixed(1)}M`, sub: "Costo Directo", trend: "down", trendVal: `${vtasNetas ? Math.abs((totalCosto/vtasNetas)*100).toFixed(1) : 0}% s/Vtas`, avgDesc: `Promedio mensual anualizado: $${(avgCosto/1000).toFixed(1)}M`, planDesc: getPlanDesc(totalCosto, planCostoYtd, true) },
            { label: "Gastos YTD", value: `$${(totalGastos/1000).toFixed(1)}M`, sub: "Fijos + Variables", trend: "down", trendVal: `${vtasNetas ? Math.abs((totalGastos/vtasNetas)*100).toFixed(1) : 0}% s/Vtas`, avgDesc: `Promedio mensual anualizado: $${(avgGastos/1000).toFixed(1)}M`, planDesc: getPlanDesc(totalGastos, planGastosYtd, true) },
            { label: "EBITDA YTD", value: `$${(ebitda/1000).toFixed(1)}M`, sub: "Beneficio Operativo Bruto", trend: "up", trendVal: `${vtasNetas ? ((ebitda/vtasNetas)*100).toFixed(1) : 0}% Margen`, avgDesc: `Promedio mensual anualizado: $${(avgEbitda/1000).toFixed(1)}M`, planDesc: getPlanDesc(ebitda, planEbitdaYtd) }
          ],
          insights: `
            <p><strong>Resumen Automático:</strong> Los datos presentados provienen directamente de la fuente financiera oficial en Google Sheets.</p>
            <p><strong>Desempeño Acumulado:</strong> Se registraron ventas netas por $${vtasNetas.toLocaleString('es-MX')} MXN, con costos de $${totalCosto.toLocaleString('es-MX')} y gastos totales de $${totalGastos.toLocaleString('es-MX')}.</p>
            <p class="text-blue-700 bg-blue-50 p-2 rounded border border-blue-100"><strong>EBITDA Generado:</strong> $${ebitda.toLocaleString('es-MX')} MXN.</p>
          `
        };

        // Cálculo de MoM
        let lastVentas = 0, prevVentas = 0;
        let lastEbitda = 0, prevEbitda = 0;
        let lastCosto = 0, prevCosto = 0;
        let momVentasDesc = '<span class="text-slate-500">N/A</span>';
        let momEbitdaDesc = '<span class="text-slate-500">N/A</span>';
        let momCostoDesc = '<span class="text-slate-500">N/A</span>';

        if (monthlyVentas.length >= 2) {
          lastVentas = monthlyVentas[monthlyVentas.length - 1];
          prevVentas = monthlyVentas[monthlyVentas.length - 2];
          lastEbitda = monthlyUtilidad[monthlyUtilidad.length - 1];
          prevEbitda = monthlyUtilidad[monthlyUtilidad.length - 2];
          lastCosto = monthlyCosto[monthlyCosto.length - 1];
          prevCosto = monthlyCosto[monthlyCosto.length - 2];
          
          const vtasGrowth = prevVentas ? ((lastVentas - prevVentas) / prevVentas) * 100 : 0;
          const ebitdaGrowth = prevEbitda ? ((lastEbitda - prevEbitda) / Math.abs(prevEbitda)) * 100 : 0;
          const costoGrowth = prevCosto ? ((lastCosto - prevCosto) / prevCosto) * 100 : 0;
          
          momVentasDesc = vtasGrowth >= 0 ? `<span class="text-emerald-600 font-semibold">+${vtasGrowth.toFixed(1)}%</span>` : `<span class="text-rose-600 font-semibold">${vtasGrowth.toFixed(1)}%</span>`;
          momEbitdaDesc = ebitdaGrowth >= 0 ? `<span class="text-emerald-600 font-semibold">+${ebitdaGrowth.toFixed(1)}%</span>` : `<span class="text-rose-600 font-semibold">${ebitdaGrowth.toFixed(1)}%</span>`;
          momCostoDesc = costoGrowth <= 0 ? `<span class="text-emerald-600 font-semibold">${costoGrowth.toFixed(1)}%</span>` : `<span class="text-rose-600 font-semibold">+${costoGrowth.toFixed(1)}%</span>`;
        }

        // Proyección usando los datos de PLAN presupuestados para todo el año
        const fullMonthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const lastMonthIndex = validMonths.length > 0 ? monthSheets.indexOf(validMonths[validMonths.length - 1]) : -1;
        
        const nextLabels: string[] = [];
        const nextVentasProy: number[] = [];
        const nextEbitdaProy: number[] = [];
        const nextCostoProy: number[] = [];

        const remainingMonthsCount = 12 - (lastMonthIndex + 1);
        for (let i = 1; i <= remainingMonthsCount; i++) {
          const nextIdx = lastMonthIndex + i;
          if (nextIdx < 12) {
            nextLabels.push(`${fullMonthNames[nextIdx]} (Proy)`);
            if (hasPlan && planData) {
              const nextColIdx = 1 + (nextIdx * 17) + buIndex;
              nextVentasProy.push(parseNumber(planData[planVentasRowIdx]?.[nextColIdx]) / 1000);
              nextCostoProy.push(parseNumber(planData[planCostoRowIdx]?.[nextColIdx]) / 1000);
              nextEbitdaProy.push(parseNumber(planData[planEbitdaRowIdx]?.[nextColIdx]) / 1000);
            } else {
              nextVentasProy.push(avgVentas / 1000);
              nextCostoProy.push(avgCosto / 1000);
              nextEbitdaProy.push(avgEbitda / 1000);
            }
          }
        }

        const trendLabels = [...validMonths.map(m => `${fullMonthNames[monthSheets.indexOf(m)]} (Real)`), ...nextLabels];
        const trendRealData = [...monthlyVentas.map(v => v/1000), ...Array(nextLabels.length).fill(null)];
        const trendProyData = monthlyVentas.map((v, i) => i === monthlyVentas.length - 1 ? v/1000 : null).concat(nextVentasProy);

        const trendCostRealData = [...monthlyCosto.map(c => c/1000), ...Array(nextLabels.length).fill(null)];
        const trendCostProyData = monthlyCosto.map((c, i) => i === monthlyCosto.length - 1 ? c/1000 : null).concat(nextCostoProy);

        const compLabels = [...validMonths.map(m => fullMonthNames[monthSheets.indexOf(m)]), ...nextLabels];
        const compData = [...monthlyUtilidad.map(u => u/1000), ...nextEbitdaProy];
        const compColors = [
          ...monthlyUtilidad.map(u => u < 0 ? '#f43f5e' : '#10b981'), // rose-500, emerald-500
          ...nextEbitdaProy.map(() => '#cbd5e1') // slate-300
        ];

        // Construir arrays de PLAN para gráficos globales (todos los 12 meses)
        const trendPlanData = hasPlan && planData ? [
          ...monthSheets.map((_, mIdx) => {
            return parseNumber(planData[planVentasRowIdx]?.[1 + (mIdx * 17) + buIndex]) / 1000;
          })
        ] : undefined;

        const trendCostPlanData = hasPlan && planData ? [
          ...monthSheets.map((_, mIdx) => {
            return parseNumber(planData[planCostoRowIdx]?.[1 + (mIdx * 17) + buIndex]) / 1000;
          })
        ] : undefined;

        const compPlanData = hasPlan && planData ? [
          ...monthSheets.map((_, mIdx) => {
            return parseNumber(planData[planEbitdaRowIdx]?.[1 + (mIdx * 17) + buIndex]) / 1000;
          })
        ] : undefined;

        const pnlPlanData = hasPlan ? [
          planVtasYtd / 1000,
          planCostoYtd / 1000,
          planGastosYtd / 1000,
          planEbitdaYtd / 1000
        ] : undefined;

        const expensesPlan = hasPlan && planData ? {
          sueldos: monthSheets.map((_, mIdx) => parseNumber(planData[planSueldosRowIdx]?.[1 + (mIdx * 17) + buIndex]) / 1000),
          energia: monthSheets.map((_, mIdx) => parseNumber(planData[planEnergiaRowIdx]?.[1 + (mIdx * 17) + buIndex]) / 1000),
          fletes: monthSheets.map((_, mIdx) => parseNumber(planData[planFletesRowIdx]?.[1 + (mIdx * 17) + buIndex]) / 1000),
          mant: monthSheets.map((_, mIdx) => parseNumber(planData[planMantRowIdx]?.[1 + (mIdx * 17) + buIndex]) / 1000)
        } : undefined;

        db[id].charts = {
          trend: {
            labels: trendLabels,
            real: trendRealData,
            proy: trendProyData,
            plan: trendPlanData,
            desc: `<strong>Diagnóstico Clínico de Crecimiento:</strong> El volumen de ventas del último mes registrado tuvo una variación de ${momVentasDesc} (MoM). Utilizando la proyección confirmada de finanzas (PLAN), se estima una facturación promedio de <strong>$${(nextVentasProy.reduce((a, b) => a + (b || 0), 0) / (nextVentasProy.length || 1)).toFixed(1)}M</strong> para los meses futuros proyectados.`
          },
          trendCost: {
            labels: trendLabels,
            real: trendCostRealData,
            proy: trendCostProyData,
            plan: trendCostPlanData,
            desc: `<strong>Diagnóstico Clínico de Costo:</strong> El costo de ventas del último mes registrado tuvo una variación de ${momCostoDesc} (MoM). Utilizando la proyección confirmada de finanzas (PLAN), se estima un costo de <strong>$${(nextCostoProy.reduce((a, b) => a + (b || 0), 0) / (nextCostoProy.length || 1)).toFixed(1)}M</strong> promedio para los meses futuros proyectados.`
          },
          composition: {
            type: 'bar',
            title: `Evolución EBITDA (Real vs Proyectado)`,
            labels: compLabels,
            data: compData,
            plan: compPlanData,
            colors: compColors,
            desc: `<strong>Análisis de Conversión (EBITDA):</strong> El beneficio operativo varió un ${momEbitdaDesc} respecto al mes inmediato anterior. De acuerdo al plan financiero confirmado, se proyecta un EBITDA de <strong>$${(nextEbitdaProy.reduce((a, b) => a + (b || 0), 0) / (nextEbitdaProy.length || 1)).toFixed(1)}M</strong> promedio para los meses futuros proyectados.`
          },
          pnl: {
            labels: ['Ventas Netas', 'Total Costo', 'Total Gastos', 'EBITDA'],
            data: [vtasNetas/1000, totalCosto/1000, totalGastos/1000, ebitda/1000],
            plan: pnlPlanData,
            desc: `<strong>Estructura P&L y Rentabilidad YTD:</strong> ${getBenchmarkDesc(vtasNetas ? (ebitda/vtasNetas)*100 : 0, businessTypeMap[id] || 'Otros', isTotal)}`
          },
          expenses: {
            labels: fullMonthNames,
            data: {
              sueldos: [...monthlySueldos.map(v => v/1000), ...monthSheets.slice(validMonths.length).map((_, idx) => {
                const mIdx = validMonths.length + idx;
                return parseNumber(planData[planSueldosRowIdx]?.[1 + (mIdx * 17) + buIndex]) / 1000;
              })],
              energia: [...monthlyEnergia.map(v => v/1000), ...monthSheets.slice(validMonths.length).map((_, idx) => {
                const mIdx = validMonths.length + idx;
                return parseNumber(planData[planEnergiaRowIdx]?.[1 + (mIdx * 17) + buIndex]) / 1000;
              })],
              fletes: [...monthlyFletes.map(v => v/1000), ...monthSheets.slice(validMonths.length).map((_, idx) => {
                const mIdx = validMonths.length + idx;
                return parseNumber(planData[planFletesRowIdx]?.[1 + (mIdx * 17) + buIndex]) / 1000;
              })],
              mant: [...monthlyMant.map(v => v/1000), ...monthSheets.slice(validMonths.length).map((_, idx) => {
                const mIdx = validMonths.length + idx;
                return parseNumber(planData[planMantRowIdx]?.[1 + (mIdx * 17) + buIndex]) / 1000;
              })],
              ventas: [...monthlyVentas.map(v => v/1000), ...monthSheets.slice(validMonths.length).map((_, idx) => {
                const mIdx = validMonths.length + idx;
                return parseNumber(planData[planVentasRowIdx]?.[1 + (mIdx * 17) + buIndex]) / 1000;
              })]
            },
            plan: expensesPlan,
            ytd: {
              sueldos: sueldosYtd/1000,
              energia: energiaYtd/1000,
              fletes: fletesYtd/1000,
              mant: mantYtd/1000,
              ventas: vtasNetas/1000
            },
            desc: `<strong>Auditoría OPEX Crítico:</strong> Monitoreo de los 4 rubros que representan ~80% de los gastos (Sueldos, Energía, Fletes y Mantenimiento) vs Ingresos.`
          }
        };

        // Si es Total, hacer la grafica de composition como doughnut usando las ventas de cada subsidiaria
        if (isTotal) {
           const subNames = businessUnits.filter(b => b.toLowerCase() !== 'total');
           
           // Extraer datos
           const subData = subNames.map(b => {
             const ventasVal = rawData['ACUMULADO'].find(r => r[metricCol]?.trim() === 'Total Ventas Netas')?.[b];
             const ebitdaVal = rawData['ACUMULADO'].find(r => r[metricCol]?.trim() === 'EBITDA' || r[metricCol]?.trim() === 'Ebitda' || r[metricCol]?.trim() === 'ebitda')?.[b];
             return {
               name: b,
               ventas: parseNumber(ventasVal) / 1000,
               ebitda: parseNumber(ebitdaVal) / 1000
             };
           });

           // Ordenar de más rentable (mayor ebitda) a menos rentable
           subData.sort((a, b) => b.ebitda - a.ebitda);

           const sortedNames = subData.map(d => d.name);
           const sortedVentas = subData.map(d => d.ventas);
           const sortedEbitda = subData.map(d => d.ebitda);
           const totalEbitdaGrupo = sortedEbitda.reduce((acc, curr) => acc + curr, 0);

           db[id].charts.composition = {
             type: 'doughnut',
             title: 'Ingresos por Subsidiaria YTD',
             labels: sortedNames,
             data: sortedVentas,
             extraData: sortedEbitda,
             totalEbitda: totalEbitdaGrupo,
             desc: "<strong>Aportación Comercial:</strong> Distribución del ingreso neto entre las unidades de negocio."
           };
        }
        
        db[id].availableMonths = validMonths;
        db[id].months = monthlyDataDict;

      });
    }

    return NextResponse.json({ success: true, db });
  } catch (error: any) {
    console.error("Error syncing with Google Sheets:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
