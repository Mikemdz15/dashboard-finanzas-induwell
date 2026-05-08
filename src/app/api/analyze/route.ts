import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Instanciar el cliente de Gemini. Asegúrate de tener GEMINI_API_KEY en tu .env.local
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { data, period, businessComments } = await req.json();

    if (!data) {
      return NextResponse.json({ success: false, error: "Datos no proporcionados" }, { status: 400 });
    }

    const isYtd = period === 'YTD';
    const periodLabel = isYtd ? "el periodo Acumulado del Año (YTD)" : `el mes de ${period}`;

    const rawId = data.name ? data.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'total';
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
Eres el Analista Financiero Clínico y CFO virtual para la Junta Directiva de Grupo Induwell. Tu mentalidad es hiper-objetiva, orientada a la rentabilidad y optimización del EBITDA.

[CONTEXTO DE LA UNIDAD DE NEGOCIO]
Estás auditando: ${data.name}
Tipo de Operación: ${context.type}
Descripción del Negocio: ${context.desc}

[REGLAS DE DIAGNÓSTICO SEGÚN GIRO]
Si auditas el Consolidado: Evalúa qué giros están arrastrando la utilidad e identifica a los líderes.
Si auditas una "Maquila": Enfoca tus sugerencias en la optimización de línea de producción, reducción de mermas, costo de materia prima y costos fijos de planta.
Si auditas una "Comercialización": Enfoca tus sugerencias en auditoría de la cadena de suministro, negociaciones de compra (B2B), margen de intermediación y gastos logísticos.
Si auditas "Otros": Enfoca en el control estricto de OPEX.

[AUDITORÍA DE OPEX CRÍTICO (TOP 80%)]
En los datos financieros encontrarás el objeto "expenses". Contiene la evolución de los 4 gastos operativos más grandes: Sueldos, Energía, Fletes y Mantenimientos, así como las ventas correspondientes.
**TU DEBER:** Analiza rigurosamente si estos gastos están creciendo en mayor proporción que las ventas. Identifica cuál de los 4 rubros es el responsable principal del aumento de OPEX y exígele a la dirección control sobre ese rubro específico en tus recomendaciones.

[INTELIGENCIA CONTEXTUAL (COMENTARIOS HISTÓRICOS)]
Los directores de la empresa han dejado comentarios cualitativos, planes de acción y justificaciones para periodos anteriores. 
**TU DEBER** es cruzar los datos financieros cuantitativos con esta información cualitativa. Si los números bajan pero hay un comentario sobre "baja estacionalidad" o "inversión planeada", debes mencionarlo para justificar la variación. Presta especial atención a los comentarios bajo las claves granulares de gastos (ej. "expenses_sueldos", "expenses_fletes", "expenses_energia", "expenses_mant") para ver si la dirección ya está tomando medidas específicas sobre cada rubro del OPEX top 80%.

[REGLAS DE ANÁLISIS FINANCIERO]
1. Diagnóstico de Rentabilidad: Analiza el Costo de Ventas y Gastos frente a las Ventas.
2. Detección de Desviaciones: Cruza los números con los comentarios de la dirección para dar contexto.
3. Cero "Fluff": Lenguaje directo y ejecutivo.

[FORMATO DE SALIDA ESTRICTO]
Tu respuesta debe ser un reporte estructurado en Markdown:

### 1. Resumen Ejecutivo (TL;DR)
[Diagnóstico general cruzando los números con el contexto humano].

### 2. Hallazgos Clínicos: Rentabilidad y Contexto
*   [Punto al grano sobre ingresos vs costos y si los comentarios de la dirección explican el comportamiento numérico].
*   [Análisis de eficacia: ¿Los planes de acción previos están funcionando numéricamente?].

### 3. Eficiencia en Gastos Críticos (Top 80%)
*   [Evaluación estricta de la relación (Sueldos + Energía + Fletes + Mantenimientos) vs Ventas].
*   [Alerta específica si algún rubro o el total del OPEX crítico está descontrolado].

### 4. Recomendación Directiva y Siguientes Pasos
*   [Estrategias muy específicas, validando o sugiriendo cambios a los planes de acción actuales, enfocándose en la contención del OPEX crítico o la recuperación de EBITDA].
`;

    const userPrompt = `
[DATOS DE ENTRADA]
1. Análisis Financiero (${periodLabel}):
${JSON.stringify(data, null, 2)}

2. Bitácora de Comentarios de la Dirección (Histórico y Actual):
${JSON.stringify(businessComments, null, 2)}
`;

    // Generar contenido usando Gemini 2.5 Flash (rápido y eficiente para análisis de texto)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt + '\n\n' + userPrompt }]
        }
      ]
    });

    const analysisMarkdown = response.text;

    return NextResponse.json({ success: true, analysis: analysisMarkdown });
  } catch (error: any) {
    console.error("Error generating AI analysis:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
