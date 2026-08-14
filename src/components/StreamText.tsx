type Props = {
  text: string;
  caret?: boolean;
};

export function StreamText({ text, caret = false }: Props) {
  return (
    <span className="stream">
      {text}
      {caret ? <span className="caret" aria-hidden="true" /> : null}
    </span>
  );
}
