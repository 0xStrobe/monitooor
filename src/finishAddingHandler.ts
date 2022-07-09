import { Composer, Scenes } from "telegraf";
import { createMonitor } from "./db";
import { globalState, addUrlStateInit } from "./monitooor";

export const finishAddingHandler = new Composer<Scenes.WizardContext>();
finishAddingHandler.action("yes-finish-adding", async (ctx) => {
    const { url, selector, interval } = globalState.addUrlState;
    const id = createMonitor(url, selector, interval);

    await ctx.replyWithMarkdown(`OK! I've added this to the database. The entry ID is \`${id}\`.`);
    globalState.addUrlState = { ...addUrlStateInit };
    return await ctx.scene.leave();
});
finishAddingHandler.action("no-finish-adding", async (ctx) => {
    await ctx.reply("OK! Everything canceled.");
    globalState.addUrlState = { ...addUrlStateInit };
    return await ctx.scene.leave();
});
finishAddingHandler.use((ctx) => ctx.replyWithMarkdown("Confirm adding this monitor or cancel?"));
