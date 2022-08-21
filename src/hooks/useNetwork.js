import { useState, useEffect, useMemo } from "react";

import { useLocalStorage } from "./useLocalStorage.js";

import PubNub from "pubnub";
// pubnubKeys.js is listed in .gitignore, contains private keys
import { subscribeKey, publishKey } from "../pubnubKeys.js";

//// Constants ////

const VALID_UUID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const UUID_LENGTH = 64;
const VALID_CODE_CHARS = "2346789QWERTYUPASDFGHJKLZXCVBNM";
const CODE_LENGTH = 4;

const PRESENCE_CHECK_FAIL_MESSAGE =
  "Could not successfully check that code.\nYou may not be connected to the internet.";

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

export function useNetwork({ capacityPerCode = 2, playerCount }) {
  //// States & Constants ////

  // universally unique ID (don't need setter -- won't ever change)
  const [uuid] = useLocalStorage("uuid", createUuid());
  // code currently in use (can only use one at a time)
  const [code, setCode] = useState(null);
  const mode = code ? "remote" : "local";
  // function to handle incoming messages
  const [messageHandler, setMessageHandler] = useState(null);

  //// PubNub ////

  // useMemo to avoid recalculating every rerender due to uuid dependency
  // (uuid never changes once set)
  const pubnub = useMemo(
    () => new PubNub({ publishKey, subscribeKey, uuid }),
    [uuid]
  );

  //// Effects ////

  // listen for incoming messages
  useEffect(() => {
    if (messageHandler) {
      const listener = { message: messageHandler };
      pubnub.addListener(listener);

      return function cleanupListener() {
        pubnub.removeListener(listener);
      };
    }
  }, [messageHandler, pubnub]);

  //// Helpers ////

  // check how many people are using a code
  async function checkPresence(code) {
    try {
      const channel = await pubnub.hereNow({ channels: [code] });
      return channel.totalOccupancy;
    } catch (error) {
      alert(PRESENCE_CHECK_FAIL_MESSAGE);
      console.error("Couldn't get room occupancy.", error);
      throw error;
    }
  }

  // randomly generate codes until an unused one is found
  function getUnusedCode() {
    try {
      let newCode;
      do {
        newCode = getRandomCode();
      } while (checkPresence(newCode) > 0);
      return newCode;
    } catch (e) {
      console.error(e);
      throw Error("Error generating unused remote code.");
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
  function create() {
    try {
      const newCode = getUnusedCode();
      subscribeTo(newCode);
      setCode(newCode);
      alert(
        `Success: Playing remotely with remote code ${newCode} - share it.`
      );
    } catch (e) {
      console.error(e);
      alert(`Failed to play remotely: ${e.message}`);
    }
  }

  // if allowed, setup incoming/outgoing messages
  function join(codeInput) {
    const newCode = codeInput.toUpperCase();
    if (!isValidCode(newCode)) {
      alert(`Failed to play remotely: Invalid remote code.`);
      return;
    }
    try {
      const presenceCount = checkPresence(newCode);
      if (presenceCount === 0) {
        alert(
          `Failed to play remotely: There's nobody using that remote code.`
        );
        return;
      } else if (presenceCount === 3) {
        alert(`Failed to play remotely: That remote code is full.`);
        return;
      }
      // !! NETWORK: joining - what if 2 players already started a game?
      subscribeTo(newCode);
      setCode(newCode);
      alert(`Success: Playing remotely.`);
      // !! NETWORK: send player info (or is that elsewhere?)
    } catch (e) {
      console.error(e);
      alert(`Failed to play remotely: ${e.message} `);
    }
  }

  // clean exit from room, closing incoming/outgoing messages; notify others
  function leave() {
    try {
      unsubscribeFrom(code);
      // !! NETWORK: send leaving message (or is that elsewhere?)
    } catch (e) {
      console.error(e);
    } finally {
      setCode(null);
    }
  }

  // send the message
  function sendMessage(message) {
    if (code === null) {
      // throw Error("Can't send message because not playing remotely.");
      console.debug("Would have sent message", message); // ~
      return;
    }
    try {
      pubnub.publish({ message: { ...message, uuid }, channel: code });
      console.debug("Sent message", message); // ~
    } catch (e) {
      console.log(e);
      alert(
        `Failed to notify opponent of latest changes - are you still connected to the internet?\nThe game may be out of sync, unfortunately.`
      );
    }
  }

  //// Return ////

  return {
    mode,
    code,
    create,
    join,
    leave,
    sendMessage,
    setMessageHandler, // ? maybe pass in via object which never changes?
  };
}
