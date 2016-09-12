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

import DrawView from './DrawView';

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
    this.oldSelectedNode = null;
    this.moveNodes = [];
    this.nodeMoveStep = 0;
    this.nodeMoveTime = 0;

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
    this._nodeMoveControll = setInterval(this.onNodeMoveControll.bind(this), 1/6*100);
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
          d.status = cv.NODE_PLAY;
          d.x += ScreenWidth / 2;
          d.y += ScreenHeight / 2;
          d.orgX = d.x;
          d.orgY = d.y;
          d.orgR = d.radius;
          this.nodeSize.minX = Math.min(this.nodeSize.minX, parseInt(d.x));
          this.nodeSize.maxX = Math.max(this.nodeSize.maxX, parseInt(d.x));
          this.nodeSize.minY = Math.min(this.nodeSize.minY, parseInt(d.y));
          this.nodeSize.maxY = Math.max(this.nodeSize.maxY, parseInt(d.y));
        }
        console.log('size:', this.nodeSize);
        this.myEdges = serverJson.links;
        this.arrayEdge = [];
        for(var i=0;i<this.myEdges.length;i++){
          this.myEdges[i].visible = true;
          var nodeIdx = this.getNodeIdxForZxKey(this.myEdges[i].source.zxKey);
          if (nodeIdx >= 0){
            this.myEdges[i].source = this.myNodes[nodeIdx];
          }
          nodeIdx = this.getNodeIdxForZxKey(this.myEdges[i].target.zxKey);
          if (nodeIdx >= 0){
            this.myEdges[i].target = this.myNodes[nodeIdx];
          }
        }
        this.status = cv.LAYER_PLAY;
        this.setDrawData();
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
  setDrawData(){
    var setDataTime = (new Date()).getTime();
    this.drawData = {
      order: ['lines', 'rects', 'circles', 'texts'],
      lines: [],
      rects: [],
      circles: [],
      texts: [],
    };
    for (var i = 0; i < this.myNodes.length; i++) {
    // for (var i = 0; i < 1; i++) {
      var node = this.myNodes[i];
      // node.x = 0;
      // node.y = 0;
      var x = node.x ? node.x : 0;
      var y = node.y ? node.y : 0;
      var tempData = {
        x: x,
        y: y,
        color: processColor('white'),
        fill: 0,
        order: node.order,
      };
      var tempText = {
        x: x,
        y: y,
        color: processColor('blue'),
        order: node.order,
        fontSize: 14,
        text: node.zxContent,
      };
      this.drawData.texts.push(tempText);
      tempData.radius = node.radius;
      if (node.kind == 0) {
        tempData.color = processColor('rgb(255,0,0)');
      }else if (node.kind == 1) {
        tempData.color = processColor('rgb(0,255,0)');
      }else {
        tempData.color = processColor('rgb(255,255,255)');
      }
      this.drawData.circles.push(tempData);
      // if (node.kind == 0){
      //   tempData.radius = node.radius;
      //   tempData.color = processColor('rgb(255,0,0)');
      //   this.drawData.circles.push(tempData);
      // }else if (node.kind == 1) {
      //   tempData.width = node.radius * 2;
      //   tempData.height = node.radius * 2;
      //   tempData.x = x - node.radius;
      //   tempData.y = y - node.radius;
      //   tempData.color = processColor('rgb(0,255,0)');
      //   this.drawData.rects.push(tempData);
      // }else{
      //   tempData.width = node.radius * 2;
      //   tempData.height = node.radius * 2;
      //   tempData.x = x - node.radius;
      //   tempData.y = y - node.radius;
      //   tempData.color = processColor('rgb(255,255,255)');
      //   this.drawData.rects.push(tempData);
      // }
      node.showNode = tempData;
    }
    for(var i=0;i<this.myEdges.length;i++){
      var edge = this.myEdges[i];
      var tempEdge = {
        x1: edge.source.x,
        y1: edge.source.y,
        x2: edge.target.x,
        y2: edge.target.y,
        color: processColor('rgb(0,255,0)'),
        stroke: 1,
      };
      this.drawData.lines.push(tempEdge);
      edge.showEdge = tempEdge;
    }
    console.log('set data time: ' + ((new Date()).getTime() - setDataTime));
    this.updateRender();
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
    // console.log(event, index, e, g);
    // if (event == cv.NODE_EVENT_START){
    //   this.selectNode = this.myNodes[index];
    //   console.log(this.myNodes[index]);
    //   this.selectLeft = g.dx;
    //   this.selectTop = g.dy;
    // }else if (event == cv.NODE_EVENT_MOVE){
    //   this.selectLeft = g.dx;
    //   this.selectTop = g.dy;
    // }else if (event == cv.NODE_EVENT_END) {
    //   this.selectNode = null;
    // }
  }
  onPressNode(data){
    //
  }
  onSelectedNode(){
    //
  }
  onNodeMoveControll(){
    if (this.status == cv.LAYER_NODE_MOVE || this.status == cv.LAYER_NODE_BACK){
      if (this.nodeMoveStep <= this.nodeMoveTime){
        this.nodeMoveStep++;
        for(var i=0;i<this.myNodes.length;i++){
          var node = this.myNodes[i];
          if (node.status == cv.NODE_MOVE || node.status == cv.NODE_BACK){
            node.x = node.oldX + (node.newX - node.oldX) * this.nodeMoveStep / this.nodeMoveTime;
            node.y = node.oldY + (node.newY - node.oldY) * this.nodeMoveStep / this.nodeMoveTime;
            node.radius = node.oldR + (node.newR - node.oldR) * this.nodeMoveStep / this.nodeMoveTime;

            if (this.nodeMoveStep == this.nodeMoveTime){
              node.x = node.newX;
              node.y = node.newY;
              node.radius = node.newR;
              if (node.status == cv.NODE_MOVE){
                node.status = cv.NODE_MOVE_OVER;
              }else if (node.status == cv.NODE_BACK){
                node.status = cv.NODE_PLAY;
              }
            }
          }  
        }
        if (this.nodeMoveStep == this.nodeMoveTime){
          if (this.status == cv.LAYER_NODE_MOVE){
            this.status = cv.LAYER_NODE_STOP;
          }else if (this.status == cv.LAYER_NODE_BACK) {
            this.status = cv.LAYER_PLAY;
          }
        }
      }
      this.setDrawData();
    }
  }
  getTransValue(v, t){
    if (t == 'x'){
      return (v - ScreenWidth/2) / this.scaleViewValue - this.moveViewX;
    }else{
      return (v - ScreenHeight/2) / this.scaleViewValue - this.moveViewY;
    }
  }
  getATransValue(v, t){
    if (t == 'x'){
      return (v + this.moveViewX) * this.scaleViewValue + ScreenWidth/2;
    }else {
      return (v + this.moveViewY) * this.scaleViewValue + ScreenHeight/2;
    }
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
    if (this.status == cv.LAYER_PLAY || this.status == cv.LAYER_NODE_STOP){
      this.touchScale = null;
      if (g.numberActiveTouches == 2){
        this.touchScale = Dis(e.nativeEvent.touches[0].pageX - e.nativeEvent.touches[1].pageX, 
          e.nativeEvent.touches[0].pageY - e.nativeEvent.touches[1].pageY);
      }else if (g.numberActiveTouches == 1){
        if (this.nowSelectedNode){
          this.oldSelectedNode = this.nowSelectedNode;
          this.nowSelectedNode = null;
        }
        var tp = {
          x: this.getTransValue(e.nativeEvent.locationX, 'x'),
          y: this.getTransValue(e.nativeEvent.locationY, 'y')
        };
        // console.log(
        //   tp.x,
        //   tp.y,
        //   e.nativeEvent.locationX,
        //   e.nativeEvent.locationY,
        //   this.moveViewX,
        //   this.moveViewY,
        //   this.scaleViewValue,
        //   this.myNodes[0].x,
        //   this.myNodes[0].y
        // );
        for(var i=0;i<this.myNodes.length;i++){
          var dis = DisP(tp, {x:this.myNodes[i].x, y:this.myNodes[i].y});
          if (dis <= this.myNodes[i].radius){
            console.log(this.myNodes[i].zxContent);
            this.nowSelectedNode = this.myNodes[i];
            break;
          }
        }
        if (this.nowSelectedNode == null && this.oldSelectedNode){
          this.oldSelectedNode = null;
          this.setNodeMoveBack();
        }
      }
    }
  }
  onPanResponderMove(e, g){
    if (this.status == cv.LAYER_PLAY){
      if (g.numberActiveTouches == 1){
        if (this.nowSelectedNode){
          this.nowSelectedNode = null;
        }
        var mx = this.moveViewX + g.dx / this.scaleViewValue;
        var my = this.moveViewY + g.dy / this.scaleViewValue;
        mx = Math.max(mx, this.nodeSize.minX + ScreenWidth * 0.5);
        mx = Math.min(mx, this.nodeSize.maxX - ScreenWidth * 0.5);
        my = Math.max(my, this.nodeSize.minY + ScreenHeight * 0.5);
        my = Math.min(my, this.nodeSize.maxY - ScreenHeight * 0.5);
        if (this.refs.drawView){
          this.refs.drawView.setNativeProps({
            transPos: {
              x: mx,
              y: my,
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
        if (this.refs.drawView){
          this.refs.drawView.setNativeProps({
            scaleValue: {
              x: this.scaleViewValue,
              y: this.scaleViewValue,
            },
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
    if (this.status == cv.LAYER_PLAY || this.status == cv.LAYER_NODE_STOP){
      if (this.moveViewIsMoved){
        this.moveViewX += g.dx / this.scaleViewValue;
        this.moveViewY += g.dy / this.scaleViewValue;

        this.moveViewX = Math.max(this.moveViewX, this.nodeSize.minX + ScreenWidth * 0.5);
        this.moveViewX = Math.min(this.moveViewX, this.nodeSize.maxX - ScreenWidth * 0.5);
        this.moveViewY = Math.max(this.moveViewY, this.nodeSize.minY + ScreenHeight * 0.5);
        this.moveViewY = Math.min(this.moveViewY, this.nodeSize.maxY - ScreenHeight * 0.5);

        this.moveViewIsMoved = false;
        // console.log(this.moveViewX, this.moveViewY, this.scaleViewValue, this.nodeSize);
      }else if (this.nowSelectedNode){
        if (this.oldSelectedNode != this.nowSelectedNode){
          this.setNodeMoveStart();
        }
      }
      this.touchScale = null;
    }
  }
  setNodeMoveStart(){
    this.nowSelectedNode.status = cv.NODE_MOVE;
    this.nowSelectedNode.oldX = this.nowSelectedNode.x;
    this.nowSelectedNode.oldY = this.nowSelectedNode.y;
    this.nowSelectedNode.newX = this.getTransValue(ScreenWidth/2, 'x');
    this.nowSelectedNode.newY = this.getTransValue(ScreenHeight/2, 'y');
    this.nowSelectedNode.oldR = this.nowSelectedNode.radius;
    this.nowSelectedNode.newR = ScreenWidth / 4 / this.scaleViewValue;

    var cx = 0, cy = 0;
    var dx = (ScreenWidth/10);
    var dy = (ScreenHeight/2 + ScreenWidth/4 + dx) ;
    var py = (ScreenHeight/2 - ScreenWidth/4 - dx) ;
    var sx = 0, d = dx - 4;
    for(var i=0;i<this.myEdges.length;i++){
      var edge = this.myEdges[i];
      if (edge.source == this.nowSelectedNode){
        edge.target.oldX = edge.target.x;
        edge.target.oldY = edge.target.y;
        edge.target.oldR = edge.target.radius;
        edge.target.newX = this.getTransValue(dx / 2 + cx * dx, 'x');
        edge.target.newY = this.getTransValue(dy + cy * dx, 'y');
        edge.target.newR = d/2 / this.scaleViewValue;
        edge.target.status = cv.NODE_MOVE;
        cx++;
        if (cx >= 10){
          cy ++;
          cx = 0;
        }
      }else if (edge.target == this.nowSelectedNode){
        edge.source.oldX = edge.source.x;
        edge.source.oldY = edge.source.y;
        edge.source.oldR = edge.source.radius;
        edge.source.newX = this.getTransValue(dx / 2 + sx * dx, 'x');
        edge.source.newY = this.getTransValue(py, 'y');
        edge.source.newR = d/2 / this.scaleViewValue;
        edge.source.status = cv.NODE_MOVE;
        sx++;
      }else{
        edge.visible = false;
      }
    }
    for(var i=0;i<this.myNodes.length;i++){
      var node = this.myNodes[i];
      if (node.status == cv.NODE_PLAY){
        var x = this.getATransValue(node.x, 'x');
        var y = this.getATransValue(node.y, 'y');
        var r = node.radius * this.scaleViewValue;
        if ((x+r >= 0 && x-r <= ScreenWidth) || (y+r >= 0 && y-r <= ScreenHeight)){
          var angle = Math.atan2(y-this.nowSelectedNode.y, x-this.nowSelectedNode.x);
          node.oldX = node.x;
          node.oldY = node.y;
          node.oldR = node.radius;
          node.newX = this.getTransValue(Math.cos(angle) * ScreenWidth/2, 'x') + this.nowSelectedNode.x;
          node.newY = this.getTransValue(Math.sin(angle) * ScreenWidth/2, 'y') + this.nowSelectedNode.y;
          node.newR = d/2 / this.scaleViewValue;
          node.status = cv.NODE_MOVE;
        }
      }
    }
    this.nodeMoveStep = 0;
    this.nodeMoveTime = 10;
    this.status = cv.LAYER_NODE_MOVE;
  }
  setNodeMoveBack(){
    for(var i=0;i<this.myNodes.length;i++){
      var node = this.myNodes[i];
      if (node.status == cv.NODE_MOVE_OVER){
        node.status = cv.NODE_BACK;
        node.oldX = node.x;
        node.oldY = node.y;
        node.newX = node.orgX;
        node.newY = node.orgY;
        node.oldR = node.radius;
        node.newR = node.orgR;
      }
    }
    this.nodeMoveStep = 0;
    this.nodeMoveTime = 10;
    this.status = cv.LAYER_NODE_BACK;
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
        <View style={styles.container} {...this._panResponder.panHandlers} pointerEvents={'box-only'}>
            <DrawView style={{
              width: parseInt(ScreenWidth), 
              height: parseInt(ScreenHeight), 
              backgroundColor:'#AAA'
            }}
              transPos={{x:this.moveViewX, y:this.moveViewY}}
              scaleValue={{x:this.scaleViewValue, y:this.scaleViewValue}}
              drawData={this.drawData}
              ref={'drawView'} />
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