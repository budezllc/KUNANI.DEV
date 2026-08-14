import type { Project, ProjectMedia } from "../data/types";
import { youtubeEmbedSrc } from "../lib/media";
import { session, toolResult } from "../lib/session";
import { usePlayback } from "../hooks/useSessionPlayback";
import { StreamText } from "./StreamText";

type Props = {
  id: string;
  title: string;
};

export function YouTubeEmbed({ id, title }: Props) {
  return (
    <div className="reel-frame">
      <iframe
        src={youtubeEmbedSrc(id)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

function SnapshotFrame({ src, title }: { src: string; title: string }) {
  return (
    <figure className="shot-frame">
      <img src={src} alt={title} />
    </figure>
  );
}

function ProjectMediaFrame({ media }: { media: ProjectMedia }) {
  if (media.kind === "youtube") {
    return <YouTubeEmbed id={media.id} title={media.title} />;
  }
  return <SnapshotFrame src={media.src} title={media.title} />;
}

export function ProjectChapter({ project }: { project: Project }) {
  const { view, chapterOn } = usePlayback();
  const think = view(`think-${project.slug}`);
  const tool = view(`tool-${project.slug}`);
  const tx = view(`tx-${project.slug}`);
  const read = toolResult(project);
  const json = JSON.stringify(read, null, 2);

  return (
    <section className="chapter" id={project.slug}>
      <div className={`turn ${chapterOn(project.slug) ? "" : "is-queued"}`}>
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
            <span className="msg-role">TOOL · {read.tool}</span>
            <pre className="tool-json">
              {tool.complete ? json : <StreamText text={tool.text} caret={tool.caret} />}
            </pre>
          </div>
        ) : null}
        {tx.show ? (
          <article
            className={`artifact ${tx.complete ? "" : "is-streaming"}`}
            id={`${project.slug}-reply`}
          >
            <p className="hud-meta">
              <span>TX · {session.os}</span>
              <span>{project.kicker}</span>
              <span>{project.year}</span>
              <span>{project.openSource ? "open_source: true" : "studio"}</span>
            </p>
            <h2>{project.title}</h2>
            <p className="lede">
              <StreamText text={tx.text} caret={tx.caret} />
            </p>
            {tx.complete ? (
              <>
                <p className="body">{project.body}</p>
                <ul className="tags">
                  {project.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <div className="link-row">
                  {project.links.map((link) => (
                    <a
                      key={link.href}
                      className="btn btn-ghost"
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
                {project.media ? <ProjectMediaFrame media={project.media} /> : null}
              </>
            ) : null}
          </article>
        ) : null}
      </div>
    </section>
  );
}
