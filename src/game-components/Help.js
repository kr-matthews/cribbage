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
        <h2>Cribbage</h2>
        <div>
          You can play 2- or 3- or 4-player Cribbage matches here. A match
          consists of several games, where you get game points for winning
          matches, and each game is to 121 points. For full rules, search the
          internet, or check out{" "}
          <a
            href={"https://en.wikipedia.org/wiki/Rules_of_cribbage"}
            className="link-tooltip-container"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wikipedia
          </a>{" "}
          or{" "}
          <a
            href={"https://bicyclecards.com/how-to-play/cribbage/"}
            className="link-tooltip-container"
            target="_blank"
            rel="noopener noreferrer"
          >
            Bicycle Cards
          </a>
          .
        </div>
        <div>
          In the top left corner, just below the scoreboard, you can change your
          name and turn sound effects on/off.
        </div>
        <div>
          To play locally against the computer, first add one or two computer
          players via the giant "+" button in the top right, just below the
          scoreboard. Then click "Begin" at the bottom.
        </div>
        <div>
          To play remotely against a friend, first adjust your name then select
          the pencil icon next to "Playing Locally". You'll then be able to
          create a new match, or enter a code if someone else already created a
          match and sent you their code. If you created the match then you'll be
          able to add a computer player or two (if you want) and begin the match
          as above - otherwise your opponent, who created the match, will do
          that.
        </div>
        <div>
          At the bottom of the screen is a match log which records all the plays
          made, in case you miss what happened at any point.
        </div>
        <div>
          Do not refresh or close the app during a match; your progress will be
          lost.
        </div>
        <div>
          To open this help panel again, just click 'Show Help' in the top left.
          You can also choose via the buttons below whether this help panel
          automatically opens every time you come back to this app, or only when
          you click the help button.
        </div>
        <br />
        <button onClick={doShowAgain}>
          Close and automatically open next visit
        </button>
        <button onClick={doNotShowAgain}>Close and don't show again</button>
      </section>

      <div
        className={`overlay${visible ? "" : " hidden"}`}
        onClick={justClose}
      ></div>
    </>
  );
}
