export const db: any = {
    "grupo": {
        id: "grupo",
        name: "Consolidado GRUPO INDUWELL",
        icon: "building-2",
        kpis: [
            { label: "Ventas Q1", value: "$387.6M", sub: "Brutas acumuladas", trend: "up", trendVal: "146.3M Mar" },
            { label: "Costo Total Q1", value: "-$273.9M", sub: "Incluye Apoyos", trend: "down", trendVal: "71% de Vta" },
            { label: "Gastos Q1", value: "-$56.3M", sub: "Operativos y Adm.", trend: "down", trendVal: "15% de Vta" },
            { label: "Utilidad Neta Q1", value: "$57.5M", sub: "Beneficio Final", trend: "up", trendVal: "14.8% Margen" }
        ],
        insights: `
            <p><strong>Análisis de Rentabilidad Mensual:</strong> Enero inició con $134.3M en ventas y $22.9M de utilidad (Margen 17.0%). Febrero bajó a $107M con $14.8M de utilidad (13.8%). Marzo logró un récord de ventas de $146.3M, pero la utilidad fue de $19.8M (13.5%). Esta compresión de 3.5 puntos porcentuales de enero a marzo es una alerta directiva grave.</p>
            <p><strong>Plan de Acción (El Costo lo es Todo):</strong> La caída del margen global evidencia que a mayor volumen no estamos logrando economías de escala. Se requiere una auditoría profunda e inmediata sobre los costos directos y gastos logísticos para tapar las fugas antes de seguir acelerando la venta.</p>
            <p><strong>Fundamentos de Proyección Q2:</strong> El pronóstico de crecimiento (escalonado de $139M a $153.5M mensuales) se sustenta en la consolidación de canales core en Alphalab y la agresiva inercia de penetración de mercado que Kawiil logró en el cierre de marzo.</p>
            <p class="text-blue-700 bg-blue-50 p-2 rounded border border-blue-100"><strong>Utilidad Neta Estimada Q2: $74.8 Millones.</strong> Asumiendo ventas trimestrales acumuladas de ~$440M y logrando que la auditoría recupere el margen operativo base del 17% a nivel grupo, la utilidad neta trimestral proyectada superará la barrera de los $74M.</p>
        `,
        charts: {
            trend: {
                labels: ['Ene (Real)', 'Feb (Real)', 'Mar (Real)', 'Abr (Proy)', 'May (Proy)', 'Jun (Proy)'],
                real: [134.3, 107.0, 146.3, null, null, null],
                proy: [null, null, 146.3, 139.0, 147.7, 153.5],
                desc: "<strong>Curva de Crecimiento:</strong> Muestra la recuperación general en marzo. La proyección mantiene una tendencia alcista conservadora superando los $150M para el cierre del Q2."
            },
            composition: {
                type: 'doughnut',
                title: 'Ingresos por Subsidiaria Q1',
                labels: ['Alphalab', 'INDW Trading', 'Kawiil', 'Velaluz', 'Alimentos', 'Pro Merc'],
                data: [186.9, 91.9, 47.0, 36.6, 16.9, 8.3],
                desc: "<strong>Aportación Comercial:</strong> Ilustra la dependencia hacia Alphalab (~48%), seguida de la fuerte participación de INDW Trading y el rápido crecimiento de Kawiil."
            },
            pnl: {
                labels: ['Ventas Brutas', 'Apoyos (Com. + Log.)', 'Costo de Venta', 'Gastos Fijos/Var', 'Utilidad Neta'],
                data: [387.6, -7.7, -266.2, -56.3, 57.5],
                desc: "<strong>Radiografía de Rentabilidad:</strong> Evidencia cómo los altos costos de venta (más del 70%) absorben el ingreso bruto, mitigados por un gasto operativo controlado al 15%."
            }
        }
    },
    "alphalab": {
        id: "alphalab",
        name: "GRUPO ALPHALAB",
        icon: "flask-conical",
        kpis: [
            { label: "Ventas Q1", value: "$186.9M", sub: "48% del Grupo", trend: "up", trendVal: "69M en Mar" },
            { label: "Costo Q1", value: "-$131.5M", sub: "Incluye Apoyos", trend: "down", trendVal: "70% de Vta" },
            { label: "Gastos Q1", value: "-$40.2M", sub: "Alta carga fija", trend: "down", trendVal: "21% de Vta" },
            { label: "Utilidad Neta Q1", value: "$15.2M", sub: "Margen ajustado", trend: "neutral", trendVal: "8.1% Margen" }
        ],
        insights: `
            <p><strong>Análisis de Rentabilidad Mensual:</strong> En enero logramos un 10.3% de utilidad neta ($6.6M sobre $64M). Sin embargo, en febrero cayó drásticamente al 6.8% ($3.7M). En el mes récord de ventas de marzo ($69M), apenas retuvimos el 7.1% ($4.9M). Esto indica claramente que el costo y los gastos se dispararon devorando el volumen incremental.</p>
            <p><strong>Plan de Acción (El Costo lo es Todo):</strong> Se exige una auditoría urgente del costo directo (que ronda el 70%) y un recorte tajante a los excesivos $13M-$14M de gastos fijos mensuales. El objetivo directivo del Q2 no debe centrarse en vender más, sino en auditar y eficientar la operación.</p>
            <p><strong>Fundamentos de Proyección Q2:</strong> No se proyecta un crecimiento agresivo ($65M-$70M al mes) dado que la capacidad instalada y la madurez de mercado actual de Alphalab demandarían mayor CAPEX para saltos exponenciales. La meta comercial es la retención pura de cuentas clave.</p>
            <p class="text-blue-700 bg-blue-50 p-2 rounded border border-blue-100"><strong>Utilidad Neta Estimada Q2: $20.3 Millones.</strong> A pesar de proyectar un volumen de ventas moderado (~$203M en el trimestre), la auditoría de recorte de fijos (ahorrando $1.5M-$2M por mes) nos permitirá regresar al margen de doble dígito (10%), incrementando la rentabilidad real un 33% respecto a Q1.</p>
        `,
        charts: {
            trend: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr (P)', 'May (P)', 'Jun (P)'],
                real: [64.0, 53.8, 69.0, null, null, null],
                proy: [null, null, 69.0, 65.0, 68.0, 70.0],
                desc: "<strong>Volumen de Operación:</strong> Refleja el pico récord en marzo. Para el Q2 se proyecta un aplanamiento realista promediando ~$67M mensuales."
            },
            composition: {
                type: 'bar',
                title: 'Evolución Utilidad (Ene-Mar)',
                labels: ['Ene', 'Feb', 'Mar'],
                data: [6.6, 3.7, 4.9],
                desc: "<strong>Contracción del Margen:</strong> A pesar del fuerte volumen de ventas de marzo, la utilidad no creció en la misma proporción, confirmando la pesada carga de los gastos fijos."
            },
            pnl: {
                labels: ['Ventas', 'Apoyos Com/Log', 'Costos', 'Gastos', 'Utilidad'],
                data: [186.9, -4.7, -126.8, -40.2, 15.2],
                desc: "<strong>Estructura Pesada:</strong> Muestra claramente que los costos y los gastos fijos de $40.2M comprimen severamente la capacidad de trasladar ventas a utilidad neta final."
            }
        }
    },
    "indw": {
        id: "indw",
        name: "INDW TRADING",
        icon: "globe",
        kpis: [
            { label: "Ventas Q1", value: "$91.9M", sub: "Volátil", trend: "neutral", trendVal: "Caída en Feb" },
            { label: "Costos Q1", value: "-$75.1M", sub: "Incluye Apoyos", trend: "down", trendVal: "82% de Vta" },
            { label: "Gastos Q1", value: "-$5.4M", sub: "Operativos", trend: "up", trendVal: "Estructura ligera" },
            { label: "Utilidad Neta Q1", value: "$11.5M", sub: "Recuperación Mar", trend: "up", trendVal: "12.5% Margen" }
        ],
        insights: `
            <p><strong>Análisis de Rentabilidad Mensual:</strong> Fuerte contraste: Enero cerró con un sano 19.8% ($6.8M de utilidad). Febrero sufrió un colapso en volumen ($22.2M) que no cubrió los fijos, resultando en un margen negativo del -1.2%. Marzo rebotó con fuerza logrando un 13.9% de margen ($4.8M sobre $35.1M).</p>
            <p><strong>Plan de Acción (El Costo lo es Todo):</strong> La sensibilidad al volumen es crítica. Con un costo total del 82%, el margen de maniobra no existe. La auditoría debe centrarse en optimizar los apoyos comerciales y auditar el origen de la mercancía para reducir el costo a un máximo de 78%.</p>
            <p><strong>Fundamentos de Proyección Q2:</strong> Las ventas se proyectan entre $32M y $35M. El análisis de demanda inelástica del Q1 demuestra que operar por debajo de $30M causa quiebra técnica. Comercial tiene como mandato asegurar contratos de volumen fijo para blindar la barrera de supervivencia de los $32M.</p>
            <p class="text-blue-700 bg-blue-50 p-2 rounded border border-blue-100"><strong>Utilidad Neta Estimada Q2: $14.1 Millones.</strong> Manteniendo ventas acumuladas de ~$101M en el Q2, y logrando que la renegociación de compras tope el costo en 78%, capitalizaremos la estructura esbelta ($5.4M de gastos) para retener un margen operativo del 14% seguro.</p>
        `,
        charts: {
            trend: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr (P)', 'May (P)', 'Jun (P)'],
                real: [34.4, 22.2, 35.1, null, null, null],
                proy: [null, null, 35.1, 32.0, 34.0, 35.0],
                desc: "<strong>Señal de Volatilidad:</strong> Acusa la fuerte caída de febrero seguida del rebote en marzo. La proyección sugiere blindar el volumen para evitar caídas similares en Q2."
            },
            composition: {
                type: 'bar',
                title: 'Evolución Utilidad Neta (Alerta Feb)',
                labels: ['Ene', 'Feb', 'Mar'],
                data: [6.8, -0.3, 4.9],
                desc: "<strong>Alerta de Quiebre:</strong> La caída debajo de cero en febrero resalta la extrema sensibilidad del modelo a disminuciones en el volumen comercial."
            },
            pnl: {
                labels: ['Ventas', 'Apoyos', 'Costos', 'Gastos', 'Utilidad'],
                data: [91.9, -1.9, -73.2, -5.4, 11.5],
                desc: "<strong>Alta Sensibilidad al Costo:</strong> Destaca el altísimo costo de venta (82%), pero una estructura operativa esbelta ($5.4M) que permite reponerse rápidamente en meses fuertes."
            }
        }
    },
    "kawiil": {
        id: "kawiil",
        name: "KAWIIL",
        icon: "sparkles",
        kpis: [
            { label: "Ventas Q1", value: "$47.0M", sub: "Crecimiento Rápido", trend: "up", trendVal: "+55% Feb-Mar" },
            { label: "Costo Q1", value: "-$35.1M", sub: "Incluye Apoyos", trend: "down", trendVal: "75% de Vta" },
            { label: "Gastos Q1", value: "-$0.1M", sub: "Altamente eficiente", trend: "up", trendVal: "< 1% de Vta" },
            { label: "Utilidad Neta Q1", value: "$11.8M", sub: "Estrella en ascenso", trend: "up", trendVal: "25% Margen" }
        ],
        insights: `
            <p><strong>Análisis de Rentabilidad Mensual:</strong> Enero registró 25.4% de margen ($3.1M util.). Febrero subió a un extraordinario 28.0% ($3.7M). Sin embargo, en la explosión de ventas de marzo ($21M), el margen se diluyó al 23.0% ($4.8M). El pico de ventas sacrificó 5 puntos porcentuales de rentabilidad relativa.</p>
            <p><strong>Plan de Acción (El Costo lo es Todo):</strong> La auditoría para Q2 se enfocará en verificar por qué el costo escaló desproporcionadamente en el mes de mayor volumen (marzo). El objetivo es no relajar la supervisión en medio de la euforia de crecimiento.</p>
            <p><strong>Fundamentos de Proyección Q2:</strong> Se proyecta un crecimiento asertivo hacia los $22M - $25M mensuales. El sustento radica en la tracción de mercado (55% de aumento real de feb a mar) y la apertura y consolidación de nuevas zonas de distribución que apenas madurarán financieramente en Q2.</p>
            <p class="text-blue-700 bg-blue-50 p-2 rounded border border-blue-100"><strong>Utilidad Neta Estimada Q2: $17.7 Millones.</strong> Preservando celosamente la estructura donde los gastos fijos son menores al 1%, y manteniendo el margen de retorno excepcional del 25% sobre un volumen trimestral de ~$71M, Kawiil se posiciona como una joya de rentabilidad.</p>
        `,
        charts: {
            trend: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr (P)', 'May (P)', 'Jun (P)'],
                real: [12.4, 13.5, 21.0, null, null, null],
                proy: [null, null, 21.0, 22.0, 24.0, 25.0],
                desc: "<strong>Tracción Exponencial:</strong> Visualiza el violento despunte comercial en marzo. La estrategia directiva es aprovechar esta inercia durante los próximos meses."
            },
            composition: {
                type: 'bar',
                title: 'Evolución Utilidad (Ene-Mar)',
                labels: ['Ene', 'Feb', 'Mar'],
                data: [3.1, 3.7, 4.8],
                desc: "<strong>Correlación Perfecta:</strong> Demuestra cómo un incremento en volumen se traslada casi de manera proporcional a la utilidad gracias a su modelo eficiente."
            },
            pnl: {
                labels: ['Ventas', 'Apoyos', 'Costos', 'Gastos', 'Utilidad'],
                data: [47.0, -0.1, -35.0, -0.1, 11.8],
                desc: "<strong>Escenario Ideal:</strong> Los gastos fijos/variables son virtualmente invisibles en la gráfica (<1%), generando un excepcional margen final de retorno del 25%."
            }
        }
    },
    "velaluz": {
        id: "velaluz",
        name: "VELALUZ",
        icon: "flame",
        kpis: [
            { label: "Ventas Q1", value: "$36.6M", sub: "Estable", trend: "neutral", trendVal: "Promedio 12M/mes" },
            { label: "Costos Q1", value: "-$20.5M", sub: "Incluye Apoyos", trend: "down", trendVal: "56% de Vta" },
            { label: "Gastos Q1", value: "-$8.2M", sub: "Controlados", trend: "neutral", trendVal: "22% de Vta" },
            { label: "Utilidad Neta Q1", value: "$7.9M", sub: "Flujo constante", trend: "neutral", trendVal: "22% Margen" }
        ],
        insights: `
            <p><strong>Análisis de Rentabilidad Mensual:</strong> Enero brilló con 24.9% de margen ($3.8M util.). En febrero, la caída de ventas arrastró el margen al 17.4%. En marzo recuperamos volumen, pero el margen subió tímidamente al 20.7% ($2.3M). Se perdieron más de 4 puntos de rentabilidad en el transcurso del trimestre.</p>
            <p><strong>Plan de Acción (El Costo lo es Todo):</strong> Los apoyos logísticos ($1.3M acumulados) merman directamente el resultado operativo. Se instruye auditar de inmediato la estructura logística y los contratos de distribución para el Q2, para evitar que la cadena de suministro absorba las ganancias.</p>
            <p><strong>Fundamentos de Proyección Q2:</strong> Las ventas seguirán una estacionalidad plana ($11M - $13M mensuales). Al operar en un mercado cautivo sin catalizadores de crecimiento disruptivo a la vista, la proyección financiera descansa en la recurrencia de la base instalada de clientes.</p>
            <p class="text-blue-700 bg-blue-50 p-2 rounded border border-blue-100"><strong>Utilidad Neta Estimada Q2: $8.6 Millones.</strong> Bajo una venta trimestral cautiva de ~$36M, la eficiencia vendrá de la auditoría logística. Reduciendo apoyos superfluos y recuperando el margen histórico del 24%, se asegura una aportación de caja limpia y predecible.</p>
        `,
        charts: {
            trend: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr (P)', 'May (P)', 'Jun (P)'],
                real: [15.3, 9.9, 11.3, null, null, null],
                proy: [null, null, 11.3, 11.0, 12.0, 13.0],
                desc: "<strong>Comportamiento Seguro:</strong> Tras un pico inicial en enero, la línea se estabiliza. Q2 será sobre mantenimiento con pequeñas perspectivas de crecimiento."
            },
            composition: {
                type: 'bar',
                title: 'Evolución Utilidad (Ene-Mar)',
                labels: ['Ene', 'Feb', 'Mar'],
                data: [3.8, 1.7, 2.3],
                desc: "<strong>Estabilidad Rentable:</strong> Aporta flujo de caja estable al corporativo. Febrero tuvo contracción, pero marzo retomó niveles seguros."
            },
            pnl: {
                labels: ['Ventas', 'Apoyos', 'Costos', 'Gastos', 'Utilidad'],
                data: [36.6, -0.7, -19.8, -8.2, 7.9],
                desc: "<strong>Balance Saludable:</strong> Con un costo de mercancía que supera por poco el 50%, la unidad tiene suficiente margen para cubrir cómodamente sus gastos operativos."
            }
        }
    },
    "alimentos": {
        id: "alimentos",
        name: "ALIMENTOS Y SUPLEMENTOS",
        icon: "wheat",
        kpis: [
            { label: "Ventas Q1", value: "$16.9M", sub: "Consistente", trend: "up", trendVal: "6.6M en Mar" },
            { label: "Costos Q1", value: "-$7.6M", sub: "Incluye Apoyos", trend: "down", trendVal: "45% de Vta" },
            { label: "Gastos Q1", value: "-$1.1M", sub: "Operación Lean", trend: "up", trendVal: "7% de Vta" },
            { label: "Utilidad Neta Q1", value: "$8.1M", sub: "Altamente rentable", trend: "up", trendVal: "48% Margen" }
        ],
        insights: `
            <p><strong>Análisis de Rentabilidad Mensual:</strong> Enero presentó un sólido 28.9% de margen ($1.5M). Febrero arrojó una anomalía contable excepcional en la base (rozando el 99%). En marzo se estabilizó en un sano 26.8% ($1.7M de utilidad sobre $6.6M en venta).</p>
            <p><strong>Plan de Acción (El Costo lo es Todo):</strong> Para mantener este modelo hiper-rentable, la auditoría debe garantizar la correcta y oportuna imputación mensual de sus costos de inventario, evitando distorsiones operativas y blindando el costo directo real en el rango del 45%.</p>
            <p><strong>Fundamentos de Proyección Q2:</strong> Crecimiento proyectado muy estable entre $6M y $7M mensuales. El sustento recae en un ticket de compra promedio inelástico y lealtad de nicho, con ligera tracción adicional por el desplazamiento de nuevos SKUs que se probaron orgánicamente en marzo.</p>
            <p class="text-blue-700 bg-blue-50 p-2 rounded border border-blue-100"><strong>Utilidad Neta Estimada Q2: $9.3 Millones.</strong> Preservando el estatus de "operación lean" (gastos minúsculos) y un costo auditado, sobre ingresos trimestrales de ~$19.5M la empresa será capaz de sostener un apabullante ~48% de retención de capital.</p>
        `,
        charts: {
            trend: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr (P)', 'May (P)', 'Jun (P)'],
                real: [5.4, 4.8, 6.6, null, null, null],
                proy: [null, null, 6.6, 6.0, 6.5, 7.0],
                desc: "<strong>Proyección de Nicho:</strong> Suave pero sostenido ascenso que confirma una base de clientes madura. Se proyectan picos moderados de $7M en Q2."
            },
            composition: {
                type: 'bar',
                title: 'Evolución Utilidad (Ene-Mar)',
                labels: ['Ene', 'Feb', 'Mar'],
                data: [1.6, 4.8, 1.8],
                desc: "<strong>Atípico Positivo:</strong> Febrero arrojó beneficios muy por encima del promedio, demostrando la capacidad de la división para generar márgenes abultados."
            },
            pnl: {
                labels: ['Ventas', 'Apoyos', 'Costos', 'Gastos', 'Utilidad'],
                data: [16.9, -0.2, -7.4, -1.1, 8.1],
                desc: "<strong>El Modelo de Negocio más Eficiente:</strong> La operación 'Lean'. Bajos costos (45%) y gastos minúsculos resultan en un impresionante 48% de retención neta."
            }
        }
    },
     "promerc": {
        id: "promerc",
        name: "PRO MERC",
        icon: "shopping-bag",
        kpis: [
            { label: "Ventas Q1", value: "$8.3M", sub: "Nicho Constante", trend: "up", trendVal: "3.1M en Mar" },
            { label: "Costos Q1", value: "-$4.1M", sub: "Incluye Apoyos", trend: "down", trendVal: "49% de Vta" },
            { label: "Gastos Q1", value: "-$1.3M", sub: "Moderados", trend: "neutral", trendVal: "16% de Vta" },
            { label: "Utilidad Neta Q1", value: "$3.0M", sub: "Aporte sólido", trend: "neutral", trendVal: "36% Margen" }
        ],
        insights: `
            <p><strong>Análisis de Rentabilidad Mensual:</strong> Excelente consistencia operativa: Enero entregó 32.6% de margen, Febrero subió al 41.2%, y Marzo cerró en 32.6%. Es la operación con la menor volatilidad y mayor seguridad en la retención de utilidades a nivel grupo.</p>
            <p><strong>Plan de Acción (El Costo lo es Todo):</strong> El modelo funciona porque los costos están rigurosamente controlados (49%). La instrucción es no alterar la estructura operativa; la acción directiva será auditar los contratos de compra de Q2 para asegurar que la inflación no rompa la barrera de costo del 50%.</p>
            <p><strong>Fundamentos de Proyección Q2:</strong> El desempeño proyectado será plano, entre $3M y $3.5M mensuales. Este cálculo asume un 100% de retención en la renovación de su cartera cautiva, sin expectativas ni presupuesto asignado para abrir nuevos canales de venta que arriesguen gastos.</p>
            <p class="text-blue-700 bg-blue-50 p-2 rounded border border-blue-100"><strong>Utilidad Neta Estimada Q2: $3.4 Millones.</strong> Consolidando su estatus de "Cash Cow" confiable, sobre una venta trimestral predecible de ~$9.7M, la unidad continuará entregando puntualmente su 35% de margen tradicional sin sobresaltos.</p>
        `,
        charts: {
            trend: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr (P)', 'May (P)', 'Jun (P)'],
                real: [2.5, 2.6, 3.1, null, null, null],
                proy: [null, null, 3.1, 3.0, 3.2, 3.5],
                desc: "<strong>Crecimiento Orgánico:</strong> Una línea casi recta sin sorpresas negativas. Su proyección estima un leve y natural ascenso en mercado maduro."
            },
            composition: {
                type: 'bar',
                title: 'Evolución Utilidad (Ene-Mar)',
                labels: ['Ene', 'Feb', 'Mar'],
                data: [0.8, 1.1, 1.0],
                desc: "<strong>Consistencia:</strong> Aporta mes a mes cerca del millón de pesos íntegros a la bolsa corporativa, sin desviaciones imprevistas."
            },
            pnl: {
                labels: ['Ventas', 'Apoyos', 'Costos', 'Gastos', 'Utilidad'],
                data: [8.3, -0.1, -4.0, -1.3, 3.0],
                desc: "<strong>Cash Cow Confiable:</strong> Estructura simétrica muy predecible. Sus costos sub-50% garantizan que la división siempre opere en números negros positivos."
            }
        }
    }
};
