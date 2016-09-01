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

import Dimensions from 'Dimensions';
let ScreenWidth = Dimensions.get('window').width;
let ScreenHeight = Dimensions.get('window').height;

// var net = require('net');
// console.log(net);

export default class TestNet extends Component {
  constructor(props){
    super(props);

    this.state = {
        text: 'aaaa',
    };
  }
  componentDidMount() {
    // this.ws = new WebSocket('http://192.168.1.111:8888', '');
    
    // this.ws.onopen = ()=>{
    //   // this.ws.send('something');
    // };
    // this.ws.onmessage = (e) => {
    //   console.log(e.data);
    // };
    // this.ws.onerror = (e) => {
    //   console.log(e.message);
    // };
    // this.ws.onclose = (e) => {
    //   console.log(e.code, e.reason);
    // };

    // setTimeout(this.sendMsg.bind(this), 1000);
  }
  componentWillUnmount() {
    this.ws = null;
  }
  
  sendMsg(){
    if (this.ws && this.ws.readyState == WebSocket.CONNECTING){
      console.log('CONNECTING');
      // this.ws.send('hello socket');
      // this.ws.send(1);
      console.log(this.ws);
    }
    // this.ws && this.ws.send('hello world!');
  }
  
  render() {
    return (
      <View style={styles.container} >
        <Text style={{marginTop: 20}}>{this.state.text}</Text>
      </View> 
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
});

