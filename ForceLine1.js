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

import {
  cv,
  Dis,
  DisP,
} from './ForceCV';

import Dimensions from 'Dimensions';
let ScreenWidth = Dimensions.get('window').width;
let ScreenHeight = Dimensions.get('window').height;

export default class ForceLine extends Component {
  constructor(props){
    super(props);
    this.x1 = -1,
    this.y1 = -1,
    this.x2 = -2,
    this.y2 = -2,
    this.edge = props.edge == undefined ? null : props.edge;
    this.color = this.edge == null ? 'green' : this.edge.color;
    this.state={
      visible: props.visible == undefined ? true : props.visible,
      blnUpdate: false,
    };
    this.updateInfo();
    this.bodyStyle={
      position: 'absolute',
      left: this.x,
      top: this.y,
      backgroundColor: this.color,
      width: Math.max(1, this.width),
      height: 1,
      transform: [
        {rotateZ: '' + this.rotate}
      ]
    };
  }
  setVisible(bln){
    this.setState({
      visible: bln,
    });
    if (bln){
      this.setPosition(this.x1, this.y1, this.x2, this.y2);
      this.setColor(this.color);
    }
  }
  updateRender(){
    this.setState({
      blnUpdate: !this.state.blnUpdate,
    });
  }
  updateInfo(){
    this.width = Dis(this.x1 - this.x2, this.y1 - this.y2);
    this.x = (this.x1 + this.x2) / 2 - this.width / 2;
    this.y = (this.y1 + this.y2) / 2;
    this.rotate = Math.atan((this.y2 - this.y1) / (this.x2 - this.x1)) * 180 / Math.PI;
  }
  setPosition(x1, y1, x2, y2){
    //设置位置可以根据是否显示来更新
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    if (this.state.visible){
      this.updateInfo();
      if (this.refs.body){
        this.refs.body.setNativeProps({
          style:{
            width: Math.max(1, this.width),
            left: this.x,
            top: this.y,
            transform: [
              {rotateZ: '' + this.rotate}
            ]
          }
        });
      }
    }
  }
  setColor(color){
    this.color = color;
    if (this.state.visible){
      if (this.refs.body){
        this.refs.body.setNativeProps({
          style:{
            backgroundColor: this.color,
          }
        });
      } 
    }
  }
  shouldComponentUpdate(nextProps, nextState){
    if (this.props!=nextProps || this.state!=nextState) return true;
    return false;
  }
  render() {
    if (this.state.visible){
      return (
        <View ref={'body'} style={this.bodyStyle}/>
      );
    }else{
      return (
        <View style={{backgroundColor:'#0000', overflow: 'hidden'}}/>
      );
    }
  }
}
