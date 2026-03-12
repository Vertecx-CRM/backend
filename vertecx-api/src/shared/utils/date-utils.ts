import { BadRequestException } from "@nestjs/common";

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
}
