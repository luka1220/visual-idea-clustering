import React, { Component } from "react";
import { connect } from "react-redux";
import { setActiveIdea } from "../actions";
import Draggable from "./draggable";
import { ideaColor, borderColor } from "../constants/color";
import { labelIcon, textnoteIcon } from "../icons";
import { H6 } from "../styledComponents";

export const renderIdeas = (ideas, container, dropZone) => {
  if (!ideas) return null;
  const ideasRender = ideas.map(idea => {
    return (
      <Idea
        container={container}
        dropZone={dropZone ? dropZone : "IDEA" + idea.id}
        key={idea.id}
        data={idea}
      />
    );
  });
  return ideasRender.reverse();
};

function ellipsizeTextBox(id) {
  var textHeight = 0;
  var el = document.getElementById(id);
  if (!el) return { textHeight: undefined, text: undefined };
  var text = el.innerHTML;
  var wordArray = el.innerHTML.split(" ");
  textHeight = el.scrollHeight;
  while (el.scrollHeight > el.offsetHeight) {
    wordArray.pop();
    text = wordArray.join(" ") + "...";
    el.innerHTML = text;
  }
  return { textHeight, text };
}

var styles = {
  ideaBox: {
    position: "absolute",
    //border: "2px solid " + borderColor,
    width: 120,
    height: 120,
    cursor: "move",
    zIndex: 2,
    background: ideaColor
  },
  inCluster: {
    position: "relative",
    top: 0,
    left: 0,
    float: "left"
  },
  content: {
    padding: "0px 5px",
    fontSize: 10,
    maxHeight: 80
  },
  icon: {
    float: "right",
    fontSize: 10
  }
};

class Idea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textHeight: styles.content.maxHeight,
      displayFull: false
    };
    this.ideaRef = React.createRef();
  }

  componentDidMount() {
    const { textHeight, text } = ellipsizeTextBox(
      "content" + this.props.data.id
    );
    this.setState({
      textHeight: textHeight,
      ellipText: text,
      hasEllipText: textHeight > styles.content.maxHeight
    });
  }
  handleOnClick = ev => {
    const {
      boundSetActiveIdea,
      container,
      data: { id }
    } = this.props;
    if (this.state.hasEllipText && false) {
      //display full can be removed
      this.setState(prevState => {
        return { displayFull: !prevState.displayFull };
      });
    }
    boundSetActiveIdea(id, container);
  };

  render() {
    const {
      data: { position, id, content, labels, textnote, title },
      container,
      dropZone,
      activeIdea
    } = this.props;
    const { displayFull, textHeight, ellipText } = this.state;
    var style = {
      ...styles.ideaBox,
      ...position
    };
    if (container.type === "CLUSTER" || container.type === "STACK") {
      style = { ...style, ...styles.inCluster };
    }

    var text = ellipText && !displayFull ? ellipText : content;
    var styleTextBox = styles.content;
    if (displayFull) {
      style.height = style.height + textHeight - styles.content.maxHeight;
      styleTextBox = { ...styleTextBox, maxHeight: textHeight };
    }
    return (
      <Draggable
        id={id}
        dropZone={dropZone}
        type={"idea"}
        container={container}
        style={style}
        onClick={this.handleOnClick}
      >
        <div>
          <H6 bold={activeIdea === id}>
            {title || "Idea"}
            {labels && labels.length ? (
              <img
                draggable="false"
                style={styles.icon}
                alt="label"
                height="20"
                src={labelIcon}
              />
            ) : null}
            {textnote ? (
              <img
                draggable="false"
                style={styles.icon}
                alt="textnote"
                height="20"
                src={textnoteIcon}
              />
            ) : null}
          </H6>
          <div id={"content" + id} style={styleTextBox}>
            {text}
          </div>
        </div>
      </Draggable>
    );
  }
}

const mapStateToProps = state => ({
  activeIdea: state.activeIdea && state.activeIdea.id
});
const mapDispatchToProps = dispatch => ({
  boundSetActiveIdea: (...props) => dispatch(setActiveIdea(...props))
});

Idea = connect(
  mapStateToProps,
  mapDispatchToProps
)(Idea);

export default Idea;
