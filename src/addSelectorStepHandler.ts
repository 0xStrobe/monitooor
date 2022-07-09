import { Composer, Scenes } from "telegraf";

export const addSelectorStepHandler = new Composer<Scenes.WizardContext>();
addSelectorStepHandler.action("yes-selector", async (ctx) => {
    await ctx.replyWithMarkdown("OK! Enter the CSS selector then. (eg. `li.my-class#my-id`)");
    return ctx.wizard.selectStep(3);
});
addSelectorStepHandler.action("no-selector", async (ctx) => {
    await ctx.reply("Got it, I'll just update you whenever I detect any changes in the webpage.");
    // wait for 500ms
    await new Promise((resolve) => setTimeout(resolve, 500));
    await ctx.reply("How often do you want me to check? (in minutes)");
    return ctx.wizard.selectStep(4);
});
addSelectorStepHandler.use((ctx) =>
    ctx.replyWithMarkdown("Bro I'm asking do you want to monitor a specific CSS selector or not?"),
);
