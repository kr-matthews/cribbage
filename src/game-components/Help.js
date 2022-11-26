import "./help.css";

export default function Help({
  visible = false,
  doNotShowAgain,
  doShowAgain,
  justClose,
}) {
  return (
    <>
      <section className={`modal${visible ? "" : " hidden"}`}>
        <button onClick={doShowAgain}>
          Close and automatically open next visit
        </button>
        <button onClick={doNotShowAgain}>
          Close and don't automatically show again
        </button>
      </section>

      <div
        className={`overlay${visible ? "" : " hidden"}`}
        onClick={justClose}
      ></div>
    </>
  );
}
