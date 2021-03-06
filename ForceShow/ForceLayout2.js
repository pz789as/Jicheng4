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

var d3 = require('../d3.v4.js');

import Node from './ForceNode';
import Line from './ForceLine1';

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
        this.initBaseNodes();
        break;
      case 4:
        this.initBaseEdges();
        break;
      case 5:
        this.initLevelNodes();
        break;
      case 6:
        this.initLevelEdges();
        break;
      case 7:
        break;
    }
    if (index == 7){
      this.firstTimeout = setTimeout(this.firstStart.bind(this), 100);
    }else{
      this.loadTimeout = setTimeout(this.loading.bind(this, index+1), 100);
    }
  }
  firstStart(){
    this.status = cv.LAYER_FORCE;
    this.updateRender();
    this.lvIndex = 0;
    this.startForce();
  }
  initBaseNodes(){
    this.myNodes = [];
    this.arrayNode = [];
    for(var i = 0; i < this.zixingJson.length; i++){
      var data = this.zixingJson[i];
      this.myNodes.push({
        zxKey: parseInt(data.key),
        zxContent: data.zxContent,
        showKey: data.showKey,
        myWeight: 1,
        visible: false,
        status: cv.NODE_PLAY,
        backColor: 'white',
        index: i,
        order: i,
        radius: 10,
      });
      this.arrayNode.push(
        <Node ref={(ref)=>{this.nodeRefs.push(ref);}}
          key={i} data={this.myNodes[i]} visible={false}/>
      );
    }
  }
  jianchaNode(){
    for(var i=0;i<this.myNodes.length;i++){
      if (i != this.myNodes[i].index){
        console.log('检查Node顺序出错:', i, this.myNodes[i].index);
      }
    }
  }
  initBaseEdges(){
    this.myEdges = [];
    this.arrayEdge = [];
    var iOrder = 0;
    for(var i=0;i<this.goujianGuanxiJson.length;i++){
      var gx = this.goujianGuanxiJson[i];
      var gj = this.getGJByKey(parseInt(gx.gjKey));//源头构件
      if (parseInt(gx.zxKey) == parseInt(gj.zxKey)) {
        console.log('自身，所以线不加入');
        continue;
      }
      var source = this.getNodeByKey(parseInt(gj.zxKey));
      var target = this.getNodeByKey(parseInt(gx.zxKey));
      if (source == null || target == null){
        console.log('节点为空：', source, target);
        continue;
      }
      source.kindText = gj.kind;//类型：不成字，成字，汉字
      if (gj.kind == '不成字部件'){
        source.kind = 0;
        source.backColor = 'rgb(255, 0, 0)';
      }else if (gj.kind == '成字部件'){
        source.kind = 1;
        source.backColor = 'rgb(0, 255, 0)';
      }else{
        source.kind = 2;
        source.backColor = 'rgb(255, 255, 255)';
      }
      source.myWeight++;
      var edge = {
        source: source,
        target: target,
        order: iOrder,
        combineIndex: parseInt(gx.gjIndex),
        yyjKind: gx.yyjKind,//音义记类型
        color:'rgb(0,0,0)',
      };
      this.myEdges.push(edge);
      iOrder++;
    }
    // console.log('myEdges count:', this.myEdges.length);
    for (var i = 0; i < this.myNodes.length; i++) {
      if (this.myNodes[i].myWeight > this.maxWeight)
        this.maxWeight = this.myNodes[i].myWeight;
      if (this.myNodes[i].myWeight < this.minWeight)
        this.minWeight = this.myNodes[i].myWeight;
    }
    this.linearScale = d3.scaleLinear().domain([this.minWeight, this.maxWeight]).range([10, 100]);
  }
  initLevelNodes(){
    this.lvNodes = [];
    for (var i = 0; i < this.myNodes.length; i++) {
      this.myNodes[i].radius = this.linearScale(this.myNodes[i].myWeight);
      for (var m = 0; m < FORCE_DATA.length; m++) {
        if (this.myNodes[i].myWeight >= FORCE_DATA[m].number) {
          if (this.lvNodes[m] == null)
            this.lvNodes[m] = [];
          this.lvNodes[m].push(this.myNodes[i]);
        }
      }
    }
  }
  initLevelEdges(){
    for (var lvi = 0; lvi < this.lvNodes.length; lvi++) {
      if (this.lvEdges[lvi] == null){
        this.lvEdges[lvi] = [];
      }
      if (lvi < this.lvNodes.length - 1) continue;
      for(var i=0;i<this.myEdges.length;i++){
        var source = this.myEdges[i].source;
        var target = this.myEdges[i].target;
        if (
          this.getIndexForArray(this.lvNodes[lvi], source) >= 0 &&
          this.getIndexForArray(this.lvNodes[lvi], target) >= 0
        ){
          if (target.parent == null || target.parent == undefined){
            target.parent = source;
          }else{
            if (target.parent.myWeight < source.myWeight){
              target.parent = source;
            }
          }
        }
      }
      var count = 0;
      for(var i=0;i<this.myEdges.length;i++){
        var source = this.myEdges[i].source;
        var target = this.myEdges[i].target;
        if (
          this.getIndexForArray(this.lvNodes[lvi], source) >= 0 &&
          this.getIndexForArray(this.lvNodes[lvi], target)
        ){
          if (source == target.parent){
            this.myEdges[i].color = 'rgb(0, 255, 0)';
            this.myEdges[i].type = 0;
            this.lvEdges[lvi].push(this.myEdges[i]);
            this.arrayEdge.push(
              <Line ref={l=>{this.edgeRefs.push(l);}} 
                key={this.myEdges[i].order}
                edge={this.myEdges[i]} 
                visible={false}/>
            );
          }else{
            this.myEdges[i].color = 'rgba(128, 128, 128, 128)';
            this.myEdges[i].type = 1;
            this.lvGrayEdges.push(this.myEdges[i]);
          }
          count++;
        }
      }
      console.log(this.myEdges.length, this.lvEdges[lvi].length, this.lvGrayEdges.length, this.lvNodes[lvi].length, count);
    }
  }
  getIndexForArray(arr, obj){
    for(var i=0;i<arr.length;i++){
      if (arr[i] == obj) return i;
    }
    return -1;
  }
  getEdges(source, target){
    for(var i = 0; i < this.myEdges.length; i++){
      if (this.myEdges[i].source == source && this.myEdges[i].target == target) {
        return this.myEdges[i];
      }
    }
    console.log('没有找到edge，要检查一下了!', source.zxContent, target.zxContent);
    return null;
  }
  getGJByKey(gjKey){
    for(var i=0;i<this.goujianJson.length;i++){
      if (parseInt(this.goujianJson[i].key) == gjKey){
        return this.goujianJson[i];
      }
    }
    console.log('构件未找到，key=' + gjKey);
    return null;
  }
  getNodeByKey(zxKey){
    for(var i=0;i<this.myNodes.length;i++){
      if (this.myNodes[i].zxKey == zxKey){
        return this.myNodes[i];
      }
    }
    console.log('节点未找到，key=' + zxKey);
    return null;
  }
  getIndexInMyNodesByGjKey(gjKey) {
    var zxKey = 0;
    for (var i = 0; i < this.goujianJson.length; i++) {
      if (this.goujianJson[i].key == gjKey) {
        zxKey = parseInt(this.goujianJson[i].zxKey);
        break;
      }
    }
    for (var i = 0; i < this.myNodes.length; i++) {
      if (this.myNodes[i].zxKey == zxKey) {
        return i;
      }
    }
    return -1;
  }
  getGoujianArr(zxKey){
    var arr = [],k = 0;
    for(var i=0;i<this.goujianJson.length;i++){
      if (parseInt(this.goujianJson[i].zxKey) == zxKey){
        arr[k] = this.goujianJson[i];
        k++;
      }
    }
    return arr;
  }
  getGoujianGuanxiArrByZixing(zxKey){
    var arr = [], k = 0;
    for (var i = 0; i < this.goujianGuanxiJson.length; i++) {
      if (parseInt(this.goujianGuanxiJson[i].zxKey) == zxKey) {
        arr[k] = this.goujianGuanxiJson[i];
        k++;
      }
    }
    return arr;
  }
  startForce(){
    var lvi = this.lvIndex;
    for(var i=0; i< this.lvNodes[lvi].length; i++){
      this.lvNodes[lvi][i].visible = true;
    }
    this.simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(function(d){return d.index}))
    .force('charge', d3.forceManyBody().strength(function (d, i) {
      if (d.myWeight <= 2){
        return 2 * FORCE_DATA[lvi].charge;
      }else{
        return d.myWeight * FORCE_DATA[lvi].charge;
      }
    }))
    .force('center', d3.forceCenter(ScreenWidth/2, ScreenHeight/2))
    .force('fx', d3.forceX().strength(FORCE_DATA[lvi].gravity).x(ScreenWidth/2))
    .force('fy', d3.forceY().strength(FORCE_DATA[lvi].gravity).y(ScreenHeight/2))
    .alphaMin(0.005);

    this.simulation.nodes(this.lvNodes[lvi])
    .on('tick', this.ticked.bind(this))
    .on('end', this.endTick.bind(this));

    this.simulation.force('link')
    .links(this.lvEdges[lvi])
    .distance(function (d) {
      var dis;
      if (lvi == 0)
        dis = FORCE_DATA[lvi].linkDis;
      else {
        if (d.source.kindText != "不成字部件") {
          dis = 1.414 * d.source.radius + d.target.myWeight * FORCE_DATA[lvi].linkDis;
        } else {
          dis = d.source.radius + d.target.myWeight * FORCE_DATA[lvi].linkDis;
        }
      }
      return dis;
    });
    this.forceTime = (new Date()).getTime();
    this.tickedTime = new Date().getTime();
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
      if (this.scaleViewValue >= 2.5) this.scaleViewValue = 2.5;
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
  ticked(){
    console.log('ticked time: ' + ((new Date()).getTime() - this.tickedTime));
    this.tickedTime = new Date().getTime();
    this.lvNodes[this.lvIndex].forEach(this.freshNode.bind(this));
    // this.lvEdges[this.lvIndex].forEach(this.freshLink.bind(this));
  }
  endTick() {
    console.log('end force', this.lvIndex, ', 计算时间:', (new Date()).getTime() - this.forceTime);
    if (this.lvIndex + 1 >= this.lvNodes.length){
      //当所有节点运动完毕之后，将线显示出来
      // setTimeout(()=>{this.lvNodes[this.lvIndex].forEach(this.freshNode.bind(this));}, 1000);
      this.setEdgeVisible(null, true);
      this.updateRender();
      console.log('all node is add.');
    }else{
      this.lvIndex++;
      this.startForce();
    }
  }
  setEdgeVisible(node, visible){
    if (this.edgeRefs){
      for(var i=0;i<this.edgeRefs.length;i++){
        if (this.edgeRefs[i]){
          if (visible){
            this.edgeRefs[i].setTransPos(
              -this.nodeSize.minX,
              -this.nodeSize.minY,
            );
            this.edgeRefs[i].selfSet();
          }
          this.edgeRefs[i].setVisible(visible);
        }
      }
    }
  }
  freshLink(d){
    // this.edgeRefs[d.index].setPosition(d.source.x, d.source.y, d.target.x, d.target.y);
  }
  freshNode(d){
    this.nodeSize.minX = Math.min(this.nodeSize.minX, parseInt(d.x));
    this.nodeSize.maxX = Math.max(this.nodeSize.maxX, parseInt(d.x));
    this.nodeSize.minY = Math.min(this.nodeSize.minY, parseInt(d.y));
    this.nodeSize.maxY = Math.max(this.nodeSize.maxY, parseInt(d.y));
    if (this.nodeRefs){
      if (this.nodeRefs[d.order]) {
        this.nodeRefs[d.order].setPosition(d.x, d.y);
        if (this.nodeRefs[d.order].getVisible() != d.visible){
          this.nodeRefs[d.order].setVisible(d.visible);
        }
      }
    }
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
    // return (
    //   <Surface ref={'lineView'} 
    //     width={this.nodeSize.maxX - this.nodeSize.minX} height={this.nodeSize.maxY - this.nodeSize.minY} 
    //     style={{left: this.nodeSize.minX, top: this.nodeSize.minY}}>
    //     {this.arrayEdge}
    //   </Surface>
    // );
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