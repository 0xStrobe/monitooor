import { deunionize, Markup, Scenes } from "telegraf";
import { addSelectorStepHandler } from "./addSelectorStepHandler";
import { finishAddingHandler } from "./finishAddingHandler";
import { globalState } from "./monitooor";

export const addUrlWizard = new Scenes.WizardScene(
    "add-url-wizard",
    // 0
    async (ctx) => {
        await ctx.reply("Enter a URL to monitor");
        return ctx.wizard.next();
    },
    // 1
    async (ctx) => {
        globalState.addUrlState.url = deunionize(ctx.message).text;
        // await ctx.replyWithMarkdown(`URL is \`${addUrlState.url}\``);
        await ctx.replyWithMarkdown(
            "Do you want to monitor a specific CSS selector? (select `No` if you don't know what it is)",
            Markup.inlineKeyboard([
                Markup.button.callback("✅ Yes", "yes-selector"),
                Markup.button.callback("❌ No", "no-selector"),
            ]),
        );
        return ctx.wizard.next();
    },
    // 2
    addSelectorStepHandler,
    // 3
    async (ctx) => {
        globalState.addUrlState.selector = deunionize(ctx.message).text;
        // await ctx.replyWithMarkdown(`URL is \`${addUrlState.url}\``);
        // await ctx.replyWithMarkdown(`Selector is \`${addUrlState.selector}\``);
        await ctx.reply("Got it.");
        // wait for 500ms
        await new Promise((resolve) => setTimeout(resolve, 500));
        await ctx.reply("How often do you want me to check? (in minutes)");
        return ctx.wizard.next();
    },
    // 4
    async (ctx) => {
        globalState.addUrlState.interval = Number(deunionize(ctx.message).text);
        await ctx.replyWithMarkdown(`OK, so this is what I've got`);
        await ctx.replyWithMarkdown(
            `- URL: \`${globalState.addUrlState.url}\` \n- Selector: \`${globalState.addUrlState.selector}\` \n- Interval: \`${globalState.addUrlState.interval}\``,
        );
        await ctx.reply(
            "Confirm adding this monitor or cancel?",
            Markup.inlineKeyboard([
                Markup.button.callback("✅ Sure", "yes-finish-adding"),
                Markup.button.callback("❌ Cancel", "no-finish-adding"),
            ]),
        );
        return ctx.wizard.next();
    },
    // 5
    finishAddingHandler,
);
