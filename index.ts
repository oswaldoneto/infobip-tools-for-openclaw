import { Type } from "@sinclair/typebox";

interface PluginConfig {
  baseUrl: string;
  apiKey: string;
  defaultSender?: string;
}

function normalizeBaseUrl(url: string): string {
  const withProtocol = url.startsWith("http") ? url : `https://${url}`;
  return withProtocol.replace(/\/$/, "");
}

async function infobipPost(
  cfg: PluginConfig,
  path: string,
  payload: unknown,
): Promise<unknown> {
  const baseUrl = normalizeBaseUrl(cfg.baseUrl);
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `App ${cfg.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const errMsg =
      (data as any)?.requestError?.serviceException?.text ??
      response.statusText;
    throw new Error(`Infobip error ${response.status}: ${errMsg}`);
  }
  return data;
}

export default function register(api: any) {
  api.registerTool({
    name: "send_whatsapp_text",
    description:
      "Send a WhatsApp text message via Infobip. Use this when the user wants to send a WhatsApp message to a phone number.",
    parameters: Type.Object({
      recipient: Type.String({
        description:
          "Recipient phone number in E.164 format (e.g. +5511999999999)",
      }),
      text: Type.String({
        description: "Text content of the message",
      }),
      sender: Type.Optional(
        Type.String({
          description:
            "WhatsApp sender identifier. Falls back to defaultSender from plugin config.",
        }),
      ),
      message_id: Type.Optional(
        Type.String({
          description: "Optional custom message ID for tracking",
        }),
      ),
    }),
    async execute(_id: string, params: any) {
      const cfg = (api.pluginConfig ?? {}) as PluginConfig;
      const sender = params.sender ?? cfg.defaultSender;
      if (!sender) {
        throw new Error(
          "sender is required. Pass it as a parameter or set defaultSender in the plugin config.",
        );
      }

      const payload: Record<string, unknown> = {
        from: sender,
        to: params.recipient,
        content: { text: params.text },
      };
      if (params.message_id) payload.messageId = params.message_id;

      const result = await infobipPost(cfg, "/whatsapp/1/message/text", payload);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  });

  api.registerTool({
    name: "send_whatsapp_template",
    description:
      "Send a pre-approved WhatsApp template message via Infobip. Use this when the user wants to send a templated WhatsApp message.",
    parameters: Type.Object({
      recipient: Type.String({
        description:
          "Recipient phone number in E.164 format (e.g. +5511999999999)",
      }),
      template_name: Type.String({
        description: "Name of the pre-approved WhatsApp template",
      }),
      language: Type.String({
        description:
          "Language code of the template (e.g. pt_BR, en, en_US)",
      }),
      placeholders: Type.Optional(
        Type.Array(Type.String(), {
          description:
            "List of placeholder values to fill in the template body, in order",
        }),
      ),
      sender: Type.Optional(
        Type.String({
          description:
            "WhatsApp sender identifier. Falls back to defaultSender from plugin config.",
        }),
      ),
      message_id: Type.Optional(
        Type.String({
          description: "Optional custom message ID for tracking",
        }),
      ),
    }),
    async execute(_id: string, params: any) {
      const cfg = (api.pluginConfig ?? {}) as PluginConfig;
      const sender = params.sender ?? cfg.defaultSender;
      if (!sender) {
        throw new Error(
          "sender is required. Pass it as a parameter or set defaultSender in the plugin config.",
        );
      }

      const message: Record<string, unknown> = {
        from: sender,
        to: params.recipient,
        content: {
          templateName: params.template_name,
          language: params.language,
          templateData: {
            body: {
              placeholders: params.placeholders ?? [],
            },
          },
        },
      };
      if (params.message_id) message.messageId = params.message_id;

      const result = await infobipPost(
        cfg,
        "/whatsapp/1/message/template",
        { messages: [message] },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  });
}
