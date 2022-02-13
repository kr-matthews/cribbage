import "./options.css";
import pencilIcon from "./pencil-icon.png";

/**
 * Shows an icon which can be clicked to call a function, possibly after a window event for input and/or confirmation.
 *
 * @param {string} type - "prompt", "confirm", or defaults
 * @param {string} title - displayed on mouse hover
 * @param {string} text - to show in the window event
 * @param {string} defaultInput - default text in the prompt
 * @param {string} fun - function to execute on successful click
 */
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
    <img
      src={pencilIcon}
      className="editIcon"
      title={title}
      onClick={clickhandler}
    />
  );
}
