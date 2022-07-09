# Monitooor

Telegram bot to monitor your URLs.

## Installation

Simply run this:

```bash
yarn
```

## Configuration

Before you can start the bot, you need to talk with Bot Father and create a new bot. You'll also need to make a group and add your bot to it, and get the Chat ID (use [@RawDataBot](https://t.me/RawDataBot) to get this).

Then create a `.env` file in the repository root and fill it with the following variables:

```bash
BOT_TOKEN=<the bot token you got from the Bot Father>
CHAT_ID=<the group you want the bot to send updates to>
```

## Commands

### `/start`

Initialize monitoring daemon.

### `/add`

Enter wizard to set up a new URL to monitor.
