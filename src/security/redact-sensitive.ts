const SENSITIVE_KEY_PATTERN =
  /authorization|api[_-]?key|token|secret|password/i;

export function redactSensitive(
  value: unknown
): unknown {
  if (Array.isArray(value)) {
    return value.map(redactSensitive);
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    const result: Record<string, unknown> = {};

    for (
      const [key, childValue]
      of Object.entries(value)
    ) {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        result[key] = "[REDACTED]";
        continue;
      }

      result[key] =
        redactSensitive(childValue);
    }

    return result;
  }

  return value;
}