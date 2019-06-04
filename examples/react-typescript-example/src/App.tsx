import React from 'react';
import { Provider } from 'react-redux';
import makeStore from './store'
import './App.css';
import Home from './pages/Home'

const store = makeStore()

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Home/>
    </Provider>
  );
}

export default App;
