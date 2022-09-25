import { useCallback, useEffect } from "react";

import { useLocalStorage } from "./useLocalStorage";

import Action from "./Action";

import zero from "./../spoken-numbers/0.wav";
import one from "./../spoken-numbers/1.wav";
import two from "./../spoken-numbers/2.wav";
import three from "./../spoken-numbers/3.wav";
import four from "./../spoken-numbers/4.wav";
import five from "./../spoken-numbers/5.wav";
import six from "./../spoken-numbers/6.wav";
import seven from "./../spoken-numbers/7.wav";
import eight from "./../spoken-numbers/8.wav";
import nine from "./../spoken-numbers/9.wav";
import ten from "./../spoken-numbers/10.wav";
import elevn from "./../spoken-numbers/11.wav";
import twelve from "./../spoken-numbers/12.wav";
import thirteen from "./../spoken-numbers/13.wav";
import fourteen from "./../spoken-numbers/14.wav";
import fifteen from "./../spoken-numbers/15.wav";
import sixteen from "./../spoken-numbers/16.wav";
import seventeen from "./../spoken-numbers/17.wav";
import eighteen from "./../spoken-numbers/18.wav";
import nineteen from "./../spoken-numbers/19.wav";
import twenty from "./../spoken-numbers/20.wav";
import twentyOne from "./../spoken-numbers/21.wav";
import twentyTwo from "./../spoken-numbers/22.wav";
import twentyThree from "./../spoken-numbers/23.wav";
import twentyFour from "./../spoken-numbers/24.wav";
import twentyFive from "./../spoken-numbers/25.wav";
import twentySix from "./../spoken-numbers/26.wav";
import twentySeven from "./../spoken-numbers/27.wav";
import twentyEight from "./../spoken-numbers/28.wav";
import twentyNine from "./../spoken-numbers/29.wav";
import thirty from "./../spoken-numbers/30.wav";
import thirtyOne from "./../spoken-numbers/31.wav";

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

function intToSoundFile(int) {
  return INT_SOUND_FILES[int];
}

//// hook ////

export function useSoundEffects(
  previousAction,
  previousPlayer,
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
      total && sounds.push(intToSoundFile(total));
      sayFor && sounds.push(intToSoundFile(4)); // hack: use "4" for "for"
      score !== false && sounds.push(intToSoundFile(score));

      playSounds(sounds);
    },
    [playSounds]
  );

  //// effects ////

  // !!! only say for non-user players
  // note: when turning sound on, this will run, making sound for the previous action
  useEffect(() => {
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
        delta > 0 && sayTotalForScore(false, true, 1);
        break;

      case Action.SCORE_HAND:
      case Action.SCORE_CRIB:
        // say 0s
        sayTotalForScore(false, false, delta);
        break;

      default:
        break;
    }
    // consecutive identical scores in hands only have previousPlayer change
  }, [previousAction, previousPlayer, stackTotal, delta, sayTotalForScore]);

  // !! sound for "go"
  // ! other sound effects? - starting, joining, winning, etc.

  return { isOn, toggle };
}
