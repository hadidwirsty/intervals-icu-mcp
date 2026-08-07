/**
 * Shared types dan helper kecil dipakai di semua tool modules.
 */

import { isApiError } from "./client.js";

import type { ApiResult } from "./client.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/** Bungkus hasil ApiResult<T> jadi CallToolResult MCP standar (text content + isError flag). */
export function toToolResult(result: ApiResult<unknown>): CallToolResult {
  if (isApiError(result)) {
    return {
      isError: true,
      content: [{ type: "text", text: result.message }],
    };
  }
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}

export function errorResult(message: string): CallToolResult {
  return { isError: true, content: [{ type: "text", text: message }] };
}
