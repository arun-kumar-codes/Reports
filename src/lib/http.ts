import { NextResponse } from "next/server";
import type { ApiErrorBody } from "@/types/report";

export function jsonError(
  status: number,
  code: string,
  message: string,
): NextResponse<ApiErrorBody> {
  return NextResponse.json<ApiErrorBody>(
    { error: { code, message } },
    { status },
  );
}
