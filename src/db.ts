import Database from "better-sqlite3";
import { globalState } from "./monitooor";
import { getInnerHTML } from "./parser";

interface Monitor {
    id: number;
    url: string;
    selector: string;
    interval: number;
    lastChecked: number;
    lastChanged: number;
    lastHttpStatus: number;
    lastCachedHtml: string;
    timerId: number;
}

const db = new Database("monitooor.db", { verbose: console.log });
const table = db.prepare(
    "CREATE TABLE IF NOT EXISTS monitors (id INTEGER PRIMARY KEY, url TEXT, selector TEXT, interval INTEGER, lastChecked INTEGER, lastChanged INTEGER, lastHttpStatus INTEGER, lastCachedHtml TEXT, timerId INTEGER)",
);
table.run();

export function createMonitor(url: string, selector: string, interval: number) {
    const monitor = db.prepare("INSERT INTO monitors (url, selector, interval) VALUES (@url, @selector, @interval)");
    const res = monitor.run({ url, selector, interval });
    return Number(res.lastInsertRowid);
}

export function getMonitor(id: number) {
    const monitor = db.prepare("SELECT * FROM monitors WHERE id = @id");
    const res: Monitor = monitor.get({ id });
    return res;
}

export function removeMonitor(id: number) {
    // stop the setInterval timer if it's running
    const timer = db.prepare("SELECT * FROM monitors WHERE id = @id");
    const { timerId } = timer.get({ id }) as Monitor;
    if (timerId) {
        clearInterval(timerId);
    }

    const monitor = db.prepare("DELETE FROM monitors WHERE id = @id");
    const res = monitor.run({ id });
    return res.changes;
}

export function listMonitors() {
    const monitors = db.prepare("SELECT * FROM monitors");
    const res = monitors.all();
    return res as Monitor[];
}

export function countMonitors() {
    const monitors = db.prepare("SELECT COUNT(*) FROM monitors");
    const res = monitors.get();
    return res.count as number;
}

export async function performCheck(id: number) {
    const monitor: Monitor = getMonitor(id);
    const { url, selector } = monitor;

    const { httpStatus, html } = await getInnerHTML(url, selector);
    const lastChecked = Date.now();

    // if not changed, only update lastChecked
    if (html === monitor.lastCachedHtml) {
        const update = db.prepare("UPDATE monitors SET lastChecked = @lastChecked WHERE id = @id");
        const res = update.run({ lastChecked, id });
        return res.changes;
    }

    const lastChanged = Date.now();
    const lastHttpStatus = httpStatus;
    const lastCachedHtml = html;
    const update = db.prepare(
        "UPDATE monitors SET lastChecked = @lastChecked, lastChanged = @lastChanged, lastHttpStatus = @lastHttpStatus, lastCachedHtml = @lastCachedHtml WHERE id = @id",
    );
    const res = update.run({ lastChecked, lastChanged, lastHttpStatus, lastCachedHtml, id });
    await globalState.sendMessage(`🚨 Detected changes in URL: ${url}`);
    return res.changes;
}

// loop through the db and set up setInterval for each monitor to performCheck with an extra initial check
export async function startAllMonitors() {
    const monitors: Monitor[] = listMonitors();
    for (const monitor of monitors) {
        const { id, interval, timerId: _timerId } = monitor;
        clearInterval(_timerId); // in case it's already running
        const timerId = setInterval(() => performCheck(id), interval * 60 * 1000);
        const update = db.prepare("UPDATE monitors SET timerId = @timerId WHERE id = @id");
        const res = update.run({ timerId, id });
        await performCheck(id);
    }
}

// start a new monitor with setInterval and an extra initial check
export async function startMonitor(id: number) {
    const monitor = getMonitor(id);
    const { interval, timerId: _timerId } = monitor;
    clearInterval(_timerId); // in case it's already running
    const timerId = setInterval(() => performCheck(id), interval * 60 * 1000);
    const update = db.prepare("UPDATE monitors SET timerId = @timerId WHERE id = @id");
    const res = update.run({ timerId, id });
    await performCheck(id);
}

export function clearAllTimerIdsForExit() {
    // set all timerIds to null
    const update = db.prepare("UPDATE monitors SET timerId = NULL");
    const res = update.run();
    return res.changes;
}
