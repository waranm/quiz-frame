import { Frog, Button } from "frog";
import type { NextRequest } from "next/server";
import { handle } from "frog/next";

const QUESTIONS = [
  {
    q: "When markets swing 10% in a day, you…",
    a: [
      { label: "buy the dip", val: "BULL" },
      { label: "wait & see", val: "BALANCED" },
      { label: "hedge / cut risk", val: "DEFENSIVE" },
    ],
  },
  {
    q: "Your favorite tool for alpha is…",
    a: [
      { label: "on‑chain data", val: "BULL" },
      { label: "macro + TA", val: "BALANCED" },
      { label: "yield & risk mgmt", val: "DEFENSIVE" },
    ],
  },
  {
    q: "If gas spikes mid‑trade…",
    a: [
      { label: "send it anyway", val: "BULL" },
      { label: "reroute / batch", val: "BALANCED" },
      { label: "skip the trade", val: "DEFENSIVE" },
    ],
  },
] as const;

const RESULTS: Record<string, { title: string; blurb: string }> = {
  BULL: {
    title: "⚡ The Momentum Maximalist",
    blurb:
      "You thrive on volatility and move fast. Your edge is conviction + speed. Track risk so you can play tomorrow, too.",
  },
  BALANCED: {
    title: "📈 The Disciplined Navigator",
    blurb:
      "You balance setups and risk with patience. Process first, FOMO last — solid compounding mindset.",
  },
  DEFENSIVE: {
    title: "🛡️ The Risk Manager",
    blurb:
      "Capital preservation is king. You hunt asymmetric yield and wait for fat pitches. Long game player.",
  },
};

type State = {
  step: number;
  tally: Record<string, number>;
  done?: boolean;
  lastChoice?: string;
};

const app = new Frog<{ State: State }>({
  title: "Quiz Frame",
  initialState: {
    step: 0,
    tally: {},
  },
});

function pickWinner(tally: Record<string, number>): string {
  let best = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : "BALANCED";
}

app.frame("/", (c) => {
  const { buttonValue, deriveState } = c;

  const state = deriveState((s) => {
    if (buttonValue && typeof buttonValue === "string") {
      s.lastChoice = buttonValue;
      s.tally[buttonValue] = (s.tally[buttonValue] || 0) + 1;
      s.step = (s.step ?? 0) + 1;
    }
    if (s.step >= QUESTIONS.length) s.done = true;
  });

  if (!state.done) {
    const current = QUESTIONS[state.step];
    return c.res({
      image: (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            background: "black",
            color: "white",
            padding: 32,
            fontSize: 36,
          }}
        >
          <div style={{ fontSize: 28, opacity: 0.85, marginBottom: 8 }}>
            Quiz — {state.step + 1}/{QUESTIONS.length}
          </div>
          <div style={{ fontSize: 44, textAlign: "center", lineHeight: 1.2 }}>
            {current.q}
          </div>
        </div>
      ),
      intents: [
        <Button value={current.a[0].val}>{current.a[0].label}</Button>,
        <Button value={current.a[1].val}>{current.a[1].label}</Button>,
        <Button value={current.a[2].val}>{current.a[2].label}</Button>,
      ],
    });
  }

  const winner = pickWinner(state.tally);
  const result = RESULTS[winner];
  const shareText = `${result.title} — ${result.blurb}`;

  return c.res({
    image: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg,#0b0b0b,#141e30)",
          color: "white",
          padding: 40,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 22, opacity: 0.8, marginBottom: 12 }}>
          Your Result
        </div>
        <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 12 }}>
          {result.title}
        </div>
        <div style={{ fontSize: 30, maxWidth: 800, lineHeight: 1.3 }}>
          {result.blurb}
        </div>
      </div>
    ),
    intents: [
      <Button action="post" target="/reset">Play again</Button>,
      <Button
        action="link"
        target={`https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`}
      >
        Share
      </Button>,
    ],
  });
});

app.frame("/reset", (c) => {
  const { deriveState } = c;
  deriveState((s) => {
    s.step = 0;
    s.tally = {};
    s.done = false;
    s.lastChoice = undefined;
  });
  return c.res({
    image: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "black",
          color: "white",
          fontSize: 44,
        }}
      >
        Ready? Tap to start →
      </div>
    ),
    intents: [<Button action="post" target="/">Start</Button>],
  });
});

export const GET = (req: NextRequest) => handle(app)(req);
export const POST = (req: NextRequest) => handle(app)(req);
