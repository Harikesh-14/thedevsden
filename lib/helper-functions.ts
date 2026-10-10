export function formatRelativeTime(date: Date | string): string {
  const targetDate = new Date(date);

  if (Number.isNaN(targetDate.getTime())) {
    return "Invalid date";
  }

  const now = new Date();
  const diffInSeconds = Math.floor(
    (targetDate.getTime() - now.getTime()) / 1000
  );

  const formatter = new Intl.RelativeTimeFormat("en", {
    numeric: "always",
  });

  const units = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ] as const;

  for (const { unit, seconds } of units) {
    if (Math.abs(diffInSeconds) >= seconds || unit === "second") {
      const value = Math.round(diffInSeconds / seconds);
      return formatter.format(value, unit);
    }
  }

  return "just now";
}