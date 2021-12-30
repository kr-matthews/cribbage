import { useState, useReducer } from "react";

// pubnubKeys.js is listed in .gitignore, contains private keys
import { subscribeKey, publishKey } from "../pubnubKeys.js";

//// Reducers

function messageQueueReducer(state, action) {
  switch (action.type) {
    case "clear":
      return [];
    case "add":
      return [...state, action.message];
    default:
      console.info(
        "incomingMessageQueueReducer received unrecognized action",
        action.type
      );
      return state;
  }
}

export function useNetwork({ capacityPerCode = 2 }) {
  //// States & Constants

  // code currently in use (can only use one at a time)
  const [code, setCode] = useState(null);

  // queue of incoming messages
  const [incomingMessageQueue, dispatchIncomingMessagesQueue] = useReducer(
    [],
    messageQueueReducer
  );

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
    dispatchIncomingMessagesQueue({ type: "clear" });
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
    incomingMessageQueue, // TODO: NETWORK: This needs to be thought out -- can't remove from queue as is
  };
}
