# Monitooor

Telegram bot to monitor your URLs. Notifies you if your URL is down, or the element specified by CSS selector has content update.

## About

The reason that this project exists is because of [this tweet](https://twitter.com/0xngmi/status/1545697094027075584).

The code is based on one of my own bots. I refactored and rewrote a big chunk of code cuz my own bot had a ton of hardcoded stuff in it. Now you get a wizard for adding URLs to monitor. May be very buggy, but the neat thing is that you can also add CSS selectors to monitor (it notifies you when the content of the webpage changes, not only if the website is 500 or 404).

The code doesn't have multi-user management yet, so I don't have a public server for it. Everyone needs to run their own private bot. You have to download the code, set up the bot credentials, and run it on your own computer or a server. If you have an Android phone you can run it in Termux, cuz you already keep your phone on 24/7 so it's basically a no-downtime server lol.

I won't be actively maintaining this bot cuz no time, but contributions are welcome. If I have time I might finish the multi-user management part and make it a public service.

## Installation

Simply run this:

```bash
yarn
```

## Configure and run

Before you can start the bot, you need to talk with Bot Father and create a new bot. You'll also need to make a group and add your bot to it, and get the Chat ID (use [@RawDataBot](https://t.me/RawDataBot) to get this).

Then create a `.env` file in the repository root and fill it with the following variables:

```bash
BOT_TOKEN=<the bot token you got from the Bot Father>
CHAT_ID=<the group you want the bot to send updates to>
```

Then you can run the bot with `yarn start`. May not work on Windows.

## Commands

### `/start`

Initialize monitoring daemon and display some info.

### `/add`

Enter wizard to set up a new URL to monitor.

### `/list`

List all entries in database.

### `/help`

Display some info.
