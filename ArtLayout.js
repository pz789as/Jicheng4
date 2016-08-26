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
  ART,
  PanResponder,
  PixelRatio,
} from 'react-native';

const {
  Shape,
  Group,
  Transform,
  Surface,
  Path,
  Pattern,
  LinearGradient,
  RadialGradient,
  ClippingRectangle,
} = ART;

import Dimensions from 'Dimensions';
let ScreenWidth = Dimensions.get('window').width;
let ScreenHeight = Dimensions.get('window').height;

var d3 = require('./d3.v4.js');
var graph = require('./miserables2.json');

import Line from './Line';
import Node  from './Node';

let radius = 10;

export default class ArtLayout extends Component {
  constructor(props){
    super(props);
    this.simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(function(d){return d.id}))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(ScreenWidth/2, ScreenHeight/2))
    .alphaMin(0.05);

    this.simulation.nodes(graph.nodes)
    .on('tick', this.ticked.bind(this))
    .on('end', this.endTick.bind(this));

    this.simulation.force('link')
    .links(graph.links);

    this.arrayNode = [];
    this.arrayLink = [];
    this.lineRefs = [];
    this.nodeRefs = [];

    graph.links.forEach((d)=>{
      //因为线太多会卡，所以初始化时，show设置为false，先不显示。
      this.arrayLink.push(
        <Line ref={l=>{this.lineRefs[d.index]=l;}} key={d.index} show={false}/>
      );
    });
    graph.nodes.forEach((d)=>{
      this.arrayNode.push(
        <Node ref={n=>{this.nodeRefs[d.index]=n;}} 
          key={d.index} radius={radius}
          text={d.id}/>
      );
    });
    this.state={
      x: ScreenWidth/2,
      y: ScreenHeight/2,
      blnUpdate: false,
      nodeInfo: [],
    };
    this._panResponder = {};
    this.selectLeft = 0;
    this.selectTop = 0;
    global.Dis = this.distance.bind(this);
    global.DisP = this.distanceP.bind(this);
    this.selectNode = null;
  }
  distanceP(p1, p2){
    return Dis(p1.x - p2.x, p1.y - p2.y);
  }
  distance(x, y){
    return Math.sqrt(x * x + y * y);
  }
  ticked(){
    graph.links.forEach(this.freshLink.bind(this));
    graph.nodes.forEach(this.freshNode.bind(this));
  }
  endTick() {
    //当所有节点运动完毕之后，将线显示出来
    graph.links.forEach((d)=>{
      this.lineRefs[d.index].setVisible(true);
    });
  }
  freshLink(d){
    this.lineRefs[d.index].setPosition(d.source.x, d.source.y, d.target.x, d.target.y);
  }
  freshNode(d){
    this.nodeRefs[d.index].setPosition(d.x, d.y);
  }
  updateRender(){
    this.setState({
      blnUpdate: !this.state.blnUpdate,
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <View ref={'backView'} style={{transform:[{scale:1}]}}
          pointerEvents={'box-only'} 
          {...this._panResponder.panHandlers}>
          <Surface width={ScreenWidth} height={ScreenHeight}>
            {this.drawLink()}
          </Surface>
          {this.arrayNode}
        </View>
      </View>
    );
  }
  drawLink(){
    return this.arrayLink;
  }
  componentWillMount(){
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.onStartShouldSetPanResponder.bind(this),
      onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder.bind(this),
      onPanResponderGrant: this.onPanResponderGrant.bind(this),
      onPanResponderMove: this.onPanResponderMove.bind(this),
      onPanResponderRelease: this.onPanResponderRelease.bind(this),
      onPanResponderTerminate: this.onPanResponderTerminate.bind(this),
    });
  }
  onStartShouldSetPanResponder(e, gestureSate){
    return true;
  }
  onMoveShouldSetPanResponder(e, gestureSate){
    return true;
  }
  onPanResponderGrant(e, gestureSate){
    this.selectLeft = e.nativeEvent.locationX;
    this.selectTop = e.nativeEvent.locationY;
    var mouseP = {
      x: this.selectLeft,
      y: this.selectTop
    };
    this.selectNode = null;
    for(var i = 0; i < graph.nodes.length; i++){
      var d = graph.nodes[i];
      var dis = DisP({x:d.x,y:d.y}, mouseP);
      if (dis <= radius){
        this.simulation.alphaTarget(0.3).restart();
        this.selectNode = graph.nodes[i];
        this.selectNode.fx = this.selectNode.x;
        this.selectNode.fy = this.selectNode.y;
        break;
      }
    }
  }
  onPanResponderMove(e, gestureSate){
    if (this.selectNode != null) {
      this.selectNode.fx += e.nativeEvent.locationX - this.selectLeft;
      this.selectNode.fy += e.nativeEvent.locationY - this.selectTop;
    }
    this.selectLeft = e.nativeEvent.locationX;
    this.selectTop = e.nativeEvent.locationY;
  }
  onPanResponderRelease(e, gestureSate){
    if (this.selectNode != null){
      this.simulation.alphaTarget(0);
      this.selectNode.fx = null;
      this.selectNode.fy = null;
      this.selectNode = null;
    }
  }
  onPanResponderTerminate(e, gestureSate){
    this.simulation.alphaTarget(0);
    this.selectNode = null;
  }
  componentDidMount(){
    
  }
  componentWillUnmount(){

  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
});

