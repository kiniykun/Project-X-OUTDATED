// Bare full-window proxy page, meant to be embedded in an iframe.
// Usage: /go.html?url=https%3A%2F%2Fexample.com
// It reports the page's real address to the parent window as { px: true, url }.
import { engine } from "./engine.ts";

const frame = document.getElementById("frame") as HTMLIFrameElement;
const msg = document.getElementById("msg") as HTMLElement;

const show = (text: string) => {
	msg.textContent = text;
	msg.hidden = false;
};

const target = (() => {
	try {
		const u = new URL(new URLSearchParams(location.search).get("url") ?? "");
		return /^https?:$/.test(u.protocol) ? u.href : "";
	} catch {
		return "";
	}
})();

const start = async () => {
	if (!target) {
		show("No address was given.");
		return;
	}
	try {
		const session = await engine.createSession(frame, {
			url: url => parent.postMessage({ px: true, url }, "*"),
			ready: () => (msg.hidden = true),
			escape: url => window.open(url, "_blank", "noopener")
		});
		parent.postMessage({ px: true, url: target }, "*");
		session.go(target);
		setTimeout(() => (msg.hidden = true), 1500);
	} catch (error) {
		show("The proxy could not start: " + String((error as Error)?.message ?? error));
	}
};

void start();
