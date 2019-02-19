import DATA from "./ac1-export-complete.json";

const getDATA = () => {
  var ideas = DATA["@graph"].map(idea => {
    return {
      content: idea.content,
      "@id": idea["@id"],
      id: idea["@id"]
        .split("/")
        .filter(v => v !== "")
        .pop(),
      //title: idea.title ? idea.title : "Idea",
      position: { left: 0, top: 0 }
    };
  });
  return ideas;
};

export { getDATA, DATA };
