import { useState, useEffect, useMemo, useCallback } from "react";

import { useLocalStorage } from "./useLocalStorage.js";

import PubNub from "pubnub";
// pubnubKeys.js is listed in .gitignore, contains private keys
import { subscribeKey, publishKey } from "../pubnubKeys.js";

//// Constants ////

const VALID_UUID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const UUID_LENGTH = 64;
const VALID_CODE_CHARS = "2346789QWERTYUPASDFGHJKLZXCVBNM";
const CODE_LENGTH = 4;

//// Helpers ////

// should make sure it is unique, but just assume it is
function createUuid() {
  let uuid = "";
  for (let i = 0; i < UUID_LENGTH; i++) {
    uuid +=
      VALID_UUID_CHARS[Math.floor(Math.random() * VALID_UUID_CHARS.length)];
  }
  return uuid;
}

function getRandomCode() {
  let newCode = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    newCode +=
      VALID_CODE_CHARS[Math.floor(Math.random() * VALID_CODE_CHARS.length)];
  }
  return newCode;
}

function isValidCode(code) {
  return (
    code.length === CODE_LENGTH &&
    [...code].every((char) => VALID_CODE_CHARS.includes(char))
  );
}

export function useNetwork({
  capacity = 2,
  computerCount = 0,
  messageHandler,
  onCreateSuccess = () => {},
  acceptMessageData,
  handleAcceptMessageData = () => {},
  leaveMessageData,
  handleLeaveMessageData = () => {},
  onFailure = (e) => console.error(e),
}) {
  //// States & Constants ////

  // universally unique ID (don't need setter -- won't ever change)
  const [uuid] = useLocalStorage("uuid", createUuid());
  // code currently in use (can only use one at a time)
  const [code, setCode] = useState(null);

  // waiting for response from pubnub?
  const [isConnecting, setIsConnecting] = useState(false);
  // waiting for accept/reject response from code owner?
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] =
    useState(false);
  const mode =
    isConnecting || isWaitingForConfirmation
      ? "connecting"
      : code
      ? "remote"
      : "local";

  // did the user create the room, and should therefore be able to lock/unlock
  const [isCodeOwner, setIsCodeOwner] = useState(null);
  // may new users join the room
  const [isLocked, setIsLocked] = useState(null);

  // store unhandled incoming message
  // ? if 2 messages come in at once, one will be lost - very unlikely though
  const [message, setMessage] = useState(null);

  //// PubNub ////

  // useMemo to avoid recalculating every rerender due to uuid dependency
  // (uuid never changes once set)
  const pubnub = useMemo(
    () => new PubNub({ publishKey, subscribeKey, uuid }),
    [uuid]
  );

  //// Helpers ////

  // check how many people are using a code
  async function checkPresence(code) {
    try {
      const channel = await pubnub.hereNow({ channels: [code] });
      return channel.totalOccupancy;
    } catch (e) {
      throw Error(
        `Could not successfully check code '${code}'. You may not be connected to the internet.`
      );
    }
  }

  async function canNewUserStay() {
    try {
      const presence = await checkPresence(code);
      // new user doesn't seem to contribute to presence yet
      if (isLocked) {
        return {
          message: `Could not join code '${code}': A match is already in progress.`,
        };
      } else if (presence + computerCount >= capacity) {
        return {
          message: `Could not join code '${code}': The code has already reached player capacity.`,
        };
      } else {
        return true;
      }
    } catch (error) {
      throw error;
    }
  }

  // need to store messages and then immediately process them via an effect below
  // to ensure the whole message handler function is applied without any rerenders
  // in the middle, which will happen if used directly in the listener
  function messageReceiver({ message }) {
    setMessage(message);
  }

  async function internalMessageHandler(message) {
    // ignore messages from self
    if (message.uuid === uuid) return;

    console.info("Message in:", message.type);

    // first few cases are all internal to useNetwork,
    // default case is from the App
    switch (message.type) {
      case "join":
        try {
          if (isCodeOwner) {
            // accept or reject new user
            const canStay = await canNewUserStay();
            canStay === true
              ? sendMessage({ type: "accept", acceptMessageData })
              : sendMessage({ type: "reject", e: canStay });
          }
        } catch (error) {
          throw error;
        }
        break;

      case "accept":
        if (isWaitingForConfirmation) {
          setIsWaitingForConfirmation(false);
          handleAcceptMessageData(message.acceptMessageData);
        }
        break;

      case "reject":
        if (isWaitingForConfirmation) {
          setIsWaitingForConfirmation(false);
          onFailure(message.e);
          leave();
        }
        break;

      case "leave":
        handleLeaveMessageData(message.leaveMessageData);
        break;

      default:
        messageHandler(message);
        break;
    }
  }

  // randomly generate codes until an unused one is found
  async function getUnusedCode() {
    try {
      let newCode;
      let presence;
      do {
        newCode = getRandomCode();
        presence = await checkPresence(newCode);
      } while (presence > 0);
      return newCode;
    } catch (e) {
      throw Error(
        "Error generating unused remote code. Are you connected to the internet?"
      );
    }
  }

  // subscribe to incoming messages
  function subscribeTo(code) {
    console.info(`Subscribing to ${code}`);
    pubnub.subscribe({ channels: [code], withPresence: true });
  }

  function unsubscribeFrom(code) {
    console.info(`Unsubscribing from ${code}`);
    pubnub.unsubscribe({ channels: [code] });
  }

  //// Return functions ////

  // generate an unused code and setup incoming/outoing messages
  async function create() {
    try {
      setIsConnecting(true);
      const newCode = await getUnusedCode();
      subscribeTo(newCode);
      setCode(newCode);
      setIsCodeOwner(true);
      onCreateSuccess(newCode);
    } catch (e) {
      onFailure(e);
    } finally {
      setIsConnecting(false);
    }
  }

  // if allowed, setup incoming/outgoing messages
  async function join(codeInput) {
    try {
      setIsConnecting(true);
      const newCode = codeInput.toUpperCase();
      if (!isValidCode(newCode)) {
        onFailure({
          message: `Failed to join code '${newCode}': Invalid code.`,
        });
        return;
      }
      const presenceCount = await checkPresence(newCode);
      if (presenceCount === 0) {
        onFailure({
          message: `Failed to join code '${newCode}': Nobody is currently using it.`,
        });
        return;
      }
      subscribeTo(newCode);
      setIsWaitingForConfirmation(true);
      setIsCodeOwner(false);
      setCode(newCode);
    } catch (e) {
      onFailure(e);
    } finally {
      setIsConnecting(false);
    }
  }

  // clean exit from room, closing incoming/outgoing messages; notify others
  function leave(silently = false) {
    try {
      if (mode === "remote" && !silently) {
        sendMessage({ type: "leave", leaveMessageData });
      }
      unsubscribeFrom(code);
    } catch (e) {
      console.error(e);
    } finally {
      setCode(null);
      setIsCodeOwner(null);
      setIsLocked(null);
    }
  }

  function lock() {
    if (isCodeOwner) setIsLocked(true);
  }

  function unlock() {
    if (isCodeOwner) setIsLocked(false);
  }

  // send the message
  const sendMessage = useCallback(
    (message) => {
      if (code === null) {
        return;
      }
      try {
        pubnub.publish({ message: { ...message, uuid }, channel: code });
        console.info("Message out:", message.type);
      } catch (e) {
        // ? missing dependency issue
        onFailure({
          message: `Failed to notify opponent of latest changes - are you still connected to the internet? The match may be out of sync, unfortunately, and cannot continue.`,
        });
      }
    },
    [pubnub, code, uuid]
  );

  //// Effects ////

  // listen for incoming messages
  useEffect(() => {
    const listener = { message: messageReceiver };
    pubnub.addListener(listener);

    return function cleanupListener() {
      pubnub.removeListener(listener);
    };
  });

  // when waiting for confirmation, ask for it
  useEffect(() => {
    if (isWaitingForConfirmation) {
      sendMessage({ type: "join" });
    }
  }, [isWaitingForConfirmation, sendMessage]);

  // handle incoming message - see note above [messageReceiver]
  // eslint-disable-next-line
  useEffect(() => {
    if (message) {
      setMessage(null);
      internalMessageHandler(message);
    }
  });

  //// Return ////

  return {
    mode,
    code,
    isCodeOwner,
    create,
    join,
    leave,
    lock,
    unlock,
    sendMessage,
  };
}
