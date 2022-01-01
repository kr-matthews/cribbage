import { useState, useEffect } from "react";

import { useLocalStorage } from "./useLocalStorage.js";

// pubnubKeys.js is listed in .gitignore, contains private keys
// import { subscribeKey, publishKey } from "../pubnubKeys.js";

//// Helpers

// should make sure it is unique, but just assume it is
function createUuid() {
  // TODO: define getUuid
  return "1234567890";
}

export function useNetwork({ capacityPerCode = 2 }) {
  //// States & Constants

  // universally unique ID
  const [uuid, setUuid] = useLocalStorage("uuid", createUuid());
  // code currently in use (can only use one at a time)
  const [code, setCode] = useState(null);
  // function to handle incoming messages
  const [messageHandler, setMessageHandler] = useState(null);

  //// Effects

  useEffect(() => {
    if (messageHandler) {
      // TODO: NETWORK: setup subscription
    }
  });

  //// Helpers

  // ...

  //// Return functions

  // generate an unused code and setup incoming/outoing messages
  function create() {
    // TODO: NETWORK: define create
    // will throw errors if can't create (network error, no unused codes, etc?)
    setCode("XXXX");
  }

  // if allowed, setup incoming/outgoing messages
  function join(codeInput) {
    // TODO: NETWORK: define join
    // will throw errors if can't join (network error, room empty, room full, etc?)
    setCode(codeInput);
  }

  // clean exit from room, closing incoming/outgoing messages; notify others
  function leave() {
    // TODO: NETWORK: define leave
    // shouldn't throw any errors
    setCode(null);
  }

  // send the message to the
  function sendMessage(message) {
    // TODO: NETWORK: define sendMessage
  }

  //// Return

  return {
    code,
    create,
    join,
    leave,
    sendMessage,
    setMessageHandler,
  };
}
