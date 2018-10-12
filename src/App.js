import React, { Component } from 'react';
import Board from "./components/board";
import Header from "./components/header";
import MenuBar from "./components/menuBar";
import IdeaStack from "./components/ideaStack";
import CHI19S1_ideas from './data/CHI19S1-ideas.json';

class App extends Component {
	constructor(props){
		super(props)
		this.boardRef = React.createRef(); 
		this.state = {
			nextIdeas: [],
			dropedIdeas: [],
			nextIdeasIndex: 0,
			offset: {x:0,y:0},
			boardPosition:{
				top: 0,
				left: 0
			}
		}
	}
	componentDidMount(){
		const boardPos = this.boardRef.current.getBoundingClientRect()
		const { nextIdeasIndex } = this.state
		const nextIdeas = this.dataLoader(nextIdeasIndex, nextIdeasIndex+5, CHI19S1_ideas)
		const dropedIdeas = []
		this.setState({
			nextIdeas:nextIdeas,
			dropedIdeas: dropedIdeas,
			boardPosition:{
				top: boardPos.y,
				left: boardPos.x
			}, 
			offset: {
				x:0,
				y:0
			}
		})
	}
	dataLoader = (fromIndex, toIndex, JSON_DATA) => {
		const data = JSON_DATA.slice(fromIndex,toIndex); 
		var ideas = data.map((idea)=>{
			idea.position = {x:0,y:0}
			return idea
		})
		return ideas; 
	}
	handleDrop = (ev) => {
		ev.preventDefault();
		const { top, left} = this.state.boardPosition
		const { x, y } = this.state.offset
		var data = ev.dataTransfer.getData("text");
		console.log("drop", data)
		var id = parseInt(data.slice(4))
		var { nextIdeas, dropedIdeas } = this.state
		console.log(nextIdeas,dropedIdeas)
		var index = dropedIdeas.findIndex(idea=>idea.id==id)
		if(index<0) {
			index = nextIdeas.findIndex(i=>i.id==id)
			var idea = nextIdeas.splice(index,1)
			idea[0].position = {x:ev.clientX - left - x, y:ev.clientY - top - y}
			dropedIdeas.push(idea[0])
			this.setState({
				nextIdeas:nextIdeas,
				dropedIdeas: dropedIdeas
			})
		} else {
			dropedIdeas[index].position = {x:ev.clientX - left - x, y:ev.clientY - top - y}
			this.setState({
				dropedIdeas: dropedIdeas
			})
		}
	}

	handleDropTrash = (ev) => {
		ev.preventDefault();
		var { nextIdeas, dropedIdeas } = this.state
		var data = ev.dataTransfer.getData("text");
		var id = parseInt(data.slice(4))

		var index = dropedIdeas.findIndex(idea=>idea.id==id)
		if(index<0) {
			index = nextIdeas.findIndex(i=>i.id==id)
			nextIdeas.splice(index,1)
		} else {
			dropedIdeas.splice(index,1)
		}
		this.setState({
				nextIdeas:nextIdeas,
				dropedIdeas: dropedIdeas
			})
	}

	handleNextIdeas = () => {
		console.log("handleNextIdeas")
		const { nextIdeasIndex } = this.state
		const nextIdeas = this.dataLoader(nextIdeasIndex+5, nextIdeasIndex+10, CHI19S1_ideas)
		this.setState((prevState)=>{
			return {
				nextIdeasIndex: prevState.nextIdeasIndex+5,
				nextIdeas: prevState.nextIdeas.concat(nextIdeas)
			}
		})
	}

	handleOffset = (x,y) => {
		this.setState({
			offset:{
				x: y,
				y: x
			} 
		})
	}

	render(){
		const { nextIdeas, dropedIdeas } = this.state
		
		return(
			<div>
				<Header/>
				<div className="row">
				<div className="col-2">
					<MenuBar handleNextIdeas={this.handleNextIdeas}/>
					<IdeaStack isTrash={false} nextIdeas={nextIdeas} handleOffset={this.handleOffset} />
					<IdeaStack isTrash={true} handleDropTrash={this.handleDropTrash} />
				</div>
				<div className="col-10" ref={this.boardRef} >
					<Board dropedIdeas={dropedIdeas} handleDrop={this.handleDrop} handleOffset={this.handleOffset}/>
				</div>
				
				</div>
			</div>
			)
	}
}

export default App; 