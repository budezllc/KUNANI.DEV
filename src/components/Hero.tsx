import { site, socials } from "../data/site";
import { catalogHref } from "../lib/catalog";
import { session } from "../lib/session";
import { usePlayback } from "../hooks/useSessionPlayback";
import { StreamText } from "./StreamText";

export function Hero() {
  const { view, chapterOn } = usePlayback();
  const boot = view("boot");
  const rx = view("rx-hero");
  const think = view("think-hero");
  const tx = view("tx-hero");

  return (
    <section className="hero" id="hero">
      <div className={`turn ${chapterOn("hero") ? "" : "is-queued"}`}>
        {boot.show ? (
          <p className="msg msg-sys">
            <span className="msg-role">SYS · BOOT</span>
            <StreamText text={boot.text} caret={boot.caret} />
          </p>
        ) : null}
        {rx.show ? (
          <p className="msg msg-rx">
            <span className="msg-role">RX · {site.person}</span>
            <StreamText text={rx.text} caret={rx.caret} />
          </p>
        ) : null}
        {think.show ? (
          <p className={`msg msg-think ${think.complete ? "" : "is-live"}`}>
            <span className="msg-role">
              THINKING
              <span className="think-dots" aria-hidden="true" />
            </span>
            <StreamText text={think.text} caret={think.caret} />
          </p>
        ) : null}
        {tx.show ? (
          <div className="msg msg-tx hero-tx" id="hero-reply">
            <span className="msg-role">TX · {session.os}</span>
            <p className="hero-kicker">
              {site.person} · {site.company} · {session.model}
            </p>
            <h1 className="hero-title">KUNANI</h1>
            <p className="hero-line">
              <StreamText text={tx.text} caret={tx.caret} />
            </p>
            {tx.complete ? (
              <>
                <p className="hero-tag">{site.tagline}</p>
                <div className="hero-cta">
                  <a className="btn" href={catalogHref()}>
                    Open catalog
                  </a>
                  <a className="btn btn-ghost" href={socials[0].href}>
                    GitHub
                  </a>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
