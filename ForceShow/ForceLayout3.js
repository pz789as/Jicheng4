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

    this.lvNodes = [];
    this.lvEdges = [];
    this.lvGrayEdges = [];
    this.lvIndex = 0;
    this.minWeight = 9999;
    this.maxWeight = 1;
    this.linearScale = null;
    this.simulation = null;
    this._panResponder = {};
    this.selectLeft = 0;
    this.selectTop = 0;
    this.selectNode = null;
    this.arrayNode = [];
    this.arrayEdge = [];
    this.edgeRefs = [];
    this.nodeRefs = [];
    this.goujianJson = null;
    this.goujianGuanxiJson = null;
    this.zixingJson = null;
    this.myNodes = null;
    this.myEdges = null;

    this.state={
      blnUpdate: false,
      loadIndex: 0,
      status: cv.LAYER_LOAD,
    };

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
    this.timeoutCount = 0;
    this.netState = 0;
    this.client = null;
    this.tempServerData = null;
    global.forceLayout = this;
    console.log(ScreenWidth, ScreenHeight);
  }
  loading(index){
    this.setState({
      loadIndex: index,
    });
    switch(index){
      case 0:
        this.goujianJson = require('../data/mGoujian.json');
        break;
      case 1:
        this.goujianGuanxiJson = require('../data/mGoujianGuanxi.json');
        break;
      case 2:
        this.zixingJson = require('../data/mZixing.json');
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
  connectServer(){
    this.tempServerData = null;
    this.client = net.createConnection({host:'192.168.1.111', port:8888}, this.isConnected.bind(this));
    this.client.on('error', function(error){
      console.log('error:', error);
    });
    this.client.setTimeout(30000, ()=>{
      console.log('connect timeout');
      this.timeoutCount++;
      if (this.timeoutCount >= 3){
        this.netState = 0;
        this.client = null;
        this.timeoutCount = 0;
        Alert.alert(
          'Alert',
          '网络错误，请稍后再试！',
          [
            {text: 'Cancel', onPress: () => console.log('Cancel Pressed!')},
            {text: 'OK', onPress: () => console.log('OK Pressed!')},
          ]
        );
      }else{
        this.connectServer();
      }
    });
  }
  getDataFromServer(data){
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
          this.arrayEdge.push(
            <Line ref={l=>{this.edgeRefs.push(l);}} 
              key={i}
              edge={this.myEdges[i]}
              visible={true}/>
          );
        }
        this.setState({
          status: cv.LAYER_FORCE,
        });
      }
    }
  }
  isConnected(){//回调，说明链接成功
    console.log('is connected');
    this.netState = 1;
    this.client.on('data', this.getDataFromServer.bind(this));
    this.client.on('close', this.isClosed.bind(this));
  }
  isClosed(close){
    console.log('close', close);//返回true 说明服务器没有开启，false说明服务器中途关闭了
    this.netState = 0;
    if (close == false){//中途服务器出问题而关闭
      Alert.alert(
        'Alert',
        '网络错误，请稍后再试！',
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed!')},
          {text: 'OK', onPress: () => console.log('OK Pressed!')},
        ]
      );
    }
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
    if (event == cv.NODE_EVENT_START){
      this.simulation.alphaTarget(0.3).restart();
      this.selectNode = this.myNodes[index];
      this.selectLeft = g.dx;
      this.selectTop = g.dy;
      this.selectNode.fx = this.selectNode.x;
      this.selectNode.fy = this.selectNode.y;
    }else if (event == cv.NODE_EVENT_MOVE){
      this.selectNode.fx += (g.dx - this.selectLeft) / this.scaleViewValue;
      this.selectNode.fy += (g.dy - this.selectTop) / this.scaleViewValue;
      this.selectLeft = g.dx;
      this.selectTop = g.dy;
    }else if (event == cv.NODE_EVENT_END) {
      this.simulation.alphaTarget(0);
      this.selectNode.fx = null;
      this.selectNode.fy = null;
      this.selectNode = null;
    }
  }
  onPressNode(data){
    console.log('onPress', data.order, data.zxContent); 
  }
  onStartShouldSetPanResponder(e, g){
    if (this.state.status == cv.LAYER_LOAD || this.selectNode != null){
      return false;
    }
    return true;
  }
  onMoveShouldSetPanResponder(e, g){
    if (this.state.status == cv.LAYER_LOAD || this.selectNode != null){
      return false;
    }
    return true;
  }
  onPanResponderGrant(e, g){
    this.touchScale = null;
    if (g.numberActiveTouches == 2){
      this.touchScale = Dis(e.nativeEvent.touches[0].pageX - e.nativeEvent.touches[1].pageX, 
        e.nativeEvent.touches[0].pageY - e.nativeEvent.touches[1].pageY);
    }
  }
  onPanResponderMove(e, g){
    if (g.numberActiveTouches == 1){
      var mx = this.moveViewX + g.dx / this.scaleViewValue;
      var my = this.moveViewY + g.dy / this.scaleViewValue;
      mx = Math.max(mx, this.nodeSize.minX + ScreenWidth * 1.5);
      mx = Math.min(mx, this.nodeSize.maxX - ScreenWidth * 1.5);
      my = Math.max(my, this.nodeSize.minY + ScreenHeight * 0.5);
      my = Math.min(my, this.nodeSize.maxY - ScreenHeight * 1);
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
  onPanResponderRelease(e, g){
    this.endPanResponder(e, g);
  }
  onPanResponderTerminate(e, g){
    this.endPanResponder(e, g);
  }
  endPanResponder(e, g){
    if (this.moveViewIsMoved){
      this.moveViewX += g.dx / this.scaleViewValue;
      this.moveViewY += g.dy / this.scaleViewValue;

      this.moveViewX = Math.max(this.moveViewX, this.nodeSize.minX + ScreenWidth * 1.5);
      this.moveViewX = Math.min(this.moveViewX, this.nodeSize.maxX - ScreenWidth * 1.5);
      this.moveViewY = Math.max(this.moveViewY, this.nodeSize.minY + ScreenHeight * 0.5);
      this.moveViewY = Math.min(this.moveViewY, this.nodeSize.maxY - ScreenHeight * 1);

      this.moveViewIsMoved = false;
      // console.log(this.moveViewX, this.moveViewY, this.scaleViewValue, this.nodeSize);
    }
    this.touchScale = null;
  }
  componentDidMount(){
  }
  componentWillUnmount(){
    this.loadTimeout && clearTimeout(this.loadTimeout);
    this.firstTimeout && clearTimeout(this.firstTimeout);
    global.forceLayout = null;
  }
  getStatus(){
    return this.state.status;
  }
  updateRender(){
    this.setState({
      blnUpdate: !this.state.blnUpdate,
    });
  }
  
  render() {
    // return(
    //   <View style={{flex:1}}>
    //     <View style={{
    //       position: 'absolute',
    //       left: 100,
    //       top: 100,
    //       backgroundColor: 'rgb(255,255,0)',
    //       width: 100,
    //       height: 100,
    //       transform: [
    //         {rotateZ: '0'}
    //       ]
    //     }} />
    //     <View style={{
    //       position: 'absolute',
    //       left: 100,
    //       top: 100,
    //       backgroundColor: 'rgb(0,255,0)',
    //       width: 100,
    //       height: 100,
    //       transform: [
    //         {rotateZ: '45'}
    //       ]
    //     }} />
    //     <View style={{
    //       position: 'absolute',
    //       left: 100,
    //       top: 100,
    //       backgroundColor: 'rgb(255,0,255)',
    //       width: 100,
    //       height: 1,
    //       transform: [
    //         {rotateZ: '30'}
    //       ]
    //     }} />
    //   </View>
    // );
    if (this.state.status == cv.LAYER_LOAD){
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