import { aboutBlurb, site, socials } from "../data/site";
import { session } from "../lib/session";
import { showSiteFooter } from "../lib/playback";
import { usePlayback } from "../hooks/useSessionPlayback";
import { StreamText } from "./StreamText";

export function About() {
  const { view, chapterOn } = usePlayback();
  const think = view("think-about");
  const tool = view("tool-about");
  const tx = view("tx-about");
  const card = {
    tool: "identity.card",
    args: { handle: site.handle },
    ok: true,
    data: {
      name: site.person,
      company: site.company,
      loc: site.location,
      years: site.years,
    },
  };

  return (
    <section className="chapter about" id="about">
      <div className={`turn ${chapterOn("about") ? "" : "is-queued"}`}>
        {think.show ? (
          <p className={`msg msg-think ${think.complete ? "" : "is-live"}`}>
            <span className="msg-role">
              THINKING
              <span className="think-dots" aria-hidden="true" />
            </span>
            <StreamText text={think.text} caret={think.caret} />
          </p>
        ) : null}
        {tool.show ? (
          <div className="msg msg-tool">
            <span className="msg-role">TOOL · identity.card</span>
            <pre className="tool-json">
              {tool.complete ? (
                JSON.stringify(card, null, 2)
              ) : (
                <StreamText text={tool.text} caret={tool.caret} />
              )}
            </pre>
          </div>
        ) : null}
        {tx.show ? (
          <article
            className={`artifact ${tx.complete ? "" : "is-streaming"}`}
            id="about-reply"
          >
            <p className="hud-meta">
              <span>TX · {session.os}</span>
              <span>operator</span>
              <span>{site.location}</span>
            </p>
            <h2>{site.person}</h2>
            <p className="lede">
              <StreamText text={tx.text} caret={tx.caret} />
            </p>
            {tx.complete ? (
              <>
                <p className="body about-blurb">{aboutBlurb}</p>
                <div className="link-row">
                  {socials.map((item) => (
                    <a
                      key={item.href}
                      className="btn btn-ghost"
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </>
            ) : null}
          </article>
        ) : null}
      </div>
    </section>
  );
}

export function Footer() {
  const { mode } = usePlayback();
  if (!showSiteFooter(mode)) return null;

  return (
    <footer className="site-footer">
      <p>
        © {new Date().getFullYear()} {site.name} · {site.person} · {site.domain}
      </p>
      <p className="footer-note">
        Catalog lives in <code>src/data/projects.ts</code>. Parked Three.js volume:
        append <code>?stage=volume</code>.
      </p>
    </footer>
  );
}
