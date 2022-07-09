import dotenv from "dotenv";
dotenv.config();

import { Scenes, session, Telegraf } from "telegraf";
import { addUrlWizard } from "./addUrlWizard";
import { clearAllTimerIdsForExit, countMonitors, listMonitors, startAllMonitors } from "./db";

const token = process.env.BOT_TOKEN;
if (token === undefined) {
    throw new Error("BOT_TOKEN must be provided!");
}

// best state management ever lol seriously the telegraf.js docs and examples are shiiit
// i'd rather use xstate or redux lol
export const addUrlStateInit = {
    url: "",
    selector: "",
    interval: 0,
};
export const globalState = {
    addUrlState: { ...addUrlStateInit },
};

const bot = new Telegraf<Scenes.WizardContext>(token);
const stage = new Scenes.Stage<Scenes.WizardContext>([addUrlWizard]);
bot.use(session());
bot.use(stage.middleware());

const HELP_TEXT =
    "**Welcome to [Strobie](https://twitter.com/0xstrobe)'s Monitooor!**\n\n" +
    "I'm a bot that monitors a webpage for changes. I can add URLs and CSS selectors to the database and I can notify you when a change is detected on the selected element on the webpage.\n\n" +
    "I also work with JS heavy webpages! I will load the webpage and render it in the background just like a normal browser, and parse the innerHTML of the element you specified via the CSS selector.\n\n" +
    "To add a monitor, use the command `/add`.";

bot.command("start", async (ctx) => {
    await ctx.replyWithMarkdown(HELP_TEXT);
    // if db not empty, start monitoring everything and notify
    // if db empty, do nothing
    const count = countMonitors();
    if (count > 0) {
        await ctx.replyWithMarkdown(`I detected ${count} entries already in the database!`);
        await startAllMonitors();
        await ctx.replyWithMarkdown("I just started everything!");
    }
});

bot.command("add", async (ctx) => {
    await ctx.scene.enter("add-url-wizard");
});

bot.command("list", async (ctx) => {
    await ctx.reply("Listing all monitors...");
    const monitors = listMonitors();
    const monitorStrings = monitors
        .map((monitor) => {
            const { id, url, selector } = monitor;
            // truncate url and selector to fit in telegram
            const truncatedUrl = url.length > 20 ? `${url.substring(0, 20)}...` : url;
            const truncatedSelector = selector.length > 15 ? `${selector.substring(0, 20)}...` : selector;
            return `${id} - ${truncatedUrl} - ${truncatedSelector}`;
        })
        .reduce((acc, curr) => `${acc}\n${curr}`);
    await ctx.replyWithMarkdown(`\`\`\`\n${monitorStrings}\n\`\`\``);
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => {
    clearAllTimerIdsForExit();
    bot.stop("SIGINT");
});
process.once("SIGTERM", () => {
    clearAllTimerIdsForExit();
    bot.stop("SIGTERM");
});
