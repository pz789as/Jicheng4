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
let stroke  = 2;

export default class ForceLine extends Component {
  constructor(props){
    super(props);
    this.edge = props.edge;
    this.x1 = this.edge.source.x == undefined ? -1 : this.edge.source.x;
    this.y1 = this.edge.source.y == undefined ? -1 : this.edge.source.y;
    this.x2 = this.edge.target.x == undefined ? -2 : this.edge.target.x;
    this.y2 = this.edge.target.y == undefined ? -2 : this.edge.target.y;
    this.tx = props.transPos == undefined ? 0 : props.transPos.x;
    this.ty = props.transPos == undefined ? 0 : props.transPos.y;
    this.color = this.edge.color == undefined ? 'rgb(0, 255 0)': this.edge.color;
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
      height: stroke,
      transform: [
        {rotateZ: '' + this.rotate}
      ]
    };
  }
  componentDidMount() {

  }
  
  setTransPos(tx, ty){
    this.tx = tx;
    this.ty = ty;
    if (this.state.visible){
      this.updateRender();
    }
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
    this.y = (this.y1 + this.y2) / 2 + stroke / 2;
    this.rotate = Math.atan((this.y2 - this.y1) / (this.x2 - this.x1)) * 180 / Math.PI;
  }
  selfSet(){
    this.x1 = this.edge.source.x;
    this.y1 = this.edge.source.y;
    this.x2 = this.edge.target.x;
    this.y2 = this.edge.target.y;
    this.color = this.edge.color;
    this.updateInfo();
    if (this.state.visible){
      this.updateRender();
    }
  }
  setPosition(x1, y1, x2, y2){
    //设置位置可以根据是否显示来更新
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.updateInfo();
    if (this.state.visible){
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
        <View style={{backgroundColor:'#0000'}}/>
      );
    }
  }
}
