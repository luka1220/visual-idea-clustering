import Cluster from "../models/cluster";
const initialState = {
  stackIdeas: [],
  boardIdeas: [],
  clusters: [],
  nextIndex: 0
};
export default (state = initialState, action) => {
  const { type } = action;
  var idea, newState, clusters, c;
  switch (type) {
    case "MOVE_IDEA":
      const { source, sink, id, position } = action;
      [idea, newState] = removeIdeaFromSource(state, source, id);
      if (!newState) return state;
      newState = addIdeaToSink(newState, sink, { ...idea, position });
      if (!newState) return state;
      return newState;
    case "LOAD_IDEAS":
      const { ideas } = action;
      const stackIdeas = [...state.stackIdeas, ...ideas];
      return {
        ...state,
        stackIdeas: stackIdeas,
        nextIndex: ideas.length + state.nextIndex
      };
    case "MOVE_CLUSTER":
      const { id: c_id, position: p } = action;
      [c, clusters] = removeElement(c_id, state.clusters);
      return { ...state, clusters: [...clusters, { ...c, position: p }] };
    case "RENAME_CLUSTER":
      const { id: rnid, name: rnname } = action;
      [c, clusters] = removeElement(rnid, state.clusters);
      return { ...state, clusters: [...clusters, { ...c, name: rnname }] };
    case "RESET_STATE":
      return initialState;
    case "UPDATE_IDEA":
      const { updateObj } = action;
      [idea, newState] = removeIdeaFromSource(
        state,
        action.container,
        action.id,
        true
      );
      if (!newState) return state;
      newState = addIdeaToSink(newState, action.container, {
        ...idea,
        ...updateObj
      });
      if (!newState) return state;
      return newState;
    default:
      return state;
  }
};

/**
 * input @array - a list mit object holding an id
 * return the object holding the id and the array without the object
 **/
function removeElement(id, array) {
  let index = array.findIndex(a => a.id === id);
  let resultArray = [...array.slice(0, index), ...array.slice(index + 1)];
  return [array[index], resultArray];
}
function removeIdeaFromSource(state, source, id, keepSource = false) {
  let boardIdeas, stackIdeas, clusters, idea, cluster, ideaList;
  switch (source.type) {
    case "BOARD":
      [idea, boardIdeas] = removeElement(id, state.boardIdeas);
      return [idea, { ...state, boardIdeas: boardIdeas }];
    case "STACK":
      [idea, stackIdeas] = removeElement(id, state.stackIdeas);
      return [idea, { ...state, stackIdeas: stackIdeas }];
    case "CLUSTER":
      [cluster, clusters] = removeElement(source.id, state.clusters);
      [idea, ideaList] = removeElement(id, cluster.ideas);
      if (ideaList.length < 1 && !keepSource) {
        return [idea, { ...state, clusters: clusters }];
      }
      return [
        idea,
        { ...state, clusters: [...clusters, { ...cluster, ideas: ideaList }] }
      ];
    default:
      return [null, null];
  }
}

function addIdeaToSink(state, sink, idea) {
  let boardIdeas, clusters, cluster, idea2;
  switch (sink.type) {
    case "BOARD":
      return {
        ...state,
        boardIdeas: [...state.boardIdeas, idea]
      };
    case "STACK":
      return { ...state, stackIdeas: [...state.stackIdeas, idea] };
    case "CLUSTER":
      [cluster, clusters] = removeElement(sink.id, state.clusters);
      cluster = {
        ...cluster,
        ideas: [...cluster.ideas, { ...idea, position: cluster.position }]
      };
      return { ...state, clusters: [...clusters, cluster] };
    case "IDEA":
      [idea2, boardIdeas] = removeElement(sink.id, state.boardIdeas);
      clusters = [...state.clusters, new Cluster(idea.position, [idea, idea2])];
      return { ...state, clusters: clusters, boardIdeas: boardIdeas };
    case "TRASH":
      return state;
    default:
      return null;
  }
}