import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./reducers";
import throttle from "lodash/throttle";
import { loadState, saveState } from "./localStorage";

const configureStore = () => {
  var persistedState = loadState();
  var state = persistedState
    ? {
        clustering: { present: persistedState, past: [], future: [] },
        activeIdea: null
      }
    : undefined;
  const store = createStore(rootReducer, state, applyMiddleware(thunk));
  if (process.env.NODE_ENV !== "production") {
    store.dispatch = addLoggingToDispatch(store);
  }
  store.subscribe(
    throttle(() => {
      saveState(store.getState().clustering.present);
    }, 1000)
  );

  return store;
};

const addLoggingToDispatch = store => {
  const rawDispatch = store.dispatch;
  if (!console.group) {
    return rawDispatch;
  }
  return action => {
    console.group(action.type);
    console.log("%c prev state", "color: gray", store.getState());
    console.log("%c action", "color: blue", action);
    const returnValue = rawDispatch(action);
    console.log("%c next state", "color: green", store.getState());
    console.groupEnd(action.type);
    return returnValue;
  };
};

export default configureStore;
