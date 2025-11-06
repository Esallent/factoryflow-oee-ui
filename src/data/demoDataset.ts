// Mock dataset structure matching factoryos_demo_dataset_full_v2.json
export const demoDataset = {
  dim_line: {
    company_1: {
      line_id: "LINE_001",
      line_name: "Línea de Producción A",
      company_name: "Schaeffler México",
      is_active: true
    },
    company_2: {
      line_id: "LINE_002",
      line_name: "Línea de Ensamble Principal",
      company_name: "L.V. Spada",
      is_active: true
    }
  },
  dim_equipment: {
    company_1: {
      equipment_id: "EQ_SCH_001",
      equipment_name: "Torno CNC T-450",
      line_id: "LINE_001",
      design_cycle_time_min: 2.5,
      is_active: true
    },
    company_2: {
      equipment_id: "EQ_SPA_001",
      equipment_name: "Prensa Hidráulica PH-800",
      line_id: "LINE_002",
      design_cycle_time_min: 3.2,
      is_active: true
    }
  },
  dim_shift: {
    company_1: {
      shift_name: "Turno 1",
      timezone: "America/Mexico_City"
    },
    company_2: {
      shift_name: "Turno Mañana",
      timezone: "America/Argentina/Buenos_Aires"
    }
  },
  fact_oee_hourly: {
    company_1: generateHourlyData("Schaeffler México", "EQ_SCH_001"),
    company_2: generateHourlyData("L.V. Spada", "EQ_SPA_001")
  }
};

function generateHourlyData(companyName: string, equipmentId: string) {
  const data = [];
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);
  
  for (let hour = 0; hour < 24; hour++) {
    const tsHour = new Date(baseDate);
    tsHour.setHours(hour);
    
    // Generate realistic OEE metrics with some variation
    const availability = 0.75 + Math.random() * 0.2;
    const performance = 0.80 + Math.random() * 0.15;
    const quality = 0.85 + Math.random() * 0.12;
    const oeeTotal = availability * performance * quality;
    
    // Determine OEE band
    let oeeBandEs = "";
    if (oeeTotal >= 0.95) oeeBandEs = "Excelencia";
    else if (oeeTotal >= 0.85) oeeBandEs = "Bueno";
    else if (oeeTotal >= 0.75) oeeBandEs = "Aceptable";
    else if (oeeTotal >= 0.65) oeeBandEs = "Regular";
    else oeeBandEs = "Inaceptable";
    
    const totalUnits = Math.floor(100 + Math.random() * 200);
    const defectiveUnits = Math.floor(totalUnits * (1 - quality) * 0.3);
    
    data.push({
      ts_hour: tsHour.toISOString(),
      equipment_id: equipmentId,
      availability_ratio: availability,
      performance_ratio: performance,
      quality_ratio: quality,
      oee_total: oeeTotal,
      oee_band_es: oeeBandEs,
      total_units: totalUnits,
      defective_units: defectiveUnits,
      planned_runtime_min: 60,
      actual_runtime_min: Math.floor(availability * 60),
      downtime_min: Math.floor((1 - availability) * 60)
    });
  }
  
  return data;
}

export type HourlyOeeRecord = {
  ts_hour: string;
  equipment_id: string;
  availability_ratio: number;
  performance_ratio: number;
  quality_ratio: number;
  oee_total: number;
  oee_band_es: string;
  total_units: number;
  defective_units: number;
  planned_runtime_min: number;
  actual_runtime_min: number;
  downtime_min: number;
};
