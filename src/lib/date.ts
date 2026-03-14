import { FirestoreDateValue } from "@/types/models";

type TimestampLike = {
  toDate: () => Date;
};

export function isTimestampLike(value: unknown): value is TimestampLike {
  return (
    !!value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  );
}

export function asDate(value: FirestoreDateValue): Date | null {
  if (value == null) return null;
  if (isTimestampLike(value)) return value.toDate();

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
