import assert from "node:assert/strict";
import { test } from "node:test";

import register from "../index.ts";

const INFOBIP_BASE_URL = process.env.INFOBIP_BASE_URL;
const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY;
const INFOBIP_SENDER = process.env.INFOBIP_SENDER;
const INFOBIP_RECIPIENT = process.env.INFOBIP_RECIPIENT;

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

test("integration: send_whatsapp_text sends a real message", async () => {
  const tools: { name: string; execute: (id: string, params: any) => any }[] =
    [];
  const api = {
    pluginConfig: {
      baseUrl: requireEnv("INFOBIP_BASE_URL", INFOBIP_BASE_URL),
      apiKey: requireEnv("INFOBIP_API_KEY", INFOBIP_API_KEY),
      defaultSender: requireEnv("INFOBIP_SENDER", INFOBIP_SENDER),
    },
    registerTool(tool: { name: string; execute: (id: string, params: any) => any }) {
      tools.push(tool);
    },
  };

  register(api);

  const tool = tools.find((t) => t.name === "send_whatsapp_text");
  assert.ok(tool, "send_whatsapp_text tool registered");

  const result = await tool!.execute("id", {
    recipient: requireEnv("INFOBIP_RECIPIENT", INFOBIP_RECIPIENT),
    text: `Teste integração OpenClaw ${new Date().toISOString()}`,
  });

  assert.ok(result?.content?.[0]?.text, "Expected result content text");
});

test("integration: send_whatsapp_template sends a real template message", async () => {
  const tools: { name: string; execute: (id: string, params: any) => any }[] =
    [];
  const api = {
    pluginConfig: {
      baseUrl: requireEnv("INFOBIP_BASE_URL", INFOBIP_BASE_URL),
      apiKey: requireEnv("INFOBIP_API_KEY", INFOBIP_API_KEY),
      defaultSender: requireEnv("INFOBIP_SENDER", INFOBIP_SENDER),
    },
    registerTool(tool: { name: string; execute: (id: string, params: any) => any }) {
      tools.push(tool);
    },
  };

  register(api);

  const tool = tools.find((t) => t.name === "send_whatsapp_template");
  assert.ok(tool, "send_whatsapp_template tool registered");

  const result = await tool!.execute("id", {
    recipient: requireEnv("INFOBIP_RECIPIENT", INFOBIP_RECIPIENT),
    template_name: "education_hackathon_microsoft_marco",
    language: "pt_BR",
    placeholders: [],
  });

  assert.ok(result?.content?.[0]?.text, "Expected result content text");
});
