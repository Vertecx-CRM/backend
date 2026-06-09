import { BadRequestException } from "@nestjs/common";
import { NormalizationClass } from "./normalization.class";

export class DateUtils {
  static localMidnight(ymd: string) {
    const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = Number(m[1]);
    const mm = Number(m[2]);
    const d = Number(m[3]);
    return new Date(y, mm - 1, d, 0, 0, 0, 0);
  }

  static toDateOrNull(input?: string | null) {
    if (input === undefined) return undefined;
    if (input === null || input === "") return null;
  
    const asMidnight = DateUtils.localMidnight(input);
    if (asMidnight) return asMidnight;
  
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) {
      throw new BadRequestException("Fecha/hora invÃ¡lida");
    }
    return d;
  }
  
  static ensureEndAfterStart(start: Date | null, end: Date | null) {
    if (start && end && end.getTime() <= start.getTime()) {
      throw new BadRequestException(
        "La hora final debe ser mayor a la hora inicial"
      );
    }
  }

  static  buildScheduleLabel(start: Date | null, end: Date | null) {
    if (!start) return "";
    const fmtDateTime = new Intl.DateTimeFormat("es-CO", {
      timeZone: "America/Bogota",
      dateStyle: "full",
      timeStyle: "short",
    });
    const fmtTime = new Intl.DateTimeFormat("es-CO", {
      timeZone: "America/Bogota",
      timeStyle: "short",
    });
    const startText = fmtDateTime.format(start);
    if (end) return `${startText} - ${fmtTime.format(end)}`;
    return startText;
  }

  static isScheduledState(name?: string | null) {
    const norm = NormalizationClass.normalizeStateName(name);
    return norm.includes("agend");
  }

  static parseTimeToParts(raw?: string | null) {
    const txt = String(raw ?? "").trim();
    const m = txt.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (!m) return null;
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    const ss = Number(m[3] ?? "0");
    if (!Number.isFinite(hh) || !Number.isFinite(mm) || !Number.isFinite(ss)) return null;
    return { hh, mm, ss };
  }

  static orderDateTime(dateRaw?: Date | string | null, timeRaw?: string | null) {
    if (!dateRaw || !timeRaw) return null;
    const time = DateUtils.parseTimeToParts(timeRaw);
    if (!time) return null;
    const base = dateRaw instanceof Date ? dateRaw : new Date(String(dateRaw));
    if (!Number.isFinite(base.getTime())) return null;
    return new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      time.hh,
      time.mm,
      time.ss,
      0
    );
  }

  static buildRange(start: Date | null, end: Date | null) {
    if (!start) return null;
    const safeEnd =
      end && Number.isFinite(end.getTime()) && end.getTime() > start.getTime()
        ? end
        : new Date(start.getTime() + 60 * 60 * 1000);
    return { start, end: safeEnd };
  }

  static hasOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
    return Math.max(aStart.getTime(), bStart.getTime()) < Math.min(aEnd.getTime(), bEnd.getTime());
  }
}
