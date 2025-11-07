# FactoryOS Frontend — Data Integration Guide v1.2

## 📋 Overview

This document describes the time range specifications and data handling for FactoryOS Lovable frontend aligned with backend v1.2 (FastAPI).

---

## 🕒 Time Range Specifications

### Predefined Ranges (Presets)

The backend supports the following predefined time ranges via the `range_type` parameter:

| range_type   | UI Label          | Description                | Relative Interval                                                                              | Example (today = 2025-11-06) |
| ------------ | ----------------- | -------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------- |
| last_7_days  | Últimos 7 días    | Rolling 7-day period       | current_date - 7 → current_date                                                                | 2025-10-30 → 2025-11-06      |
| last_14_days | Últimos 14 días   | Rolling 14-day period      | current_date - 14 → current_date                                                               | 2025-10-23 → 2025-11-06      |
| last_30_days | Últimos 30 días   | Rolling 30-day period      | current_date - 30 → current_date                                                               | 2025-10-07 → 2025-11-06      |
| this_week    | Esta semana       | Monday to current day      | date_trunc('week', current_date) → current_date                                                | 2025-11-03 → 2025-11-06      |
| last_week    | Semana anterior   | Monday–Sunday of last week | date_trunc('week', current_date - interval '1 week') → date_trunc('week', current_date) - 1    | 2025-10-27 → 2025-11-02      |
| this_month   | Este mes          | From 1st of current month  | date_trunc('month', current_date) → current_date                                               | 2025-11-01 → 2025-11-06      |
| last_month   | Mes anterior      | Full previous month        | date_trunc('month', current_date - interval '1 month') → date_trunc('month', current_date) - 1 | 2025-10-01 → 2025-10-31      |
| this_quarter | Este trimestre    | Current natural quarter    | date_trunc('quarter', current_date) → current_date                                             | 2025-10-01 → 2025-11-06      |
| this_year    | Año actual        | From Jan 1 to current day  | date_trunc('year', current_date) → current_date                                                | 2025-01-01 → 2025-11-06      |
| all_time     | Todo el histórico | No date filter             | MIN(record_date) → MAX(record_date)                                                            | —                            |

**Note:** These presets are currently backend-only and not exposed in the UI. They are documented for future version 2.

---

### Custom Range (range_type: `custom`)

When `range_type = "custom"`, the following parameters are required:

* `start_date` (YYYY-MM-DD) — Initial date
* `end_date` (YYYY-MM-DD) — Final date

**Validation Rules:**

* `start_date ≤ end_date`
* Maximum span: 180 days
* If "Compare with previous period" is active, backend automatically computes the previous range

**Example:**

```
Current range:   2025-10-15 → 2025-11-06
Previous range:  2025-09-24 → 2025-10-15
```

---

## 📊 Comparative Mode

### Parameter: `compare_enabled`

When `compare_enabled = true`, the backend returns data for both current and previous periods.

**Backend Response Structure:**

```json
{
  "current": [
    {
      "calendar_date": "2025-11-06",
      "availability_avg": 0.85,
      "performance_avg": 0.82,
      "quality_avg": 0.95,
      "oee_avg": 0.66,
      "total_units_sum": 2450,
      "defective_units_sum": 35,
      "expected_units": 2880
    }
  ],
  "previous": [
    {
      "calendar_date": "2025-10-30",
      "availability_avg": 0.81,
      "performance_avg": 0.80,
      "quality_avg": 0.93,
      "oee_avg": 0.60,
      "total_units_sum": 2200,
      "defective_units_sum": 42,
      "expected_units": 2880
    }
  ]
}
```

**UI Behavior:**

* Show dashed line for previous period in trend charts
* Display Δ% (delta percentage) on KPI cards

**Example KPI Display:**

> **OEE:** 73.1% / 69.8% (▲+4.7%)

---

## 🚨 Empty Data Handling

### Scenario 1: No Records Found

**Backend Response:**

```json
{
  "warning": "No records found",
  "current": [],
  "previous": []
}
```

**Frontend Behavior:**

1. Hide KPI cards and charts
2. Show banner: **"Sin datos disponibles para el período seleccionado."**

### Scenario 2: Empty Array

**Backend Response:**

```json
[]
```

**Frontend Behavior:**

Same as Scenario 1 — display "no data" banner.

---

## 📥 CSV Export Error Handling

### Endpoint: `/records/export.csv`

If the export request fails (`status >= 400`):

**Frontend Behavior:**

* Show toast notification: **"Exportación no disponible en esta versión."**
* Do not block the UI
* Log error to console for debugging

**Example Code:**

```typescript
try {
  const response = await fetch('/api/v1/records/export.csv');
  if (!response.ok) {
    toast({
      variant: "destructive",
      title: "Error de exportación",
      description: "Exportación no disponible en esta versión.",
    });
    return;
  }
  // Process CSV download
} catch (error) {
  console.error("CSV export failed:", error);
  toast({
    variant: "destructive",
    title: "Error de exportación",
    description: "Exportación no disponible en esta versión.",
  });
}
```

---

## 🔗 API Endpoints Summary

| Endpoint                     | Method | Parameters                                                        | Cache | Notes                           |
| ---------------------------- | ------ | ----------------------------------------------------------------- | ----- | ------------------------------- |
| `/reports/oee-daily.csv`     | GET    | line_id, equipment_id, shift_id, range, range_type, compare_enabled | 5 min | Returns daily OEE aggregates    |
| `/records/export.csv`        | GET    | line_id, equipment_id, shift_id, start_date, end_date            | None  | Exports production records      |
| `/shifts`                    | GET    | —                                                                | 1 day | Retrieves shift definitions     |

---

## ✅ Acceptance Criteria (v1.2)

✅ Dataset structure compatible with backend v1.2  
✅ "Sin datos" banner appears when dataset is empty or contains warning  
✅ CSV export errors handled with toast notification  
✅ Hidden variables `range_type` and `compare_enabled` exist in filters  
✅ Range parameters documented for future UI implementation  
✅ No data loss or binding issues  

---

## 📌 Future Enhancements (v2)

The following features are documented but not yet implemented in the UI:

* UI selector for predefined ranges (last_7_days, this_week, this_month, etc.)
* Custom date range picker with calendar UI
* Visual indicator for comparative mode toggle
* Enhanced tooltips explaining OEE color thresholds

---

**Document Version:** 1.2  
**Last Updated:** 2025-11-07  
**Compatibility:** Backend FastAPI v1.2
