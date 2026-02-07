// SoundManager.js
import Sound from 'react-native-sound';

const sounds = {};

export const initSound = (key, filename) => {
  if(sounds[key]) return; // already loaded
  const sound = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
    if(error) console.log('Failed to load sound:', key, error);
  });
  sounds[key] = sound;
};

export const playEffect = (key, isSoundOn=true) => {
  if(!isSoundOn) return;
  const sound = sounds[key];
  if(sound){
    sound.stop(() => { sound.play(); });
  }
};

export const stopEffect = (key) => {
  const sound = sounds[key];
  if(sound){
    sound.stop();
  }
};

export const releaseAll = () => {
  Object.values(sounds).forEach(s => {
    try{ s.release(); } catch(e){}
  });
};
