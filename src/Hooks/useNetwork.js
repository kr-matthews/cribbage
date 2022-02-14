import { useState, useEffect, useMemo } from "react";

import { useLocalStorage } from "./useLocalStorage.js";

import PubNub from "pubnub";
// pubnubKeys.js is listed in .gitignore, contains private keys
import { subscribeKey, publishKey } from "../pubnubKeys.js";

//// Helpers

// should make sure it is unique, but just assume it is
function createUuid() {
  const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const charCount = possibleChars.length;
  let uuid = "";
  for (let i = 0; i < 64; i++) {
    uuid += possibleChars[Math.floor(Math.random() * charCount)];
  }
  return uuid;
}

export function useNetwork({ capacityPerCode = 2, playerCount }) {
  //// States & Constants

  // universally unique ID (don't need setter -- won't ever change)
  const [uuid] = useLocalStorage("uuid", createUuid());
  // code currently in use (can only use one at a time)
  const [code, setCode] = useState(null);
  const mode = code ? "local" : "remote";
  // function to handle incoming messages
  const [messageHandler, setMessageHandler] = useState(null);

  //// PubNub

  // useMemo to avoid recalculating every reredner due to uuid dependency
  // (uuid never changes once set)
  const pubnub = useMemo(
    () => new PubNub({ publishKey, subscribeKey, uuid }),
    [uuid]
  );

  //// Effects

  // listen for incoming messages
  useEffect(() => {
    if (messageHandler) {
      console.info("Adding handler for incoming messages");
      const listener = { message: messageHandler };
      pubnub.addListener(listener);

      return function cleanupListener() {
        console.info("Removing handler for incoming messages");
        pubnub.removeListener(listener);
      };
    }
  }, [messageHandler, pubnub]);

  //// Helpers

  // randomly generate codes until an unused one is found
  function getUnusedCode() {
    // TODO: define getUnusedCode
    return "XXXX";
  }

  // subscribe to incoming messages
  function subscribeTo(code) {
    console.info("Subscribing to $code");
    pubnub.subscribe({ channels: [code], withPresence: true });
  }

  function unsubscribeFrom(code) {
    console.info("Unsubscribing from $code");
    pubnub.unsubscribe({ channels: [code] });
  }

  //// Return functions

  // generate an unused code and setup incoming/outoing messages
  function create() {
    try {
      const newCode = getUnusedCode();
      subscribeTo(newCode);
      setCode(newCode);
    } catch (e) {
      // TODO: NETWORK: handle errors in create
      // will throw errors if can't create (network error, no unused codes, etc?)
    }
  }

  // if allowed, setup incoming/outgoing messages
  function join(codeInput) {
    try {
      subscribeTo(codeInput);
      setCode(codeInput);
    } catch (e) {
      // TODO: NETWORK: handle errors in join
      // will throw errors if can't join (network error, room empty, room full, etc?)
    }
    setCode(codeInput);
  }

  // clean exit from room, closing incoming/outgoing messages; notify others
  function leave() {
    try {
      unsubscribeFrom(code);
    } catch (e) {
      // TODO: NETWORK: handle errors in leave
      // leave won't throw any errors
    } finally {
      setCode(null);
    }
  }

  // send the message to the
  function sendMessage(message) {
    if (!code) {
      // TODO: NETWORK: throw error
    }
    try {
      pubnub.publish({ message: { ...message, uuid }, channel: code });
    } catch (e) {
      // TODO: NETWORK: handle errors in sendMessage
    }
  }

  //// Return

  return {
    mode,
    code,
    create,
    join,
    leave,
    sendMessage,
    setMessageHandler, // maybe pass in via object which never changes?
  };
}
