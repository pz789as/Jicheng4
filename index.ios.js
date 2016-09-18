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
  View
} from 'react-native';

import TestD3 from './TestD3';
import TestArt from './TestArt';
import ArtLayout from './ArtLayout';
import ForceLayout from './ForceShow/ForceLayout5';
import TestNet from './TestNet';

var test = false;
class Jicheng4 extends Component {
  constructor(props){
    super(props);
    console.log(Math.tan(45*Math.PI/180));
    console.log(Math.atan(1)*180/Math.PI);
    console.log(Math.atan2(1, 1)*180/Math.PI);
    console.log(Math.cos(45*Math.PI/180));
    console.log(Math.sin(Math.atan2(1, 1)));

    this.state = {
      blnUpdate: false,
    };
    this.testArr = [];
    for(var i=0;i<5;i++){
      this.testArr.push(
        <Text key={i} style={{fontSize:20, color: 'red'}} onPress={this.changeChild.bind(this, i)}>
          这是{i}
        </Text>
      );
    }
    console.log(this.testArr);
  }
  setUpdate(){
    this.setState({
      blnUpdate: !this.state.blnUpdate
    });
  }
  render() {
    if (test == false){
      return (
        <View style={styles.container}>
          <ForceLayout />
        </View>
      );
    }else{
      return this.renderTest();
    }
  }
  changeChild(key){
    console.log(key);
    if (this.testArr[key].props.children[0] == '我变了'){
      this.testArr[key].props.style = {fontSize : 20, color : 'red'};
      this.testArr[key].props.children[0] = '这是';
    }else{
      this.testArr[key].props.style = {fontSize : 30, color : 'green'};
      this.testArr[key].props.children[0] = '我变了';
      //这里要说说text的结构，如果text是纯文字，children就只有一个，如果中间夹杂着其他变量，react是将text分段保存的。
    }
    this.setUpdate();
  }
  renderTest(){
    return this.render2();
  }
  render0(){
    return (
      <View style={[styles.container, styles.center]}>
        {this.testArr}
      </View>
    );
  }
  render1(){
    var arr = [];
    for(var i=0;i<5;i++){
      arr.push(
        <Text key={i} style={{fontSize:20, color: 'red'}} onPress={this.changeChild.bind(this, i)}>
          这是{i}
        </Text>
      );
    }
    for(var i=0;i<arr.length;i++){
      if (arr[i].key == 2){
        arr[i].props.style.fontSize = 40;
        arr[i].props.style.color = 'green';
        arr[i].props.children[0] = '改变了哦';
      }
    }
    return (
      <View style={[styles.container, styles.center]}>
        {arr}
      </View>
    );
  }
  render2(){
    return (
      <View style={styles.container}>
        <View style={{
          position: 'absolute',
          left: 50,
          top: 50,
          width: 100,
          height: 20,
          backgroundColor: '#F00',
          transform:[{
            rotateZ: '45'
          }],
        }}/>
        <View style={{
          position: 'absolute',
          left: 50,
          top: 50,
          width: 100,
          height: 20,
          backgroundColor: '#0F0',
          transform:[{
            rotateZ: '0'
          }],
        }}/>
        <View style={{
          position: 'absolute',
          left: 50,
          top: 60,
          width: 100,
          height: 1,
          backgroundColor: '#00F',
          transform:[{
            rotateZ: '0'
          }],
        }}/>
        <View style={{
          position: 'absolute',
          left: 50,
          top: 60,
          width: 100,
          height: 1,
          backgroundColor: '#FF0',
          transform:[{
            rotateZ: '45'
          }],
        }}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center:{
    justifyContent: 'center',
    alignItems: 'center',
  }
});

AppRegistry.registerComponent('Jicheng4', () => Jicheng4);
