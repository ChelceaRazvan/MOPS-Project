
import axios, { AxiosError } from "axios";

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<unknown>;

    const data = ax.response?.data;

    if (typeof data === "object" && data !== null) {
      const maybeDetail = (data as Record<string, unknown>)["detail"];
      if (typeof maybeDetail === "string" && maybeDetail.trim().length > 0) {
        return maybeDetail;
      }
      const maybeMessage = (data as Record<string, unknown>)["message"];
      if (typeof maybeMessage === "string" && maybeMessage.trim().length > 0) {
        return maybeMessage;
      }
    }

    return ax.message ?? "Request error";
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "Unexpected error";
}
