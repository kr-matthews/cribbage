import { useReducer, useEffect, useState } from "react";
import {
  WithHeavyFooter,
  Body,
  HeavyFooter,
  HomeLink,
  CodeLink,
} from "footer-dependency/dist/lib";

import { useLocalStorage } from "./hooks/useLocalStorage.js";
import { usePreviousPlayerAction } from "./hooks/usePreviousPlayerAction.js";
import { useDeck } from "./hooks/useDeck.js";
import { useCutForDeal } from "./hooks/useCutForDeal.js";
import { useGame } from "./hooks/useGame.js";
import { useGamePoints } from "./hooks/useGamePoints.js";
import { useSoundEffects } from "./hooks/useSoundEffects.js";
import { useNetwork } from "./hooks/useNetwork.js";
import { useMatchLogs } from "./hooks/useMatchLogs.js";
import useComputerPlayer from "./hooks/useComputerPlayer.js";

import Action from "./hooks/Action.js";

import Header from "./game-components/Header.js";
import Hands from "./game-components/Hands.js";
import PlayArea from "./game-components/PlayArea.js";
import Actions from "./game-components/Actions.js";
import ScoreBoard from "./game-components/ScoreBoard.js";
import MatchLogs from "./game-components/MatchLogs.js";
import Help from "./game-components/Help.js";

import "./game-components/gameComponents.css";
import "./playing-cards/playingCards.css";

//// Debug Flags ////

// make all cards face-up
const MAKE_ALL_FACE_UP = false;
// let user control computer player actions
const CONTROL_ALL_PLAYERS = false;
// use a rigged deck (defined via `manuallyOrderedCards` in cardHelpers.js), instead of randomly shuffling
const USE_RIGGED_DECK = false;

//// UI Flags ////

// always use four columns in UI, even if fewer than 3 players
const HIDE_EMPTY_COLUMNS = true;

//// Constants ////

// hand of size up to 6, plus starter card on the end
const HAND_ALL_UNSELECTED = Array(7).fill(false);
// longest allowed name
const USER_NAME_MAX_LENGTH = 12;
// colours on the board (don't use middle track when 2 players)
const BOARD_COLOURS = ["#33A8FF", "red", "#238E04"];
const PEG_COLOURS = ["darkblue", "#A70303", "#2C5121"]; // these might not actually be used

//// Reducers ////

function playersReducer(players, action) {
  const newPlayers = [...players];

  switch (action.type) {
    case "override":
      return action.players;

    case "add":
      newPlayers.push({});
    // intentional fall-through
    // eslint-disable-next-line
    case "update":
      const ind =
        action.player || (action.player === 0 ? 0 : newPlayers.length - 1); // silly 0 being falsy
      const isComputer =
        action.isComputer ||
        (action.isComputer === false ? false : newPlayers[ind].isComputer);
      const name = action.name || newPlayers[ind].name;
      const isUser =
        action.isUser ||
        (action.isUser === false ? false : newPlayers[ind].isUser);
      newPlayers[ind] = { name, isComputer, isUser };
      break;

    case "remove":
      newPlayers.splice(action.player, 1);
      break;

    default:
      console.error("playersReducer couldn't recognize action", action);
  }

  // update colours
  const newPlayerCount = newPlayers.length;
  for (let ind = 0; ind < newPlayerCount; ind++) {
    // if 2 players, 2 * ind maps indices to inner, outer tracks
    newPlayers[ind].colour =
      BOARD_COLOURS[newPlayerCount === 3 ? ind : 2 * ind];
  }

  return newPlayers;
}

function selectedReducer(selected, action) {
  let newSelected = [...selected];
  switch (action.type) {
    case "click":
      newSelected[action.index] = !newSelected[action.index];
      break;
    case "replace":
      newSelected = [...HAND_ALL_UNSELECTED];
      newSelected[action.index] = !selected[action.index];
      break;
    case "reset":
      newSelected = [...HAND_ALL_UNSELECTED];
      break;
    default:
      console.error("selectedReducer couldn't recognize action", action);
  }
  return newSelected;
}

//// Helpers ////

function getRandomName() {
  let names = [
    "Skynet",
    "Ava",
    "Jarvis",
    "HAL 900",
    "Matrix",
    "Alie",
    "Tardis",
  ];
  return names[Math.floor(Math.random() * names.length)];
}

