import { useCallback, useEffect } from "react";

import { useLocalStorage } from "./useLocalStorage";

import Action from "./Action";

import go from "./../audio-files/go.wav";
import zero from "./../audio-files/0.wav";
import one from "./../audio-files/1.wav";
import two from "./../audio-files/2.wav";
import three from "./../audio-files/3.wav";
import four from "./../audio-files/4.wav";
import five from "./../audio-files/5.wav";
import six from "./../audio-files/6.wav";
import seven from "./../audio-files/7.wav";
import eight from "./../audio-files/8.wav";
import nine from "./../audio-files/9.wav";
import ten from "./../audio-files/10.wav";
import elevn from "./../audio-files/11.wav";
import twelve from "./../audio-files/12.wav";
import thirteen from "./../audio-files/13.wav";
import fourteen from "./../audio-files/14.wav";
import fifteen from "./../audio-files/15.wav";
import sixteen from "./../audio-files/16.wav";
import seventeen from "./../audio-files/17.wav";
import eighteen from "./../audio-files/18.wav";
import nineteen from "./../audio-files/19.wav";
import twenty from "./../audio-files/20.wav";
import twentyOne from "./../audio-files/21.wav";
import twentyTwo from "./../audio-files/22.wav";
import twentyThree from "./../audio-files/23.wav";
import twentyFour from "./../audio-files/24.wav";
import twentyFive from "./../audio-files/25.wav";
import twentySix from "./../audio-files/26.wav";
import twentySeven from "./../audio-files/27.wav";
import twentyEight from "./../audio-files/28.wav";
import twentyNine from "./../audio-files/29.wav";
import thirty from "./../audio-files/30.wav";
import thirtyOne from "./../audio-files/31.wav";

//// constants and helpers ////

const INT_SOUND_FILES = [
  zero,
  one,
  two,
  three,
  four,
  five,
  six,
  seven,
  eight,
  nine,
  ten,
  elevn,
  twelve,
  thirteen,
  fourteen,
  fifteen,
  sixteen,
  seventeen,
  eighteen,
  nineteen,
  twenty,
  twentyOne,
  twentyTwo,
  twentyThree,
  twentyFour,
  twentyFive,
  twentySix,
  twentySeven,
  twentyEight,
  twentyNine,
  thirty,
  thirtyOne,
];

function toSoundFile(sound) {
  switch (sound) {
    case "go":
      return go;

    default:
      return INT_SOUND_FILES[sound];
  }
}

//// hook ////

export function useSoundEffects(
  previousAction,
  previousPlayer,
  userPosition,
  stackTotal,
  delta
) {
  const [isOn, setIsOn] = useLocalStorage("sound", false);

  function toggle() {
    setIsOn(!isOn);
  }

  const playSounds = useCallback(
    (urls) => {
      if (!isOn || urls.length === 0) return;

      const audio = new Audio(urls[0]);
      urls.shift();
      audio.onended = () => playSounds(urls);
      audio.play();
    },
    [isOn]
  );

  const sayTotalForScore = useCallback(
    (total, sayFor, score) => {
      const sounds = [];

      // note: 0 is falsy!
      total && sounds.push(toSoundFile(total));
      sayFor && sounds.push(toSoundFile(4)); // hack: use "4" for "for"
      score !== false && sounds.push(toSoundFile(score));

      playSounds(sounds);
    },
    [playSounds]
  );

  //// effects ////

  // speaking //
  // note: when turning sound on, this will run, making sound for the previous action
  useEffect(() => {
    // only opponents should speak
    if (previousPlayer === userPosition) return;

    switch (previousAction) {
      case null:
        break;

      case Action.FLIP_STARTER:
        delta > 0 && sayTotalForScore(false, true, 2);
        break;

      case Action.PLAY:
        // don't say 0s
        sayTotalForScore(stackTotal, delta > 0, delta > 0 && delta);
        break;

      case Action.GO:
        sayTotalForScore("go", delta > 0, delta > 0 && 1);
        break;

      case Action.SCORE_HAND:
      case Action.SCORE_CRIB:
        // say 0s
        sayTotalForScore(false, false, delta);
        break;

      default:
        break;
    }
    // note: consecutive identical scores in hands only have previousPlayer change
  }, [
    previousAction,
    previousPlayer,
    userPosition,
    stackTotal,
    delta,
    sayTotalForScore,
  ]);

  // ! other sound effects? - starting, joining, winning, etc.

  return { isOn, toggle };
}
