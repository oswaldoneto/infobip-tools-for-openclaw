# openclaw-infobip

Plugin [OpenClaw](https://openclaw.ai) para enviar mensagens WhatsApp via [API da Infobip](https://www.infobip.com/).

## Instalação

```bash
# Instalar dependências
npm install

# Instalar o plugin localmente no OpenClaw
openclaw plugins install .
```

Reinicie o Gateway para carregar o plugin:

```bash
openclaw gateway restart
```

## Configuração

```bash
openclaw config set plugins.entries.infobip.config.baseUrl "https://xxxxx.api.infobip.com"
openclaw config set plugins.entries.infobip.config.apiKey "SUA_API_KEY"
openclaw config set plugins.entries.infobip.config.defaultSender "SEU_REMETENTE_WHATSAPP"
```

| Propriedade     | Obrigatório | Descrição                                          |
|-----------------|-------------|----------------------------------------------------|
| `baseUrl`       | ✅          | URL base da sua conta Infobip                      |
| `apiKey`        | ✅          | Chave de API da Infobip                            |
| `defaultSender` | ❌          | Remetente padrão (pode ser sobrescrito por tool)   |

## Tools disponíveis

### `send_whatsapp_text`

Envia uma mensagem de texto WhatsApp.

| Parâmetro    | Tipo   | Obrigatório | Descrição                                      |
|--------------|--------|-------------|------------------------------------------------|
| `recipient`  | string | ✅          | Número em formato E.164 (ex: `+5511999999999`) |
| `text`       | string | ✅          | Texto da mensagem                              |
| `sender`     | string | ❌          | Remetente (usa `defaultSender` se omitido)     |
| `message_id` | string | ❌          | ID customizado para rastreamento               |

### `send_whatsapp_template`

Envia um template WhatsApp pré-aprovado.

| Parâmetro       | Tipo     | Obrigatório | Descrição                                      |
|-----------------|----------|-------------|------------------------------------------------|
| `recipient`     | string   | ✅          | Número em formato E.164 (ex: `+5511999999999`) |
| `template_name` | string   | ✅          | Nome do template aprovado na Infobip           |
| `language`      | string   | ✅          | Código do idioma (ex: `pt_BR`, `en`)           |
| `placeholders`  | string[] | ❌          | Valores para os placeholders do template       |
| `sender`        | string   | ❌          | Remetente (usa `defaultSender` se omitido)     |
| `message_id`    | string   | ❌          | ID customizado para rastreamento               |

## Estrutura do projeto

```
.
├── index.ts               # Plugin principal (registro das tools)
├── openclaw.plugin.json   # Manifesto do plugin
├── package.json           # Dependências npm
└── tsconfig.json          # Configuração TypeScript
```
