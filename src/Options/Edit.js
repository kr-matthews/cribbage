export default function Edit({
  type,
  title = "Click to edit",
  text,
  defaultInput,
  fun,
}) {
  function clickhandler() {
    switch (type) {
      case "prompt":
        const input = prompt(text, defaultInput);
        if (input !== null) fun(input);
        break;

      case "confirm":
        if (window.confirm(text)) fun();
        break;

      default:
        fun();
        break;
    }
  }

  return (
    <span className="editIcon" title={title} onClick={clickhandler}>
      &#9998;
    </span>
  );
}

// TODO: NEXT: CSS: edit button (at least cursor)
