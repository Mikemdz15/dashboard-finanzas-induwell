import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const business_unit = searchParams.get('businessUnit');
    const period = searchParams.get('period');

    if (!business_unit || !period) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('business_unit', business_unit)
      .eq('period', period)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      return NextResponse.json({ success: true, analysis: data[0].insight_text });
    } else {
      return NextResponse.json({ success: true, analysis: null });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { data, period, tabId, regenerate } = await req.json();

    if (!data) {
      return NextResponse.json({ success: false, error: "Datos no proporcionados" }, { status: 400 });
    }

    const rawId = tabId || 'total';

    // Fetch existing comments to pass as context
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*')
      .eq('business_unit', rawId)
      .order('created_at', { ascending: true });

    // We only pass comments that match the period or "global"
    const relevantComments = (commentsData || []).filter(
      c => c.period === period || c.period === 'global'
    ).map(c => `[${c.user_name} sobre ${c.component_id} en ${c.period}]: ${c.text}`);

    const isYtd = period === 'YTD';
    const periodLabel = isYtd ? "el periodo Acumulado del Año (YTD)" : `el mes de ${period}`;

    const businessContextMap: Record<string, { type: string, desc: string }> = {
      'liquidos': { type: 'Maquila', desc: 'Maquiladora de artículos de limpieza y cuidado del hogar.' },
      'womax': { type: 'Comercialización', desc: 'Comercialización de jabón en polvo.' },
      'tintes': { type: 'Comercialización', desc: 'Comercialización de tintes.' },
      'veladoras': { type: 'Maquila', desc: 'Maquila de veladoras.' },
      'dulces': { type: 'Comercialización', desc: 'Comercialización de distintos tipos de marcas de dulces.' },
      'maruchan': { type: 'Comercialización', desc: 'Comercialización de sopa maruchan.' },
      'foco': { type: 'Comercialización', desc: 'Comercialización de Focos.' },
      'polvos': { type: 'Maquila', desc: 'Maquila de polvos alimenticios.' },
      'desperdicio': { type: 'Otros', desc: 'Venta de materiales de desperdicio cartón, playo, unicel.' },
      'boing': { type: 'Comercialización', desc: 'Comercialización de la bebida Boing.' },
      'cosmeticos': { type: 'Comercialización', desc: 'Comercialización de Cosmeticos.' },
      'desechables': { type: 'Comercialización', desc: 'Comercialización de desechables.' },
      'racks': { type: 'Comercialización', desc: 'Importación y venta de Racks.' }
    };
    
    const context = businessContextMap[rawId] || { type: rawId === 'total' ? 'Consolidado' : 'Unidad de Soporte', desc: 'Unidades administrativas o consolidado de grupo.' };

    const systemPrompt = `
[ROL Y MENTALIDAD]
Eres el Analista Financiero Clínico y CFO virtual para la Junta Directiva de Grupo Induwell. Tu mentalidad es hiper-objetiva, orientada a la rentabilidad, optimización del EBITDA y estricto control presupuestario.

[CONTEXTO DE LA UNIDAD DE NEGOCIO]
Estás auditando: ${data.name}
Tipo de Operación: ${context.type}
Descripción del Negocio: ${context.desc}

[REGLAS DE DIAGNÓSTICO SEGÚN GIRO]
Si auditas el Consolidado: Evalúa qué giros están arrastrando la utilidad e identifica a los líderes.
Si auditas una "Maquila": Enfoca tus sugerencias en la optimización de línea de producción, reducción de mermas, costo de materia prima y costos fijos de planta.
Si auditas una "Comercialización": Enfoca tus sugerencias en auditoría de la cadena de suministro, negociaciones de compra (B2B), margen de intermediación y gastos logísticos.
Si auditas "Otros": Enfoca en el control estricto de OPEX.

[INTEGRACIÓN REAL VS PLAN (PRESUPUESTO)]
Los datos de entrada contienen los arreglos del PLAN (Presupuesto oficial) en ` + '`data.charts` (por ejemplo, `charts.trend.plan` para Ventas, `charts.trendCost.plan` para Costos, `charts.composition.plan` para EBITDA, y `charts.expenses.plan` para OPEX).' + ` Tu diagnóstico debe realizar una comparación rigurosa entre el desempeño Real/Proyectado y el PLAN presupuestado:
1. Desviación de Ventas (Real vs. PLAN): Determina si la facturación está logrando el plan y las brechas en proyección.
2. Eficiencia de Costo (Real vs. PLAN): Evalúa si el costo de ventas está alineado al presupuesto.
3. Desviación y Cumplimiento de EBITDA (Real vs. PLAN): Compara el EBITDA Real/Proyectado vs el Presupuestado y calcula la viabilidad de cumplir las metas anuales.
4. Desviaciones en Gastos Críticos (Sueldos, Energía, Fletes, Mantenimiento) vs su respectivo PLAN.

[AUDITORÍA DE OPEX CRÍTICO (TOP 80%)]
Analiza rigurosamente si los gastos principales (Sueldos, Energía, Fletes, Mantenimientos) están creciendo en mayor proporción que las ventas o si están desalineados de las proyecciones y metas de presupuesto.

[INTELIGENCIA CONTEXTUAL DE USUARIOS (HISTORIAL DE CHAT)]
A continuación, se te proporcionarán comentarios reales hechos por los usuarios de la plataforma y directivos. 
**TU DEBER** es cruzar tus hallazgos numéricos con estos comentarios de los usuarios. Responde directamente a sus inquietudes, validando si tienen razón numéricamente o no. Menciona por su nombre a los usuarios cuando tomes en cuenta sus comentarios. (Ejemplo: "Miguel menciona que hay un exceso de fletes, lo cual es correcto ya que el número subió un X%...").

[REGLAS DE ANÁLISIS FINANCIERO]
1. Diagnóstico de Rentabilidad: Analiza el Costo de Ventas y Gastos frente a las Ventas.
2. Detección de Desviaciones: Cruza los números reales e inteligencia de presupuestos del PLAN con los comentarios de los usuarios.
3. Cero "Fluff": Lenguaje directo, ejecutivo e hiper-objetivo.

[FORMATO DE SALIDA ESTRICTO]
Tu respuesta debe ser un reporte estructurado en Markdown:

### 1. Resumen Ejecutivo (TL;DR)
[Diagnóstico general cruzando los números reales, comentarios de dirección y el estatus de cumplimiento general vs el PLAN].

### 2. Auditoría y Desviaciones Real vs. PLAN (Presupuesto)
*   [Brechas específicas de Ventas, Costo y EBITDA Real vs PLAN presupuestado. Diagnostica si estamos en curso o desalineados].

### 3. Hallazgos Clínicos y Contexto de Usuarios
*   [Punto al grano sobre ingresos vs costos. MENCIONA LAS OPINIONES DE LOS USUARIOS aquí y valídalas en base a los datos numéricos de rentabilidad y presupuesto].

### 4. Eficiencia en Gastos Críticos (Top 80%) y PLAN OPEX
*   [Evaluación estricta de la relación (Sueldos + Energía + Fletes + Mantenimientos) vs Ventas y vs sus respectivas metas asignadas en el PLAN].

### 5. Recomendación Directiva y Siguientes Pasos
*   [Estrategias muy específicas para mitigar desviaciones, cerrar las brechas vs el PLAN y asegurar el cumplimiento del presupuesto anual].
`;

    const userPrompt = `
[DATOS DE ENTRADA]
1. Análisis Financiero (${periodLabel}):
${JSON.stringify(data, null, 2)}

2. Historial de Comentarios de Usuarios en la Plataforma:
${relevantComments.length > 0 ? relevantComments.join('\n') : 'No hay comentarios registrados por los usuarios aún.'}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt + '\n\n' + userPrompt }]
        }
      ]
    });

    const analysisMarkdown = response.text || '';

    // Guardar en Supabase ai_insights
    const { error } = await supabase
      .from('ai_insights')
      .insert([
        {
          business_unit: rawId,
          period: period,
          insight_text: analysisMarkdown
        }
      ]);

    if (error) {
      console.error("Error saving AI Insight to Supabase:", error);
    }

    return NextResponse.json({ success: true, analysis: analysisMarkdown });
  } catch (error: any) {
    console.error("Error generating AI analysis:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
