/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Text,
  View,
  PanResponder,
  Animated,
} from 'react-native';

import {
  cv,
  Dis,
  DisP,
} from './ForceCV';

import Dimensions from 'Dimensions';
let ScreenWidth = Dimensions.get('window').width;
let ScreenHeight = Dimensions.get('window').height;

export default class ForceNode extends Component {
  constructor(props){
    super(props);
    this.data = props.data;
    this.initNodeStyle = null;
    this.x = ScreenWidth / 2 - this.data.radius;
    this.y = ScreenHeight / 2 - this.data.radius;
    this.radius = this.data.radius;
    this.type = 0;
    this.initNodeStyle = {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      width: this.data.radius * 2,
      height: this.data.radius * 2,
      left: this.x,
      top: this.y,
      // borderRadius: this.type == 0 ? this.radius : 0,
      borderRadius: this.radius,
      backgroundColor: this.data.backColor,
    };
    this.text = this.data.zxContent;
    this.fontColor = 'rgb(0,0,255)';
    this.initTextStyle = {
      color: this.fontColor,
      width: this.radius * 2 * 0.75 * 3,
      fontSize: this.radius * 2 * 0.75,
      textAlign: 'center',
      backgroundColor: '#0000',
    };
    var tempVisible = props.visible == undefined ? true : props.visible; 
    this.state = {
      visible: tempVisible,
    };
    this._panResponder = {};
    this.blnInTouch = false;
    this.aniX = new Animated.Value(0);
    this.aniY = new Animated.Value(0);
    this.aniR = new Animated.Value(0);
  }
  componentDidMount(){
    if (this.state.visible){
      this.setType(this.data.kind);
      this.setRadius(this.data.radius);
      this.setColor(this.data.backColor);
      this.setPosition(this.data.x, this.data.y);
    }
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
  onStartShouldSetPanResponder(e, g){
    if (forceLayout.status == cv.LAYER_LOAD || !this.state.visible || g.numberActiveTouches != 1){
      return false;
    }
    return true;
  }
  onMoveShouldSetPanResponder(e, g){
    if (forceLayout.status == cv.LAYER_LOAD || !this.state.visible || g.numberActiveTouches != 1){
      return false;
    }
    return true;
  }
  onPanResponderGrant(e, g){
    console.log(this.data.order, this.data.zxContent);
    this.blnInTouch = true;
    forceLayout.setSelectNode(cv.NODE_EVENT_START, 
      this.data.order, e, g);
  }
  onPanResponderMove(e, g){
    if (this.refs.body){
      forceLayout.setSelectNode(cv.NODE_EVENT_MOVE, 
        this.data.order, e, g);
    }
  }
  onPanResponderRelease(e, g){
    this.blnInTouch = false;
    forceLayout.setSelectNode(cv.NODE_EVENT_END, 
      this.data.order, e, g);
  }
  onPanResponderTerminate(e, g){
    this.blnInTouch = false;
    forceLayout.setSelectNode(cv.NODE_EVENT_END, 
      this.data.order, e, g);
  }
  getVisible(){
    return this.state.visible;
  }
  setVisible(bln){
    this.setState({
      visible: bln,
    });
    if (bln){
      this.setType(this.data.kind);
      this.setRadius(this.data.radius);
      this.setColor(this.data.backColor);
      this.setPosition(this.data.x, this.data.y);
    }
  }
  setRadius(radius){
    this.radius = radius;
    if (this.state.visible){
      this.refs.body && this.refs.body.setNativeProps({
        style:{
          width: this.radius * 2,
          height: this.radius * 2,
          // borderRadius: this.type == 0 ? this.radius : 0,
          borderRadius: this.radius,
        },
      });
      this.refs.text && this.refs.text.setNativeProps({
        style:{
          width: this.radius * 2 * 0.75 * 3,
          fontSize: this.radius * 2 * 0.75,
        },
      });
    }
  }
  setColor(color){
    this.data.backColor = color;
    if (this.state.visible){
      this.refs.body.setNativeProps({
        style:{
          backgroundColor: this.data.backColor,
        },
      });
    }
  }
  setType(type){
    this.type = type;
    if (this.state.visible){
      this.refs.body.setNativeProps({
        style:{
          borderRadius: this.type == 0 ? this.radius : 0,
        },
      });
    }
  }
  setPosition(x, y){
    if (x != null){
      this.x = x - this.radius;
    }
    if (y != null){
      this.y = y - this.radius;
    }
    if (this.state.visible){
      this.refs.body.setNativeProps({
        style:{
          left: this.x,
          top: this.y,
        },
      });
    }
  }
  render() {
    if (this.state.visible){
      var text = this.text;
      // return (
      //   <View ref={'body'} style={this.initNodeStyle}
      //     {...this._panResponder.panHandlers}>
      //     <Text style={this.initTextStyle}>{this.text}</Text>
      //   </View>
      // );
      return (
        <View ref={'body'} style={this.initNodeStyle}>
          <Text ref={'text'} style={this.initTextStyle} onPress={this.TouchNode.bind(this)}>
            {text}
          </Text>
        </View>
      );
    }else {
      return (
        <View style={{backgroundColor:'#0000'}}/>
      );
    }
  }
  TouchNode(){
    forceLayout.onPressNode(this.data);
  }
  setNodeMove(aniTemp, time){
    console.log(aniTemp.x, aniTemp.y, aniTemp.r);
    this.aniX.setValue(this.data.x);
    this.aniY.setValue(this.data.y);
    this.aniR.setValue(this.data.radius);
    this.aniXLis = this.aniX.addListener(this.aniXCB.bind(this));
    this.aniYLis = this.aniY.addListener(this.aniYCB.bind(this));
    this.aniRLis = this.aniR.addListener(this.aniRCB.bind(this));
    Animated.parallel([
      Animated.timing(this.aniX, {
        toValue: aniTemp.x,
        duration: time,
      }),
      Animated.timing(this.aniY, {
        toValue: aniTemp.y,
        duration: time,
      }),
      Animated.timing(this.aniR, {
        toValue: aniTemp.r,
        duration: time,
      })
    ]).start(this.startOver.bind(this));
  }
  startOver(){
    if (forceLayout.nowSelectedNode == this){
      forceLayout.status = cv.LAYER_NODE_STOP;
    }
  }
  aniXCB(v){
    this.setPosition(v.value, null);
  }
  aniYCB(v){
    this.setPosition(null, v.value);
  }
  aniRCB(v){
    this.setRadius(v.value);
  }
  setNodeBack(time){
    Animated.parallel([
      Animated.timing(this.aniX, {
        toValue: this.data.x,
        duration: time,
      }),
      Animated.timing(this.aniY, {
        toValue: this.data.y,
        duration: time,
      }),
      Animated.timing(this.aniR, {
        toValue: this.data.radius,
        duration: time,
      })
    ]).start(this.backOver.bind(this));
  }
  backOver(){
    this.clearListener();
    if (forceLayout.nowSelectedNode == this){
      forceLayout.statue = cv.LAYER_PLAY;
      forceLayout.nowSelectedNode = null;
    }
  }
  clearListener(){
    this.aniXLis && this.aniX.removeListener(this.aniXLis);
    this.aniYLis && this.aniY.removeListener(this.aniYLis);
    this.aniRLis && this.aniR.removeListener(this.aniRLis);
  }
  componentWillUnmount() {
    this.clearListener();
  }
}

