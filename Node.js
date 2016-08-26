/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Text,
  View,
} from 'react-native';

import Dimensions from 'Dimensions';
let ScreenWidth = Dimensions.get('window').width;
let ScreenHeight = Dimensions.get('window').height;

export default class nodeView extends Component {
  constructor(props){
    super(props);
    this.radius = props.radius ? props.radius : 10;
    this.x = (props.x ? props.x : ScreenWidth/2) - this.radius;
    this.y = (props.y ? props.y : ScreenWidth/2) - this.radius;
    this.color = props.color ? props.color : 'red';
    this.fontColor = props.fontColor ? props.fontColor : 'blue';
    this.text = props.text ? props.text : '我';

    this.initNodeStyle = {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      width: this.radius * 2,
      height: this.radius * 2,
      left: this.x,
      top: this.y,
      borderRadius: this.radius,
      backgroundColor: this.color,
      zIndex: 0,
    };
    this.initTextStyle = {
      color: this.fontColor,
      fontSize: this.radius * 2 * 0.75,
      alignItems: 'center',
      backgroundColor: '#0000',
    };
  }
  setRadius(radius){
    this.radius = radius;
    this.refs.body.setNativeProps({
      style:{
        width: this.radius * 2,
        height: this.radius * 2,
        borderRadius: this.radius,
      },
    });
  }
  setColor(color){
    this.color = color;
    this.refs.body.setNativeProps({
      style:{
        backgroundColor: this.color,
      },
    });
  }
  setPosition(x, y){
    this.x = x - this.radius;
    this.y = y - this.radius;
    this.refs.body.setNativeProps({
      style:{
        left: this.x,
        top: this.y,
      },
    });
  }
  render() {
    return (
      <View ref={'body'} style={this.initNodeStyle} >
        <Text style={this.initTextStyle}>{this.text}</Text>
      </View>
    );
  }
}

