// Globalfile/KeyboardContext.js
import React, { createContext, useContext, useState } from 'react';

const KeyboardContext = createContext();

export const KeyboardProvider = ({ children }) => {
  const [keyboard, setKeyboard] = useState('classic'); // default keyboard

  const changeKeyboard = (key) => setKeyboard(key);

  return (
    <KeyboardContext.Provider value={{ keyboard, changeKeyboard }}>
      {children}
    </KeyboardContext.Provider>
  );
};

export const useKeyboard = () => useContext(KeyboardContext);
