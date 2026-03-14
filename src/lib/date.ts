import { FirestoreDateValue } from "@/types/models";

type TimestampLike = {
  toDate: () => Date;
};

export function isTimestampLike(value: FirestoreDateValue): value is TimestampLike {
  return !!value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function";
}

export function asDate(value: FirestoreDateValue): Date | null {
  if (value == null) return null;
  if (isTimestampLike(value)) return value.toDate();

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
