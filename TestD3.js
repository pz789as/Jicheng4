/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Dimensions from 'Dimensions';
let ScreenWidth = Dimensions.get('window').width;
let ScreenHeight = Dimensions.get('window').height;

var d3 = require('./d3.v4.js');
var graph = require('./miserables.json');
// console.log(d3);

import Svg,{
  Circle,
  Ellipse,
  G,
  LinearGradient,
  RadialGradient,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
  Symbol,
  Text as SvgText,
  Use,
  Defs,
  Stop
} from 'react-native-svg';

import TestLine from './TestLine';

export default class TestD3 extends Component {
  constructor(props){
    super(props);
    this.simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(function(d){return d.id}))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(ScreenWidth/2, ScreenHeight/2))
    .alphaMin(0.1);

    this.simulation.nodes(graph.nodes)
    .on('tick', this.ticked.bind(this))
    .on('end', this.endTick.bind(this));

    this.simulation.force('link')
    .links(graph.links);

    this.arrayNode = graph.nodes;
    this.arrayLink = graph.links;
    this.lineRefs = [];
    this.nodeRefs = [];

    this.state={
      x: ScreenWidth/2,
      y: ScreenHeight/2,
      blnUpdate: false,
      nodeInfo: [],
    };
    this.time = (new Date()).getTime();
    this.blnDrawLink = false;
  }
  ticked(){
    this.blnDrawLink = !this.blnDrawLink;
    graph.links.forEach(this.freshLink.bind(this));
    graph.nodes.forEach(this.freshNode.bind(this));
    this.updateRender();
  }
  endTick() {
    console.log('end:', (new Date()).getTime() - this.time);
    this.blnDrawLink = true;
    this.updateRender();
  }
  freshLink(d){
    // console.log('freshLink', d);
  }
  freshNode(d){
  }
  updateRender(){
    this.setState({
      blnUpdate: !this.state.blnUpdate,
    });
  }
  render() {
    var index = parseInt(Math.random() * this.arrayLink.length);
    return (
      <Svg width={ScreenWidth} height={ScreenHeight}>
        {this.drawLink()}
        {this.drawNode()}
      </Svg>
    );
  }
  drawNode(){
    var arr = [];
    for(var i=0;i<this.arrayNode.length;i++){
      arr.push(
        <G ref={(ele)=>{this.nodeRefs[i] = ele;}} 
          key={i}
          x={this.arrayNode[i].x}
          y={this.arrayNode[i].y}>
          <Circle  
            cx='0'
            cy='0'
            r='10'
            fill='red' />
        </G>
      );
    }
    return arr;
  }
  drawLink(){
    var arr = [];
    if (this.blnDrawLink) {
      for(var i=0;i<this.arrayLink.length;i++){
        arr.push(
            <TestLine key={i} ref={ele=>{this.lineRefs[i]=ele;}}
              x1={this.arrayLink[i].source.x} y1={this.arrayLink[i].source.y}
              x2={this.arrayLink[i].target.x} y2={this.arrayLink[i].target.y}/>
        );
      }
    }
    return arr;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  nodeStyle:{
    position: 'absolute',
    width: 15,
    height: 15,
    left: ScreenWidth/2,
    top: ScreenHeight/2,
    // borderRadius: 7.5,
    // backgroundColor: 'green',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
});

