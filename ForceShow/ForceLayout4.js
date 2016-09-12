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
  processColor,
  Alert,
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

global.Buffer = global.Buffer || require('buffer').Buffer;

var net = require('net');

var d3 = require('../d3.v4.js');

import Node from './ForceNode';
import Line from './ForceLine3';

let radius = 10;
let loadCount = 7;

import {
  cv,
  Dis,
  DisP,
  FORCE_DATA,
} from './ForceCV';

export default class ForceLayout extends Component {
  constructor(props){
    super(props);

    this._panResponder = {};
    this.selectLeft = 0;
    this.selectTop = 0;
    this.selectNode = null;
    this.arrayNode = [];
    this.arrayEdge = [];
    this.edgeRefs = [];
    this.nodeRefs = [];
    this.myNodes = null;
    this.myEdges = null;
    this.nowSelectedNode = null;

    this.state={
      blnUpdate: false,
      loadIndex: 0,
    };
    this.status = cv.LAYER_LOAD;

    this.relativeX = -ScreenWidth / 2;
    this.relativeY = -ScreenHeight / 2;
    this.moveViewIsMoved = false;
    this.moveViewX = 0;
    this.moveViewY = 0;
    this.moveViewStyle = {
      position: 'absolute',
      left: this.moveViewX + this.relativeX,
      top: this.moveViewY + this.relativeY,
    };
    this.scaleViewValue = 1;
    this.scaleViewStyle = {
      transform: [{
        scale: this.scaleViewValue,
      }]
    };
    this.nodeSize={
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
    };
    this.client = null;
    this.tempServerData = null;
    this._nodeMoveControll = setInterval(this.onNodeMoveControll.bind(this), 100);
    global.forceLayout = this;
    console.log(ScreenWidth, ScreenHeight);
  }
  loading(index){
    this.setState({
      loadIndex: index,
    });
    switch(index){
      case 0:
        break;
      case 1:
        break;
      case 2:
        break;
      case 3:
        break;
      case 4:
        break;
      case 5:
        break;
      case 6:
        break;
      case 7:
        break;
    }
    if (index == 7){
      this.firstTimeout = setTimeout(this.connectServer.bind(this), 100);
    }else{
      this.loadTimeout = setTimeout(this.loading.bind(this, index+1), 100);
    }
  }
  getIndexForArray(arr, obj){
    for(var i=0;i<arr.length;i++){
      if (arr[i] == obj) return i;
    }
    return -1;
  }
  connectServer(){
    this.client = new WebSocket('http://192.168.1.111:8888');
    this.client.onopen = this.isConnected.bind(this);
    this.client.onerror = (e) =>{
      console.log('error:', e.message);
      Alert.alert(
        'Alert',
        '网络错误，请稍后再试！' + e.message,
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed!')},
          {text: 'OK', onPress: () => console.log('OK Pressed!')},
        ]
      );
    };
    this.client.onclose = this.isClosed.bind(this);
    this.client.onmessage = this.getDataFromServer.bind(this);
  }
  isConnected(){//回调，说明链接成功
    console.log('is connected');
  }
  isClosed(e){
    console.log('code:' + e.code, 'reason:' + e.reason);
    if (e.code == 1001){//中途服务器出问题而关闭
      Alert.alert(
        'Alert',
        '网络错误，请稍后再试！' + e.reason,
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed!')},
          {text: 'OK', onPress: () => console.log('OK Pressed!')},
        ]
      );
    }
  }
  getDataFromServer(e){
    var data = e.data;
    var serverData = data.toString();
    console.log(serverData.length);
    if (this.tempServerData == null){
      this.tempServerData = serverData;
    }else{
      this.tempServerData += serverData;
    }
    if (serverData.charAt(serverData.length - 1) == '|'){
      this.tempServerData = this.tempServerData.substr(0, this.tempServerData.length - 1);
      console.log('total: ' + this.tempServerData.length);
      var serverJson = JSON.parse(this.tempServerData);
      if (serverJson.type == 'ended'){
        this.arrayNode = [];
        this.myNodes = serverJson.nodes;
        for(var i=0;i<this.myNodes.length;i++){
          var d = this.myNodes[i];
          d.x += ScreenWidth / 2;
          d.y += ScreenHeight / 2;
          this.nodeSize.minX = Math.min(this.nodeSize.minX, parseInt(d.x));
          this.nodeSize.maxX = Math.max(this.nodeSize.maxX, parseInt(d.x));
          this.nodeSize.minY = Math.min(this.nodeSize.minY, parseInt(d.y));
          this.nodeSize.maxY = Math.max(this.nodeSize.maxY, parseInt(d.y));
          this.arrayNode.push(
            <Node ref={(ref)=>{this.nodeRefs.push(ref);}}
              key={i} data={this.myNodes[i]} visible={true}/>
          );
        }
        console.log('size:', this.nodeSize);
        this.myEdges = serverJson.links;
        this.arrayEdge = [];
        for(var i=0;i<this.myEdges.length;i++){
          var nodeIdx = this.getNodeIdxForZxKey(this.myEdges[i].source.zxKey);
          if (nodeIdx >= 0){
            this.myEdges[i].source = this.myNodes[nodeIdx];
          }
          nodeIdx = this.getNodeIdxForZxKey(this.myEdges[i].target.zxKey);
          if (nodeIdx >= 0){
            this.myEdges[i].target = this.myNodes[nodeIdx];
          }
          this.arrayEdge.push(
            <Line ref={l=>{this.edgeRefs.push(l);}} 
              key={i}
              edge={this.myEdges[i]}
              visible={true}/>
          );
        }
        this.status = cv.LAYER_PLAY;
        this.updateRender();
      }
    }
  }
  getNodeIdxForZxKey(zxKey){
    for(var i=0;i<this.myNodes.length;i++){
      if (this.myNodes[i].zxKey == zxKey){
        return i;
      }
    }
    console.log('通过zxKey查找node出错', zxKey);
    return -1;
  }
  componentWillMount(){
    this.loading(0);
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.onStartShouldSetPanResponder.bind(this),
      onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder.bind(this),
      onPanResponderGrant: this.onPanResponderGrant.bind(this),
      onPanResponderMove: this.onPanResponderMove.bind(this),
      onPanResponderRelease: this.onPanResponderRelease.bind(this),
      onPanResponderTerminate: this.onPanResponderTerminate.bind(this),
    });
  }
  setSelectNode(event, index, e, g) {
    console.log(event, index, e, g);
    if (event == cv.NODE_EVENT_START){
      this.selectNode = this.myNodes[index];
      console.log(this.myNodes[index]);
      this.selectLeft = g.dx;
      this.selectTop = g.dy;
    }else if (event == cv.NODE_EVENT_MOVE){
      this.selectLeft = g.dx;
      this.selectTop = g.dy;
    }else if (event == cv.NODE_EVENT_END) {
      this.selectNode = null;
    }
  }
  onPressNode(data){
    // console.log('onPress', data.order, data.zxContent);
    if (this.status == cv.LAYER_PLAY){
      var index = data.order;
      if (this.nodeRefs){
        if (this.nodeRefs[index]){
          this.nodeRefs[index].setNodeMove({
            'x': - this.moveViewX - this.relativeX,
            'y': - this.moveViewY - this.relativeY,
            'r': ScreenWidth/4 / this.scaleViewValue,
          }, 500);
          this.status = cv.LAYER_NODE_MOVE;
          this.nowSelectedNode = this.nodeRefs[index];
        }
      }
    }else if (this.status == cv.LAYER_NODE_STOP){
      if (this.nowSelectedNode){
        this.status = cv.LAYER_NODE_MOVE;
        this.nowSelectedNode.setNodeBack(500);
      }
    }
  }
  onNodeMoveControll(){
    // for()
  }
  onStartShouldSetPanResponder(e, g){
    if (this.status == cv.LAYER_LOAD || this.selectNode != null){
      return false;
    }
    return true;
  }
  onMoveShouldSetPanResponder(e, g){
    if (this.status == cv.LAYER_LOAD || this.selectNode != null){
      return false;
    }
    return true;
  }
  onPanResponderGrant(e, g){
    if (this.status == cv.LAYER_PLAY){
      this.touchScale = null;
      if (g.numberActiveTouches == 2){
        this.touchScale = Dis(e.nativeEvent.touches[0].pageX - e.nativeEvent.touches[1].pageX, 
          e.nativeEvent.touches[0].pageY - e.nativeEvent.touches[1].pageY);
      }
    }
  }
  onPanResponderMove(e, g){
    if (this.status == cv.LAYER_PLAY){
      if (g.numberActiveTouches == 1){
        var mx = this.moveViewX + g.dx / this.scaleViewValue;
        var my = this.moveViewY + g.dy / this.scaleViewValue;
        mx = Math.max(mx, this.nodeSize.minX + ScreenWidth * 0);
        mx = Math.min(mx, this.nodeSize.maxX - ScreenWidth * 0);
        my = Math.max(my, this.nodeSize.minY + ScreenHeight * 0);
        my = Math.min(my, this.nodeSize.maxY - ScreenHeight * 0);
        if (this.refs.moveView){
          this.refs.moveView.setNativeProps({
            style:{
              left: mx + this.relativeX,
              top: my + this.relativeY,
            }
          });
          this.moveViewIsMoved = true;
        }
        this.touchScale = null;
      }else if (g.numberActiveTouches == 2){
        var tempScale = Dis(e.nativeEvent.touches[0].pageX - e.nativeEvent.touches[1].pageX, 
          e.nativeEvent.touches[0].pageY - e.nativeEvent.touches[1].pageY);
        if (this.touchScale == null) {
          this.touchScale = tempScale;
        }
        this.scaleViewValue += (tempScale - this.touchScale) * 0.002;
        if (this.scaleViewValue >= 2.0) this.scaleViewValue = 2.0;
        if (this.scaleViewValue <= 0.1) this.scaleViewValue = 0.1;
        this.touchScale = tempScale;
        if (this.refs.scaleView){
          this.refs.scaleView.setNativeProps({
            style:{
              transform: [{
                scale: this.scaleViewValue,
              }],
            }
          });
        }
      }
    }
  }
  onPanResponderRelease(e, g){
    this.endPanResponder(e, g);
  }
  onPanResponderTerminate(e, g){
    this.endPanResponder(e, g);
  }
  endPanResponder(e, g){
    if (this.status == cv.LAYER_PLAY){
      if (this.moveViewIsMoved){
        this.moveViewX += g.dx / this.scaleViewValue;
        this.moveViewY += g.dy / this.scaleViewValue;

        this.moveViewX = Math.max(this.moveViewX, this.nodeSize.minX + ScreenWidth * 0);
        this.moveViewX = Math.min(this.moveViewX, this.nodeSize.maxX - ScreenWidth * 0);
        this.moveViewY = Math.max(this.moveViewY, this.nodeSize.minY + ScreenHeight * 0);
        this.moveViewY = Math.min(this.moveViewY, this.nodeSize.maxY - ScreenHeight * 0);

        this.moveViewIsMoved = false;
        // console.log(this.moveViewX, this.moveViewY, this.scaleViewValue, this.nodeSize);
      }
      this.touchScale = null;
    }
  }
  componentDidMount(){
  }
  componentWillUnmount(){
    this.loadTimeout && clearTimeout(this.loadTimeout);
    this.firstTimeout && clearTimeout(this.firstTimeout);
    this._nodeMoveControll && clearInterval(this._nodeMoveControll);
    global.forceLayout = null;
  }
  updateRender(){
    this.setState({
      blnUpdate: !this.state.blnUpdate,
    });
  }
  
  render() {
    if (this.status == cv.LAYER_LOAD){
      return (
        <View style={styles.loadView}>
          <View style={[styles.loadback]}>
            <View style={[styles.load, {width: (ScreenWidth*0.8)*this.state.loadIndex/loadCount}]} />
          </View>
        </View>
      );
    }else {
      return (
        <View style={styles.container} {...this._panResponder.panHandlers}>
          <View ref={'scaleView'} style={this.scaleViewStyle} >
            <View ref={'moveView'} style={this.moveViewStyle} >
              {this.drawLink()}
              {this.arrayNode}
            </View>
          </View>
        </View>
      );
    }
  }
  componentWillUpdate(nextProps, nextState) {
    this.renderTime = (new Date()).getTime();
  }
  componentDidUpdate(prevProps, prevState) {
    console.log('render drawview time:' + ((new Date()).getTime() - this.renderTime));
  }
  drawLink(){
    return this.arrayEdge;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#555',
  },
  loadView:{
    flex: 1,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadback:{
    width: ScreenWidth * 0.8,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(255,0,0)',
  },
  load:{
    width: ScreenWidth * 0.8,
    height : 20,
    backgroundColor: 'rgb(0,0,255)',
    alignSelf: 'flex-start',
  }
});