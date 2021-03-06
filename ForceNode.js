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
    this.type = 0;
    if (this.data.mData.gjArr.length > 0){
      if (this.data.mData.gjArr[0].kind == '不成字部件'){
        this.data.backColor = 'rgb(255,0,0)';
        this.type = 0;
      }else if (this.data.mData.gjArr[0].kind == '成字部件'){
        this.data.backColor = 'rgb(0,255,0)';
        this.type = 1;
      }else{
        this.data.backColor = 'rgb(255,255,255)';
        this.type = 2;
      }
    }else{
      this.data.backColor = 'rgb(255,0,0)';
    }
    this.initNodeStyle = {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      width: this.data.radius * 2,
      height: this.data.radius * 2,
      left: this.x,
      top: this.y,
      borderRadius: this.type == 0 ? this.data.radius : 0,
      backgroundColor: this.data.backColor,
    };
    this.text = this.data.mData.zxContent;
    this.fontColor = 'rgb(0,0,255)';
    this.initTextStyle = {
      color: this.fontColor,
      fontSize: this.data.radius * 2 * 0.75,
      textAlign: 'center',
      backgroundColor: '#0000',
    };
    this.state = {
      visible: props.visible == undefined ? true : props.visible,
    };
    this._panResponder = {};
    this.blnInTouch = false;
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
    if (forceLayout.getStatus == cv.LAYER_LOAD || !this.state.visible || g.numberActiveTouches != 1){
      return false;
    }
    return true;
  }
  onMoveShouldSetPanResponder(e, g){
    if (forceLayout.getStatus == cv.LAYER_LOAD || !this.state.visible || g.numberActiveTouches != 1){
      return false;
    }
    return true;
  }
  onPanResponderGrant(e, g){
    console.log(this.data.order, this.data.mData.zxContent);
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
      this.setRadius(this.data.radius);
      this.setColor(this.data.backColor);
      this.setPosition(this.x, this.y);
    }
  }
  setRadius(radius){
    this.data.radius = radius;
    if (this.state.visible){
      this.refs.body.setNativeProps({
        style:{
          width: this.data.radius * 2,
          height: this.data.radius * 2,
          borderRadius: this.type == 0 ? this.data.radius : 0,
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
  setPosition(x, y){
    this.x = x - this.data.radius;
    this.y = y - this.data.radius;
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
      // return (
      //   <View ref={'body'} style={this.initNodeStyle}
      //     {...this._panResponder.panHandlers}>
      //     <Text style={this.initTextStyle}>{this.text}</Text>
      //   </View>
      // );

      return (
        <View ref={'body'} style={this.initNodeStyle}>
          <Text style={this.initTextStyle} onPress={this.TouchNode.bind(this)}>{this.text}</Text>
        </View>
      );

      // return (
      //   <Text ref={'body'} style={[this.initNodeStyle, {color: this.fontColor,
      //     fontSize: this.data.radius * 2 * 0.75,
      //     textAlign: 'center',}]}>
      //     {this.text}
      //   </Text>
      // );
    }else {
      return (
        <View style={{backgroundColor:'#0000'}}/>
      );
    }
  }
  TouchNode(){
    forceLayout.onPressNode(this.data);
  }
}

