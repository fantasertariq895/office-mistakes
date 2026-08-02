import { prisma } from "@/lib/prisma";
import { badRequest, optionalString, readJson, route } from "@/lib/api-helpers";
import { NOTIFICATION_CHANNELS } from "@/lib/constants";

function serialise(row: {
  id: number;
  pinHash: string | null;
  notificationChannels: string;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  theme: string;
  updatedAt: Date;
}) {
  let channels: string[] = ["in_app"];
  try {
    const parsed = JSON.parse(row.notificationChannels);
    if (Array.isArray(parsed)) channels = parsed.filter((c) => typeof c === "string");
  } catch {
    /* fall back to the default */
  }
  return {
    id: row.id,
    // Never send the hash to the browser.
    pinSet: Boolean(row.pinHash),
    forcePin: process.env.FORCE_PIN === "true",
    notificationChannels: channels,
    quietHoursStart: row.quietHoursStart,
    quietHoursEnd: row.quietHoursEnd,
    theme: row.theme,
    updatedAt: row.updatedAt,
  };
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const GET = route(async () => {
  const row = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  return serialise(row);
});

export const PATCH = route(async (req) => {
  const body = await readJson(req);
  const data: Record<string, unknown> = {};

  if ("theme" in body) {
    const theme = optionalString(body, "theme");
    if (theme !== "light" && theme !== "dark") {
      throw badRequest('"theme" must be "light" or "dark"');
    }
    data.theme = theme;
  }

  for (const key of ["quietHoursStart", "quietHoursEnd"] as const) {
    if (key in body) {
      const value = optionalString(body, key);
      if (value !== null && value !== undefined && !TIME_RE.test(value)) {
        throw badRequest(`"${key}" must be HH:MM`);
      }
      data[key] = value ?? null;
    }
  }

  if ("notificationChannels" in body) {
    const value = body.notificationChannels;
    if (
      !Array.isArray(value) ||
      value.some(
        (c) => typeof c !== "string" || !NOTIFICATION_CHANNELS.includes(c as never)
      )
    ) {
      throw badRequest('"notificationChannels" must be an array of known channels');
    }
    data.notificationChannels = JSON.stringify(value);
  }

  const row = await prisma.settings.update({ where: { id: 1 }, data });
  return serialise(row);
});
