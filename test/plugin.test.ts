import assert from "node:assert/strict";
import { test } from "node:test";

import register from "../index.ts";

const INFOBIP_BASE_URL =
  process.env.INFOBIP_BASE_URL ?? "example.api.infobip.com";
const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY ?? "test-key";
const INFOBIP_SENDER = process.env.INFOBIP_SENDER ?? "SENDER";
const INFOBIP_RECIPIENT =
  process.env.INFOBIP_RECIPIENT ?? "+5511999999999";

type RegisteredTool = {
  name: string;
  execute: (id: string, params: any) => Promise<any>;
};

test("send_whatsapp_text calls Infobip with normalized baseUrl and payload", async () => {
  const tools: RegisteredTool[] = [];
  const api = {
    pluginConfig: {
      baseUrl: `${INFOBIP_BASE_URL}/`,
      apiKey: INFOBIP_API_KEY,
      defaultSender: INFOBIP_SENDER,
    },
    registerTool(tool: RegisteredTool) {
      tools.push(tool);
    },
  };

  let fetchCalled = false;
  let fetchUrl = "";
  let fetchOptions: any = null;

  globalThis.fetch = (async (url: any, options: any) => {
    fetchCalled = true;
    fetchUrl = String(url);
    fetchOptions = options;
    return {
      ok: true,
      json: async () => ({ result: "ok" }),
      status: 200,
      statusText: "OK",
    } as any;
  }) as any;

  register(api);

  const tool = tools.find((t) => t.name === "send_whatsapp_text");
  assert.ok(tool, "send_whatsapp_text tool registered");

  await tool!.execute("id", {
    recipient: INFOBIP_RECIPIENT,
    text: "Olá",
  });

  assert.equal(fetchCalled, true);
  assert.equal(
    fetchUrl,
    `https://${INFOBIP_BASE_URL}/whatsapp/1/message/text`,
  );
  assert.equal(fetchOptions.method, "POST");
  assert.equal(fetchOptions.headers.Authorization, `App ${INFOBIP_API_KEY}`);

  const body = JSON.parse(fetchOptions.body);
  assert.deepEqual(body, {
    from: INFOBIP_SENDER,
    to: INFOBIP_RECIPIENT,
    content: { text: "Olá" },
  });
});

test("send_whatsapp_text errors when sender is missing", async () => {
  const tools: RegisteredTool[] = [];
  const api = {
    pluginConfig: {
      baseUrl: INFOBIP_BASE_URL,
      apiKey: INFOBIP_API_KEY,
    },
    registerTool(tool: RegisteredTool) {
      tools.push(tool);
    },
  };

  register(api);

  const tool = tools.find((t) => t.name === "send_whatsapp_text");
  assert.ok(tool, "send_whatsapp_text tool registered");

  await assert.rejects(
    () => tool!.execute("id", { recipient: INFOBIP_RECIPIENT, text: "Oi" }),
    /sender is required/,
  );
});

test("send_whatsapp_template sends template payload with placeholders and message_id", async () => {
  const tools: RegisteredTool[] = [];
  const api = {
    pluginConfig: {
      baseUrl: INFOBIP_BASE_URL,
      apiKey: INFOBIP_API_KEY,
      defaultSender: INFOBIP_SENDER,
    },
    registerTool(tool: RegisteredTool) {
      tools.push(tool);
    },
  };

  let fetchUrl = "";
  let fetchOptions: any = null;

  globalThis.fetch = (async (url: any, options: any) => {
    fetchUrl = String(url);
    fetchOptions = options;
    return {
      ok: true,
      json: async () => ({ result: "ok" }),
      status: 200,
      statusText: "OK",
    } as any;
  }) as any;

  register(api);

  const tool = tools.find((t) => t.name === "send_whatsapp_template");
  assert.ok(tool, "send_whatsapp_template tool registered");

  await tool!.execute("id", {
    recipient: INFOBIP_RECIPIENT,
    template_name: "pedido_confirmado",
    language: "pt_BR",
    placeholders: ["João", "12345"],
    message_id: "msg-123",
  });

  assert.equal(
    fetchUrl,
    `https://${INFOBIP_BASE_URL}/whatsapp/1/message/template`,
  );

  const body = JSON.parse(fetchOptions.body);
  assert.deepEqual(body, {
    messages: [
      {
        from: INFOBIP_SENDER,
        to: INFOBIP_RECIPIENT,
        messageId: "msg-123",
        content: {
          templateName: "pedido_confirmado",
          language: "pt_BR",
          templateData: {
            body: {
              placeholders: ["João", "12345"],
            },
          },
        },
      },
    ],
  });
});

test("infobipPost surfaces service error text on non-ok response", async () => {
  const tools: RegisteredTool[] = [];
  const api = {
    pluginConfig: {
      baseUrl: INFOBIP_BASE_URL,
      apiKey: INFOBIP_API_KEY,
      defaultSender: INFOBIP_SENDER,
    },
    registerTool(tool: RegisteredTool) {
      tools.push(tool);
    },
  };

  globalThis.fetch = (async () => {
    return {
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({
        requestError: {
          serviceException: {
            text: "Invalid recipient",
          },
        },
      }),
    } as any;
  }) as any;

  register(api);

  const tool = tools.find((t) => t.name === "send_whatsapp_text");
  assert.ok(tool, "send_whatsapp_text tool registered");

  await assert.rejects(
    () =>
      tool!.execute("id", {
        recipient: INFOBIP_RECIPIENT,
        text: "Oi",
      }),
    /Infobip error 400: Invalid recipient/,
  );
});