////// App //////

export default function App() {
  //// User and Players ////

  // user's name (persists)
  const [userName, setUserName] = useLocalStorage("userName", "Undecided");
  function trySetUserName(input) {
    // can't change while playing remotely
    if (network.mode !== "local") {
      alert("You can't change your name while playing remotely.");
      return;
    }
    // can't set to empty
    const newName = input.trim().slice(0, USER_NAME_MAX_LENGTH).trim();
    if (newName.length === 0) {
      alert("You can't have a blank name.");
      return;
    }
    setUserName(newName);
    matchLogs.postUpdate(`You changed your username to ${newName}.`);
  }

  // list of up to 3 players
  const [players, dispatchPlayers] = useReducer(playersReducer, []);

  // what spot the user is 'sitting' in (note: should always be in some position)
  const userPosition = players.map((player) => player.isUser).indexOf(true);
  const isInCharge = userPosition === 0; // ? somewhat overlaps with network.isCodeOwner

  // amount of players present (note: user should always present, as noted above)
  const playerCount = players.length;
  const computerCount = players.filter((player) => player.isComputer).length;

  function addNewPlayer(name, isComputer, isUserInitiated = true) {
    if (!isMatchInProgress && playerCount < 3) {
      dispatchPlayers({
        type: "add",
        name,
        isComputer,
        isUser: false,
      });
      isUserInitiated &&
        network.sendMessage({ type: "player-add", name, isComputer });
      matchLogs.postUpdate(
        `${isComputer ? "Computer player" : "Player"} ${name} has joined.`
      );
      soundEffects.playSound("hello");
    }
  }

  function addComputerPlayer() {
    if (isMatchInProgress || playerCount >= 3) return;
    if (network.mode !== "local" && playerCount === 2 && computerCount === 1) {
      // keep room for a second real user
      alert(
        `You must be playing locally to have only computer opponents. Leave remote play to add another computer players.`
      );
      return;
    }

    let existingNames = players.map((player) => player.name);
    let name;

    // get a name which isn't already in use
    do {
      name = getRandomName();
    } while (existingNames.includes(name));

    addNewPlayer(name, true);
  }

  function removePlayer(player, isUserInitiated = true) {
    // can't remove yourself or non-existant players
    if (player !== userPosition && players[player]) {
      dispatchPlayers({ type: "remove", player });
      // someone leaving mid-match resets everything
      isMatchInProgress && reset();
      isUserInitiated && network.sendMessage({ type: "player-remove", player });
      matchLogs.postUpdate(
        `${players[player].isComputer ? "Computer player " : "Player "}${
          players[player].name
        } has left.${isMatchInProgress ? " The match cannot continue." : ""}`
      );
      soundEffects.playSound("bye");
    }
  }

  function removeAllPlayers() {
    dispatchPlayers({ type: "override", players: [] }); // effect will auto-add self back as 1st player
  }

  //// Previous Action ////

  // previous player and action
  const previousPlayerAction = usePreviousPlayerAction(playerCount);
  const { previousAction, makePlayerArray, setPreviousPlayerAction } =
    previousPlayerAction;

  //// Network/Remote ////

  function handleAcceptMessageData(newPlayers) {
    dispatchPlayers({
      type: "override",
      players: [
        // old isUser properties were for the sender
        ...newPlayers.map((player) => ({ ...player, isUser: false })),
        { name: userName, isComputer: false, isUser: true },
      ],
    });
    network.sendMessage({
      type: "player-add",
      name: userName,
      isComputer: false,
    });
    matchLogs.postUpdate(`Joined game with existing players.`);
    soundEffects.playSound("hello");
  }

  // someone decided to leave
  function handleLeaveMessageData(player) {
    reset();
    if (player === 0) {
      network.leave(true);
      removeAllPlayers();
    } else {
      removePlayer(player, false);
    }
    network.unlock();
  }

  function onCreateSuccess(code) {
    matchLogs.postUpdate(`Created code ${code} - share it.`);
  }

  function onFailure(e) {
    console.error(e);
    e && e.message && matchLogs.postUpdate(e.message);
  }

  const messageHandler = ({
    type,
    isComputer,
    name,
    player,
    indices,
    index,
    cards,
  }) => {
    switch (type) {
      case "player-add":
        addNewPlayer(name, isComputer, false);
        break;

      case "player-remove":
        if (player === userPosition) {
          leave(false);
        } else {
          removePlayer(player, false);
        }
        break;

      case "setUpCutForDeal":
        setUpCutForDeal(false);
        break;

      case "cutForDeal":
        cutForDealFunction(false);
        break;

      case "setUpCutForDealRetry":
        setUpCutForDealRetry(false);
        break;

      case "startFirstGame":
        startFirstGame(false);
        break;

      case "deal":
        deal(false);
        break;

      case "discardToCrib":
        discard(player, indices, false);
        break;

      case "cutForStarter":
        cutForStarter(false);
        break;

      case "flipStarter":
        flipStarter(false);
        break;

      case "play":
        play(index, false);
        break;

      case "go":
        go(false);
        break;

      case "flipPlayedCards":
        flipPlayedCards(false);
        break;

      case "returnCardsToHands":
        returnCardsToHands(false);
        break;

      case "scoreHand":
        scoreHand(false);
        break;

      case "scoreCrib":
        scoreCrib(false);
        break;

      case "startNewRound":
        startNewRound(false);
        break;

      case "startNewGame":
        startNewGame(false);
        break;

      case "deck":
        deck.reset(cards);
        break;

      default:
        break;
    }
  };

  // handle network connection, for remote play (can still play locally if there's no connection)
  const network = useNetwork({
    capacity: 3,
    computerCount,
    messageHandler,
    onCreateSuccess,
    acceptMessageData: players,
    handleAcceptMessageData,
    leaveMessageData: userPosition,
    handleLeaveMessageData,
    onFailure,
  });

  function create() {
    if (computerCount === 2) {
      alert(
        `You must have space for other players to join in order to play remotely. Remove a computer player then try again.`
      );
      return;
    }
    if (
      window.confirm(
        `All existing game state and match history will be lost when you try to create a code.
        \nNote: You also won't be able to change your name while playing remotely. Change your name before creating if necessary, by hitting cancel.`
      )
    ) {
      reset();
      matchLogs.postUpdate(`Game state and match history reset.`);
      network.create();
    }
  }

  function join(code) {
    if (
      window.confirm(
        `Your existing game state and match history will be lost when you try to join this code, and existing computer players will be removed if you successfully join the code.
        \nNote: You also won't be able to change your name while playing remotely. Change your name before joining if necessary, by hitting cancel.`
      )
    ) {
      reset();
      matchLogs.postUpdate(`Game state and match history reset.`);
      network.join(code);
    }
  }

  function leave(isUserInitiated = true) {
    network.leave(!isUserInitiated);
    reset();
    removeAllPlayers();
    matchLogs.postUpdate(
      isUserInitiated
        ? `You left the remote match. Game state and match history reset.`
        : `You were removed from the remote match. Game state and match history reset.`
    );
  }

  //// Cards and Play ////

  // are the players locked in, or can new ones join
  const isMatchInProgress = ![null, Action.RESET_ALL].includes(previousAction); // ? somewhat overlaps with network.isLocked

  // the deck (used pre-game, to cut for deal); pass in card stack on reset
  const deck = useDeck(null, USE_RIGGED_DECK);

  // a single iteration of the game, which can be restarted
  const game = useGame(
    deck,
    playerCount,
    userPosition,
    previousPlayerAction,
    MAKE_ALL_FACE_UP
  );

  // to decide who goes first in the first game
  const cutForDeal = useCutForDeal(deck, playerCount, previousPlayerAction);

  // track game points across multiple games
  const gamePoints = useGamePoints(
    playerCount,
    game.winner,
    game.nonSkunkCount,
    game.skunkCount,
    game.doubleSkunkCount,
    game.tripleSkunkCount
  );

  // which cards from user's hand (plus deck top card) are selected
  const [selected, dispatchSelected] = useReducer(
    selectedReducer,
    HAND_ALL_UNSELECTED
  );
  const selectedCount = selected.filter((bool) => bool).length;
  const selectedIndices = selected
    .map((bool, index) => (bool ? index : null))
    .filter((index) => index !== null);

  //// User Experience ////

  // sound effects (can be muted)
  const soundEffects = useSoundEffects(
    previousAction,
    previousPlayerAction.previousPlayer,
    userPosition,
    game.stackTotal,
    game.scoreDelta,
    game.scoreScorer,
    game.winner
  );

  //// Next Action ////

  // to prevent computers moving forward before user processes something
  const [permissionGiven, setPermissionGiven] = useState(false);
  function givePermission() {
    setPermissionGiven(true);
  }
  function resetPermission() {
    setPermissionGiven(false);
  }

  const [nextPlayers, nextAction] = (() => {
    if (!isMatchInProgress) {
      // haven't started anything yet
      return [makePlayerArray(0), Action.SET_UP_CUT_FOR_DEAL];
    } else if (game.dealer === null) {
      // need to cut for deal
      return [cutForDeal.nextPlayers, cutForDeal.nextAction];
    } else if (gamePoints.hasMatchWinner) {
      // somebody won the match it's over
      return [makePlayerArray(0), Action.RESET_ALL];
    } else if (game.nextAction !== null) {
      // the game is ongoing
      return [game.nextPlayers, game.nextAction];
    } else {
      // the game is over (and nobody has won the match)
      return [makePlayerArray(game.winner + 1), Action.START_NEW_GAME];
    }
  })();

  // if there's a unique next player, get them from here
  const nextPlayer = nextPlayers ? nextPlayers.indexOf(true) : null;

  function doesActionRequirePermission(action) {
    switch (action) {
      case Action.START_NEW_GAME:
      case Action.START_NEW_ROUND:
        return true;

      default:
        return false;
    }
  }

  const permissionIsRequired =
    doesActionRequirePermission(nextAction) &&
    players[nextPlayer].isComputer &&
    (network.mode === "local" ||
      (network.mode === "remote" && network.isCodeOwner));

  //// Actions ////

  // lock in players to start (note: make sure to cut for deal before starting the first game)
  function setUpCutForDeal(isUserInitiated = true) {
    if (network.mode === "remote" && computerCount === playerCount - 1) {
      // have to leave remote play if they want to start
      if (
        window.confirm(
          "You are starting a remote game with only yourself and computer players, and will therefore automatically be switched back to local play now."
        )
      ) {
        // they agree; leave remote play (exception for debug mode)
        if (!CONTROL_ALL_PLAYERS) network.leave();
      } else {
        // they cancelled the start
        return;
      }
    }

    // start the game (possibly after leaving remote play)
    network.lock();
    cutForDeal.reset();
    isUserInitiated && network.sendMessage({ type: "setUpCutForDeal" });
    isUserInitiated && deck.reset();
    setPreviousPlayerAction(nextPlayer, Action.SET_UP_CUT_FOR_DEAL);
  }

  function cutForDealFunction(isUserInitiated = true) {
    cutForDeal.cut();
    isUserInitiated && network.sendMessage({ type: "cutForDeal" });
  }

  function setUpCutForDealRetry(isUserInitiated = true) {
    cutForDeal.reset();
    isUserInitiated && network.sendMessage({ type: "setUpCutForDealRetry" });
    isUserInitiated && deck.reset();
    setPreviousPlayerAction(nextPlayer, Action.SET_UP_CUT_FOR_DEAL_RETRY);
  }

  function startFirstGame(isUserInitiated = true) {
    game.reset(cutForDeal.firstDealer);
    isUserInitiated && network.sendMessage({ type: "startFirstGame" });
    cutForDeal.reset();
    isUserInitiated && deck.reset();
    setPreviousPlayerAction(nextPlayer, Action.START_FIRST_GAME);
  }

  function deal(isUserInitiated = true) {
    game.deal();
    isUserInitiated && network.sendMessage({ type: "deal" });
  }

  function discard(player, indices, isUserInitiated = true) {
    game.discardToCrib(player, indices);
    isUserInitiated &&
      network.sendMessage({ type: "discardToCrib", player, indices });
  }

  function cutForStarter(isUserInitiated = true) {
    game.cut();
    isUserInitiated && network.sendMessage({ type: "cutForStarter" });
  }

  function flipStarter(isUserInitiated = true) {
    game.flip();
    isUserInitiated && network.sendMessage({ type: "flipStarter" });
  }

  function play(index, isUserInitiated = true) {
    game.play(index);
    isUserInitiated && network.sendMessage({ type: "play", index });
  }

  function go(isUserInitiated = true) {
    game.go();
    isUserInitiated && network.sendMessage({ type: "go" });
  }

  function flipPlayedCards(isUserInitiated = true) {
    game.endPlay();
    isUserInitiated && network.sendMessage({ type: "flipPlayedCards" });
  }

  function returnCardsToHands(isUserInitiated = true) {
    game.returnToHand();
    isUserInitiated && network.sendMessage({ type: "returnCardsToHands" });
  }

  function scoreHand(isUserInitiated = true) {
    game.scoreHand();
    isUserInitiated && network.sendMessage({ type: "scoreHand" });
  }

  function scoreCrib(isUserInitiated = true) {
    game.scoreCrib();
    isUserInitiated && network.sendMessage({ type: "scoreCrib" });
  }

  function startNewRound(isUserInitiated = true) {
    game.startNextRound();
    isUserInitiated && network.sendMessage({ type: "startNewRound" });
    isUserInitiated && deck.reset();
    resetPermission();
  }

  function startNewGame(isUserInitiated = true) {
    const nextDealer = (game.winner + 1) % playerCount;
    game.reset(nextDealer);
    isUserInitiated && network.sendMessage({ type: "startNewGame" });
    setPreviousPlayerAction(nextPlayer, Action.START_NEW_GAME);
    resetPermission();
  }

  // reset everything
  function reset() {
    game.reset();
    gamePoints.reset();
    deck.reset();
    cutForDeal.reset();
    setPreviousPlayerAction(0, Action.RESET_ALL);
    resetPermission();
  }

  const allActions = {
    setUpCutForDeal,
    cutForDealFunction,
    setUpCutForDealRetry,
    startFirstGame,
    deal,
    discard,
    cutForStarter,
    flipStarter,
    play,
    go,
    flipPlayedCards,
    returnCardsToHands,
    scoreHand,
    scoreCrib,
    startNewRound,
    startNewGame,
    reset,
  };

  //// Next Action UI parameters ////

  // defaults, to override when necessary in the switch statement below
  let labels = [nextAction.label];
  let actions = [];
  let enabled = [true];
  let clickDeckHandler = null;
  let clickCardHandler = null;

  switch (nextAction) {
    case Action.SET_UP_CUT_FOR_DEAL:
      actions = [() => setUpCutForDeal()];
      enabled = [isInCharge && [2, 3].includes(playerCount)];
      break;

    case Action.CUT_FOR_DEAL:
      actions = [cutForDealFunction];
      clickDeckHandler = actions[0];
      break;

    case Action.SET_UP_CUT_FOR_DEAL_RETRY:
      actions = [() => setUpCutForDealRetry()];
      clickDeckHandler = actions[0];
      break;

    case Action.START_FIRST_GAME:
      actions = [() => startFirstGame()];
      clickDeckHandler = actions[0];
      break;

    case Action.START_DEALING:
      actions = [() => deal()];
      clickDeckHandler = actions[0];
      break;

    case Action.CONTINUE_DEALING:
      labels = [];
      actions = [];
      enabled = [];
      break;

    case Action.DISCARD:
      actions = [
        () => {
          discard(
            CONTROL_ALL_PLAYERS ? nextPlayer : userPosition,
            selectedIndices
          );
          dispatchSelected({ type: "reset" });
        },
      ];
      enabled = [selectedCount === 4 - playerCount];
      clickCardHandler = (index) => {
        dispatchSelected({ type: "click", index });
      };
      break;

    case Action.CUT_FOR_STARTER:
      actions = [cutForStarter];
      clickDeckHandler = actions[0];
      break;

    case Action.FLIP_STARTER:
      actions = [flipStarter];
      clickDeckHandler = actions[0];
      break;

    case Action.PLAY_OR_GO: // todo SCORING: add option for claiming various types of points (?)
      labels = ["Play", "Go"];
      actions = [
        () => {
          play(selectedIndices[0]);
          dispatchSelected({ type: "reset" });
        },
        () => {
          go();
          dispatchSelected({ type: "reset" });
        },
      ];
      enabled = [
        selectedCount === 1 && game.isValidPlay(selectedIndices[0]),
        game.isValidGo(),
      ];
      clickCardHandler = (index) => {
        dispatchSelected({ type: "replace", index });
      };
      break;

    case Action.FLIP_PLAYED_CARDS:
      actions = [flipPlayedCards];
      break;

    case Action.RETURN_CARDS_TO_HANDS:
      actions = [returnCardsToHands];
      break;

    case Action.SCORE_HAND: // todo SCORING: add options to claim points (?)
      actions = [scoreHand];
      break;

    case Action.SCORE_CRIB:
      actions = [scoreCrib];
      break;

    case Action.START_NEW_ROUND:
      actions = [() => startNewRound()];
      clickDeckHandler = actions[0];
      break;

    case Action.START_NEW_GAME:
      actions = [() => startNewGame()];
      clickDeckHandler = actions[0];
      break;

    case Action.RESET_ALL:
      actions = [reset];
      clickDeckHandler = actions[0];
      break;

    default:
      console.error("App couldn't recognize next action", nextAction);
      break;
  }

  if (permissionIsRequired && !permissionGiven) {
    labels = [Action.CONTINUE.label];
    actions = [givePermission];
    enabled = [true];
  }

  //// Computer Player ////

  // todo: refactor hook to handle arbitrary number of computer players in 1 instantiation?
  useComputerPlayer(
    playerCount,
    1,
    players[1] &&
      players[1].isComputer &&
      (network.mode === "local" ||
        (network.mode === "remote" && network.isCodeOwner)),
    nextPlayers[1] &&
      nextAction !== Action.CONTINUE_DEALING &&
      (permissionGiven || !permissionIsRequired),
    allActions,
    nextAction,
    game.hands[1],
    game.sharedStack,
    game.stackTotal,
    game.dealer === 1
  );
  useComputerPlayer(
    playerCount,
    2,
    players[2] &&
      players[2].isComputer &&
      (network.mode === "local" ||
        (network.mode === "remote" && network.isCodeOwner)),
    nextPlayers[2] &&
      nextAction !== Action.CONTINUE_DEALING &&
      (permissionGiven || !permissionIsRequired),
    allActions,
    nextAction,
    game.hands[2],
    game.sharedStack,
    game.stackTotal,
    game.dealer === 2
  );

  //// Game History ////

  const matchLogs = useMatchLogs(
    players,
    userPosition,
    game.dealer,
    previousPlayerAction.previousPlayer,
    previousPlayerAction.previousAction,
    cutForDeal.cuts,
    game.starter,
    game.piles,
    game.stackTotal,
    game.scoreDelta,
    game.scoreScorer,
    game.winner !== -1,
    game.winner,
    gamePoints.hasMatchWinner,
    gamePoints.matchWinner,
    game.skunkCount,
    game.doubleSkunkCount,
    game.tripleSkunkCount
  );

  //// Effects ////

  // ? missing dependency issues with network and matchLogs

  // add player when nobody is there
  useEffect(() => {
    if (playerCount === 0) {
      dispatchPlayers({
        type: "add",
        name: userName,
        isComputer: false,
        isUser: true,
      });
    }
  }, [playerCount, userName]);

  // welcome message
  useEffect(() => {
    matchLogs.postUpdate("Welcome to Cribbage.");
  }, []);

  // update player name in player list when it changes
  useEffect(() => {
    if (userPosition !== -1) {
      dispatchPlayers({
        type: "update",
        player: userPosition,
        name: userName,
        isComputer: false,
        isUser: true,
      });
    }
  }, [userName, userPosition]);

  // the dealer is in charge, or default to the owner if dealer not currently assigned
  // but also, need to step in for computer dealers
  const isResponsibleForDeck =
    (game.dealer === null && network.isCodeOwner) ||
    game.dealer === userPosition ||
    (network.isCodeOwner &&
      game.dealer !== null &&
      players[game.dealer].isComputer);

  // when the deck is reset, send it to other players, if you're responsible for it
  useEffect(() => {
    if (deck.size === 52 && isResponsibleForDeck) {
      network.sendMessage({ type: "deck", cards: deck.cards });
    }
  }, [isResponsibleForDeck, network.sendMessage, deck.size, deck.cards]);

  //// help modal ////

  const [skipHelpOnLoad, setSkipHelpOnLoad] = useLocalStorage(
    "skip-help",
    false
  );
  const [showHelp, setShowHelp] = useState(!skipHelpOnLoad);

  //// Return ////

  return (
    <WithHeavyFooter>
      <Body>
        <Help
          visible={showHelp}
          doNotShowAgain={() => {
            setSkipHelpOnLoad(true);
            setShowHelp(false);
          }}
          doShowAgain={() => {
            setSkipHelpOnLoad(false);
            setShowHelp(false);
          }}
          justClose={() => setShowHelp(false)}
        />
        <ScoreBoard
          pathColours={BOARD_COLOURS}
          pegColours={PEG_COLOURS}
          gamePoints={gamePoints.points}
          currentScores={game.currentScores}
          priorScores={game.previousScores}
          hasWinner={game.hasWinner}
          winner={game.winner}
          skunkLine={game.skunkLine}
          doubleSkunkLine={game.doubleSkunkLine}
          tripleSkunkLine={game.tripleSkunkLine}
        />
        <Header
          hideEmptyColumns={HIDE_EMPTY_COLUMNS}
          userName={userName}
          updateUserName={trySetUserName}
          dealerPosition={game.dealer}
          mode={network.mode}
          isSoundOn={soundEffects.isOn}
          toggleSound={soundEffects.toggle}
          code={network.code}
          create={create}
          join={join}
          leave={leave}
          canAddPlayer={
            isInCharge &&
            network.mode !== "loading" &&
            nextAction === Action.SET_UP_CUT_FOR_DEAL &&
            playerCount < 3
          }
          addComputerPlayer={() => addComputerPlayer(true)}
          players={players}
          nextPlayers={nextPlayers}
          scores={
            nextAction === Action.SET_UP_CUT_FOR_DEAL
              ? [null, null, null]
              : game.currentScores
          }
          gamePoints={
            nextAction === Action.SET_UP_CUT_FOR_DEAL
              ? [null, null, null]
              : gamePoints.points
          }
          pointsToWin={gamePoints.pointsToWin}
          removeable={
            isInCharge &&
            nextAction === Action.SET_UP_CUT_FOR_DEAL && [false, true, true]
          }
          removePlayer={removePlayer}
          showHelp={() => setShowHelp(true)}
        />
        <Hands
          hideEmptyColumns={HIDE_EMPTY_COLUMNS}
          crib={game.crib}
          hands={game.hands}
          activePosition={CONTROL_ALL_PLAYERS ? nextPlayer : userPosition}
          selectedCards={selected}
          clickCardHandler={
            (CONTROL_ALL_PLAYERS || nextPlayers[userPosition]) &&
            clickCardHandler
          }
          maxSize={game.crib.length === 4 ? 4 : 8 - playerCount}
        />
        <PlayArea
          hideEmptyColumns={HIDE_EMPTY_COLUMNS}
          deckSize={deck.unCutCount}
          isDeckCutInPlace={nextAction === Action.FLIP_STARTER}
          deckBottomSize={nextAction === Action.FLIP_STARTER && deck.unCutCount}
          deckTopSize={nextAction === Action.FLIP_STARTER && deck.cutCounts[0]}
          starter={game.starter}
          isStarterSelected={selected[6]}
          clickDeckHandler={nextPlayers[userPosition] && clickDeckHandler}
          piles={game.piles}
          cutSizes={deck.cutCounts}
          cutCards={cutForDeal.cuts}
        />
        <Actions
          waiting={
            !nextPlayers[userPosition] &&
            (!permissionIsRequired || permissionGiven)
          }
          nextToAct={
            nextPlayers.reduce((count, curr) => count + (curr ? 1 : 0), 0) === 1
              ? nextPlayer === userPosition
                ? "you"
                : players[nextPlayer].name
              : "everyone else"
          }
          nextAction={
            nextPlayers[userPosition]
              ? nextAction.futureDescriptionOfSelf
              : nextAction.futureDescriptionOfOther
          }
          labels={labels}
          actions={actions}
          enabled={enabled}
          controlAllPlayers={CONTROL_ALL_PLAYERS}
        />
        <MatchLogs messages={matchLogs.messages} />
      </Body>

      <HeavyFooter>
        <HomeLink />
        <CodeLink gitHubRepoName="cribbage" />
      </HeavyFooter>
    </WithHeavyFooter>
  );
}
